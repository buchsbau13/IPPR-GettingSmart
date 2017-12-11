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

    MashupPlatform.wiring.registerCallback("getEntities", function (input) {
        getEntities(input, function (data) {
            MashupPlatform.wiring.pushEvent("entityOutput", JSON.stringify(data));
        });
    });

    MashupPlatform.wiring.registerCallback("addEntity", function (entity) {
        var payload;
        try {
            payload = JSON.parse(entity);
        } catch (e) {
            payload = null;
        }

        var url = createURL('v2/entities');
        var headers = {};

        if (MashupPlatform.prefs.get('use_owner_credentials')) {
            headers['X-FIWARE-OAuth-Token'] = 'true';
            headers['X-FIWARE-OAuth-Header-Name'] = 'X-Auth-Token';
            headers['X-FIWARE-OAuth-Source'] = 'workspaceowner';
        }

        if (!payload || !payload.id || !payload.type) {
            getEntities(null, function (data) {
                data.statusAdd = {};
                data.statusAdd.state = "exception";
                data.statusAdd.message = "Unexpected input received!";
                data.inputExample = {
                    "id": "example_id",
                    "type": "example_type",
                    "example_attribute": {
                        "type": "example_type",
                        "value": "example_value"
                    }
                };
                MashupPlatform.wiring.pushEvent("entityOutput", JSON.stringify(data));
            });
            return;
        }

        var params = {"type": payload.type};

        headers['FIWARE-Service'] = MashupPlatform.prefs.get('ngsi_tenant').trim().toLowerCase();

        MashupPlatform.http.makeRequest(url, {
            method: "POST",
            postBody: JSON.stringify(payload),
            contentType: "application/json",
            requestHeaders: headers,
            onSuccess: function (response) {
                getEntities(JSON.stringify(params), function (data) {
                    data.statusAdd = {};
                    data.statusAdd.state = "success";
                    data.statusAdd.message = "Entity '" + payload.id + "' successfully created!"
                    MashupPlatform.wiring.pushEvent("entityOutput", JSON.stringify(data));
                });
            },
            onFailure: function (response) {
                getEntities(JSON.stringify(params), function (data) {
                    data.statusAdd = {};
                    data.statusAdd.state = "failure";
                    data.statusAdd.message = "Error " + response.status + ": " + response.statusText;
                    MashupPlatform.wiring.pushEvent("entityOutput", JSON.stringify(data));
                });
            },
            onException: function (resp, except) {
                MashupPlatform.operator.log(except);
                getEntities(JSON.stringify(params), function (data) {
                    data.statusAdd = {};
                    data.statusAdd.state = "exception";
                    data.statusAdd.message = except;
                    MashupPlatform.wiring.pushEvent("entityOutput", JSON.stringify(data));
                });
            }
        });
    });

    MashupPlatform.wiring.registerCallback("editEntity", function (entity) {
        var payload;
        try {
            payload = JSON.parse(entity);
        } catch (e) {
            payload = null;
        }

        var headers = {};

        if (MashupPlatform.prefs.get('use_owner_credentials')) {
            headers['X-FIWARE-OAuth-Token'] = 'true';
            headers['X-FIWARE-OAuth-Header-Name'] = 'X-Auth-Token';
            headers['X-FIWARE-OAuth-Source'] = 'workspaceowner';
        }

        if (!payload || !payload.id || !payload.type) {
            getEntities(null, function (data) {
                data.statusEdit = {};
                data.statusEdit.state = "exception";
                data.statusEdit.message = "Unexpected input received!";
                data.inputExample = {
                    "id": "example_id",
                    "type": "example_type",
                    "example_attribute": {
                        "type": "example_type",
                        "value": "example_value"
                    }
                };
                MashupPlatform.wiring.pushEvent("entityOutput", JSON.stringify(data));
            });
            return;
        }

        var url = createURL('v2/entities/' + payload.id + '/attrs');
        var params = {"type": payload.type};

        headers['FIWARE-Service'] = MashupPlatform.prefs.get('ngsi_tenant').trim().toLowerCase();

        var entID = payload.id;
        delete payload.id;
        delete payload.type;

        MashupPlatform.http.makeRequest(url, {
            method: "POST",
            postBody: JSON.stringify(payload),
            parameters: params,
            contentType: "application/json",
            requestHeaders: headers,
            onSuccess: function (response) {
                getEntities(JSON.stringify(params), function (data) {
                    data.statusEdit = {};
                    data.statusEdit.state = "success";
                    data.statusEdit.message = "Entity '" + entID + "' successfully updated!"
                    MashupPlatform.wiring.pushEvent("entityOutput", JSON.stringify(data));
                });
            },
            onFailure: function (response) {
                getEntities(JSON.stringify(params), function (data) {
                    data.statusEdit = {};
                    data.statusEdit.state = "failure";
                    data.statusEdit.message = "Error " + response.status + ": " + response.statusText;
                    MashupPlatform.wiring.pushEvent("entityOutput", JSON.stringify(data));
                });
            },
            onException: function (resp, except) {
                MashupPlatform.operator.log(except);
                getEntities(JSON.stringify(params), function (data) {
                    data.statusEdit = {};
                    data.statusEdit.state = "exception";
                    data.statusEdit.message = except;
                    MashupPlatform.wiring.pushEvent("entityOutput", JSON.stringify(data));
                });
            }
        });
    });

    MashupPlatform.wiring.registerCallback("delEntity", function (entity) {
        var payload;
        try {
            payload = JSON.parse(entity);
        } catch (e) {
            payload = null;
        }

        var headers = {};

        if (MashupPlatform.prefs.get('use_owner_credentials')) {
            headers['X-FIWARE-OAuth-Token'] = 'true';
            headers['X-FIWARE-OAuth-Header-Name'] = 'X-Auth-Token';
            headers['X-FIWARE-OAuth-Source'] = 'workspaceowner';
        }

        if (!payload || !payload.id || !payload.type) {
            getEntities(null, function (data) {
                data.statusDel = {};
                data.statusDel.state = "exception";
                data.statusDel.message = "Unexpected input received!";
                data.inputExample = {
                    "id": "example_id",
                    "type": "example_type"
                };
                MashupPlatform.wiring.pushEvent("entityOutput", JSON.stringify(data));
            });
            return;
        }

        var url = createURL('v2/entities/' + payload.id);
        var params = {"type": payload.type};

        headers['FIWARE-Service'] = MashupPlatform.prefs.get('ngsi_tenant').trim().toLowerCase();

        MashupPlatform.http.makeRequest(url, {
            method: "DELETE",
            parameters: params,
            requestHeaders: headers,
            onSuccess: function (response) {
                getEntities(JSON.stringify(params), function (data) {
                    data.statusDel = {};
                    data.statusDel.state = "success";
                    data.statusDel.message = "Entity '" + payload.id + "' successfully deleted!"
                    MashupPlatform.wiring.pushEvent("entityOutput", JSON.stringify(data));
                });
            },
            onFailure: function (response) {
                getEntities(JSON.stringify(params), function (data) {
                    data.statusDel = {};
                    data.statusDel.state = "failure";
                    data.statusDel.message = "Error " + response.status + ": " + response.statusText;
                    MashupPlatform.wiring.pushEvent("entityOutput", JSON.stringify(data));
                });
            },
            onException: function (resp, except) {
                MashupPlatform.operator.log(except);
                getEntities(JSON.stringify(params), function (data) {
                    data.statusDel = {};
                    data.statusDel.state = "exception";
                    data.statusDel.message = except;
                    MashupPlatform.wiring.pushEvent("entityOutput", JSON.stringify(data));
                });
            }
        });
    });

    MashupPlatform.wiring.registerCallback("getSubscriptions", function (input) {
        getSubscriptions(input, function (data) {
            MashupPlatform.wiring.pushEvent("subOutput", JSON.stringify(data));
        });
    });

    MashupPlatform.wiring.registerCallback("addSubscription", function (subscr) {
        // TODO
    });

    MashupPlatform.wiring.registerCallback("editSubscription", function (subscr) {
        // TODO
    });

    MashupPlatform.wiring.registerCallback("delSubscription", function (subscr) {
        // TODO
    });

    var createURL = function createURL(path) {
        try {
            var orion = new URL(MashupPlatform.prefs.get('ngsi_server'));

            if (orion.pathname[orion.pathname.length - 1] !== "/") {
                orion.pathname += "/";
            }
            return new URL(path, orion);
        } catch (e) {
            MashupPlatform.operator.log("Invalid server URL! Please check your settings!");
        }
    };

    var getEntities = function getEntities(input, callbackFunc) {
        var data = {};
        var headers = {};
        var params = {};
        var url = createURL('v2/entities');

        try {
            var info = JSON.parse(input);
            if (info.type) {
                params.type = info.type;
            }
            if (info.id) {
                params.id = info.id;
            }
        } catch (e) {
            params = {};
        }

        if (MashupPlatform.prefs.get('use_owner_credentials')) {
            headers['X-FIWARE-OAuth-Token'] = 'true';
            headers['X-FIWARE-OAuth-Header-Name'] = 'X-Auth-Token';
            headers['X-FIWARE-OAuth-Source'] = 'workspaceowner';
        }

        headers['FIWARE-Service'] = MashupPlatform.prefs.get('ngsi_tenant').trim().toLowerCase();

        params.limit = "1000";

        MashupPlatform.http.makeRequest(url, {
            method: "GET",
            parameters: params,
            requestHeaders: headers,
            onSuccess: function (response) {
                var resp = JSON.parse(response.responseText);
                if (resp instanceof Array) {
                    data = {"entities": resp};
                } else {
                    data = {"entities": [resp]};
                }
                data.statusGet = {};
                data.statusGet.state = "success";
                data.statusGet.message = "Entities successfully received!"
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

    var getSubscriptions = function getSubscriptions(input, callbackFunc) {
        var url;
        var data = {};
        var headers = {};
        var params = {};

        try {
            var info = JSON.parse(input);
            if (info.id) {
                url = createURL('v2/subscriptions/' + info.id);
            } else {
                url = createURL('v2/subscriptions');
                params.limit = "1000";
            }
        } catch (e) {
            url = createURL('v2/subscriptions');
            params.limit = "1000";
        }

        if (MashupPlatform.prefs.get('use_owner_credentials')) {
            headers['X-FIWARE-OAuth-Token'] = 'true';
            headers['X-FIWARE-OAuth-Header-Name'] = 'X-Auth-Token';
            headers['X-FIWARE-OAuth-Source'] = 'workspaceowner';
        }

        headers['FIWARE-Service'] = MashupPlatform.prefs.get('ngsi_tenant').trim().toLowerCase();

        MashupPlatform.http.makeRequest(url, {
            method: "GET",
            parameters: params,
            requestHeaders: headers,
            onSuccess: function (response) {
                var resp = JSON.parse(response.responseText);
                if (resp instanceof Array) {
                    data = {"subscriptions": resp};
                } else {
                    data = {"subscriptions": [resp]};
                }
                data.statusGet = {};
                data.statusGet.state = "success";
                data.statusGet.message = "Subscriptions successfully received!"
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
})();
