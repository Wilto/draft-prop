(function(exports, window) {
    var uri = decodeURIComponent(window.location),
        query = uri.split("?")[1],
        props = {},
        vp,
        w,
        h,
        x;

    for (var component, qcomponents = query.split('&'); qcomponents.length > 0;) {
        component = qcomponents.pop().split('=');
        if (component.length === 2) {
            props[component[0]] = component[1];
        }
    }

    w = parseInt(props.vpwidth, 10);
    h = parseInt(props.vpheight, 10);
    x = parseFloat(props.vpdensity);

    vp = new CustomViewport(w, h, x);

    if(Boolean(props.vplocked)){
        vp.lock(w,h,x);
    }

    //Export the viewport as exports.customViewport;
    Object.defineProperty(exports, 'customViewport', {
        get: function() {
            return vp;
        }
    });

    function CustomViewport(w, h, x) {
        if (!(this instanceof CustomViewport)) {
            return new Viewport();
        }

        var width,
            height,
            density,
            metatag,
            isReady = false,
            locked = false,
            self = this,
            dispatcher = window.document.createElement('x-dispatcher'),
            props;

        //public interfaces
        props = {
            height: {
                get: heightGetter,
                set: heightSetter
            },
            width: {
                get: widthGetter,
                set: widthSetter
            },
            density: {
                get: densityGetter,
                set: densitySetter
            },
            dimensions: {
                value: copyDimensions
            },
            on: {
                value: function(type, callback) {
                    dispatcher.addEventListener(type, callback, false);
                }
            },
            removeListener: {
                value: function(type, callback) {
                    dispatcher.removeEventListener(type, callback, false);
                }
            },
            ready: {
                get: function() {
                    return isReady;
                }
            },
            lock: {
                value: lock
            },
            unlock: {
                value: unlock
            },
            locked: {
                get: function() {
                    return locked;
                }
            }
        };

        Object.defineProperties(this, props);
        init.call(this);

        function init() {
            addMetaviewport();
            this.width = w;
            this.height = h;
            this.density = x;
            window.addEventListener('resize', setToWindowSize, false);
            isReady = true;
            dispatchEvent('ready');
        }

        function setToWindowSize() {
            var w = window.innerWidth,
                h = window.innerHeight,
                x = (window.devicePixelRatio) || 1;
            dimensionSetter(w, h, x);
        }

        function copyDimensions() {
            return new Dimensions();
            function Dimensions() {
                this.width = width;
                this.height = height;
                this.density = density;
                this.viewport = self;
            }
        }

        function lock(w, h, x) {
            dimensionSetter(w, h, x);
            if (!locked) {
                window.removeEventListener('resize', setToWindowSize, false);
                locked = true;
                dispatchEvent('lockchange');
            }
        }

        function unlock() {
            if (locked) {
                window.addEventListener('resize', setToWindowSize, false);
                locked = false;
                dispatchEvent('lockchange');
            }
        }

        function addMetaviewport() {
            var observer;
            metatag = window.document.querySelector('head > meta[name=viewport]');
            if (!(metatag)) {
                metatag = document.createElement('meta');
                metatag.setAttribute('name', 'viewport');
                document.head.appendElement(metatag);
            }
        }

        function dimensionSetter(w,h,x) {
            var newWidth = (parseInt(w, 10)) || width || window.innerWidth,
                newHeight = (parseInt(h, 10)) || height || window.innerHeight,
                newDensity = (parseFloat(x)) || (window.devicePixelRatio) || 1,
                changed = false;
            if (newWidth !== width) {
                width = newWidth;
                changed = true;
            }

            if (newHeight !== height) {
                height = newHeight;
                changed = true;
            }

            if (newDensity !== density) {
                density = newDensity;
                changed = true;
            }

            if (metatag && changed) {
                //only update if we are still interactive
                //otherwise, it doesn't really help
                if(window.document.readyState !== "complete"){
                    updateMeta();
                }
                dispatchEvent('change');
            }
        }

        function updateMeta() {
            var content = '';
            content += (!(isNaN(width))) ? 'width=' + width + ',' : '';
            content += (!(isNaN(height))) ? 'height=' + height + ',' : '';
            content += (!(isNaN(density))) ? 'target-densitydpi=' + density : '';
            //remove trailing ",", as browser whinge about it.
            if (/,$/.test(content)) {
                content = content.substr(0, content.length - 1);
            }
            metatag.content = content;
        }

        function widthSetter(w) {
             dimensionSetter(w, height, density);
        }

        function heightSetter(h) {
             dimensionSetter(width, h, density);
        }

        function densitySetter(x) {
            dimensionSetter(width, height, x);
        }

        function heightGetter() {
            return height;
        }

        function densityGetter() {
            return density;
        }

        function widthGetter() {
            return width;
        }

        function dispatchEvent(type) {
            var e = document.createEvent('CustomEvent');
            e.initEvent(type, false, false, null);
            dispatcher.dispatchEvent(e);
        }
    }

}(this, window));
