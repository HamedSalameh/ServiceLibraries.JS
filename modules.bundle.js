var modules = (function () {
    "use strict";
    
    // The loaded modules
    var modulesBundle = {}

    for (var i = 0; i < arguments.length; i++) {
        var _module = arguments[i];
        if (typeof _module !== 'undefined' && typeof _module.ModuleName !== 'undefined' && _module.ModuleName !== '') {
            modulesBundle[_module.ModuleName] = _module;
        }
    }
   
    return modulesBundle;

})(general, globals, network, security, ui);
