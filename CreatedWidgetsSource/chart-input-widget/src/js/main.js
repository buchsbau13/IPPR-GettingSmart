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
    var unitAttributes = {};

    var create_ngsi_connection = function create_ngsi_connection() {
        var request_headers = {};

        if (MashupPlatform.prefs.get('use_user_fiware_token') || MashupPlatform.prefs.get('use_owner_credentials')) {
            request_headers['FIWARE-OAuth-Token'] = 'true';
            request_headers['FIWARE-OAuth-Header-Name'] = 'X-Auth-Token';

            if (MashupPlatform.prefs.get('use_owner_credentials')) {
                request_headers['FIWARE-OAuth-Source'] = 'workspaceowner';
            }
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
            "entity": {
                label: 'Entity Id',
                type: 'select',
                initialEntries: [{
                    label: "-------------------",
                    value: ""
                }],
                required: true
            },
            "attribute": {
                label: 'Attribute Name',
                type: 'select',
                initialEntries: [{
                    label: "-------------------",
                    value: ""
                }],
                required: true
            },
            "maxvalues": {
                label: 'Max Data Points',
                type: 'number',
                min: "1",
                max: "10000",
                initialValue: "3000",
                required: true
            },
            "aggregationPeriod": {
                label: 'Aggreg. Period',
                type: 'select',
                readOnly: true,
                initialEntries: [
                    {
                        label: "None",
                        value: false
                    },
                    {
                        label: "Month",
                        value: "month"
                    },
                    {
                        label: "Day",
                        value: "day"
                    },
                    {
                        label: "Hour",
                        value: "hour"
                    },
                ]
            },
            "aggregationMethod": {
                label: 'Aggreg. Method',
                type: 'select',
                initialEntries: [
                    {
                        label: "None",
                        value: false
                    },
                    {
                        label: "Maximum",
                        value: "max"
                    },
                    {
                        label: "Average",
                        value: "avg"
                    },
                    {
                        label: "Minimum",
                        value: "min"
                    }
                ],
                required: true
            },
            "datetime": {
                label: 'Date Range',
                type: 'text',
                required: true
            }
        };
        form = new StyledElements.Form(fields, {cancelButton: false});
        form.addEventListener("submit", updateEntity);
        form.fieldInterfaces.entity.inputElement.addEventListener('change', onEntityChange);
        form.fieldInterfaces.maxvalues.inputElement.addEventListener('change', removeMessageBar);
        form.fieldInterfaces.attribute.inputElement.addEventListener('change', removeMessageBar);
        form.fieldInterfaces.datetime.inputElement.addEventListener('change', removeMessageBar);
        form.fieldInterfaces.aggregationMethod.inputElement.addEventListener('change', onAggMethodChange);
        form.fieldInterfaces.aggregationPeriod.inputElement.addEventListener('change', onAggPeriodChange);


        moment.locale('de-at');
        $(form.fieldInterfaces.datetime.inputElement.inputElement).daterangepicker({
            timePicker: true,
            timePicker24Hour: true,
            timeZone: null,
            timePickerIncrement: 5,
            locale: {
                format: 'LLL'
            }
        });

        layout.getCenterContainer().appendChild(form);
        layout.insertInto(document.body);

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

    var complete = function complete(msg) {
        info.innerHTML = msg ? msg : 'Complete!';
        error.classList.add('hidden');
        info.classList.remove('hidden');
    };

    var hiddeStautsDivs = function hiddeStautsDivs() {
        info.classList.add('hidden');
        error.classList.add('hidden');
    };

    var onEntityChange = function onEntityChange(select) {
        var attributesFilter = MashupPlatform.prefs.get('attributes').trim();
        if (attributesFilter !== "") {
            attributesFilter = attributesFilter.split(new RegExp(',\\s*'));
        }

        var attribute_values = currentData[select.getValue()];

        if (attribute_values == null) {
            attribute_values = {};
        }

        var attributes = Object.keys(attribute_values);
        attributes = attributes.filter(function (e) {
            return this.indexOf(e) >= 0;
        }, attributesFilter);
        var old_attribute = form.fieldInterfaces.attribute.inputElement.getValue();
        var entries = [];

        for (var i = 0; i < attributes.length; i++) {
            if (['id', 'type'].indexOf(attributes[i]) === -1) {
                entries.push({value: attributes[i]});
            }
        }

        form.fieldInterfaces.attribute.inputElement.clear();
        form.fieldInterfaces.attribute.inputElement.addEntries(entries);
        if (attributes.indexOf(old_attribute) !== -1) {
            form.fieldInterfaces.attribute.inputElement.setValue(old_attribute);
        }
        removeMessageBar();
    };

    var onAggPeriodChange = function onAggPeriodChange(select) {
        var aggPeriod = select.getValue();

        if (!aggPeriod) {
            // enable number input
            form.fieldInterfaces.maxvalues.inputElement.enable();
            form.fieldInterfaces.maxvalues.inputElement.value = 3000;
        } else if (aggPeriod) {
            // disable number input
            form.fieldInterfaces.maxvalues.inputElement.value = "";
            form.fieldInterfaces.maxvalues.inputElement.disable();
        }
        removeMessageBar();
    };

    var onAggMethodChange = function onAggMethodChange(select) {
        var aggMethod = select.getValue();

        if (!aggMethod) {
            // disable agg period select
            form.fieldInterfaces.aggregationPeriod.inputElement.value = "None";
            form.fieldInterfaces.aggregationPeriod.inputElement.disable();
        } else if (aggMethod) {
            // enable agg period select
            form.fieldInterfaces.aggregationPeriod.inputElement.enable();
        }
        removeMessageBar();
    };

    var doQuery = function doQuery() {
        var entityIdList = [];
        form.disable();
        hiddeStautsDivs();

        var id_pattern = MashupPlatform.prefs.get('entity_id_pattern');
        if (id_pattern === '') {
            id_pattern = '.*';
        }

        var types = MashupPlatform.prefs.get('entity_types').split(new RegExp(',\\s*'));
        for (var i = 0; i < types.length; i++) {
            var entityId = {
                id: id_pattern,
                type: types[i],
                isPattern: true
            };
            entityIdList.push(entityId);
        }

        ngsi.query(entityIdList,
            null,
            {
                flat: true,
                onSuccess: onQuerySuccess,
                onFailure: onQueryFail
            }
        );

        // Read unit definitions from settings
        if (MashupPlatform.prefs.get('unit_attributes')) {
            var keyValueList = MashupPlatform.prefs.get('unit_attributes').split(new RegExp(',\\s*'));
            keyValueList.forEach(function (entry) {
                var pair = entry.split(new RegExp('=\\s*'));
                if (pair.length == 2) {
                    unitAttributes[pair[0]] = pair[1];
                } else {
                    unitAttributes = {};
                }
            });
        } else {
            unitAttributes = {};
        }
    };

    var onQuerySuccess = function onQuerySuccess(data) {
        var entries = [];
        currentData = data;

        for (var key in data) {
            entries.push({value: key});
        }

        form.fieldInterfaces.entity.inputElement.clear();
        form.fieldInterfaces.entity.inputElement.addEntries(entries);
        onEntityChange(form.fieldInterfaces.entity.inputElement);

        form.enable();
    };

    var onQueryFail = function onQueryFail(e) {
        form.disable();
        fail('Fail querying the server: ' + e);
    };

    var updateEntity = function updateEntity(form, data) {
        form.disable();
        hiddeStautsDivs();

        var entityId = data.entity;
        var dateParts = data.datetime.split(" - ");
        var offset = moment().utcOffset();

        var output = {};
        output.entity = currentData[entityId];
        output.attribute = data.attribute;
        output.aggregation = data.aggregation;

        // Get unit string from entity data (if available)
        if (unitAttributes && unitAttributes[data.attribute] && currentData[entityId][unitAttributes[data.attribute]]) {
            output.unit = currentData[entityId][unitAttributes[data.attribute]];
        } else {
            output.unit = "";
        }

        output.startDate = moment(dateParts[0], 'LLL', 'de').utcOffset(offset).toISOString();
        output.endDate = moment(dateParts[1], 'LLL', 'de').utcOffset(offset).toISOString();
        output.maxValues = form.fieldInterfaces.maxvalues.inputElement.getValue();

        MashupPlatform.wiring.pushEvent('outputData', JSON.stringify(output));
        MashupPlatform.widget.log(output, MashupPlatform.log.INFO);

        form.enable();
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

    MashupPlatform.wiring.registerCallback("message", function (messageString) {
        var message = JSON.parse(messageString);
        if (message.type === "error") {
            fail(message.text);
        } else {
            complete(message.text);
        }
    });

    var removeMessageBar = function removeMessageBar() {
        if (error) {
            error.classList.add('hidden');
        }
        if (info) {
            info.classList.add('hidden');
        }
    };

    window.addEventListener("DOMContentLoaded", init, false);
})();
