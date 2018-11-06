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
        var attribute;
        var type;

        mp.wiring.registerCallback("attribute", function (inputAttribute) {
            attribute = inputAttribute;
        });

        mp.wiring.registerCallback("entity", function (entityString) {
            if (entityString) {
                (function loop(count) {
                    setTimeout(function () {
                        if (attribute) {
                            requestData(entityString, attribute);
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

    // =========================================================================
    // PRIVATE
    // =========================================================================

    var requestData = function requestData(entityString, attribute) {
        var entity = 'entity';
        var entity_type = 'entity_type';

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
        var url = new URL('v1/contextEntities/type/' + entity_type + '/id/' + entity + '/attributes/' + attribute, server);

        mp.http.makeRequest(url, {
            method: "GET",
            requestHeaders: request_headers,
            parameters: {
                lastN: hlimit
            },
            onSuccess: function (response) {
                if (response.status !== 200) {
                    throw new Error('Unexpected response from STH');
                }

                var responseData = JSON.parse(response.responseText).contextResponses[0].contextElement.attributes[0].values;
                var timestamps = responseData.map(function (entry) {
                    return (new Date(entry.recvTime)).getTime();
                });
                var dataseries = responseData.map(function (entry) {
                    return Number(entry.attrValue);
                });

                if (timestamps.length !== 0 && dataseries.length !== 0) {
                    var outputData = {};
                    outputData.timestamps = timestamps;
                    outputData.dataseries = dataseries;
                    outputData.entity = entityString;
                    outputData.attribute = attribute;
                    mp.wiring.pushEvent("outputData", JSON.stringify(outputData));
                    mp.operator.log(outputData, mp.log.INFO);
                } else {
                    mp.operator.log("No Data found for Entity " + entity, mp.log.INFO);
                    mp.wiring.pushEvent("clear", entity);
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
