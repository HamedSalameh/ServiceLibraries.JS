var security = (function() {
    "use strict";

    var getAntiForgeryToken = function(containerElement) {
        var token = null;
        // save the updates on the server
        if (typeof containerElement !== 'undefined') {
            var element = $('#' + containerElement);
            if (element !== 'undefined') {
                token = $('input[name="__RequestVerificationToken"]', element).val();
            } else {
                token = null;
            }
        } else {
            throw new jsiException(".security.GetAntiForgeryToken : Container element must not be null.", containerElement);
        }
        return token;
    }

    return {
        ModuleName: "security",
        GetAntiForgeryToken: function(containerElement) {
            return getAntiForgeryToken(containerElement);
        }
    }


})();