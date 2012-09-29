steps towards a working picture element
--------------------
* Should I insist on compiling chromium with vanilla WebKit?
* HTMLPictureElement: public HTMLImageElement
* What do we want to do with ImageInnerElement? Should we duplicate a
  similar one as HTMLPictureElement's shadow DOM, and can we use it as is?
* Add handling of <picture> tag to the PreloadScanner
* How can I do media queries eval inside the preload scanner?
  MediaQueryMatcher? All I need to get started is get the window
dimensions from somewhere... 
* How can I scan source tags with the preload scanner?
* What the hell does the HTMLTagNames.in syntax mean !?!?!?
* Add HTMLPictureElement.h include to HTMLElementFactory by changing
  make_names.pl
