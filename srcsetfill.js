(function(exports){
	"use strict"; 	
	//Define what "white space" is per HTML5
	Object.defineProperty(HTML.prototype, "whitespace",{get: whiteSpaceChars}) 

	//The step skip whitespace means that the user agent must collect a sequence of characters that are space characters. 
	Object.defineProperty(HTML.prototype, "skipWhiteSpace", {value: skipWhiteSpace});


	Object.defineProperty(HTML.prototype, "splitStringOnSpaces", {value: splitStringOnSpaces});


	var HTML = new HTML();

	//export parser 
	var srcsetParser =  new SrcSetParser(); 
	Object.defineProperty(exports, "srcsetParser", {value: srcsetParser}); 

	function HTML(){}
	
	function whiteSpaceChars(){ 
		return "\u0020\u0009\u000A\u000C\u000D"
	}


	function skipWhiteSpace(str){
		str = String(str);
		var l = str.length
		   ,i = 0
		   ,ws = HTML.whitespace;  
		for(; i < l; i++){
			if(ws.indexOf(str[i]) === -1){
				return i;
			}
		}
		return l;
	}

	//When a user agent has to split a string on spaces, it must use the following algorithm:
	//Let input be the string being parsed.
	function splitStringOnSpaces( input ){
		//Let position be a pointer into input, initially pointing at the start of the string.
		var position = 0
		//Let tokens be a list of tokens, initially empty.
		   ,tokens = []
		   ,l = input.length
		   ,sequence = "",
		   ws = this.whitespace;  
		
		//Skip whitespace
		position = this.skipWhiteSpace(input); 
		
		//While position is not past the end of input:
		while(position < l){
			//Collect a sequence of characters that are not space characters.
			if(ws.indexOf(input[position]) === -1){
				sequence += input[position++]; 
			}else{
				tokens.push(sequence); 
				sequence = "";
				//Skip whitespace
				position += this.skipWhiteSpace(input.substr(position, l));
			}
		}
		//Return tokens.
		return tokens;
	}
	
	function SrcSetParser(){}

	/** 
	* @param input Let input be the value of the img element's srcset attribute.	
	**/
	SrcSetParser.prototype.parse = function parse(input){

		if(input === null || input === undefined || input === ""){
			throw new TypeError("Invalid input"); 
		}

		input = String(input); 
		
		//Let position be a pointer into input, initially pointing at the start of the string.
		var position = 0
		   ,descriptors
		   ,l = input.length

		//Let raw candidates be an initially empty ordered list of URLs with associated unparsed descriptors. 
		//The order of entries in the list is the order in which entries are added to the list.
		   ,rawCandidates = []
		   ,descParser = new DescriptorParser();  
		
		//Splitting loop: Skip whitespace.
		while(position !== l){ 
			position += HTML.skipWhiteSpace(input.substr(position, l)); 
			
			//Collect a sequence of characters that are not space characters, and let that be url.
			for(var ws = HTML.whitespace, url = "", chr; position < l; position++){
				chr = input[position]; 
				if(ws.indexOf(chr) === -1) {
					url += chr; 
				}else{
					break; 
				} 
			}

			//If url is empty, then jump to the step labeled descriptor parser.
			if(url.length === 0){
				break;
			}
			
			//Collect a sequence of characters that are not "," (U+002C) characters, and let that be descriptors.
			for(var descriptors = ""; position < l; position++){
				if(input[position] !== "\u002C"){
					descriptors += input[position]; 
				}else{
					//Advance position to the next character in input (skipping past the "," (U+002C) character separating this candidate from the next).
					position++
					//Return to the step labeled splitting loop.
					break;
				}
			}

			//Add url to raw candidates, associated with descriptors.
			rawCandidates.push({url: url, descriptors: descriptors});
		}
		//If position is past the end of input, then jump to the step labeled descriptor parser.
		descParser.parse(rawCandidates); 
	}

	function DescriptorParser(){}
	
	Object.defineProperty(DescriptorParser.prototype, "parse", {value: descriptorParser})

	function descriptorParser(rawCandidates){
		var validWidth = /^\d+[w]$/,
			validHeight = /^\d+[h]$/,

		//Descriptor parser: 
		//Let candidates be an initially empty ordered list of URLs each with an associated pixel density, 
		//and optionally an associated width and/or height. The order of entries in the list is the order in which entries are added to the list.
			candidates = [];
		
		//For each entry in raw candidates with URL url associated with the unparsed descriptors unparsed descriptors,
		// in the order they were originally added to the list, run these substeps:
		for(var i = 0, l = rawCandidates.length, descriptorList; i < l; i++){
			//Let descriptor list be the result of splitting unparsed descriptors on spaces.
			var descriptorList = HTML.splitStringOnSpaces(rawCandidates[i].descriptors); 
			//Let error be no.
				,error = "no" 
			//Let width be absent.
				,width = undefined
			//Let height be absent.
				,height = undefined
			//Let density be absent.
				,absent = undefined
			//For each token in descriptor list, run the appropriate set of steps from the following list:
			for(var j = 0, token, jl = descriptorList.length; j < jl; j++){
				token = descriptorList[j];
				//If the token consists of a valid non-negative integer followed by a U+0077 LATIN SMALL LETTER W character
				if(isValid(token, validWidth)){	
					//If width is not absent, then let error be yes.
					error = "yes";
					//Apply the rules for parsing non-negative integers to the token. Let width be the result.
					
				}
				//If the token consists of a valid non-negative integer followed by a U+0068 LATIN SMALL LETTER H character
					//If height is not absent, then let error be yes.

				//Apply the rules for parsing non-negative integers to the token. Let height be the result.

				//If the token consists of a valid floating-point number followed by a U+0078 LATIN SMALL LETTER X character
					//If density is not absent, then let error be yes.
					//Apply the rules for parsing floating-point number values to the token. Let density be the result.

			}
		}

		function isValid( value , regex){

			if(regex.exec(value) !=== null){
				return true;
			}
			return false;
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
window.srcsetParser.parse("pear-mobile.jpeg 720w, pear-tablet.jpeg 1280w, pear-desktop.jpeg 1x");

//window.srcsetParser.parse("");
