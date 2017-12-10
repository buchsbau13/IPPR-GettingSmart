/*
 * Copyright (c) 2014 CoNWeT Lab., Universidad Politécnica de Madrid
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

/* globals MashupPlatform */

(function () {

    "use strict";

    var friendlyEnt, orionWidget, entityInput, output;
    var displayAttrs = [];
    var compAttributes = {};
    var unitAttributes = {};

    MashupPlatform.wiring.registerCallback("poiInput", function (poi) {
        sendOuput(JSON.parse(poi));
    });

    MashupPlatform.prefs.registerCallback(function () {
        init();
    });

    var init = function init() {
        if (MashupPlatform.prefs.get('attributes')) {
            displayAttrs = MashupPlatform.prefs.get('attributes').split(new RegExp(',\\s*'));
        } else {
            displayAttrs = [];
        }

        if (MashupPlatform.prefs.get('comp_attributes')) {
            var keyValueList = MashupPlatform.prefs.get('comp_attributes').split(new RegExp(',\\s*'));
            keyValueList.forEach(function (entry) {
                var pair = entry.split(new RegExp('=\\s*'));
                if (pair.length == 2) {
                    compAttributes[pair[0]] = pair[1];
                } else {
                    compAttributes = {};
                }
            });
        } else {
            compAttributes = {};
        }

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

        if (MashupPlatform.prefs.get('settings_entity')) {
            getFriendlyEntity(MashupPlatform.prefs.get('settings_entity'));
        } else {
            friendlyEnt = {};
        }
    };

    var initWidget = function initWidget() {
        orionWidget = MashupPlatform.mashup.addOperator('CoNWeT/orion-rest-calls/1.0', {
            "preferences": {
                "ngsi_server": {"value": MashupPlatform.prefs.get("ngsi_server")},
                "use_user_fiware_token": {"value": MashupPlatform.prefs.get("use_user_fiware_token")},
                "use_owner_credentials": {"value": MashupPlatform.prefs.get("use_owner_credentials")},
                "ngsi_tenant": {"value": MashupPlatform.prefs.get("ngsi_tenant")}
            }
        });
        orionWidget.addEventListener('remove', function () { orionWidget = null; });

        entityInput = MashupPlatform.operator.createInputEndpoint(function (input) {
            input = JSON.parse(input);
            if (input.entities) {
                friendlyEnt = input.entities[0];
            }
            orionWidget.remove();
        });
        output = MashupPlatform.operator.createOutputEndpoint();

        entityInput.connect(orionWidget.outputs.entityOutput);
        output.connect(orionWidget.inputs.getEntities);
    };

    var sendOuput = function sendOutput(poi) {
        poi.infoWindow = buildInfoWindow(poi);
        MashupPlatform.wiring.pushEvent("poiOutput", JSON.stringify(poi));
    };

    var getFriendlyEntity = function getFriendlyEntity(name) {
        initWidget();
        output.pushEvent(JSON.stringify({"id": name}));
    };

    var buildInfoWindow = function buildInfoWindow(poi) {
        var infoWindow;

        if (displayAttrs.length > 0) {
            infoWindow = "<div>";

            displayAttrs.forEach(function (attr) {
                if (poi.data[attr]) {
                    var name = attr;
                    var value = poi.data[attr];

                    if (compAttributes && compAttributes[attr]) {
                        var attrs = compAttributes[attr].split(new RegExp('&\\s*'));
                        var vals = [];
                        attrs.forEach(function (entry) {
                            vals.push(poi.data[attr][entry]);
                        });
                        value = vals.join(", ");
                    } else if (unitAttributes && unitAttributes[attr]) {
                        value = String(round(poi.data[attr], 2)) + " " + poi.data[unitAttributes[attr]];
                    }

                    if (friendlyEnt && friendlyEnt[attr]) {
                        if (attr == "id") {
                            name = friendlyEnt.entity_id.value;
                        } else if (attr == "type") {
                            name = friendlyEnt.entity_type.value;
                        } else {
                            name = friendlyEnt[attr].value;
                        }
                    }

                    infoWindow += '<span style="font-size:12px;"><b>' + name + ": </b> " + value +  "</span><br />";
                }
            });

            infoWindow += "</div>";
        } else {
            infoWindow = poi.infoWindow;
        }

        return infoWindow;
    };

    var round = function round(value, decimals) {
        return Number(Math.round(value + 'e' + decimals) + 'e-' + decimals);
    }

    init();
})();
