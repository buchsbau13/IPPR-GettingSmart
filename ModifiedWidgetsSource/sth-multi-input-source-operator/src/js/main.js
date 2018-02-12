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

    var entities, startDate, endDate, attribute;

    var STHSource = function STHSource() {
        mp.wiring.registerCallback("attribute", function (attributeString) {
            if (attributeString !== null && attributeString !== undefined) {
                attribute = attributeString;
            }
        });

        mp.wiring.registerCallback("dateFrom", function (dateFromString) {
            if (dateFromString !== null && dateFromString !== undefined) {
                startDate = dateFromString;
            }
        });

        mp.wiring.registerCallback("dateTo", function (dateToString) {
            if (dateToString !== null && dateToString !== undefined) {
                endDate = dateToString;
            }
        });

        mp.wiring.registerCallback("entities", function (entitiesString) {
            if (entitiesString !== null && entitiesString !== undefined) {
                entities = JSON.parse(entitiesString);
                (function loop(count) {
                    setTimeout(function () {
                        if ((entities && attribute && startDate && endDate) || count === 0) {
                            requestData();
                        } else if (--count > 0) {
                            loop(count);
                        }
                    }, 200)
                })(10);
            } else {
                mp.operator.log("Error occured while waiting for Input Data", mp.log.INFO);
            }
        });
    };

    var requestData = function requestData() {
        // Clear Map
        mp.wiring.pushEvent("clear", "Clear Map");

        var server = new URL(mp.prefs.get('sth_server'));
        if (server.pathname[server.pathname.length - 1] !== "/") {
            server.pathname += "/";
        }
        var request_headers = {};

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

        var noDataFound = 0;
        var dataFound = 0;

        Object.keys(entities).forEach(function (key) {
            var entity = entities[key];
            var url = new URL('v1/contextEntities/type/' + entity.type + '/id/' + entity.id + '/attributes/' + attribute, server);

            mp.http.makeRequest(url, {
                method: "GET",
                requestHeaders: request_headers,
                parameters: {
                    hLimit: 100,
                    hOffset: 0,
                    dateFrom: startDate,
                    dateTo: endDate
                },
                onSuccess: function (response) {
                    if (response.status !== 200) {
                        throw new Error('Unexpected response from STH');
                    }

                    var data = JSON.parse(response.responseText).contextResponses[0].contextElement.attributes[0].values;
                    var dataseries = data.map(function (entry) {
                        return Number(entry.attrValue);
                    });
                    var timestamps = data.map(function (entry) {
                        return (new Date(entry.recvTime)).getTime();
                    });

                    if (dataseries.length !== 0 && timestamps.length !== 0) {
                        var outputData = {};
                        outputData.timestamps = timestamps;
                        outputData.dataseries = dataseries;
                        outputData.entity = JSON.stringify(entity);
                        outputData.attribute = attribute;

                        dataFound++;
                        mp.wiring.pushEvent("outputData", JSON.stringify(outputData));
                        mp.operator.log("Data retrieved successfully for Entity " + entity.id, mp.log.INFO);

                        if (Object.keys(entities).length === dataFound) {
                            // Set back global variables to null;
                            entities = null;
                            attribute = null;
                            startDate = null;
                            endDate = null;
                        }

                    } else {
                        noDataFound++;
                        mp.operator.log("No Data found for Entity " + entity.id, mp.log.INFO);

                        if (Object.keys(entities).length === noDataFound) {
                            mp.wiring.pushEvent("clear", "No Data found");
                            mp.operator.log("No Data found. Map will be cleared!", mp.log.INFO);

                            // Set back global variables to null;
                            entities = null;
                            attribute = null;
                            startDate = null;
                            endDate = null;
                        }
                    }
                },
                onFailure: function (response) {
                    throw new Error('Unexpected response from STH');
                },
                onException: function (reason) {
                    mp.operator.log(reason);
                }
            });

        });
    };

    new STHSource();

})(MashupPlatform);
