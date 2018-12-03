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
    var gauges = [];
    var tempWidget, tempOperator,
        airPressureWidget, airPressureOperator,
        humidityWidget, humidityOperator,
        pm1Widget, pm1Operator,
        pm25Widget, pm25Operator,
        pm10Widget, pm10Operator,
        noWidget, noOperator,
        no2Widget, no2Operator,
        countWidget, countOperator,
        speedWidget, speedOperator,
        occWidget, occOperator;

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
        //output.attribute = data.attribute;

        // Get unit string from entity data (if available)
        if (unitAttributes && unitAttributes[output.attribute] && currentData[entityId][unitAttributes[output.attribute]]) {
            output.unit = currentData[entityId][unitAttributes[output.attribute]];
        } else {
            output.unit = "";
        }

        drawGauges(output);

        MashupPlatform.widget.outputs.entity.pushEvent(JSON.stringify(output));
        MashupPlatform.widget.log(output, MashupPlatform.log.INFO);

    };

    var drawGauges = function drawGauges(output) {
        MashupPlatform.widget.log('DRAW', MashupPlatform.log.INFO);
        MashupPlatform.widget.log(output, MashupPlatform.log.INFO);
        switch(output.type) {
            case 'static':
                if(lastType === 'traffic' || lastType === '') {
                    //remove existing gauges
                    removeGauges(gauges);
                    gauges = [];

                    // temperature
                    tempWidget = MashupPlatform.mashup.addWidget('CoNWeT/googlecharts/1.0.3', gaugeOptions.temperatureWidget);
                    tempOperator = MashupPlatform.mashup.addOperator('FH-JOANNEUM/gauge-chart-operator/1.3', gaugeOptions.temperatureOperator);
                    createWiring(tempWidget, tempOperator);
                    // airPressure
                    airPressureWidget = MashupPlatform.mashup.addWidget('CoNWeT/googlecharts/1.0.3', gaugeOptions.airPressureWidget);
                    airPressureOperator = MashupPlatform.mashup.addOperator('FH-JOANNEUM/gauge-chart-operator/1.3', gaugeOptions.airPressureOperator);
                    createWiring(airPressureWidget, airPressureOperator);
                    // humidity
                    humidityWidget = MashupPlatform.mashup.addWidget('CoNWeT/googlecharts/1.0.3', gaugeOptions.humidityWidget);
                    humidityOperator = MashupPlatform.mashup.addOperator('FH-JOANNEUM/gauge-chart-operator/1.3', gaugeOptions.humidityOperator);
                    createWiring(humidityWidget, humidityOperator);
                    // pm10
                    pm10Widget = MashupPlatform.mashup.addWidget('CoNWeT/googlecharts/1.0.3', gaugeOptions.pm10Widget);
                    pm10Operator = MashupPlatform.mashup.addOperator('FH-JOANNEUM/gauge-chart-operator/1.3', gaugeOptions.pm10Operator);
                    createWiring(pm10Widget, pm10Operator);
                    // pm25
                    pm25Widget = MashupPlatform.mashup.addWidget('CoNWeT/googlecharts/1.0.3', gaugeOptions.pm25Widget);
                    pm25Operator = MashupPlatform.mashup.addOperator('FH-JOANNEUM/gauge-chart-operator/1.3', gaugeOptions.pm25Operator);
                    createWiring(pm25Widget, pm25Operator);
                    // pm1
                    pm1Widget = MashupPlatform.mashup.addWidget('CoNWeT/googlecharts/1.0.3', gaugeOptions.pm1Widget);
                    pm1Operator = MashupPlatform.mashup.addOperator('FH-JOANNEUM/gauge-chart-operator/1.3', gaugeOptions.pm1Operator);
                    createWiring(pm1Widget, pm1Operator);
                    // no
                    noWidget = MashupPlatform.mashup.addWidget('CoNWeT/googlecharts/1.0.3', gaugeOptions.noWidget);
                    noOperator = MashupPlatform.mashup.addOperator('FH-JOANNEUM/gauge-chart-operator/1.3', gaugeOptions.noOperator);
                    createWiring(noWidget, noOperator);
                    // no2
                    no2Widget = MashupPlatform.mashup.addWidget('CoNWeT/googlecharts/1.0.3', gaugeOptions.no2Widget);
                    no2Operator = MashupPlatform.mashup.addOperator('FH-JOANNEUM/gauge-chart-operator/1.3', gaugeOptions.no2Operator);
                    createWiring(no2Widget, no2Operator);
                    lastType = output.type;
                }

                MashupPlatform.widget.log('STATIC', MashupPlatform.log.INFO);

                MashupPlatform.widget.log(MashupPlatform.widget.outputs, MashupPlatform.log.INFO);
                MashupPlatform.widget.log(gauges, MashupPlatform.log.INFO);
                break;
            case 'mobile':
                if(lastType === 'traffic' || lastType === '') {
                    //remove existing gauges
                    removeGauges(gauges);
                    gauges = [];

                    // temperature
                    tempWidget = MashupPlatform.mashup.addWidget('CoNWeT/googlecharts/1.0.3', gaugeOptions.temperatureWidget);
                    tempOperator = MashupPlatform.mashup.addOperator('FH-JOANNEUM/gauge-chart-operator/1.3', gaugeOptions.temperatureOperator);
                    createWiring(tempWidget, tempOperator);
                    // airPressure
                    airPressureWidget = MashupPlatform.mashup.addWidget('CoNWeT/googlecharts/1.0.3', gaugeOptions.airPressureWidget);
                    airPressureOperator = MashupPlatform.mashup.addOperator('FH-JOANNEUM/gauge-chart-operator/1.3', gaugeOptions.airPressureOperator);
                    createWiring(airPressureWidget, airPressureOperator);
                    // humidity
                    humidityWidget = MashupPlatform.mashup.addWidget('CoNWeT/googlecharts/1.0.3', gaugeOptions.humidityWidget);
                    humidityOperator = MashupPlatform.mashup.addOperator('FH-JOANNEUM/gauge-chart-operator/1.3', gaugeOptions.humidityOperator);
                    createWiring(humidityWidget, humidityOperator);
                    // pm10
                    pm10Widget = MashupPlatform.mashup.addWidget('CoNWeT/googlecharts/1.0.3', gaugeOptions.pm10Widget);
                    pm10Operator = MashupPlatform.mashup.addOperator('FH-JOANNEUM/gauge-chart-operator/1.3', gaugeOptions.pm10Operator);
                    createWiring(pm10Widget, pm10Operator);
                    // pm25
                    pm25Widget = MashupPlatform.mashup.addWidget('CoNWeT/googlecharts/1.0.3', gaugeOptions.pm25Widget);
                    pm25Operator = MashupPlatform.mashup.addOperator('FH-JOANNEUM/gauge-chart-operator/1.3', gaugeOptions.pm25Operator);
                    createWiring(pm25Widget, pm25Operator);
                    // pm1
                    pm1Widget = MashupPlatform.mashup.addWidget('CoNWeT/googlecharts/1.0.3', gaugeOptions.pm1Widget);
                    pm1Operator = MashupPlatform.mashup.addOperator('FH-JOANNEUM/gauge-chart-operator/1.3', gaugeOptions.pm1Operator);
                    createWiring(pm1Widget, pm1Operator);
                    // no
                    noWidget = MashupPlatform.mashup.addWidget('CoNWeT/googlecharts/1.0.3', gaugeOptions.noWidget);
                    noOperator = MashupPlatform.mashup.addOperator('FH-JOANNEUM/gauge-chart-operator/1.3', gaugeOptions.noOperator);
                    createWiring(noWidget, noOperator);
                    // no2
                    no2Widget = MashupPlatform.mashup.addWidget('CoNWeT/googlecharts/1.0.3', gaugeOptions.no2Widget);
                    no2Operator = MashupPlatform.mashup.addOperator('FH-JOANNEUM/gauge-chart-operator/1.3', gaugeOptions.no2Operator);
                    createWiring(no2Widget, no2Operator);
                    lastType = output.type;

                    lastType = output.type;
                }
                break;
            case 'traffic':
                if(lastType !== 'traffic'){
                    //remove existing gauges
                    removeGauges(gauges);
                    gauges = [];
                    // count
                    countWidget = MashupPlatform.mashup.addWidget('CoNWeT/googlecharts/1.0.3', gaugeOptions.countWidget);
                    countOperator = MashupPlatform.mashup.addOperator('FH-JOANNEUM/gauge-chart-operator/1.3', gaugeOptions.countOperator);
                    createWiring(countWidget, countOperator);
                    // speed
                    speedWidget = MashupPlatform.mashup.addWidget('CoNWeT/googlecharts/1.0.3', gaugeOptions.speedWidget);
                    speedOperator = MashupPlatform.mashup.addOperator('FH-JOANNEUM/gauge-chart-operator/1.3', gaugeOptions.speedOperator);
                    createWiring(speedWidget, speedOperator);
                    // occupany
                    occWidget = MashupPlatform.mashup.addWidget('CoNWeT/googlecharts/1.0.3', gaugeOptions.occupancyWidget);
                    occOperator = MashupPlatform.mashup.addOperator('FH-JOANNEUM/gauge-chart-operator/1.3', gaugeOptions.occupancyOperator);
                    createWiring(occWidget, occOperator);

                    lastType = output.type;
                }
                break;
            default:
                MashupPlatform.widget.log('DEFAULT', MashupPlatform.log.INFO);
        }
    };

    var createWiring = function createWiring(widget, operator) {
        operator.outputs.gauge.connect(widget.inputs.input);
        operator.inputs.entityInput.connect(MashupPlatform.widget.outputs.entity);
        gauges.push(widget, operator);
    }

    var lastType = "";

    var removeGauges = (gauges) => gauges.forEach(g => g.remove());

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

    const permissions = {
        "move": false,
        "close": false,
        "resize":false
    }

    const gaugeOptions = {
        temperatureWidget: {
            "permissions": permissions,
            "title" : "Temperatur",
            "top" : "110px",
            "left" : "0",
            "width" : "300px",
            'height' : "330px"
        },
        temperatureOperator: {
            "preferences": {
                "attribute": {"value": "temperature"},
                "unit": {"value": "temp_sensor_unit"},
                "options": {
                    "value": '{"min": "-50", "max": "50", "yellowFrom": "-50", "yellowTo": "0", "yellowColor": "#4876FF", "redFrom": "0", "redTo": "50", "minorTicks": "5"}'
                }
            }
        },
        airPressureWidget: {
            "permissions": permissions,
            "title" : "Luftdruck",
            "top" : "110px",
            "left": "300px",
            "width" : "300px",
            'height' : "330px"
        },
        airPressureOperator: {
            "preferences": {
                "attribute": {"value": "airPressure"},
                "unit": {"value": "air_pressure_sensor_unit"},
                "options": {
                    "value": '{"min": "950", "max": "1050", "redFrom": "1013", "redTo": "1014", "minorTicks": "5"}'
                }
            }
        },
        humidityWidget: {
            "permissions": permissions,
            "title" : "Luftfeuchtigkeit",
            "top" : "110px",
            "left": "600px",
            "width" : "300px",
            'height' : "330px"
        },
        humidityOperator: {
            "preferences": {
                "attribute": {"value": "humidity"},
                "unit": {"value": "humid_sensor_unit"},
                "options": {
                    "value": '{"min": "0", "max": "100", "yellowFrom": "65", "yellowTo": "100", "yellowColor": "#2E2EFE", "redFrom": "0", "redTo": "35","greenFrom": "35", "greenTo": "65","minorTicks": "5"}'
                }
            }
        },
        pm10Widget: {
            "permissions": permissions,
            "title" : "Feinstaub PM10",
            "top" : "440px",
            "left": "0",
            "width" : "300px",
            "height" : "330px"
        },
        pm10Operator: {
            "permissions": permissions,
            "preferences": {
                "attribute": {"value": "pm10"},
                "unit": {"value": "air_sensor_unit"},
                "options": {
                    "value": '{"min": "0", "max": "100", "yellowFrom": "40", "yellowTo": "50", "yellowColor": "#4876FF", "redFrom": "50", "redTo": "100", "minorTicks": "5"}'
                }
            }
        },
        pm25Widget: {
            "permissions": permissions,
            "title" : "Feinstaub PM2.5",
            "top" : "440px",
            "left": "300px",
            "width" : "300px",
            "height" : "330px"
        },
        pm25Operator: {
            "permissions": permissions,
            "preferences": {
                "attribute": {"value": "pm25"},
                "unit": {"value": "air_sensor_unit"},
                "options": {
                    "value": '{"min": "0", "max": "100", "yellowFrom": "40", "yellowTo": "50", "yellowColor": "#4876FF", "redFrom": "50", "redTo": "100", "minorTicks": "5"}'
                }
            }
        },
        pm1Widget: {
            "permissions": permissions,
            "title" : "Feinstaub PM1",
            "top" : "440px",
            "left": "600px",
            "width" : "300px",
            "height" : "330px"
        },
        pm1Operator: {
            "preferences": {
                "attribute": {"value": "pm1"},
                "unit": {"value": "air_sensor_unit"},
                "options": {
                    "value": '{"min": "0", "max": "100", "yellowFrom": "40", "yellowTo": "50", "yellowColor": "#4876FF", "redFrom": "50", "redTo": "100", "minorTicks": "5"}'
                }
            }
        },
        noWidget: {
            "permissions": permissions,
            "title" : "Stickstoffmonoxid NO",
            "top" : "110px",
            "left": "900px",
            "width" : "300px",
            "height" : "330px"
        },
        noOperator: {
            "permissions": permissions,
            "preferences": {
                "attribute": {"value": "no"},
                "unit": {"value": "air_sensor_unit"},
                "options": {
                    "value": '{"min": "0", "max": "100", "yellowFrom": "40", "yellowTo": "50", "yellowColor": "#4876FF", "redFrom": "50", "redTo": "100", "minorTicks": "5"}'
                }
            }
        },
        no2Widget: {
            "permissions": permissions,
            "title" : "Stickstoffdioxid NO2",
            "top" : "440px",
            "left": "900px",
            "width" : "300px",
            "height" : "330px"
        },
        no2Operator: {
            "permissions": permissions,
            "preferences": {
                "attribute": {"value": "no2"},
                "unit": {"value": "air_sensor_unit"},
                "options": {
                    "value": '{"min": "0", "max": "100", "yellowFrom": "40", "yellowTo": "50", "yellowColor": "#4876FF", "redFrom": "50", "redTo": "100", "minorTicks": "5"}'
                }
            }
        },
        countWidget: {
            "permissions": permissions,
            "title" : "Fahrzeuge",
            "top" : "110px",
            "left" : "0",
            "width" : "300px",
            'height' : "330px"
        },
        countOperator: {
            "preferences": {
                "attribute": {"value": "count"},
                "unit": {"value": "count_sensor_unit"},
                "options": {
                    "value": '{"min": "0", "max": "1000", "minorTicks": "5"}'
                }
            }
        },
        speedWidget: {
            "permissions": permissions,
            "title" : "Geschwindigkeit",
            "top" : "110px",
            "left": "300px",
            "width" : "300px",
            'height' : "330px"
        },
        speedOperator: {
            "preferences": {
                "attribute": {"value": "speed"},
                "unit": {"value": "speed_sensor_unit"},
                "options": {
                    "value": '{"min": "0", "max": "100", "redFrom": "50", "redTo": "100", "minorTicks": "5"}'
                }
            }
        },
        occupancyWidget: {
            "permissions": permissions,
            "title" : "Auslastung",
            "top" : "110px",
            "left": "600px",
            "width" : "300px",
            'height' : "330px"
        },
        occupancyOperator: {
            "preferences": {
                "attribute": {"value": "occupancy"},
                "unit": {"value": "occ_sensor_unit"},
                "options": {
                    "value": '{"min": "0", "max": "100", "yellowFrom": "30", "yellowTo": "60", "redFrom": "60", "redTo": "100","greenFrom": "0", "greenTo": "30","minorTicks": "5"}'
                }
            }
        }
    };
})();
