(function(exports, window) {
    var uri = new URI(window.location.href),
        props = uri.search(true),
        w = parseInt(props.vpwidth, 10),
        h = parseInt(props.vpheight, 10),
        x = parseFloat(props.vpdensity),
        locked = Boolean(props.vplocked),
        vp = new CustomViewport(w, h, x, locked);
    //Export the viewport as exports.customViewport;
    Object.defineProperty(exports, 'customViewport', {
        get: function() {
            return vp;
        }
    });

    function CustomViewport(w, h, x, initiaLlock) {
        if (!(this instanceof CustomViewport)) {
            return new Viewport(w, h, x);
        }
        var dimensions = new Dimensions(),
            metatag = addMetaviewport(),
            isReady = false,
            isLocked = true,
            self = this,
            dispatcher = window.document.createElement('x-dispatcher'),
            props;

        //public interfaces
        props = {
            height: {
                get: function() {
                    return dimensionGetter('height');
                },
                set: function(h) {
                    dimensionSetter(undefined, h, undefined);
                }
            },
            width: {
                get: function() {
                    return dimensionGetter('width');
                },
                set: function(w) {
                    dimensionSetter(w, undefined, undefined);
                }
            },
            density: {
                get: function() {
                    return dimensionGetter('density');
                },
                set: function(x) {
                    dimensionSetter(undefined, undefined, x);
                }
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
                    return isLocked;
                },
                set: function(value) {
                    if (Boolean(value)) {
                        self.lock();
                    }else {
                        self.unlock();
                    }
                }
            }
        };
        Object.defineProperties(this, props);
        init(w, h, x, initiaLlock);

        function init(w, h, x, lock) {
            if (Boolean(lock)) {
                self.lock(w, h, x);
            }else {
                dimensionSetter(w, h, x);
                unlock();
            }
            setupDone();
        }

        function setupDone() {
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
            var w = dimensions.width,
                h = dimensions.height,
                x = dimensions.density;
            return new Dimensions(w, h, x);
        }

        function Dimensions(w, h, x) {
            this.width = w;
            this.height = h;
            this.density = x;
        }

        function lock(w, h, x) {
            dimensionSetter(w, h, x);
            if (!isLocked) {
                window.removeEventListener('resize', setToWindowSize, false);
                isLocked = true;
                dispatchEvent('lockchange');
            }
        }

        function unlock() {
            if (isLocked) {
                window.addEventListener('resize', setToWindowSize, false);
                isLocked = false;
                dispatchEvent('lockchange');
            }
        }

        function addMetaviewport() {
            var meta = window.document.querySelector('head > meta[name=viewport]');
            if (!(meta)) {
                meta = document.createElement('meta');
                meta.setAttribute('name', 'viewport');
                document.head.appendElement(metatag);
            }
            return meta;
        }

        function dimensionSetter(w, h, x) {
            var newWidth = (parseInt(w, 10)) || dimensions.width || window.innerWidth,
                newHeight = (parseInt(h, 10)) || dimensions.height || window.innerHeight,
                newDensity = (parseFloat(x)) || dimensions.density || (window.devicePixelRatio) || 1,
                changed = false;
            if (newWidth !== dimensions.width) {
                dimensions.width = newWidth;
                changed = true;
            }
            if (newHeight !== dimensions.height) {
                dimensions.height = newHeight;
                changed = true;
            }
            if (newDensity !== dimensions.density) {
                dimensions.density = newDensity;
                changed = true;
            }
            if (changed) {
                updateMeta();
                dispatchEvent('change');
            }
        }

        function updateMeta() {
            var content = '',
                w = dimensions.width,
                h = dimensions.height,
                x = dimensions.density;
            //only update if document is still interactive
            //otherwise, it doesn't really help
            if (window.document.readyState !== 'complete') {
                content += (!(isNaN(w))) ? 'width=' + w + ',' : '';
                content += (!(isNaN(h))) ? 'height=' + h + ',' : '';
                content += (!(isNaN(x))) ? 'target-densitydpi=' + x : '';
                //remove trailing ",", as browser whinge about it.
                if (/,$/.test(content)) {
                    content = content.substr(0, content.length - 1);
                }
                metatag.content = content;
            }
        }

        function dimensionGetter(prop) {
            return dimensions[prop];
        }

        function dispatchEvent(type) {
            var e = new CustomEvent(type);
            dispatcher.dispatchEvent(e);
        }
    }
}(this, window));
