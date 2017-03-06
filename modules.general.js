var general = (function() {
    "use strict";

    var _clone = function(obj) {
        var copy;

        // Handle the 3 simple types, and null or undefined
        if (null == obj || "object" != typeof obj) return obj;

        // Handle Date
        if (obj instanceof Date) {
            copy = new Date();
            copy.setTime(obj.getTime());
            return copy;
        }

        // Handle Array
        if (obj instanceof Array) {
            copy = [];
            for (var i = 0, len = obj.length; i < len; i++) {
                copy[i] = clone(obj[i]);
            }
            return copy;
        }

        // Handle Object
        if (obj instanceof Object) {
            copy = {};
            for (var attr in obj) {
                if (obj.hasOwnProperty(attr)) copy[attr] = clone(obj[attr]);
            }
            return copy;
        }

        throw new jsiException("Unable to copy obj! Its type isn't supported.", obj);
    }

    var _getElement = function(elementId, elementIdExtention) {
        // try locate the element
        var e = document.getElementById(elementId);
        if (e === 'undefined' || e === null) {
            e = document.getElementById(elementId + elementIdExtention);
        }
        //in case element was not located by Id, try appending _alertBox to the ID and search again
        if (e === 'undefined' || e === null) {
            // could not locate element on DOM to place the alert box
            throw new jsiException("Could not locate element on DOM to inject alert.", elementId);
        }
        return e;
    };

    var _createJsonArray = function(source) {

        var _isArray = Array.isArray(source);
        if (_isArray === false) {
            // try convert to array
            try {
                var _tempArray = JSON.parse(source);
            } catch (err) {
                throw new jsiException("JSINFRA : unable to create array from object.", source);
            }
            // return the converted array or an empty array
            return _tempArray || [];
        } else {
            return source;
        }
    };

    return {
        ModuleName: "general",
        Clone: function(obj) {
            return _clone(obj);
        },
        GetElement: function(elementId, elementIdExtention) {
            return _getElement(elementId, elementIdExtention);
        },
        CreateJsonArray: function(source) {
            return _createJsonArray(source);
        }
    }

})();

