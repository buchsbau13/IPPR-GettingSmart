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
        friendlyEnt;
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
        var friendlyEntSave = MashupPlatform.widget.getVariable('friendlyEntSave');
        if (friendlyEntSave.get()) {
            friendlyEnt = JSON.parse(friendlyEntSave.get());
        }
        MashupPlatform.widget.log(friendlyEnt, MashupPlatform.log.INFO);


        layout = new StyledElements.BorderLayout({'class': 'loading'});
        var fields = {
            "entity1": {
                label: 'Sensor 1',
                type: 'select',
                initialEntries: [{
                    label: "-------------------",
                    value: ""
                }],
                required: true
            },
            "attribute1": {
                label: 'Sensor 1 Attribute',
                type: 'select',
                initialEntries: [{
                    label: "-------------------",
                    value: ""
                }],
                required: true
            },
            "entity2": {
                label: 'Sensor 2',
                type: 'select',
                initialEntries: [{
                    label: "-------------------",
                    value: ""
                }],
                required: true
            },
            "attribute2": {
                label: 'Sensor 2 Attribute',
                type: 'select',
                initialEntries: [{
                    label: "-------------------",
                    value: ""
                }],
                required: true
            },
            "aggregationPeriod": {
                label: 'Aggreg. Period',
                type: 'select',
                initialEntries: [
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
                ],
                required: true
            },
            "aggregationMethod": {
                label: 'Aggreg. Method',
                type: 'select',
                initialEntries: [
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
        form.fieldInterfaces.entity1.inputElement.addEventListener('change', onEntityChange);
        form.fieldInterfaces.attribute1.inputElement.addEventListener('change', removeMessageBar);
        form.fieldInterfaces.entity2.inputElement.addEventListener('change', onEntityChange);
        form.fieldInterfaces.attribute2.inputElement.addEventListener('change', removeMessageBar);
        form.fieldInterfaces.datetime.inputElement.addEventListener('change', removeMessageBar);
        form.fieldInterfaces.aggregationMethod.inputElement.addEventListener('change', removeMessageBar);
        form.fieldInterfaces.aggregationPeriod.inputElement.addEventListener('change', removeMessageBar);

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

        var entries = [];
        var field;

        attributes.map(attr => friendlyEnt && friendlyEnt[attr] ? entries.push({value: attr, label: friendlyEnt[attr]}) : entries.push({value: attr}));

        field = isEntityOne(select) ? form.fieldInterfaces.attribute1.inputElement : form.fieldInterfaces.attribute2.inputElement;

        field.clear();
        field.addEntries(entries);
        var old_attribute = field.getValue();
        if (attributes.indexOf(old_attribute) !== -1) {
            field.setValue(old_attribute);
        }
        removeMessageBar();
    };

    var isEntityOne = function isEntityOne(select) {
        return select.wrapperElement.childNodes[0].parentElement.children[2].attributes.name.value === 'entity1';
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

        form.fieldInterfaces.entity1.inputElement.clear();
        form.fieldInterfaces.entity1.inputElement.addEntries(entries);
        form.fieldInterfaces.entity2.inputElement.clear();
        form.fieldInterfaces.entity2.inputElement.addEntries(entries);
        onEntityChange(form.fieldInterfaces.entity1.inputElement);
        onEntityChange(form.fieldInterfaces.entity2.inputElement);

        form.enable();
    };

    var onQueryFail = function onQueryFail(e) {
        form.disable();
        fail('Fail querying the server: ' + e);
    };

    var updateEntity = function updateEntity(form, data) {
        form.disable();
        hiddeStautsDivs();

        var entity1 = data.entity1;
        var entity2 = data.entity2;
        var dateParts = data.datetime.split(" - ");
        var offset = moment().utcOffset();

        MashupPlatform.widget.log(data, MashupPlatform.log.INFO);
        MashupPlatform.widget.log(currentData, MashupPlatform.log.INFO);

        var output = {};
        output.entity1 = currentData[entity1];
        output.entity2 = currentData[entity2];
        output.attribute1 = data.attribute1;
        output.attribute2 = data.attribute2;
        output.friendlyAttribute1 = friendlyEnt[data.attribute1];
        output.friendlyAttribute2 = friendlyEnt[data.attribute2];
        output.aggregationMethod = data.aggregationMethod;
        output.aggregationPeriod = data.aggregationPeriod;

        // Get unit string from entity data (if available)
        if (unitAttributes && unitAttributes[data.attribute1] && currentData[entity1][unitAttributes[data.attribute1]]) {
            output.unit1 = currentData[entity1][unitAttributes[data.attribute1]];
        } else {
            output.unit1 = "";
        }
        // Get unit string from entity data (if available)
        if (unitAttributes && unitAttributes[data.attribute2] && currentData[entity2][unitAttributes[data.attribute2]]) {
            output.unit2 = currentData[entity2][unitAttributes[data.attribute2]];
        } else {
            output.unit2 = "";
        }

        output.startDate = moment(dateParts[0], 'LLL', 'de').utcOffset(offset).toISOString();
        output.endDate = moment(dateParts[1], 'LLL', 'de').utcOffset(offset).toISOString();
        //output.maxValues = form.fieldInterfaces.maxvalues.inputElement.getValue();

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

    MashupPlatform.wiring.registerCallback("friendlyEntInput", function (entity) {
        var save = MashupPlatform.widget.getVariable('friendlyEntSave');
        var oldSave = save.get();
        save.set(entity);

        // If old and new friendly entity are different, reload with new data
        if (oldSave !== entity) {
            clearWindow();
            init();
        }
    });

    var clearWindow = function clearWindow() {
        while (document.body.firstChild) {
            document.body.removeChild(document.body.firstChild);
        }
    };

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
