(function(exports){
    //The HTML contains definitions/algorithms from HTML5
    var HTML = {},
        //"white space" per HTML5
        //Spec: http://www.whatwg.org/specs/web-apps/current-work/#space-character
        //\u0020\u0009\u000A\u000C\u000D
        whitespace = ' \t\n\f\r',
        ASCIIDigits = /^[0-9]$/;

    //export HTML object
    Object.defineProperty(exports, 'HTML', {
        get: function() {
            return HTML;
        }
    });

    //Configure HTML object
    Object.defineProperty(HTML, 'whitespace', {
        get: function() {
            return whitespace;
        }
    });
    Object.defineProperty(HTML, 'ASCIIDigits', {
        get: function() {
            return ASCIIDigits;
        }
    });
    Object.defineProperty(HTML, 'collectCharacters', {
        value: collectCharacters
    });
    Object.defineProperty(HTML, 'skipWhiteSpace', {
        value: skipWhiteSpace
    });
    Object.defineProperty(HTML, 'splitStringOnSpaces', {
        value: splitStringOnSpaces
    });
    Object.defineProperty(HTML, 'parseNonNegInt', {
        value: parseNonNegInt
    });
    Object.defineProperty(HTML, 'parseInteger', {
        value: parseInteger
    });
    Object.defineProperty(HTML, 'parseFloat', {
        value: parseFloatingPoint
    });
   
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
    function splitStringOnSpaces(input) {
        //Let position be a pointer into input, initially pointing at the start of the string.
        var position = 0,
            //Let tokens be a list of tokens, initially empty.
            tokens = [],
            l = input.length,
            sequence = '',
            ws = HTML.whitespace;
        //Skip whitespace
        position = skipWhiteSpace(input);
        //While position is not past the end of input:
        while (position < l) {
            //Collect a sequence of characters that are not space characters.
            if (ws.indexOf(input[position]) === -1) {
                sequence += input[position++];
                if (position === l) {
                    tokens.push(sequence);
                }
            } else {
                tokens.push(sequence);
                sequence = '';
                //Skip whitespace
                position += skipWhiteSpace(input.substr(position, l));
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
        return {
            result: result,
            position: position
        };
    }
    //The rules for parsing non-negative integers are as given in the following algorithm.
    //When invoked, the steps must be followed in the order given,
    //aborting at the first step that returns a value.
    //This algorithm will return either zero, a positive integer, or an error.
    //Let input be the string being parsed.
    function parseNonNegInt(input) {
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
    function parseInteger(input) {
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
        if (input[position] === '-') {
            //Let sign be "negative".
            sign = 'negative';
            //Advance position to the next character.
            position++;
            //If position is past the end of input, return an error.
            if (position > endOfInput) {
                return new Error('Invlid input');
            }
            //Otherwise, if the character indicated by position (the first character) is a "+" (U+002B) character:
        } else if (input[position] === '+') {
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
    function parseFloatingPoint(input) {
        window.console.warn('Using ECMAScript parse float, as the HTML one is not done yet');
        return window.parseFloat(input);
        /*
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
        if (input[position] === '-') {
            //Change value and divisor to âˆ’1.
            divisor *= -1;
            //Advance position to the next character.
            position++;
            //Otherwise, if the character indicated by position (the first character) is a "+" (U+002B) character:
        } else if (input[position] === '+') {
            //Advance position to the next character. (The "+" is ignored, but it is not conforming.)
            position++;
        }
        //If position is past the end of input, return an error.
        if (position >= endOfInput) {
            return new Error('invalid input');
        }
        //If the character indicated by position is a "." (U+002E),
        //and that is not the last character in input,
        //and the character after the character indicated by position is one of ASCII digits,
        if (input[position] === '.' && position !== endOfInput && ASCIIDigits.test(input[position + 1])) {
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

            //If position is past the end of input,
            var eoi = position > endOfInput,
                isDigit = ASCIIDigits.test(input[position]),
                chr = input[position];
            //or if the character indicated by position is not one of ASCII digits,
            //"e" (U+0065), or "E" (U+0045),
            if (eoi || isDigit || chr === 'e' || chr === 'E') {
                //then jump to the step labeled conversion.
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
        //Change exponent to âˆ’1.
        //Advance position to the next character.
        //If position is past the end of input, then jump to the step labeled conversion.
        //Otherwise, if the character indicated by position is a "+" (U+002B) character:
        //Advance position to the next character.
        //If position is past the end of input, then jump to the step labeled conversion.
        //If the character indicated by position is not one of ASCII digits, then jump to the step labeled conversion.
        //Collect a sequence of characters in the range ASCII digits, and interpret the resulting sequence as a base-ten integer. Multiply exponent by that integer.
        //Multiply value by ten raised to the exponentth power.
        //Conversion:
        function conversion() {}
        // Let S be the set of finite IEEE 754 double-precision floating-point values except âˆ’0,
        //but with two special values added: 21024 and âˆ’21024.
        //Let rounded-value be the number in S that is closest to value, selecting the number with an even significand if there are two equally close values. (The two special values 21024 and âˆ’21024 are considered to have even significands for this purpose.)
        //If rounded-value is 21024 or âˆ’21024, return an error.
        //Return rounded-value.
        */
    }
}(this));
