var network = (function () {
    "use strict";

    var serverData = (function () {

        var checkServerData = function (serverDataHolderId, alertBoxName, successCallbackFn) {
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

        return {
            CheckServerData: function (serverDataHolderId, alertBoxName) {
                return checkServerData(serverDataHolderId, alertBoxName);
            },

        };

    })();

    var serverResponse = (function () {

        var getType = function (message) {
            if (message !== null) {
                if (message.Type === globals.ResponseType.Operation) {
                    return globals.ResponseType.Operation;
                } else if (message.Type === globals.ResponseType.Validation) {
                    return globals.ResponseType.Validation;
                }
            } else {
                return globals.ResponseType.Unknown;
            }
        }

        var isFailure = function (message) {
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
        };

        var isSuccess = function (message) {
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
        };

        return {
            GetType: function (message) {
                return getType(message);
            },
            IsFailure: function (message) {
                return isFailure(message);
            },
            IsSuccess: function (message) {
                return isSuccess(message);
            }
        };

    })();

    var serverCall = function (serverUrl, ajaxType, formData, successCallbackFn, alertBoxName) {

        var asyncCreate = function () {
            return $.ajax({
                url: serverUrl,
                data: formData,
                type: ajaxType
            });
        };

        asyncCreate().done(function (result) {
            var res = serverResponse.IsSuccess(result);
            if (res == true) {
                // all went ok!
                successCallbackFn();
            } else {
                // something went wrong
                var res = serverResponse.IsFailure(result);
                if (res == true) {
                    alerts.warning(alertBoxName, result);
                } else {
                    alerts.danger(alertBoxName, result);
                }
            }

        }).fail(function (result) {
            // general ajax failure
            console.log(result);
        });
    }

    return {
        ModuleName: "network",
        ServerCall: function (serverUrl, ajaxType, formData, successCallbackFn, alertBoxName) {
            return serverCall(serverUrl, ajaxType, formData, successCallbackFn, alertBoxName);
        },
        ServerData: serverData,
        ServerResponse: serverResponse
    }

})();

