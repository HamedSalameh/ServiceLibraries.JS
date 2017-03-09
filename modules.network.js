var network = (function () {
    "use strict";

    var serverData = (function () {

        var checkServerData = function (serverDataHolderId, onServerSuccessResponseCallbackFn, onServerFailureResponseCallbackFn) {
            try {
                var serverData = $("#" + serverDataHolderId).val();
            } catch (err) {
                throw new jsiException("Unable to locate element in DOM that holds the server data", serverDataHolderId);
            }
            var ResultStatus = modules.network.ServerResponse.IsSuccess(serverData);

            if (ResultStatus === true) {
                // all went ok!
                if (typeof onServerSuccessResponseCallbackFn !== 'undefined') {
                    try {
                        onServerSuccessResponseCallbackFn(serverData);
                    } catch (err) {
                        console.log(".network.serverData.checkServerData : Exception in onServerSuccessResponseCallbackFn : " + err);
                        throw err;
                    }
                }
                else {
                    console.log(".network.serverData.checkServerData : onServerSuccessResponseCallbackFn was not provided");
                }
            } else {
                if (typeof onServerFailureResponseCallbackFn !== 'undefined') {
                    try {
                        onServerFailureResponseCallbackFn(serverData);
                    } catch (err) {
                        console.log(".network.serverData.checkServerData : Exception in onServerFailureResponseCallbackFn : " + err);
                        throw err;
                    }

                } else {
                    console.log(".network.serverData.checkServerData : onServerFailureResponseCallbackFn was not provided");
                }
            }

        }

        return {
            CheckServerData: function (serverDataHolderId, onServerSuccessResponseCallbackFn, onServerFailureResponseCallbackFn) {
                return checkServerData(serverDataHolderId, onServerSuccessResponseCallbackFn, onServerFailureResponseCallbackFn);
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
            if (message) {
                message = modules.general.CreateJsonArray(message);
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
                message = modules.general.CreateJsonArray(message);
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

    var serverCall = function (serverUrl, ajaxType, formData, successCallbackFn, failureCallbackFn) {

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
                if (typeof successCallbackFn !== 'undefined') {
                    try {
                        successCallbackFn();
                    } catch (err) {
                        console.log(".network.serverData.serverCall : Exception in successCallbackFn : " + err);
                        throw err;
                    }
                }
            } else {
                // something went wrong
                if (typeof failureCallbackFn !== 'undefined') {
                    try {
                        failureCallbackFn();
                    } catch (err) {
                        console.log(".network.serverData.serverCall : Exception in failureCallbackFn : " + err);
                        throw err;
                    }
                }
            }

        }).fail(function (result) {
            // general ajax failure
            console.log(".network.serverData.serverCall : general ajax failure." + result);
        });
    }

    return {
        ModuleName: "network",
        ServerCall: function (serverUrl, ajaxType, formData, successCallbackFn, failureCallbackFn) {
            return serverCall(serverUrl, ajaxType, formData, successCallbackFn, failureCallbackFn);
        },
        ServerData: serverData,
        ServerResponse: serverResponse
    }

})();

