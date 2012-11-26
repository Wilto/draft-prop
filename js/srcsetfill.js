/**
 * TODO: need a Viewport object to facilitate testing.
 **/
 (function(exports, window) {
    'use strict';
    var debugging = true,
        srcsetParser = new SrcSetParser(),
        HTML;

    window.require(['HTML'], function(HTMLExport) {
        HTML = HTMLExport;
        var evt = window.document.createEvent('CustomEvent');
        evt.initCustomEvent('srcsetready', false, false, null);
        window.dispatchEvent(evt);
    });

    //Constructors and interfaces
    function SrcSetParser() {}
    Object.defineProperty(SrcSetParser.prototype, 'parse', {
        value: parseSrcset
    });
    Object.defineProperty(exports, 'srcsetParser', {
        get: function() {
            return srcsetParser;
        }
    });

    function parseSrcset(attr) {
        //Let input be the value of the img element's srcset attribute.
        var input = attr.value;
        if (!(attr instanceof window.Attr)) {
            throw new TypeError('Invalid input');
        }
        //Let position be a pointer into input, initially pointing at the start of the string.
        var position = 0,
            descriptors,
            l = input.length,
            //Let raw candidates be an initially empty ordered list of URLs with associated unparsed descriptors.
            //The order of entries in the list is the order in which entries are added to the list.
            rawCandidates = [];
        //Splitting loop: Skip whitespace.
        while (position < l) {
            position += HTML.skipWhiteSpace(input.substr(position, l));
            //Collect a sequence of characters that are not space characters, and let that be url.
            for (var ws = HTML.whitespace, url = '', chr; position < l; position++) {
                chr = input[position];
                if (ws.indexOf(chr) === -1) {
                    url += chr;
                } else {
                    break;
                }
            }
            //If url is empty, then jump to the step labeled descriptor parser.
            if (url.length === 0) {
                return parseDescriptors(rawCandidates, attr);
            }
            //Collect a sequence of characters that are not "," (U+002C) characters, and let that be descriptors.
            for (descriptors = ''; position < l; position++) {
                if (input[position] !== ',') {
                    descriptors += input[position];
                } else {
                    //Advance position to the next character in input (skipping past the "," (U+002C) character separating this candidate from the next).
                    position++;
                    //Return to the step labeled splitting loop.
                    break;
                }
            }
            //Add url to raw candidates, associated with descriptors.
            rawCandidates.push({
                url: url,
                descriptors: descriptors
            });
        }
        //If position is past the end of input, then jump to the step labeled descriptor parser.
        return parseDescriptors(rawCandidates, attr);
    }
    //Descriptor parser:
    function parseDescriptors(rawCandidates, attr) {
        //Let candidates be an initially empty ordered list of URLs each with an associated pixel density,
        //and optionally an associated width and/or height.
        //The order of entries in the list is the order in which entries are added to the list.
        var candidates = [],
            maxWidth,
            maxHeight,
            maxDensity;

        //For each entry in raw candidates with URL url associated with the unparsed descriptors unparsed descriptors,
        // in the order they were originally added to the list, run these substeps:
        for (var i = 0, l = rawCandidates.length; i < l; i++) {
            //Let descriptor list be the result of splitting unparsed descriptors on spaces.
            var descriptorList = HTML.splitStringOnSpaces(rawCandidates[i].descriptors),
                error = false, //Let error be no.
                width = null, //Let width be absent.
                height = null, //Let height be absent.
                density = null; //Let density be absent.

            //For each token in descriptor list, run the appropriate set of steps from the following list:
            for (var j = 0, jl = descriptorList.length; j < jl; j++) {
                parseToken(descriptorList[j], rawCandidates[i].url);
            }
        }
        //If the img element has a src attribute whose value is not the empty string,
        //then run the following substeps:
        if (attr.ownerElement.hasAttribute('src') && attr.ownerElement.getAttribute('src') !== '') {
            //Let url be the value of the element's src attribute.
            //Add an entry to candidates whose URL is url,
            //associated with a width Infinity, a height Infinity, and a pixel density 1.0.
            candidates.push(new Entry(attr.ownerElement.getAttribute('src')));
        }
        //If candidates is empty, return null and undefined and abort these steps.
        if (candidates.length === 0) {
            return {
                url: null,
                density: undefined
            };
        }
        //If an entry b in candidates has the same associated width, height, and pixel density
        //as an earlier entry a in candidates, then remove entry b.
        //Repeat this step until none of the entries in candidates have the same associated width,
        //height, and pixel density as an earlier entry.
        removeDuplicates(candidates);
        //Optionally, return the URL of an entry in candidates chosen by the user agent,
        //and that entry's associated pixel density, and then abort these steps.
        //The user agent may apply any algorithm or heuristic in its selection of an entry for the
        //purposes of this step.
        //Let max width be the width of the viewport, and let max height be the height of
        //the viewport.[CSS]
        maxWidth = window.innerWidth;
        maxHeight = window.innerHeight;
        maxDensity = window.devicePixelRatio;

        //If there are any entries in candidates that have an associated width that
        //is less than max width, then remove them,
        //unless that would remove all the entries, in which case remove only
        //the entries whose associated width is less than the greatest such width.
        //If there are any entries in candidates that have an associated height that is less
        //than max height, then remove them,unless that would remove all the entries,
        //in which case remove only the entries whose associated height is less than the greatest
        //such height.
        //If there are any entries in candidates that have an associated pixel density that
        //is less than a user-agent-defined value giving the nominal pixel density of the display,
        //then remove them, unless that would remove all the entries, in which case remove only
        //the entries whose associated pixel density is less than the greatest such pixel density.
        discardOutliers('width', candidates, maxWidth);
        discardOutliers('height', candidates, maxHeight);
        discardOutliers('density', candidates, maxDensity);

        //Remove all the entries in candidates that have an associated width that is greater than
        //the smallest such width.
        //Remove all the entries in candidates that have an associated height that is greater than
        //the smallest such height.
        //Remove all the entries in candidates that have an associated pixel density that
        //is greater than the smallest such pixel density.
        ['width', 'height', 'density'].forEach(function(prop) {
            findBestMatch(prop, candidates);
        });

        //MC: Check that the algorithm found the one and only match.
        if (candidates.length > 1 && debugging) {
            window.console.warn('there was more than one candidate?', candidates);
        }

        //Return the URL of the sole remaining entry in candidates, and that entry's
        //associated pixel density.
        return {
            url: candidates[0].url,
            density: candidates[0].density
        };

        function removeDuplicates(candidates) {
            if (candidates.length > 1) {
                for (var h = 0; h <= candidates.length; h++) {
                    for (var b = candidates.length - 1; b > h; b--) {
                        if ((h !== b) && arePropsEqual(candidates[h], candidates[b])) {
                            candidates.splice(b, 1);
                        }
                    }
                }
            }
            return candidates;

            function arePropsEqual(x, y) {
                for (var i in x) {
                    //check everything, except URL
                    if ((i !== 'url') && String(x[i]) !== String(y[i])) {
                        return false;
                    }
                }
                return true;
            }
        }

        function parseToken(token,url) {
            var validWidth = /^\d+\u0077$/,
                validHeight = /^\d+\u0068$/,
                validFloat = /^[\-\+]?[0-9]*\.?[0-9]+([eE][\-\+]?[0-9]+)?\u0078$/;

            //If the token consists of a valid non-negative integer followed by
            //a U+0077 LATIN SMALL LETTER W character
            if (validWidth.test(token)) {
                //If width is not absent, then let error be yes.
                if (width !== null) {
                    error = true;
                }
                //Apply the rules for parsing non-negative integers to the token.
                //Let width be the result.
                width = HTML.parseNonNegInt(token);
            } else if (validHeight.test(token)) {
                //If the token consists of a valid non-negative integer followed
                //by a U+0068 LATIN SMALL LETTER H character
                //I height is not absent, then let error be yes.
                if (height !== null) {
                    error = true;
                }
                //Apply the rules for parsing non-negative integers to the token. Let height be the result.
                height = HTML.parseNonNegInt(token);
            } else if (validFloat.test(token)) {
                //If the token consists of a valid floating-point number followed
                //by a U+0078 LATIN SMALL LETTER X character
                //If density is not absent, then let error be yes.
                if (density !== null) {
                    error = true;
                }
                //Apply the rules for parsing floating-point number values to the token.
                //Let density be the result.
                density = HTML.parseFloat(token);
            }

            //If error is still no,
            if (!error) {
                //then add an entry to candidates whose URL is url,
                //associated with a width width, a height height, and a pixel density density.
                candidates.push(new Entry(url, width, height, density));
            }
        }

        function Entry(url,width,height,density) {
            this.url = url;
            this.width = width || Infinity;
            this.height = height || Infinity;
            this.density = density || 1.0;
        }

        function discardOutliers(prop, candidates, max) {
            if (candidates.length > 1) {
                for (var i = 0, next = candidates[i + 1], biggest = candidates[i]; i < candidates.length; i++) {
                    if (candidates[i].hasOwnProperty(prop) && candidates[i][prop] < max) {
                        biggest = ((next) && next[prop] > biggest[prop]) ? next : biggest;
                        candidates.splice(i--, 1);
                        next = candidates[i + 1];
                    }
                }
                if (candidates.length === 0) {
                    candidates.unshift(biggest);
                }
            }
        }

        function findBestMatch(prop, candidates) {
            if (candidates.length > 1) {
                for (var i = 0, smallest = candidates[0]; i < candidates.length; i++) {
                    if (candidates[i].hasOwnProperty(prop) && !! (candidates[i + 1])) {
                        if (candidates[i + 1][prop] > smallest[prop]) {
                            candidates.splice(i + 1, 1);
                            i--;
                        } else if (candidates[i + 1][prop] !== smallest[prop]) {
                            smallest = candidates[i + 1];
                            candidates.splice(i--, 1);
                        }
                    }
                }
            }
        }
    }
}(this, window));
