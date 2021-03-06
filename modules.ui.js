var ui = (function() {
    "use strict";

    var toggleDisplayEdit = function(event, containerElementType, displayItemClass, cancelChanges) {
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

    var openPartialViewModal = function(serverURL, data, targetModal) {

        var _targetModal = modules.general.GetElement(targetModal, globals.ElementIDExtention.ModalId);
        _targetModal = $(_targetModal);

        $.ajax({
            url: serverURL,
            data: data,
            type: "GET",
            success: function(response) {
                $("#" + targetModal + "FormBody").html(response);
                _targetModal.modal();
            },
            failure: function(response) {
                console.log("Server call failed: ", response);
            },
            error: function(response) {
                console.log("Server call returned with error(s): ", response);
            }
        });

    };

    var showAlert = function(element, type, results) {

        if (element != null && type != null) {
            var e = {};
            try {
                e = modules.general.GetElement(element, globals.ElementIDExtention.AlertContainer);
            } catch (err) {
                throw err;
            }
            // clear the previous messages
            e.innerHTML = "";

            var className = "alert alert-dismissible ";

            if (type === globals.AlertType.success) {
                className += " alert-success";
            } else if (type === globals.AlertType.info) {
                className += " alert-info";
            } else if (type === globals.AlertType.warning) {
                className += " alert-warning";
            } else if (type === globals.AlertType.danger) {
                className += " alert-danger";
            }
            e.className += className;

            // Validate we are dealing with array
            try {
                results = modules.general.CreateJsonArray(results);
            } catch (err) {
                throw err;
            }

            for (var i = 0; i < results.length; i++) {
                if (modules.network.ServerResponse.GetType(results[i]) === globals.ResponseType.Validation) {
                    e.innerHTML += "<span>" + results[i].PropertyName + " : " + results[i].Message + "</span></br>";
                } else if (modules.network.ServerResponse.GetType(results[i]) === globals.ResponseType.Operation) {
                    e.innerHTML += "<span>" + results[i].Message + "</span></br>";
                }
            }

        }
    };

    return {
        ModuleName: "ui",
        ToggleDisplayEdit: function(event, containerElement, displayItemClass, cancelChanges) {
            return toggleDisplayEdit(event, containerElement, displayItemClass, cancelChanges);
        },
        OpenPartialViewModal: function(serverURL, data, targetModal) {
            return openPartialViewModal(serverURL, data, targetModal);
        },
        ShowAlert: function (element, type, results) {
            return showAlert(element, type, results);
        }
    };

})();

var alerts = (function() {

    return {
        ModuleName: "alerts",
        Success: function(element, text) {
            ui.ShowAlert(element,  globals.AlertType.success, text);
        },
        Info: function(element, text) {
            ui.ShowAlert(element, globals.AlertType.info, text);
        },
        Warning: function(element, text) {
            ui.ShowAlert(element, globals.AlertType.warning, text);
        },
        Danger: function(element, text) {
            ui.ShowAlert(element, globals.AlertType.danger, text);
        }
    };

})();