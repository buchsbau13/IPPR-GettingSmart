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
        layout = new StyledElements.HorizontalLayout({'class': 'loading'});
        var fields = {
            "entity": {
                label: 'Select Sensor',
                type: 'select',
                initialEntries: [{
                    label: "-------------------",
                    value: ""
                }],
                required: true
            }
        };
        form = new StyledElements.Form(fields, {cancelButton: false, acceptButton: false});
        form.fieldInterfaces.entity.inputElement.addEventListener('change', onEntityChange);

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

        var output = currentData[select.getValue()];
        var entityId = output.entityId;

        if (unitAttributes && unitAttributes[output.attribute] && currentData[entityId][unitAttributes[output.attribute]]) {
            output.unit = currentData[entityId][unitAttributes[output.attribute]];
        } else {
            output.unit = "";
        }

        MashupPlatform.widget.outputs.entity.pushEvent(JSON.stringify(output));
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
                details: true,
                flat: true,
                onSuccess: onQuerySuccess,
                onFailure: onQueryFail
            }
        );

        /*// Read unit definitions from settings
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
        }*/
    };

    var onQuerySuccess = function onQuerySuccess(data) {
        var entries = [];
        currentData = data;

        for (var key in data) {
            entries.push({value: key});
        }

        form.fieldInterfaces.entity.inputElement.clear();
        form.fieldInterfaces.entity.inputElement.addEntries(entries);
        //onEntityChange(form.fieldInterfaces.entity.inputElement);

        form.enable();
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
