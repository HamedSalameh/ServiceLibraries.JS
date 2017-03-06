var responseHandler = (function() {

    return {
        getType: function(message) {
            if (message !== null) {
                if (message.Type === globals.ResponseType.Operation) {
                    return globals.ResponseType.Operation;
                } else if (message.Type === globals.ResponseType.Validation) {
                    return globals.ResponseType.Validation;
                }
            } else {
                return globals.ResponseType.Unknown;
            }
        },
        isFailure: function(message) {
            if (message !== null) {
                message = generalServices.CreateJsonArray(message);
                // iterate all response objects
                if (message.length > 0) {
                    for (var i = 0; i < message.length; i++) {
                        if (message[i].Status === globals.ResultStatus.Failure) {
                            return true;
                        }
                    }
                }
            }
            return false;
        },
        isSuccess: function(message) {
            if (message !== null) {
                message = generalServices.CreateJsonArray(message);
                if (message.length > 0) {
                    for (var i = 0; i < message.length; i++) {
                        if (message[i].Status !== globals.ResultStatus.Success) {
                            return false;
                        }
                    }
                }
            }
            return true;
        }
    };

})();

var generalServices = (function() {
    "use strict";

    var checkServerData = function(serverDataHolderId, alertBoxName, successCallbackFn) {
        try {
            var serverData = $("#" + serverDataHolderId).val();
        } catch (err) {
            throw new jsiException("Unable to locate element in DOM that holds the server data", serverDataHolderId);
        }
        var ResultStatus = responseHandler.isSuccess(serverData);

        if (ResultStatus === true) {
            // all went ok!
            if (typeof successCallbackFn !== 'undefined') {
                try {
                    successCallbackFn();
                } catch (err) {
                    throw err;
                }
            }
        } else {
            // something went wrong
            var res = responseHandler.isFailure(serverData);
            if (res === true) {
                alerts.warning(alertBoxName, serverData);
            } else {
                alerts.danger(alertBoxName, serverData);
            }
        };
    };

    var serverCall = function(serverUrl, ajaxType, formData, successCallbackFn, alertBoxName) {

        var asyncCreate = function() {
            return $.ajax({
                url: serverUrl,
                data: formData,
                type: ajaxType
            });
        };

        asyncCreate().done(function(result) {
            var res = responseHandler.isSuccess(result);
            if (res == true) {
                // all went ok!
                successCallbackFn();
            } else {
                // something went wrong
                var res = responseHandler.isFailure(result);
                if (res == true) {
                    alerts.warning(alertBoxName, result);
                } else {
                    alerts.danger(alertBoxName, result);
                }
            }

        }).fail(function(result) {
            // general ajax failure
            console.log(result);
        });
    }



    return {

        ServerCall: function(serverUrl, ajaxType, formData, successCallbackFn, alertBoxName) {
            return serverCall(serverUrl, ajaxType, formData, successCallbackFn, alertBoxName);
        },
        CheckServerData: function(serverDataHolderId, alertBoxName) {
            return checkServerData(serverDataHolderId, alertBoxName);
        },

    };
})();