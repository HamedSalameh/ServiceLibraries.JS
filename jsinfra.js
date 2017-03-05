// jsiException
function jsiException(Message, SourceObject) {
    this.message = Message;
    this.sourceObject = SourceObject;
    // Use V8's native method if available, otherwise fallback
    if ("captureStackTrace" in Error){
        Error.captureStackTrace(this, jsiException);
    }
    else {
        this.stack = (new Error()).stack;
    }
}

jsiException.prototype = Object.create(Error.prototype);
jsiException.prototype.name = "jsiException";
jsiException.prototype.constructor = jsiException;

// dataObject
function xdataObject(xsrfToken, dataObj) {
    this.__RequestVerificationToken = xsrfToken;
    
    // Handle the 3 simple types, and null or undefined
    if (null == dataObj || "object" != typeof dataObj) {
        return dataObj;
    }

    if (dataObj instanceof Object) {
        for (var attr in dataObj) {
            if (dataObj.hasOwnProperty(attr)) {
                this[attr] = generalServices.Clone(dataObj[attr]);
            }
        }
    }
}

xdataObject.prototype.name = "xDataObject";
xdataObject.prototype.constructor = xdataObject;

var globals = (function () {

    return {
        ResponseType: {
            Operation: 0,
            Validation: 1,
            Unknown: 2
        },
        ResultStatus: {
            Unknown: 0,
            Success: 1,
            Exception: 2,
            Failure: 3
        },
        ContainerType: {
            Alert: "_alertContainer",
            ServerData: "_serverDataContainer"
        },
        ElementIDExtention: {
            ModalId: "Modal",
            AlertContainer: "_alertBox"
        }
    };

})();

var responseHandler = (function () {

    return {
        getType: function (message) {
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
        isFailure: function (message) {
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
        isSuccess: function (message) {
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

var uiServices = (function () {
    "use strict";

    var toggleDisplayEdit = function (event, containerElementType, displayItemClass, cancelChanges) {
        if (typeof event === 'undefined') {
            throw new jsiException("toggleDisplayEdit: event object is null", event);
        }
        if (typeof containerElementType === 'undefined' || containerElementType === "") {
            throw new jsiException("toggleDisplayEdit: container element must not be null or empty.", containerElementType);
        }
        if (typeof displayItemClass === 'undefined' || displayItemClass === "") {
            throw new jsiException("toggleDisplayEdit: displated item class must not be null or empty.", displayItemClass);
        }

        var $field = $(event.currentTarget);
        var $display = $field.prev(containerElementType + '.' + displayItemClass)

        try {
            var originalValue = $(event.currentTarget).attr('ov');
        } catch (err) {
            throw new jsiException("toggleDisplayEdit: unable to get original value attribute from source element. make sure the source element contains 'ov=[value]' attribute", $(event.currentTarget));
        }

        if (cancelChanges === true) {
            $display.html(originalValue);
            $field.find(":input:first").val(originalValue);
        } else {
            // update the display item with the calcualted value of the field item
            $display.html($field.find(":input:first").val());
        }
        // show the display item, and hide the field item
        $display.show();
        $field.hide();
    }

    var openPartialViewModal = function (serverURL, data, targetModal) {

        var _targetModal = generalServices.GetElement(targetModal, globals.ElementIDExtention.ModalId);
        _targetModal = $(_targetModal);

        $.ajax({
            url: serverURL,
            data: data,
            type: "GET",
            success: function (response) {
                $("#" + targetModal + "FormBody").html(response);
                _targetModal.modal();
            },
            failure: function (response) {
                console.log("Server call failed: ", response);
            },
            error: function (response) {
                console.log("Server call returned with error(s): ", response);
            }
        });

    };

    return {
        ToggleDisplayEdit: function (event, containerElement, displayItemClass, cancelChanges) {
            return toggleDisplayEdit(event, containerElement, displayItemClass, cancelChanges);
        },
        OpenPartialViewModal: function (serverURL, data, targetModal) {
            return openPartialViewModal(serverURL, data, targetModal);
        }
    };

})();

var generalServices = (function () {
    "use strict";

    var getAntiForgeryToken = function (containerElement) {
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
            throw new jsiException("AntiForgeryToken - Container element must not be null.", containerElement);
        }
        return token;
    }

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

    var serverCall = function (serverUrl, ajaxType, formData, successCallbackFn, alertBoxName) {

        var asyncCreate = function () {
            return $.ajax({
                url: serverUrl,
                data: formData,
                type: ajaxType
            });
        };

        asyncCreate().done(function (result) {
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

        }).fail(function (result) {
            // general ajax failure
            console.log(result);
        });
    }

    var clone = function (obj) {
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

    var getElement = function (elementId, elementIdExtention) {
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

    var createJsonArray = function (source) {

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
        CreateJsonArray: function (source) {
            return createJsonArray(source);
        },
        GetElement: function (elementId, elementIdExtention) {
            return getElement(elementId, elementIdExtention);
        },
        Clone: function(obj){
            return clone(obj);
        },
        ServerCall: function (serverUrl, ajaxType, formData, successCallbackFn, alertBoxName) {
            return serverCall(serverUrl, ajaxType, formData, successCallbackFn, alertBoxName);
        },
        CheckServerData: function (serverDataHolderId, alertBoxName) {
            return checkServerData(serverDataHolderId, alertBoxName);
        },
        GetAntiForgeryToken: function(element){
            return getAntiForgeryToken(element);
        }
    };
})();

var alerts = (function () {

    var Type = {
        success: 0,
        info: 1,
        warning: 2,
        danger: 3
    };

    var showAlert = function (element, type, results) {

        if (element != null && type != null) {
            var e = {};
            try {
                e = generalServices.GetElement(element, globals.ElementIDExtention.AlertContainer);
            } catch (err) {
                throw err;
            }
            // clear the previous messages
            e.innerHTML = "";

            var className = "alert alert-dismissible ";

            if (type === Type.success) {
                className += " alert-success";
            } else if (type === Type.info) {
                className += " alert-info";
            } else if (type === Type.warning) {
                className += " alert-warning";
            } else if (type === Type.danger) {
                className += " alert-danger";
            }
            e.className += className;

            // Validate we are dealing with array
            try {
                results = generalServices.CreateJsonArray(results);
            } catch (err) {
                throw err;
            }

            for (var i = 0; i < results.length; i++) {
                if (responseHandler.getType(results[i]) === globals.ResponseType.Validation) {
                    e.innerHTML += "<span>" + results[i].PropertyName + " : " + results[i].Message + "</span></br>";
                } else if (responseHandler.getType(results[i]) === globals.ResponseType.Operation) {
                    e.innerHTML += "<span>" + results[i].Message + "</span></br>";
                }
            }

            //setTimeout(function () {
            //    var el = document.getElementById(element);
            //    $(el).alert("close");
            //}, 3000);
        }
    };

    return {
        success: function (element, text) {
            showAlert(element, Type.success, text);
        },
        info: function (element, text) {
            showAlert(element, Type.info, text);
        },
        warning: function (element, text) {
            showAlert(element, Type.warning, text);
        },
        danger: function (element, text) {
            showAlert(element, Type.danger, text);
        }
    };

})();