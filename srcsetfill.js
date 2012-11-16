'use strict';
(function(exports) {
	var HTML = Object.create(null),
	    debugging = true,
		srcsetParser = new SrcSetParser(),
		whitespace = '\u0020\u0009\u000A\u000C\u000D',
		ASCIIDigits = /^[0-9]$/;

	//Configure HTML object
	Object.defineProperty(HTML, 'whitespace', {get: function() {return whitespace}});
	Object.defineProperty(HTML, 'ASCIIDigits', {get: function() {return ASCIIDigits}});
	Object.defineProperty(HTML, 'collectCharacters', {value: collectCharacters});
	Object.defineProperty(HTML, 'skipWhiteSpace', {value: skipWhiteSpace});
	Object.defineProperty(HTML, 'splitStringOnSpaces', {value: splitStringOnSpaces});
	Object.defineProperty(HTML, 'parseNonNegInt', {value: parseNonNegInt});
	Object.defineProperty(HTML, 'parseInteger', {value: parseInteger});
	Object.defineProperty(HTML, 'parseFloat', {value: parseFloat});


	if (debugging) {
		Object.defineProperty(exports, 'HTML', {get: function() {return HTML}});
	}

	//Constructors and interfaces
	function SrcSetParser() {}
	Object.defineProperty(exports, 'srcsetParser', {get: function() {return srcsetParser}});

	function DescriptorParser() {}
	Object.defineProperty(DescriptorParser.prototype, 'parse', {value: descriptorParser});


	//"white space" per HTML5
	//Spec: http://www.whatwg.org/specs/web-apps/current-work/#space-character

	//The step skip whitespace means that the user agent must collect a sequence of characters that are space characters.
	//Spec: http://www.whatwg.org/specs/web-apps/current-work/#skip-whitespace
	function skipWhiteSpace(str) {
		str = String(str);
		var l = str.length,
			i = 0,
			ws = HTML.whitespace;
		for (; i < l; i++) {
			if (ws.indexOf(str[i]) === -1) {
				return i;
			}
		}
		return l;
	}

	//When a user agent has to split a string on spaces, it must use the following algorithm:
	//Spec: http://www.whatwg.org/specs/web-apps/current-work/#split-a-string-on-spaces
	//Let input be the string being parsed.
	function splitStringOnSpaces(input ) {
		//Let position be a pointer into input, initially pointing at the start of the string.
		var position = 0,
		   //Let tokens be a list of tokens, initially empty.
		   tokens = [],
		   l = input.length,
		   sequence = '',
		   ws = this.whitespace;

		//Skip whitespace
		position = this.skipWhiteSpace(input);

		//While position is not past the end of input:
		while (position < l) {
			//Collect a sequence of characters that are not space characters.
			if (ws.indexOf(input[position]) === -1) {
				sequence += input[position++];
			} else {
				tokens.push(sequence);
				sequence = '';
				//Skip whitespace
				position += this.skipWhiteSpace(input.substr(position, l));
			}
		}
		//Return tokens.
		return tokens;
	}

	//For parsers based on this pattern, a step that requires the user agent to collect a sequence of characters means
	//that the following algorithm must be run, with characters being the set of characters that can be collected:
	//Let input and position be the same variables as those of the same name in the algorithm that invoked these steps.
	function collectCharacters(input, position, characters) {
		//Let result be the empty string.
		var result = '',
			l = input.length;

		//While position doesn't point past the end of input
		//and the character at position is one of the characters
		while (position < l && characters.test(input[position])) {
			//append that character to the end of result and advance position
			//to the next character in input.
			result += input[position++];
		}
		//Return result.
		return {result: result, position: position};
	}

	window.collectCharacters = collectCharacters;

	//The rules for parsing non-negative integers are as given in the following algorithm.
	//When invoked, the steps must be followed in the order given,
	//aborting at the first step that returns a value.
	//This algorithm will return either zero, a positive integer, or an error.
	//Let input be the string being parsed.
	function parseNonNegInt(input ) {
		var value = HTML.parseInteger(input);
		//Let value be the result of parsing input using the rules for parsing integers.

		//If value is an error, return an error.
		//(Returing value is already an error)
		//If value is less than zero, return an error.
		if (value < 0) {
			return new Error('Invalid input');
		}
		//Return value.
		return value;
	}


	//The rules for parsing integers are as given in the following algorithm.
	//When invoked, the steps must be followed in the order given,
	//aborting at the first step that returns a value.
	//This algorithm will return either an integer or an error.
	//Let input be the string being parsed.
	function parseInteger(input ) {
		//Let position be a pointer into input, initially pointing at the start of the string.
		var position = 0,
		//Let sign have the value "positive".
		    sign = 'positive',
		    endOfInput = input.length - 1,
		    collectedChars,
		    value = 0;
		//Skip whitespace.
		position = skipWhiteSpace(input);

		//If position is past the end of input, return an error.
		if (position > endOfInput) {
			return new Error('Invlid input');
		}

		//If the character indicated by position (the first character) is a "-" (U+002D) character:
		if (input[position] === '\u002D') {
			//Let sign be "negative".
			sign = 'negative';
			//Advance position to the next character.
			position++;
			//If position is past the end of input, return an error.
			if (position > endOfInput) {
				return new Error('Invlid input');
			}
		//Otherwise, if the character indicated by position (the first character) is a "+" (U+002B) character:
		}else if (input[position] === '\u002B') {
			//Advance position to the next character. (The "+" is ignored, but it is not conforming.)
			position++;
			//If position is past the end of input, return an error.
			if (position > endOfInput) {
				return new Error('Invlid input');
			}
		}

		//If the character indicated by position is not one of ASCII digits, then return an error.
		if (!ASCIIDigits.test(input[position])) {
			return new Error('Invlid input');
		}

		//Collect a sequence of characters in the range ASCII digits,
		//and interpret the resulting sequence as a base-ten integer.
		//Let value be that integer.
		collectedChars = HTML.collectCharacters(input, position, ASCIIDigits);
		position = collectedChars.position;
		value = parseInt(collectedChars.result, 10);
		//If sign is "positive", return value, otherwise return the result of subtracting value from zero.
		if (sign === 'positive') {
			return value;
		}
		return 0 - value;
	}

	//The rules for parsing floating-point number values are as given in the following algorithm. This algorithm must be aborted at the first step that returns something. This algorithm will return either a number or an error.
	//Let input be the string being parsed.
	function parseFloat(input) {
		//Let position be a pointer into input, initially pointing at the start of the string.
		var position = 0,
		    value = 1, //Let value have the value 1.
		    divisor = 1, //Let divisor have the value 1.
		    exponent = 1, //Let exponent have the value 1.
		    l = input.length,
            endOfInput = l - 1,
		    collectedChars;

		//Skip whitespace.
		position = HTML.skipWhiteSpace(input);

		//If position is past the end of input, return an error.
		if (position >= endOfInput) {
			return new Error('invalid input');
		}

		//If the character indicated by position is a "-" (U+002D) character:
		if (input[position] === '\u002D') {
			//Change value and divisor to −1.
			divisor *= -1;
			//Advance position to the next character.
			position++;
		//Otherwise, if the character indicated by position (the first character) is a "+" (U+002B) character:
		}else if (input[position] === '\u002B') {
			//Advance position to the next character. (The "+" is ignored, but it is not conforming.)
			position++;
		}

		//If position is past the end of input, return an error.
		if (position >= endOfInput) {
			return new Error('invalid input');
		}

		if (//If the character indicated by position is a "." (U+002E),
			input[position] === '\u002E'
			//and that is not the last character in input,
			&& position !== endOfInput
			//and the character after the character indicated by position is one of ASCII digits,
			&& ASCIIDigits.test(input[position + 1])) {
			//then set value to zero and jump to the step labeled fraction.
			value = 0;
			fraction();
		}

		//If the character indicated by position is not one of ASCII digits, then return an error.
		if (!ASCIIDigits.test(input[position])) {
			return new Error('invalid input');
		}

		//Collect a sequence of characters in the range ASCII digits,
		//and interpret the resulting sequence as a base-ten integer. Multiply value by that integer.
		collectedChars = HTML.collectCharacters(input, position, ASCIIDigits);
		value *= parseInt(collectedChars.result, 10);
		position = collectedChars.position;

		//If position is past the end of input, jump to the step labeled conversion.
		if (position > endOfInput) {
			conversion();
		}

		//Fraction: If the character indicated by position is a "." (U+002E), run these substeps:
		function fraction() {
			//Advance position to the next character.
			position++;

			if (
				//If position is past the end of input,
				position > endOfInput
				//or if the character indicated by position is not one of ASCII digits,
				|| (ASCIIDigits.test(input[position]) || input[position] === '\u0065' || '\u0045')
				//"e" (U+0065), or "E" (U+0045),
			) {//then jump to the step labeled conversion.
				conversion();
			}
		}

		throw 'Not implemented yet, sorry!';
			//If the character indicated by position is a "e" (U+0065) character or a "E" (U+0045) character, skip the remainder of these substeps.

			//Fraction loop: Multiply divisor by ten.

			//Add the value of the character indicated by position, interpreted as a base-ten digit (0..9) and divided by divisor, to value.
			//Advance position to the next character.

			//If position is past the end of input, then jump to the step labeled conversion.

			//If the character indicated by position is one of ASCII digits, jump back to the step labeled fraction loop in these substeps.

			//If the character indicated by position is a "e" (U+0065) character or a "E" (U+0045) character, run these substeps:

		//Advance position to the next character.

		//If position is past the end of input, then jump to the step labeled conversion.

		//If the character indicated by position is a "-" (U+002D) character:

		//Change exponent to −1.
		//Advance position to the next character.
		//If position is past the end of input, then jump to the step labeled conversion.

		//Otherwise, if the character indicated by position is a "+" (U+002B) character:

		//Advance position to the next character.
		//If position is past the end of input, then jump to the step labeled conversion.

		//If the character indicated by position is not one of ASCII digits, then jump to the step labeled conversion.

		//Collect a sequence of characters in the range ASCII digits, and interpret the resulting sequence as a base-ten integer. Multiply exponent by that integer.

		//Multiply value by ten raised to the exponentth power.

		//Conversion: Let S be the set of finite IEEE 754 double-precision floating-point values except −0, but with two special values added: 21024 and −21024.

		//Let rounded-value be the number in S that is closest to value, selecting the number with an even significand if there are two equally close values. (The two special values 21024 and −21024 are considered to have even significands for this purpose.)

		//If rounded-value is 21024 or −21024, return an error.

		//Return rounded-value.
	}

	SrcSetParser.prototype.parse = function parse(element ) {
		if (!(element.hasAttribute('srcset') && (!(element instanceof HTMLImageElement) || !(element instanceof HTMLPictureElement) || !(element instanceof HTMLSourceElement))) {
			return new Error('Invalid input');
		}
		//Let input be the value of the img element's srcset attribute.
		var input = element.getAttribute('srcset');
		if (input === null || input === undefined || input === '') {
			throw new TypeError('Invalid input');
		}

		//Let position be a pointer into input, initially pointing at the start of the string.
		var position = 0,
		descriptors,
		l = input.length,

		//Let raw candidates be an initially empty ordered list of URLs with associated unparsed descriptors.
		//The order of entries in the list is the order in which entries are added to the list.
		rawCandidates = [],
		descParser = new DescriptorParser();

		//Splitting loop: Skip whitespace.
		while (position !== l) {
			position += HTML.skipWhiteSpace(input.substr(position, l));

			//Collect a sequence of characters that are not space characters, and let that be url.
			for (var ws = HTML.whitespace, url = '', chr; position < l; position++) {
				chr = input[position];
				if (ws.indexOf(chr) === -1) {
					url += chr;
				}else {
					break;
				}
			}

			//If url is empty, then jump to the step labeled descriptor parser.
			if (url.length === 0) {
				break;
			}

			//Collect a sequence of characters that are not "," (U+002C) characters, and let that be descriptors.
			for (var descriptors = ''; position < l; position++) {
				if (input[position] !== '\u002C') {
					descriptors += input[position];
				}else {
					//Advance position to the next character in input (skipping past the "," (U+002C) character separating this candidate from the next).
					position++;
					//Return to the step labeled splitting loop.
					break;
				}
			}

			//Add url to raw candidates, associated with descriptors.
			rawCandidates.push({url: url, descriptors: descriptors});
		}
		//If position is past the end of input, then jump to the step labeled descriptor parser.
		descParser.parse(rawCandidates);
	};


	//Descriptor parser:
	function descriptorParser(rawCandidates) {
		//Let candidates be an initially empty ordered list of URLs each with an associated pixel density,
		//and optionally an associated width and/or height.
		//The order of entries in the list is the order in which entries are added to the list.
		var	candidates = [],
			validWidth = /^\d+\u0077$/,
			validHeight = /^\d+\0068$/,
			validFloat = /^[-+]?[0-9]*\.?[0-9]+([eE][-+]?[0-9]+)?\u0078$/,
			entry;

		//For each entry in raw candidates with URL url associated with the unparsed descriptors unparsed descriptors,
		// in the order they were originally added to the list, run these substeps:
		for (var i = 0, l = rawCandidates.length, descriptorList; i < l; i++) {
			//Let descriptor list be the result of splitting unparsed descriptors on spaces.
			var descriptorList = HTML.splitStringOnSpaces(rawCandidates[i].descriptors),
				error = 'no', //Let error be no.
				width = undefined,//Let width be absent.
				height = undefined,//Let height be absent.
				absent = undefined;//Let density be absent.

			//For each token in descriptor list, run the appropriate set of steps from the following list:
			for (var j = 0, token, jl = descriptorList.length; j < jl; j++) {
				token = descriptorList[j];
				//If the token consists of a valid non-negative integer followed by
				//a U+0077 LATIN SMALL LETTER W character
				if (validWidth.test(token)) {
					//If width is not absent, then let error be yes.
					error = 'yes';
					//Apply the rules for parsing non-negative integers to the token.
					//Let width be the result.
					width = HTML.parseNonNegInt(token);
				} else if (validHeight.test(token)) {

				//If the token consists of a valid non-negative integer followed
				//by a U+0068 LATIN SMALL LETTER H character

					//Apply the rules for parsing non-negative integers to the token. Let height be the result.
					height = HTML.parseNonNegInt(token);
					//If height is not absent, then let error be yes.
					error = 'yes';

				} else if (validFloat.test(token)) {

				//If the token consists of a valid floating-point number followed
				//by a U+0078 LATIN SMALL LETTER X character

					//If density is not absent, then let error be yes.
					error = 'yes';
					//Apply the rules for parsing floating-point number values to the token.
					//Let density be the result.
					density = HTML.parseFloat(token);
				}

				//If width is still absent, set it to Infinity.
				if (!(width)) {
					width = Infinity;
				}

				//If height is still absent, set it to Infinity.
				if (!(height)) {
					height = Infinity;
				}

				//If density is still absent, set it to 1.0.
				if (!(density)) {
					density = 1.0;
				}
				//If error is still no,
				if (error === 'no') {
					 //then add an entry to candidates whose URL is url,
					 //associated with a width width, a height height, and a pixel density density.
					 entry = {ulr: rawCandidates[i].url, width: width, height: height, density: density};
					 candidates.push(entry);
				}
			}
			//If the img element has a src attribute whose value is not the empty string,
			//then run the following substeps:
			if (img.hasAttribute('src') && img.getAttribute('src') !== '') {
				entry = {};
				//Let url be the value of the element's src attribute.
				//Add an entry to candidates whose URL is url,
				//associated with a width Infinity, a height Infinity, and a pixel density 1.0.
				entry.url = img.getAttribute('src');
				entry.width = Infinity;
				entry.height = Infinity;
				entry.density = 1.0;
				candidates.push(entry);
			}
			//If candidates is empty, return null and undefined and abort these steps.
			if (candidates.length === 0) {
				return {url: null, density: undefined};
			}

			//If an entry b in candidates has the same associated width, height, and pixel density
			//as an earlier entry a in candidates, then remove entry b.
			//Repeat this step until none of the entries in candidates have the same associated width,
			//height, and pixel density as an earlier entry.
			if (candidates.length > 1) {
				for (var i = 0; i < candidates.length - 1; i++) {
					if (!(compare.call(candidates[i], candidates[i + 1])) {
						delete candidates[i + 1];
					}
				}
			}

			//using code from: http://stackoverflow.com/questions/1068834/object-comparison-in-javascript
			function compare(x)
				{
				  var p;
				  for (p in this) {
				      if (typeof(x[p]) == 'undefined') {return false;}
				  }

				  for (p in this) {
				      if (this[p]) {
				          switch (typeof(this[p])) {
				              case 'object':
				                  if (!this[p].equals(x[p])) { return false; } break;
				              case 'function':
				                  if (typeof(x[p]) == 'undefined' ||
				                      (p != 'equals' && this[p].toString() != x[p].toString()))
				                      return false;
				                  break;
				              default:
				                  if (this[p] != x[p]) { return false; }
				          }
				      } else {
				          if (x[p])
				              return false;
				      }
				  }

				  for (p in x) {
				      if (typeof(this[p]) == 'undefined') {return false;}
				  }
				  return true;
				}

		}
	}
}(this));

//tests
//window.srcsetParser.parse();
//window.srcsetParser.parse("");
//window.srcsetParser.parse(Node);
//window.srcsetParser.parse(123);
//window.srcsetParser.parse("\u0020\u0009\u000A\u000C\u000D");
//window.srcsetParser.parse("banner-HD.jpeg 2x, banner-phone.jpeg 100w, banner-phone-HD.jpeg 100w 2x");
window.srcsetParser.parse('pear-mobile.jpeg 720w, pear-tablet.jpeg 1280w, pear-desktop.jpeg 1x');

//window.srcsetParser.parse("");
