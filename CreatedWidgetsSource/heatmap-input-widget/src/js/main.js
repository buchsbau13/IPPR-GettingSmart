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
        info;

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
            "from": {
                label: 'Date From',
                type: 'text',
                required: true
            },
            "to": {
                label: 'Date To',
                type: 'text',
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
            }
        };
        form = new StyledElements.Form(fields, {cancelButton: false, acceptButton: false});
        form.fieldInterfaces.attribute.inputElement.addEventListener('change', onInputChange);
        form.fieldInterfaces.from.inputElement.addEventListener('change', onInputChange);
        form.fieldInterfaces.to.inputElement.addEventListener('change', onInputChange);
        form.fieldInterfaces.maxValues.inputElement.addEventListener('change', onInputChange);
        layout.getCenterContainer().appendChild(form);
        layout.insertInto(document.body);

        moment.locale('de-at');
        var beginMoment = new Date();
        var endMoment = new Date();
        beginMoment = moment.utc(beginMoment.setDate(beginMoment.getDate() - 7));
        endMoment = moment.utc(endMoment.setHours(endMoment.getHours() + 2));

        form.fieldInterfaces.from.inputElement.setValue(moment.utc(beginMoment).format("LLL"));
        form.fieldInterfaces.to.inputElement.setValue(moment.utc(endMoment).format("LLL"));

        $("#rangePrimary").ionRangeSlider({
            type: "double",
            min: moment(beginMoment).format("X"),
            max: moment(endMoment).format("X"),
            from: moment(beginMoment).format("X"),
            to: moment(endMoment).format("X"),
            prettify: function (num) {
                return moment.utc(num, "X").format("LLL");
            },
            onFinish: function (data) {
                form.fieldInterfaces.from.inputElement.setValue(moment.utc(moment.unix(data.from)).format("LLL"));
                form.fieldInterfaces.to.inputElement.setValue(moment.utc(moment.unix(data.to)).format("LLL"));
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
        MashupPlatform.wiring.pushEvent('dateFrom', moment(form.fieldInterfaces.from.inputElement.getValue(), 'LLL', 'de').utcOffset(offset).toISOString());
        MashupPlatform.wiring.pushEvent('dateTo', moment(form.fieldInterfaces.to.inputElement.getValue(), 'LLL', 'de').utcOffset(offset).toISOString());
        MashupPlatform.wiring.pushEvent('entities', JSON.stringify(currentData));
        MashupPlatform.wiring.pushEvent('maxValues', form.fieldInterfaces.maxValues.inputElement.getValue());

        MashupPlatform.widget.log(
            "Data will be retrieved for Attribute: " + form.fieldInterfaces.attribute.inputElement.getValue() +
            " from " + form.fieldInterfaces.from.inputElement.getValue() +
            " to " + form.fieldInterfaces.to.inputElement.getValue(),
            MashupPlatform.log.INFO);
    };

    window.addEventListener("DOMContentLoaded", init, false);
})();
