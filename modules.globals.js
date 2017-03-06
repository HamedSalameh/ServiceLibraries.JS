/////////////////////////////////////////////////////////////////////////////////////
// jsiException
/////////////////////////////////////////////////////////////////////////////////////
function jsiException(Message, SourceObject) {
    this.message = Message;
    this.sourceObject = SourceObject;
    // Use V8's native method if available, otherwise fallback
    if ("captureStackTrace" in Error) {
        Error.captureStackTrace(this, jsiException);
    } else {
        this.stack = (new Error()).stack;
    }
}

jsiException.prototype = Object.create(Error.prototype);
jsiException.prototype.name = "jsiException";
jsiException.prototype.constructor = jsiException;

/////////////////////////////////////////////////////////////////////////////////////
// dataObject
/////////////////////////////////////////////////////////////////////////////////////
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

/////////////////////////////////////////////////////////////////////////////////////
// Globals
/////////////////////////////////////////////////////////////////////////////////////
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
        },
        AlertType: {
            success: 0,
            info: 1,
            warning: 2,
            danger: 3
        }
    };

})();