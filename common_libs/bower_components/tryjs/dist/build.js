! function(root) {

    var _onthrow = function(e) {
        root.Badjs('[tryjs]' + e, e.stack || window.location);
        // throw a error and badjs will ignore this error
        badjsIgnore();
    };

    try {
        badjsIngore();
    } catch (e) {
        if (!e.stack) {
            return;
        }
    }

    // merge
    function _merge(org, obj) {
        var key;
        for (key in obj) {
            org[key] = obj[key];
        }
    }

    // function or not
    function _isFunction(foo) {
        return typeof foo === 'function';
    }

    function cat(foo, args) {
        return function() {
            try {
                return foo.apply(this, args || arguments);
            } catch (e) {
                _onthrow(e);
            }
        };
    }

    function catArgs(foo) {
        return function() {
            var arg, args = [];
            for (var i = 0, l = arguments.length; i < l; i++) {
                arg = arguments[i];
                _isFunction(arg) && (arg = cat(arg));
                args.push(arg);
            }
            return foo.apply(this, args);
        }
    }

    function catTimeout(foo) {
        return function(cb, timeout) {
            // for setTimeout(string, delay)
            if (typeof cb === 'string') {
                try {
                    cb = new Function(cb);
                } catch (e) {
                    _onthrow(e);
                }
            }
            var args = [].slice.call(arguments, 2);
            // for setTimeout(function, delay, param1, ...)
            cb = cat(cb, args.length && args);
            return foo(cb, timeout);
        }
    }

    root.setTimeout = catTimeout(root.setTimeout);
    root.setInterval = catTimeout(root.setInterval);

    var _require = root.require,
        _define = root.define;
    if (_require && _define) {
        root.require = catArgs(_require);
        _merge(root.require, _require);
        root.define = catArgs(_define);
        _merge(root.define, _define);
    }




    /**
     * makeArgsTry
     * wrap a function's arguments with try & catch
     * @param {Function} foo
     * @param {Object} self
     * @returns {Function}
     */
    function makeArgsTry(foo, self) {
        return function() {
            var arg, tmp, args = [];
            for (var i = 0, l = arguments.length; i < l; i++) {
                arg = arguments[i];
                _isFunction(arg) && (tmp = cat(arg)) &&
                    (arg.tryWrap = tmp) && (arg = tmp);
                args.push(arg);
            }
            return foo.apply(self || this, args);
        }
    }

    /**
     * makeObjTry
     * wrap a object's all value with try & catch
     * @param {Function} foo
     * @param {Object} self
     * @returns {Function}
     */
    function makeObjTry(obj) {
        var key, value;
        for (key in obj) {
            value = obj[key];
            if (_isFunction(value)) obj[key] = cat(value);
        }
        return obj;
    }

    var _add = root.jQuery && root.jQuery.event.add,
        _ajax = root.jQuery && root.jQuery.ajax,
        _remove = root.jQuery && root.jQuery.event.remove;

    if (_add) {
        root.jQuery.event.add = makeArgsTry(_add);
        root.jQuery.event.remove = function() {
            var arg, args = [];
            for (var i = 0, l = arguments.length; i < l; i++) {
                arg = arguments[i];
                _isFunction(arg) && (arg = arg.tryWrap);
                args.push(arg);
            }
            return _remove.apply(this, args);
        }
    }

    if (_ajax) {
        root.jQuery.ajax = function(url, setting) {
            if (!setting) {
                setting = url;
                url = undefined;
            }
            makeObjTry(setting);
            if (url) return _ajax.call(root.jQuery, url, setting);
            return _ajax.call(root.jQuery, setting);
        }
    }

}(window);
