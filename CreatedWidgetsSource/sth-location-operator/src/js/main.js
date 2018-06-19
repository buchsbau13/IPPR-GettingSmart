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
        mp.wiring.registerCallback("inputData", function (inputData) {
            if (inputData) {
                try {
                    var currentData = JSON.parse(inputData);
                    requestData(currentData);
                } catch (err) {
                    MashupPlatform.operator.log("Invalid Input Data!" + err)
                }
            }
        })
    };

    // =========================================================================
    // PRIVATE
    // =========================================================================

    var requestData = function requestData(currentData) {
        var entity = JSON.parse(currentData.entity);
        var initialAttribute = currentData.attribute;
        var timestamps = currentData.timestamps;
        var dataseries = currentData.dataseries;

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

        var hlimit = timestamps.length;
        var attribute = mp.prefs.get('attribute');
        var dateFrom = new Date(Math.min.apply(Math, timestamps)).toISOString();
        var dateTo = new Date(Math.max.apply(Math, timestamps));
        dateTo = new Date(dateTo.setMilliseconds(dateTo.getMilliseconds() + 1)).toISOString();

        var url = new URL('v1/contextEntities/type/' + entity.type + '/id/' + entity.id + '/attributes/' + attribute, server);

        mp.http.makeRequest(url, {
            method: "GET",
            requestHeaders: request_headers,
            parameters: {
                hLimit: hlimit,
                hOffset: 0,
                dateFrom: dateFrom,
                dateTo: dateTo
            },
            onSuccess: function (response) {
                if (response.status !== 200) {
                    throw new Error('Unexpected response from STH');
                }

                var responseData = JSON.parse(response.responseText).contextResponses[0].contextElement.attributes[0].values;
                var dateseriesLocation = responseData.map(function (entry) {
                    return entry.attrValue;
                });

                if (dataseries.length !== 0 && timestamps.length !== 0) {
                    var data = {};
                    data.entityId = entity.id;
                    data.entity = JSON.stringify(entity);
                    data.attribute = initialAttribute;
                    data.timestamps = timestamps;
                    data.dataseries = dataseries;

                    if (dateseriesLocation && dateseriesLocation.length !== 0) {
                        data.dataseriesLocation = dateseriesLocation;
                    } else if (dateseriesLocation && dateseriesLocation.length === 0) {
                        // use current location
                        if (entity.location) {
                            data.dataseriesLocation = Array(dataseries.length).fill(entity.location);
                        }
                    } else {
                        mp.operator.log("No Locations found for Entity: " + entity.id, mp.log.INFO);
                    }

                    mp.wiring.pushEvent("outputData", JSON.stringify(data));
                    mp.operator.log("Location data retrieved successfully for Entity: " + entity.id, mp.log.INFO);
                } else {
                    mp.operator.log("Input Data empty for Entity: " + entity.id, mp.log.INFO);
                }


            },
            onFailure: function (response) {
                throw new Error('Unexpected response from STH');
            },
            onException: function (reason) {
                mp.operator.log(reason);
            }
        });
    };

    new STHSource();

})(MashupPlatform);
