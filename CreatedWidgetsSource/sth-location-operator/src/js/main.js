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

    var timestamps, dataseries, initialAttribute;

    var STHSource = function STHSource() {
        mp.wiring.registerCallback("timestamps", function (timestampsArray) {
            timestamps = timestampsArray;
        });
        mp.wiring.registerCallback("dataserie", function (dataserieArray) {
            dataseries = dataserieArray;
        });
        mp.wiring.registerCallback("attribute", function (attribute) {
            initialAttribute = attribute;
        });
        mp.wiring.registerCallback("entity", function (entityString) {
            mp.operator.log(JSON.parse(entityString), mp.log.INFO);
            requestData(entityString);
        });
    };

    // =========================================================================
    // PRIVATE
    // =========================================================================

    var entity = 'entity';
    var entity_type = 'entity_type';

    var requestData = function requestData(entityString) {
        // Check for data
        if (timestamps.length === 0 || dataseries === 0 || !entityString) {
            return;
        }

        if (entityString) {
            var entity_data = JSON.parse(entityString);
            if (entity_data.id != '') {
                entity = entity_data.id;
            }
            if (entity_data.type != '') {
                entity_type = entity_data.type;
            }
        }

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

        var hlimit = timestamps.length;
        var attribute = mp.prefs.get('attribute');
        var dateFrom = new Date(Math.min.apply(Math, timestamps));
        var dateTo = new Date(Math.max.apply(Math, timestamps));
        dateTo = dateTo.setMilliseconds(dateTo.getMilliseconds() + 1);

        var url = new URL('v1/contextEntities/type/' + entity_type + '/id/' + entity + '/attributes/' + attribute, server);

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
                var data = {};
                data.entityId = entity_data.id;
                data.entity = entityString;
                data.attribute = initialAttribute;
                data.timestamps = timestamps;
                data.dataseries = dataseries;
                data.dataseriesLocation = responseData.map(function (entry) {
                    return entry.attrValue;
                });

                if (data.dataseries.length !== data.dataseriesLocation.length) {
                    return;
                }

                mp.operator.log(data, mp.log.INFO);
                mp.wiring.pushEvent("data", JSON.stringify(data));
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
