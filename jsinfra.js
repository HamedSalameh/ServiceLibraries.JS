var modules = (function () {
    "use strict";
    debugger;
    // The loaded modules
    var LoadedModules = {}

    for (var i = 0; i < arguments.length; i++) {
        var _module = arguments[i];
        if (typeof _module !== 'undefined' && typeof _module.ModuleName !== 'undefined' && _module.ModuleName !== '') {
            LoadedModules[_module.ModuleName] = _module;
        }
    }

   
    return LoadedModules;

})(general, globals, network, security, ui);
