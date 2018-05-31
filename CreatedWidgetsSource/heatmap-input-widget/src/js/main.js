/*
 * Copyright (c) 2013-2016 CoNWeT Lab., Universidad Politécnica de Madrid
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/* global $, moment, MashupPlatform, StyledElements, NGSI */

(function () {

    "use strict";

    var layout,
        ngsi,
        form,
        currentData,
        error,
        info,
        fromValue,
        toValue,
        timeWidget,
        buttonEdit,
        timestampInput;

    var create_ngsi_connection = function create_ngsi_connection() {
        var request_headers = {};

        if (MashupPlatform.prefs.get('use_owner_credentials')) {
            request_headers['X-FIWARE-OAuth-Token'] = 'true';
            request_headers['X-FIWARE-OAuth-Header-Name'] = 'X-Auth-Token';
            request_headers['X-FIWARE-OAuth-Source'] = 'workspaceowner';
        }

        var tenant = MashupPlatform.prefs.get('ngsi_tenant').trim();
        if (tenant !== '') {
            request_headers['FIWARE-Service'] = tenant;
        }

        var path = MashupPlatform.prefs.get('ngsi_service_path').trim();
        if (path !== '' && path !== '/') {
            request_headers['FIWARE-ServicePath'] = path;
        }

        ngsi = new NGSI.Connection(MashupPlatform.prefs.get('ngsi_server'), {
            use_user_fiware_token: MashupPlatform.prefs.get('use_user_fiware_token'),
            request_headers: request_headers
        });
    };

    var init = function init() {
        layout = new StyledElements.BorderLayout({'class': 'loading'});
        var fields = {
            "attribute": {
                label: 'Attribute Name',
                type: 'select',
                initialEntries: [{
                    label: "-------------------",
                    value: ""
                }],
                required: true
            },
            "maxValues": {
                label: 'Max Values Per Entity',
                type: 'select',
                initialEntries: [
                    {value: "250"},
                    {value: "500"},
                    {value: "750"},
                    {value: "1000"}
                ],
                required: true
            },
            "dateRange": {
                label: 'Date Range',
                type: 'text',
                required: true,
                readOnly: true
            },
        };
        buttonEdit = new StyledElements.Button({
            class: "se-btn-circle z-depth-3 edit-button",
            text: "Edit date range"
        });
        buttonEdit.addEventListener('click', initTimeWidget);
        timestampInput = MashupPlatform.widget.createInputEndpoint(changeDateRange);

        form = new StyledElements.Form(fields, {cancelButton: false, acceptButton: false});
        form.fieldInterfaces.attribute.inputElement.addEventListener('change', onInputChange);
        form.fieldInterfaces.maxValues.inputElement.addEventListener('change', onInputChange);
        layout.getCenterContainer().appendChild(form);
        layout.getCenterContainer().appendChild(buttonEdit);
        layout.insertInto(document.body);

        moment.locale('de-at');
        var beginMoment = new Date();
        var endMoment = new Date();
        beginMoment = moment(beginMoment.setDate(beginMoment.getDate() - 7));
        endMoment = moment(endMoment.setHours(endMoment.getHours() + 2));

        fromValue = moment(beginMoment).format("LLL");
        toValue = moment(endMoment).format("LLL");
        form.fieldInterfaces.dateRange.inputElement.setValue(String(fromValue) + " - " + String(toValue));

        $("#rangePrimary").ionRangeSlider({
            type: "double",
            min: moment(beginMoment).format("X"),
            max: moment(endMoment).format("X"),
            from: moment(beginMoment).format("X"),
            to: moment(endMoment).format("X"),
            prettify: function (num) {
                return moment(num, "X").format("LLL");
            },
            onFinish: function (data) {
                fromValue = moment(moment.unix(data.from)).format("LLL");
                toValue = moment(moment.unix(data.to)).format("LLL");
                onInputChange();
            }
        });

        // Create the error div
        error = document.createElement('div');
        error.setAttribute('class', 'alert alert-danger div_spaced');
        error.setAttribute('id', error);
        layout.getCenterContainer().appendChild(error);

        // Create the warn div
        info = document.createElement('div');
        info.setAttribute('class', 'alert alert-success div_spaced');
        info.setAttribute('id', "info");
        layout.getCenterContainer().appendChild(info);

        hiddeStautsDivs();

        layout.repaint();
        create_ngsi_connection();
        doQuery();
    };

    var initTimeWidget = function initTimeWidget() {
        if (timeWidget) {
            timeWidget.remove();
        }
        timeWidget = MashupPlatform.mashup.addWidget('FH-JOANNEUM/date-range/1.0', {refposition: buttonEdit.getBoundingClientRect()});
        timeWidget.addEventListener('remove', function () { timeWidget = null; });

        timestampInput.connect(timeWidget.outputs.timestamps);
    };

    var changeDateRange = function changeDateRange(input) {
        if (input !== "exit") {
            var data = JSON.parse(input);
            fromValue = moment(data.start).format("LLL");
            toValue = moment(data.end).format("LLL");
            form.fieldInterfaces.dateRange.inputElement.setValue(String(fromValue) + " - " + String(toValue));
            $("#rangePrimary").data("ionRangeSlider").update({
                min: moment(data.start).format("X"),
                max: moment(data.end).format("X"),
                from: moment(data.start).format("X"),
                to: moment(data.end).format("X")
            });
            onInputChange();
        }
        timeWidget.remove();
    };

    var fail = function fail(msg) {
        error.innerHTML = msg;
        error.classList.remove('hidden');
        info.classList.add('hidden');
    };

    var hiddeStautsDivs = function hiddeStautsDivs() {
        info.classList.add('hidden');
        error.classList.add('hidden');
    };

    var doQuery = function doQuery() {
        form.disable();
        hiddeStautsDivs();

        var id = {
            isPattern: true,
            id: MashupPlatform.prefs.get('entity_id_pattern')
        };

        ngsi.query([id],
            null,
            {
                flat: true,
                onSuccess: onQuerySuccess,
                onFailure: onQueryFail
            }
        );
    };

    var onQuerySuccess = function onQuerySuccess(data) {
        currentData = data;

        var types = MashupPlatform.prefs.get('entity_types').trim();
        Object.keys(currentData).forEach(function (key) {
            if (types.indexOf(currentData[key].type) === -1) {
                delete currentData[key];
            }
        });

        var entries = [];
        var attributes = MashupPlatform.prefs.get('attributes').trim();
        if (attributes !== "") {
            attributes = attributes.split(new RegExp(',\\s*'));
            attributes.forEach(function (element) {
                entries.push({value: element});
            });
        }

        form.fieldInterfaces.attribute.inputElement.clear();
        form.fieldInterfaces.attribute.inputElement.addEntries(entries);

        form.enable();

        // Send initial data
        onInputChange();
    };

    var onQueryFail = function onQueryFail(e) {
        form.disable();
        fail('Fail querying the server: ' + e);
    };

    MashupPlatform.prefs.registerCallback(function (new_values) {
        if ('ngsi_server' in new_values) {
            create_ngsi_connection();
        }

        doQuery();
    }.bind(this));

    MashupPlatform.widget.context.registerCallback(function (newValues) {
        if (layout && ("heightInPixels" in newValues || "widthInPixels" in newValues)) {
            layout.repaint();
        }
    }.bind(this));

    var onInputChange = function onInputChange() {
        var offset = moment().utcOffset();
        MashupPlatform.wiring.pushEvent('attribute', form.fieldInterfaces.attribute.inputElement.getValue());
        MashupPlatform.wiring.pushEvent('dateFrom', moment(fromValue, 'LLL', 'de').utcOffset(offset).toISOString());
        MashupPlatform.wiring.pushEvent('dateTo', moment(toValue, 'LLL', 'de').utcOffset(offset).toISOString());
        MashupPlatform.wiring.pushEvent('entities', JSON.stringify(currentData));
        MashupPlatform.wiring.pushEvent('maxValues', form.fieldInterfaces.maxValues.inputElement.getValue());

        MashupPlatform.widget.log(
            "Data will be retrieved for Attribute: " + form.fieldInterfaces.attribute.inputElement.getValue() +
            " from " + fromValue +
            " to " + toValue,
            MashupPlatform.log.INFO);
    };

    window.addEventListener("DOMContentLoaded", init, false);
})();
