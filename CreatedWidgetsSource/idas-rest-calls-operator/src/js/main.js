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

    MashupPlatform.wiring.registerCallback("getServices", function () {
        getServices(function (data) {
            MashupPlatform.wiring.pushEvent("serviceOutput", JSON.stringify(data));
        });
    });

    MashupPlatform.wiring.registerCallback("addService", function (service) {
        var payload;
        try {
            payload = JSON.parse(service);
        } catch (e) {
            payload = null;
        }

        var url = createURL('iot/services');
        var headers = {};

        if (MashupPlatform.prefs.get('use_owner_credentials')) {
            headers['X-FIWARE-OAuth-Token'] = 'true';
            headers['X-FIWARE-OAuth-Header-Name'] = 'X-Auth-Token';
            headers['X-FIWARE-OAuth-Source'] = 'workspaceowner';
        }

        if (!payload || !payload.services || !payload.services[0].apikey || !payload.services[0].token ||
            !payload.services[0].cbroker || !payload.services[0].entity_type || !payload.services[0].resource ||
            !payload.services[0].subservice) {
            getServices(function (data) {
                data.statusAdd = {};
                data.statusAdd.state = "exception";
                data.statusAdd.message = "Unexpected input received!";
                data.inputExample = {
                    "services": [
                        {
                            "apikey": "example_apikey",
                            "token": "token2",
                            "cbroker": "http://example:1026",
                            "entity_type": "example_entity_type",
                            "resource": "/iot/example",
                            "subservice": "/example"
                        }
                    ]
                };
                MashupPlatform.wiring.pushEvent("serviceOutput", JSON.stringify(data));
            });
            return;
        }

        headers['FIWARE-Service'] = MashupPlatform.prefs.get('ngsi_tenant').trim().toLowerCase();
        headers['FIWARE-ServicePath'] = payload.services[0].subservice;

        delete payload.services[0].subservice;

        MashupPlatform.http.makeRequest(url, {
            method: "POST",
            postBody: JSON.stringify(payload),
            contentType: "application/json",
            requestHeaders: headers,
            onSuccess: function (response) {
                getServices(function (data) {
                    data.statusAdd = {};
                    data.statusAdd.state = "success";
                    data.statusAdd.message = "Service '" + payload.services[0].apikey + "' successfully created!"
                    MashupPlatform.wiring.pushEvent("serviceOutput", JSON.stringify(data));
                });
            },
            onFailure: function (response) {
                getServices(function (data) {
                    data.statusAdd = {};
                    data.statusAdd.state = "failure";
                    data.statusAdd.message = "Error " + response.status + ": " + response.statusText;
                    MashupPlatform.wiring.pushEvent("serviceOutput", JSON.stringify(data));
                });
            },
            onException: function (resp, except) {
                MashupPlatform.operator.log(except);
                getServices(function (data) {
                    data.statusAdd = {};
                    data.statusAdd.state = "exception";
                    data.statusAdd.message = except;
                    MashupPlatform.wiring.pushEvent("serviceOutput", JSON.stringify(data));
                });
            }
        });
    });

    MashupPlatform.wiring.registerCallback("editService", function (service) {
        var payload;
        try {
            payload = JSON.parse(service);
        } catch (e) {
            payload = null;
        }

        var url = createURL('iot/services');
        var headers = {};
        var params = {};

        if (MashupPlatform.prefs.get('use_owner_credentials')) {
            headers['X-FIWARE-OAuth-Token'] = 'true';
            headers['X-FIWARE-OAuth-Header-Name'] = 'X-Auth-Token';
            headers['X-FIWARE-OAuth-Source'] = 'workspaceowner';
        }

        if (!payload || !payload.apikey || !payload.token || !payload.cbroker || !payload.entity_type ||
            !payload.resource || !payload.subservice) {
            getServices(function (data) {
                data.statusEdit = {};
                data.statusEdit.state = "exception";
                data.statusEdit.message = "Unexpected input received!";
                data.inputExample = {
                    "apikey": "example_apikey",
                    "token": "token2",
                    "cbroker": "http://example:1026",
                    "entity_type": "example_entity_type",
                    "resource": "/iot/example",
                    "subservice": "/example"
                };
                MashupPlatform.wiring.pushEvent("serviceOutput", JSON.stringify(data));
            });
            return;
        }

        headers['FIWARE-Service'] = MashupPlatform.prefs.get('ngsi_tenant').trim().toLowerCase();
        headers['FIWARE-ServicePath'] = payload.subservice;

        delete payload.subservice;

        params.apikey = payload.apikey;
        params.resource = payload.resource;

        MashupPlatform.http.makeRequest(url, {
            method: "PUT",
            postBody: JSON.stringify(payload),
            parameters: params,
            contentType: "application/json",
            requestHeaders: headers,
            onSuccess: function (response) {
                getServices(function (data) {
                    data.statusEdit = {};
                    data.statusEdit.state = "success";
                    data.statusEdit.message = "Service '" + payload.apikey + "' successfully updated!"
                    MashupPlatform.wiring.pushEvent("serviceOutput", JSON.stringify(data));
                });
            },
            onFailure: function (response) {
                getServices(function (data) {
                    data.statusEdit = {};
                    data.statusEdit.state = "failure";
                    data.statusEdit.message = "Error " + response.status + ": " + response.statusText;
                    MashupPlatform.wiring.pushEvent("serviceOutput", JSON.stringify(data));
                });
            },
            onException: function (resp, except) {
                MashupPlatform.operator.log(except);
                getServices(function (data) {
                    data.statusEdit = {};
                    data.statusEdit.state = "exception";
                    data.statusEdit.message = except;
                    MashupPlatform.wiring.pushEvent("serviceOutput", JSON.stringify(data));
                });
            }
        });
    });

    MashupPlatform.wiring.registerCallback("delService", function (service) {
        var payload;
        try {
            payload = JSON.parse(service);
        } catch (e) {
            payload = null;
        }

        var url = createURL('iot/services');
        var headers = {};
        var params = {};

        if (MashupPlatform.prefs.get('use_owner_credentials')) {
            headers['X-FIWARE-OAuth-Token'] = 'true';
            headers['X-FIWARE-OAuth-Header-Name'] = 'X-Auth-Token';
            headers['X-FIWARE-OAuth-Source'] = 'workspaceowner';
        }

        if (!payload || !payload.apikey || !payload.resource || !payload.subservice) {
            getServices(function (data) {
                data.statusDel = {};
                data.statusDel.state = "exception";
                data.statusDel.message = "Unexpected input received!";
                data.inputExample = {
                    "apikey": "example_apikey",
                    "resource": "/iot/example",
                    "subservice": "/example"
                };
                MashupPlatform.wiring.pushEvent("serviceOutput", JSON.stringify(data));
            });
            return;
        }

        headers['FIWARE-Service'] = MashupPlatform.prefs.get('ngsi_tenant').trim().toLowerCase();
        headers['FIWARE-ServicePath'] = payload.subservice;

        params.apikey = payload.apikey;
        params.resource = payload.resource;

        MashupPlatform.http.makeRequest(url, {
            method: "DELETE",
            parameters: params,
            contentType: "application/json",
            requestHeaders: headers,
            onSuccess: function (response) {
                getServices(function (data) {
                    data.statusDel = {};
                    data.statusDel.state = "success";
                    data.statusDel.message = "Service '" + payload.apikey + "' successfully deleted!"
                    MashupPlatform.wiring.pushEvent("serviceOutput", JSON.stringify(data));
                });
            },
            onFailure: function (response) {
                getServices(function (data) {
                    data.statusDel = {};
                    data.statusDel.state = "failure";
                    data.statusDel.message = "Error " + response.status + ": " + response.statusText;
                    MashupPlatform.wiring.pushEvent("serviceOutput", JSON.stringify(data));
                });
            },
            onException: function (resp, except) {
                MashupPlatform.operator.log(except);
                getServices(function (data) {
                    data.statusDel = {};
                    data.statusDel.state = "exception";
                    data.statusDel.message = except;
                    MashupPlatform.wiring.pushEvent("serviceOutput", JSON.stringify(data));
                });
            }
        });
    });

    MashupPlatform.wiring.registerCallback("getDevices", function (input) {
        getDevices(input, function (data) {
            MashupPlatform.wiring.pushEvent("deviceOutput", JSON.stringify(data));
        });
    });

    MashupPlatform.wiring.registerCallback("addDevice", function (device) {
        var payload;
        try {
            payload = JSON.parse(device);
        } catch (e) {
            payload = null;
        }

        var url = createURL('iot/devices');
        var headers = {};

        if (MashupPlatform.prefs.get('use_owner_credentials')) {
            headers['X-FIWARE-OAuth-Token'] = 'true';
            headers['X-FIWARE-OAuth-Header-Name'] = 'X-Auth-Token';
            headers['X-FIWARE-OAuth-Source'] = 'workspaceowner';
        }

        if (!payload || !payload.devices || !payload.devices[0].device_id || !payload.devices[0].entity_name ||
            !payload.devices[0].entity_type || !payload.devices[0].attributes || !payload.devices[0].subservice) {
            getDevices(null, function (data) {
                data.statusAdd = {};
                data.statusAdd.state = "exception";
                data.statusAdd.message = "Unexpected input received!";
                data.inputExample = {
                    "devices": [
                        {
                            "device_id": "example_device_id",
                            "entity_name": "example_entity_name",
                            "entity_type": "example_entity_type",
                            "attributes": [
                                {
                                    "object_id": "example_object_id",
                                    "name": "example_name",
                                    "type": "example_type"
                                }
                            ],
                            "subservice": "/example"
                        }
                    ]
                };
                MashupPlatform.wiring.pushEvent("deviceOutput", JSON.stringify(data));
            });
            return;
        }

        headers['FIWARE-Service'] = MashupPlatform.prefs.get('ngsi_tenant').trim().toLowerCase();
        headers['FIWARE-ServicePath'] = payload.devices[0].subservice;

        delete payload.devices[0].subservice;

        MashupPlatform.http.makeRequest(url, {
            method: "POST",
            postBody: JSON.stringify(payload),
            contentType: "application/json",
            requestHeaders: headers,
            onSuccess: function (response) {
                getDevices(null, function (data) {
                    data.devices = getDevicesByEnt(data.devices, payload.devices[0].entity_name);
                    data.statusAdd = {};
                    data.statusAdd.state = "success";
                    data.statusAdd.message = "Device '" + payload.devices[0].device_id + "' successfully created!"
                    MashupPlatform.wiring.pushEvent("deviceOutput", JSON.stringify(data));
                });
            },
            onFailure: function (response) {
                getDevices(null, function (data) {
                    data.devices = getDevicesByEnt(data.devices, payload.devices[0].entity_name);
                    data.statusAdd = {};
                    data.statusAdd.state = "failure";
                    data.statusAdd.message = "Error " + response.status + ": " + response.statusText;
                    MashupPlatform.wiring.pushEvent("deviceOutput", JSON.stringify(data));
                });
            },
            onException: function (resp, except) {
                MashupPlatform.operator.log(except);
                getDevices(null, function (data) {
                    data.devices = getDevicesByEnt(data.devices, payload.devices[0].entity_name);
                    data.statusAdd = {};
                    data.statusAdd.state = "exception";
                    data.statusAdd.message = except;
                    MashupPlatform.wiring.pushEvent("deviceOutput", JSON.stringify(data));
                });
            }
        });
    });

    MashupPlatform.wiring.registerCallback("editDevice", function (device) {
        var payload;
        try {
            payload = JSON.parse(device);
        } catch (e) {
            payload = null;
        }

        var headers = {};

        if (MashupPlatform.prefs.get('use_owner_credentials')) {
            headers['X-FIWARE-OAuth-Token'] = 'true';
            headers['X-FIWARE-OAuth-Header-Name'] = 'X-Auth-Token';
            headers['X-FIWARE-OAuth-Source'] = 'workspaceowner';
        }

        if (!payload || !payload.device_id || !payload.entity_name || !payload.entity_type ||
            !payload.attributes || !payload.subservice) {
            getDevices(null, function (data) {
                data.statusEdit = {};
                data.statusEdit.state = "exception";
                data.statusEdit.message = "Unexpected input received!";
                data.inputExample = {
                    "device_id": "example_device_id",
                    "entity_name": "example_entity_name",
                    "entity_type": "example_entity_type",
                    "attributes": [
                        {
                            "object_id": "example_object_id",
                            "name": "example_name",
                            "type": "example_type"
                        }
                    ],
                    "subservice": "/example"
                };
                MashupPlatform.wiring.pushEvent("deviceOutput", JSON.stringify(data));
            });
            return;
        }

        var url = createURL('iot/devices/' + payload.device_id);

        headers['FIWARE-Service'] = MashupPlatform.prefs.get('ngsi_tenant').trim().toLowerCase();
        headers['FIWARE-ServicePath'] = payload.subservice;

        delete payload.subservice;

        MashupPlatform.http.makeRequest(url, {
            method: "PUT",
            postBody: JSON.stringify(payload),
            contentType: "application/json",
            requestHeaders: headers,
            onSuccess: function (response) {
                getDevices(null, function (data) {
                    data.devices = getDevicesByEnt(data.devices, payload.entity_name);
                    data.statusEdit = {};
                    data.statusEdit.state = "success";
                    data.statusEdit.message = "Device '" + payload.device_id + "' successfully updated!"
                    MashupPlatform.wiring.pushEvent("deviceOutput", JSON.stringify(data));
                });
            },
            onFailure: function (response) {
                getDevices(null, function (data) {
                    data.devices = getDevicesByEnt(data.devices, payload.entity_name);
                    data.statusEdit = {};
                    data.statusEdit.state = "failure";
                    data.statusEdit.message = "Error " + response.status + ": " + response.statusText;
                    MashupPlatform.wiring.pushEvent("deviceOutput", JSON.stringify(data));
                });
            },
            onException: function (resp, except) {
                MashupPlatform.operator.log(except);
                getDevices(null, function (data) {
                    data.devices = getDevicesByEnt(data.devices, payload.entity_name);
                    data.statusEdit = {};
                    data.statusEdit.state = "exception";
                    data.statusEdit.message = except;
                    MashupPlatform.wiring.pushEvent("deviceOutput", JSON.stringify(data));
                });
            }
        });
    });

    MashupPlatform.wiring.registerCallback("delDevice", function (device) {
        var payload;
        try {
            payload = JSON.parse(device);
        } catch (e) {
            payload = null;
        }

        var headers = {};

        if (MashupPlatform.prefs.get('use_owner_credentials')) {
            headers['X-FIWARE-OAuth-Token'] = 'true';
            headers['X-FIWARE-OAuth-Header-Name'] = 'X-Auth-Token';
            headers['X-FIWARE-OAuth-Source'] = 'workspaceowner';
        }

        if (!payload || !payload.device_id || !payload.entity_name || !payload.subservice) {
            getDevices(null, function (data) {
                data.statusDel = {};
                data.statusDel.state = "exception";
                data.statusDel.message = "Unexpected input received!";
                data.inputExample = {
                    "device_id": "example_device_id",
                    "entity_name": "example_entity_name",
                    "subservice": "/example"
                };
                MashupPlatform.wiring.pushEvent("deviceOutput", JSON.stringify(data));
            });
            return;
        }

        var url = createURL('iot/devices/' + payload.device_id);

        headers['FIWARE-Service'] = MashupPlatform.prefs.get('ngsi_tenant').trim().toLowerCase();
        headers['FIWARE-ServicePath'] = payload.subservice;

        MashupPlatform.http.makeRequest(url, {
            method: "DELETE",
            contentType: "application/json",
            requestHeaders: headers,
            onSuccess: function (response) {
                getDevices(null, function (data) {
                    data.devices = getDevicesByEnt(data.devices, payload.entity_name);
                    data.statusDel = {};
                    data.statusDel.state = "success";
                    data.statusDel.message = "Device '" + payload.device_id + "' successfully deleted!"
                    MashupPlatform.wiring.pushEvent("deviceOutput", JSON.stringify(data));
                });
            },
            onFailure: function (response) {
                getDevices(null, function (data) {
                    data.devices = getDevicesByEnt(data.devices, payload.entity_name);
                    data.statusDel = {};
                    data.statusDel.state = "failure";
                    data.statusDel.message = "Error " + response.status + ": " + response.statusText;
                    MashupPlatform.wiring.pushEvent("deviceOutput", JSON.stringify(data));
                });
            },
            onException: function (resp, except) {
                MashupPlatform.operator.log(except);
                getDevices(null, function (data) {
                    data.devices = getDevicesByEnt(data.devices, payload.entity_name);
                    data.statusDel = {};
                    data.statusDel.state = "exception";
                    data.statusDel.message = except;
                    MashupPlatform.wiring.pushEvent("deviceOutput", JSON.stringify(data));
                });
            }
        });
    });

    var createURL = function createURL(path) {
        try {
            var idas = new URL(MashupPlatform.prefs.get('idas_server'));

            if (idas.pathname[idas.pathname.length - 1] !== "/") {
                idas.pathname += "/";
            }
            return new URL(path, idas);
        } catch (e) {
            MashupPlatform.operator.log("Invalid server URL! Please check your settings!");
        }
    };

    var getServices = function getServices(callbackFunc) {
        var data = {};
        var url = createURL('iot/services');
        var headers = {};

        if (MashupPlatform.prefs.get('use_owner_credentials')) {
            headers['X-FIWARE-OAuth-Token'] = 'true';
            headers['X-FIWARE-OAuth-Header-Name'] = 'X-Auth-Token';
            headers['X-FIWARE-OAuth-Source'] = 'workspaceowner';
        }

        headers['FIWARE-Service'] = MashupPlatform.prefs.get('ngsi_tenant').trim().toLowerCase();
        headers['FIWARE-ServicePath'] = "/*";

        MashupPlatform.http.makeRequest(url, {
            method: "GET",
            contentType: "application/json",
            requestHeaders: headers,
            onSuccess: function (response) {
                data = JSON.parse(response.responseText);
                data.statusGet = {};
                data.statusGet.state = "success";
                data.statusGet.message = "Services successfully received!"
                callbackFunc(data);
            },
            onFailure: function (response) {
                data.statusGet = {};
                data.statusGet.state = "failure";
                data.statusGet.message = "Error " + response.status + ": " + response.statusText;
                callbackFunc(data);
            },
            onException: function (resp, except) {
                MashupPlatform.operator.log(except);
                data.statusGet = {};
                data.statusGet.state = "exception";
                data.statusGet.message = except;
                callbackFunc(data);
            }
        });
    };

    var getDevices = function getDevices(input, callbackFunc) {
        var url;
        var data = {};
        var headers = {};
        var params = {};

        try {
            var info = JSON.parse(input);
            if (info.id && info.subservice) {
                url = createURL('iot/devices/' + info.id);
                headers['FIWARE-ServicePath'] = info.subservice;
            } else {
                url = createURL('iot/devices');
                headers['FIWARE-ServicePath'] = ""; // Empty service path, as '/*' is not recognized for some reason
            }
        } catch (e) {
            url = createURL('iot/devices');
            headers['FIWARE-ServicePath'] = ""; // Empty service path, as '/*' is not recognized for some reason
        }

        if (MashupPlatform.prefs.get('use_owner_credentials')) {
            headers['X-FIWARE-OAuth-Token'] = 'true';
            headers['X-FIWARE-OAuth-Header-Name'] = 'X-Auth-Token';
            headers['X-FIWARE-OAuth-Source'] = 'workspaceowner';
        }

        headers['FIWARE-Service'] = MashupPlatform.prefs.get('ngsi_tenant').trim().toLowerCase();

        params.limit = "1000"; // Default limit of 20 is too small, as there is no possibility (as of yet) to filter by entity ID

        MashupPlatform.http.makeRequest(url, {
            method: "GET",
            parameters: params,
            contentType: "application/json",
            requestHeaders: headers,
            onSuccess: function (response) {
                data = JSON.parse(response.responseText);
                data.statusGet = {};
                data.statusGet.state = "success";
                data.statusGet.message = "Devices successfully received!"
                callbackFunc(data);
            },
            onFailure: function (response) {
                data.statusGet = {};
                data.statusGet.state = "failure";
                data.statusGet.message = "Error " + response.status + ": " + response.statusText;
                callbackFunc(data);
            },
            onException: function (resp, except) {
                MashupPlatform.operator.log(except);
                data.statusGet = {};
                data.statusGet.state = "exception";
                data.statusGet.message = except;
                callbackFunc(data);
            }
        });
    };

    var getDevicesByEnt = function getDevicesByEnt(devices, entityID) {
        var filteredDev = [];
        devices.forEach(function (dev) {
            if (dev.entity_name == entityID) {
                filteredDev.push(dev);
            }
        });
        return filteredDev;
    };
})();
