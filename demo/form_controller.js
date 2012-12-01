(function(window) {
    'use strict';
    var form = document.getElementById('srcsetTester'),
        srcsetAttr = createSrcsetAttr(form),
        vp = window.customViewport;

    initializeFormValues();

    //Wire up events
    vp.on('change', updateDimensionInputs);

    //Lock form through API
    vp.on('lockchange', function() {
        form.locked.checked = vp.locked;
    });

    //lock viewport through form
    form.locked.addEventListener('click', function() {
         vp.locked = form.locked.checked;
    });

    form.addEventListener('keyup', findSrcset);
    form.addEventListener('change', updateViewport);
    window.addEventListener('DOMContentLoaded', findSrcset);

    if (!vp.ready) {
        vp.on('ready', updateDimensionInputs);
    } else {
        updateDimensionInputs();
    }

    function updateViewport(e) {
        var prop = e.target.id;
        if (vp[prop]) {
            vp[prop] = e.target.value;
        }
    }

    function initializeFormValues() {
        var props = new window.URI(window.location.href).search(true),
            elem,
            e,
            value;
        for (var prop in props) {
            value = window.URI.decodeQuery(props[prop]);
            elem = form.querySelector('#' + prop);
            if (elem) {
                elem.value = value;
            }
            if (prop === 'src' || prop === 'srcset') {
                srcsetAttr.ownerElement[prop] = value;
            }
        }
        updateDimensionInputs();
    }

    function updateDimensionInputs() {
        form.width.value = vp.width;
        form.height.value = vp.height;
        form.density.value = vp.density;
        form.locked.checked = vp.locked;
    }

    function findSrcset(e) {
        console.log(e.type);
        var result = window.srcsetParser.parse(srcsetAttr);
        showResult(result);
    }

    function showResult(value) {
        form.out.value = value.url + ' (' + value.density + 'x)';
    }

    function createSrcsetAttr(form) {
        var elem = document.createElement('x-element'),
            attrValues = [{
                name: 'srcset',
                value: ''
            }, {
                name: 'src',
                value: ''
            }],
            srcsetAttr;
        attrValues.forEach((function() {
            return function(prop) {
                setupAttributes(prop);
                //initialize attribute
                elem[prop.name] = prop.value;
            };
        }()));
        return elem.getAttributeNode('srcset');

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
            form[prop.name].addEventListener('keyup', function(e) {
                elem[prop.name] = e.target.value;
            }, true);
        }
    }
}(window));
