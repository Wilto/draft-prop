(function(window) {
    'use strict';
    window.addEventListener('DOMContentLoaded', setUpTester);

    function setUpTester() {
        var srcsetTester = document.getElementById('srcsetTester'),
            viewportUI = document.getElementById('viewportUI'),
            output = document.getElementById('outputform'),
            
            //this is the fake element that is evaluated
            //we don't use an img because we don't want to load
            //real images yet
            elem = document.createElement('x-element'),
            //attributes we are interested in adding to our fake
            //element
            attrValues = [{
                name: 'srcset',
                value: ''
            }, {
                name: 'src',
                value: 'default.png'
            }],
            srcsetAttr;
        //create fake IDL attributes for x-element
        attrValues.forEach((function() {
            return function(prop) {
                setupAttributes(prop);
                //initialize attribute
                elem[prop.name] = prop.value;
            };
        }()));
        srcsetAttr = elem.getAttributeNode('srcset');
        //Wire up events
        window.customViewport.on('change', popualteForm);
        
        srcsetTester.addEventListener('input', findSrcset);
        viewportUI.addEventListener('change', updateViewport);
        //run
        popualteForm();

        function updateViewport(e){
            var prop = e.target.id;
            window.customViewport[e.target.id] = e.target.value;
        }


        function setupAttributes(prop) {
            var props = {
                get: function() {
                    return prop.value;
                },
                set: function(value) {
                    elem.setAttribute(prop.name, String(value));
                }
            };
            Object.defineProperty(elem, prop.name, props);
            srcsetTester[prop.name].addEventListener('keyup', function(e) {
                elem[prop.name] = e.target.value;
            });
        }
        //populate form
        function popualteForm() {
            viewportUI.width.value = window.customViewport.width;
            viewportUI.height.value = window.customViewport.height;
            viewportUI.density.value = window.customViewport.density;
            findSrcset();
        }

        function findSrcset() {
            var result = window.srcsetParser.parse(srcsetAttr);
            showResult(result);
        }

        function showResult(value) {
            output.out.value = JSON.stringify(value);
        }
    }
}(window));
