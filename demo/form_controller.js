(function (window) {
    "use strict";
    window.addEventListener("DOMContentLoaded", setUpTester);

    function setUpTester() {
        var srcsetTester = document.getElementById("srcsetTester"),
            elem = document.createElement("x-element"),
            attrValues = [{
                name: "srcset",
                value: ""
            }, {
                name: "src",
                value: "default.png"
            }],
            srcsetAttr;
        //create fake IDL attributes for x-element
        attrValues.forEach((function () {
            return function (prop) {
                setupAttributes(prop);
                //initialize attribute
                elem[prop.name] = prop.value;
            }
        }()));
        srcsetAttr = elem.getAttributeNode("srcset");
        //Wire up events
        window.addEventListener("resize", popualteForm)
        srcsetTester.addEventListener("input", findSrcset);
        //run
        popualteForm();

        function setupAttributes(prop) {
            var props = {
                get: function () {
                    return prop.value;
                },
                set: function (value) {
                    elem.setAttribute(prop.name, String(value));
                }
            }
            Object.defineProperty(elem, prop.name, props);
            srcsetTester[prop.name].addEventListener("keyup", function (e) {
                elem[prop.name] = e.target.value;
            });
        }
        //populate form
        function popualteForm() {
            srcsetTester.width.value = window.innerWidth;
            srcsetTester.height.value = window.innerHeight;
            srcsetTester.density.value = window.devicePixelRatio || 1.0;
            findSrcset();
        }

        function findSrcset() {
            var result = window.srcsetParser.parse(srcsetAttr)
            showResult(result);
        }

        function showResult(value) {
            srcsetTester.out.value = JSON.stringify(value);
        }
    }
}(window));