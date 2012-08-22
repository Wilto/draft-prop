## Use cases from previous proposal:

### Mobile-First Development

A common approach in sites that cater to a wide range of devices using a single codebase is a “mobile-first” development pattern — starting with a simple, linear layout and building complexity through larger screen sizes using media queries.

*Proposed Solution*
```
<picture alt="">
  <!-- Matches by default: -->
	<source src="mobile.jpg"> 
	<source src="medium.jpg" media="min-width: 600px"> 	
	<source src="fullsize.jpg" media="min-width: 900px">
	<img src="mobile.jpg">
</picture>
```

Assuming a 960px wide window at the time the page is requested and the sample markup pattern in section 3.1, the UA should make a single request for “fullsize.jpg.” Any window/screen smaller than 600px is served “mobile.jpg”, which—as a completely alternate source—could be cropped as well as resized in order to preserve the focus of the image at smaller sizes.

This example could be made more specific through the <a href="http://www.w3.org/TR/css3-mediaqueries/#orientation" class="external text" rel="nofollow">orientation</a>, <a href="http://www.w3.org/TR/css3-mediaqueries/#device-width" class="external text" rel="nofollow">device-width</a>, and <a href="http://www.w3.org/TR/css3-mediaqueries/#device-height" class="external text" rel="nofollow">device-height</a> media queries.

### Desktop-First Development

Following the reverse of the logic above, authors may want to ensure that the largest possible images are served by default. For example: a site intended for browsing across a range of “smart televisions,” for example, where one assumes a large viewport but assets could be optimized for smaller displays in the event that media queries are supported.

*Proposed Solution*
```
<picture alt="">
	<source src="default-fullsize.jpg"> 
	<source src="medium.jpg" media="max-width: 1400px"> 	
	<source src="smaller.jpg" media="max-width: 1280px">
	<img src="default-fullsize.jpg">
</picture>
```
This use case could be further tailored through the <a href="http://www.w3.org/TR/css3-mediaqueries/#aspect-ratio">aspect-ratio</a> and <a href="http://www.w3.org/TR/css3-mediaqueries/#device-aspect-ratio">device-aspect-ratio</a> media queries.

### Relative Units

A common practice in creating flexible layouts is to specify the value of one’s media queries in relative units: `em`, `rem`, `vw`/`vh` etc. This is most commonly seen with `em`s in order to reflow layouts based on users’ zoom preferences, or to resize elements through JavaScript by dynamically altering a font-size value.

Through the use of media queries this layout flexibility would extend to images as well, ensuring that a source always remains appropriate to the size of its containing element.

*Proposed Solution*
```
<picture alt="">
	<source src="default-small.jpg"> 
	<source src="medium.jpg" media="min-width: 37.5em"> 	
	<source src="fullsize.jpg" media="min-width: 56.25em">
	<img src="default-small.jpg">
</picture>
```

### Alternate Print Sources
Where media queries allow conditional logic based on whether the page is being rendered for display on screen or for print, one could extend this same logic to provide a print source other than the one rendered on the screen. For example: a photo sharing site could provide a bandwidth-optimized image for display on screen, but a high resolution image for print.

*Proposed Solution*
```
<picture alt="">
	<source src="standard-res.jpg" media="screen" /> 	
	<source src="high-res.jpg" media="print" />
	<img src="standard-res.jpg" />
</picture>
```