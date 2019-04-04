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

/* globals MashupPlatform */

(function (mp) {

    "use strict";

    // =========================================================================
    // PUBLIC
    // =========================================================================

    var STHSource = function STHSource() {
        var attribute, entityType;

        mp.wiring.registerCallback("attribute", function (inputAttribute) {
            attribute = inputAttribute;
        });

        mp.wiring.registerCallback("type", function (entityType) {
            entityType = entityType;

            if (attribute && entityType) {
                console.log("request data");
                requestData(entityType, attribute)
            }
        });

        /*
        mp.wiring.registerCallback("entity", function (entityString) {
            entityString = entityString;
            if (entityString) {
                (function loop(count) {
                    setTimeout(function () {

                        if (attribute && entityType) {
                            requestData(entityString, attribute);
                        }
                        else if (--count > 0) {
                            loop(count);
                        }
                    }, 200)
                })(10);
            } else {
                mp.operator.log("Error occured while waiting for Input Data", mp.log.INFO);
            }
        });
        */
    };

    // =========================================================================
    // PRIVATE
    // =========================================================================

    var requestData = function requestData(entityString, attribute) {
        // var entity = 'entity';
        // var entity_type = 'entity_type';
        var entity_type = entityString;

        /*
        if (entityString) {
            var entity_data = JSON.parse(entityString);
            if (entity_data.id != '') {
                entity = entity_data.id;
            }
            if (entity_data.type != '') {
                entity_type = entity_data.type;
            }
        }
        */

        var server = new URL(mp.prefs.get('sth_server'));
        if (server.pathname[server.pathname.length - 1] !== "/") {
            server.pathname += "/";
        }
        var request_headers = {};

        if (mp.prefs.get('use_user_fiware_token') || mp.prefs.get('use_owner_credentials')) {
            request_headers['FIWARE-OAuth-Token'] = 'true';
            request_headers['FIWARE-OAuth-Header-Name'] = 'X-Auth-Token';

            if (mp.prefs.get('use_owner_credentials')) {
                request_headers['FIWARE-OAuth-Source'] = 'workspaceowner';
            }
        }

        var tenant = mp.prefs.get('ngsi_tenant').trim().toLowerCase();
        if (tenant !== '') {
            request_headers['FIWARE-Service'] = tenant;
        }

        var path = mp.prefs.get('ngsi_service_path').trim().toLowerCase();
        if (path !== '' && path !== '/') {
            request_headers['FIWARE-ServicePath'] = path;
        } else {
            request_headers['FIWARE-ServicePath'] = '/';
        }

        var hlimit = mp.prefs.get('lastn');
        // einlesen der entitie ids über settings input
        var urlstatic = new URL('v1/contextEntities/type/' + entity_type + '/id/Sensor1,Sensor2,Sensor3,Sensor4,Sensor5,Sensor6,Sensor7,Sensor_DonBosco/attributes/' + attribute + ',location', server);
        var urlmobile = new URL('v1/contextEntities/type/' + entity_type + '/id/Tram1_654,Tram2_655,Bus1_30,Bus2_31/attributes/' + attribute + ',location', server);
        var urltraffic = new URL('v1/contextEntities/type/' + entity_type + '/id/Traffic1_west,Traffic1_east,Traffic2_west,Traffic2_east/attributes/' + attribute + ',location', server);
        var url;

        if (entity_type == 'static') {
            url = urlstatic;
        } else if (entity_type == 'mobile') {
            url = urlmobile;
        } else {
            url = urltraffic;
        }

        console.log(url);

        mp.http.makeRequest(url, {
            method: "GET",
            requestHeaders: request_headers,
            parameters: {
                lastN: hlimit
            },
            onSuccess: function (response) {
                /*
                if (response.status !== 200) {
                    throw new Error('Unexpected response from STH');
                }
                */

                console.log("SUCCESS");

                var responseData = JSON.parse(response.responseText).contextResponses;
                // JSON.parse(response.responseText).contextResponses[0].contextElement.attributes[0].values;

                console.log(JSON.parse(response.responseText).contextResponses[1].contextElement.attributes);

                // responseData.forEach(function (sensor) {

                    var timestamps = responseData[0].contextElement.attributes.values.map(function (entry) {
                        return (new Date(entry.recvTime)).getTime();
                    });
                    console.log("timestamps " + timestamps);
                    var dataseries = responseData[0].contextElement.attributes.values.map(function (entry) {
                        return entry.attrValue;
                    });
                    console.log("dataseries " + dataseries);
                    var dataseriesLocation = responseData[1].contextElement.attributes.values.map(function (entry) {
                        return entry.attrValue;
                    });
                    console.log("location " + dataseriesLocation);

                    /*
                    if (dataseries.length !== 0 && timestamps.length !== 0 && dataseriesLocation.length !== 0) {
                        console.log("forward");
                        var data = {};
                        data.entityId = sensor.id;
                        //data.entity = JSON.stringify(entity);
                        data.attribute = attribute;
                        data.timestamps = timestamps;
                        data.dataseries = dataseries;
                        data.dataseriesLocation = dataseriesLocation;

                        mp.wiring.pushEvent("outputData", data);
                        // mp.operator.log("Location data retrieved successfully for Entity: " + entity.id, mp.log.INFO);
                    } else {
                        // mp.operator.log("Input Data empty for Entity: " + entity.id, mp.log.INFO);
                    }
                    */
                //});
            },
            onFailure: function (response) {
                throw new Error('Unexpected response from STH');
            },
            onException: function (reason) {
                console.log("EXCEPTION");
                mp.operator.log(reason);
            }
        });
    };

    new STHSource();

})(MashupPlatform);
