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

 /* global MashupPlatform, StyledElements */

(function () {

    "use strict";

    var init = function init() {
        var data = {};

        clearPage(document.body);

        var page = document.createElement("div");
        document.body.appendChild(page);

        // Read values from settings
        var requestHeaders = {};

        if (MashupPlatform.prefs.get('orion') === "" ||
        MashupPlatform.prefs.get('idas') === "" || MashupPlatform.prefs.get('cygnus') === "") {
            var hl = createHeadline(page, "Server information incomplete! Server URLs in settings must not be empty!");
            hl.style = "color:red";
            createButton(page, "Reload", init);

            return;
        }

        var orion = new URL(MashupPlatform.prefs.get('orion'));
        var idas = new URL(MashupPlatform.prefs.get('idas'));
        var cygnus = new URL(MashupPlatform.prefs.get('cygnus'));

        if (orion.pathname[orion.pathname.length - 1] !== "/") {
            orion.pathname += "/";
        }

        if (idas.pathname[idas.pathname.length - 1] !== "/") {
            idas.pathname += "/";
        }

        // Option "use_user_fiware_token" potentially problematic to implement, currently not available

        if (MashupPlatform.prefs.get('ngsi_tenant').trim() === '') {
            data.error = "Please enter the tenant/service information in the settings!";
        }

        data.emptyElement = "-------";
        data.resource = "/iot/d";
        data.token = "token2";
        data.orion = orion;
        data.idas = idas;
        data.cygnus = cygnus;
        data.requestHeaders = requestHeaders;

        // Fetch service and entity data from servers and show home screen
        getServiceData(data, function (servData) {
            getEntityData(servData, function (entData) {
                showHomePage(page, entData);
            });
        });
    };

    var showHomePage = function showHomePage(context, data) {
        var dropdownServices, dropdownEntTypes, dropdownEntities;
        var services = [];
        var types = [];
        var entities = [];

        if (data.services && data.services.length > 0) {
            data.services.forEach(function (serv) {
                services.push(serv.apikey);
                types.push(serv.entity_type);
            });
        } else {
            services.push(data.emptyElement);
            types.push(data.emptyElement);
        }

        if (data.entities && data.entities.length > 0) {
            data.entities.forEach(function (ent) {
                entities.push({"id": ent.id, "type": ent.type});
            });
        } else {
            entities.push({"id": data.emptyElement, "type": data.emptyElement});
        }

        clearPage(context);

        createHeadline(context, "[Services]");
        addNewLine(context);
        createLabel(context, "API Key:");
        dropdownServices = createDropdown(context, services);
        createButton(context, "Add", function () {
            data.newService = {};
            showServicePage(context, data);
        });
        createButton(context, "Edit", function () {
            // if no service available, cancel action
            if (dropdownServices.options[dropdownServices.selectedIndex].text != data.emptyElement) {
                data.currentService = getService(dropdownServices.options[dropdownServices.selectedIndex].text, data);
                data.newService = getService(dropdownServices.options[dropdownServices.selectedIndex].text, data);
                showServicePage(context, data);
            }
        });
        createButton(context, "Delete", function () {
            // if no service available, cancel action
            if (dropdownServices.options[dropdownServices.selectedIndex].text != data.emptyElement) {
                data.currentService = getService(dropdownServices.options[dropdownServices.selectedIndex].text, data);
                delServicePage(context, data);
            }
        });
        addNewLine(context);
        addNewLine(context);
        addNewLine(context);

        createHeadline(context, "[Entities]");
        addNewLine(context);
        createLabel(context, "Filter by Type:");
        dropdownEntTypes = createDropdown(context, types, function () {
            changeEntList(dropdownEntTypes, dropdownEntities, entities, data); });
        addNewLine(context);
        addNewLine(context);
        createLabel(context, "Entity ID:");
        dropdownEntities = createDropdown(context, [data.emptyElement]);
        createButton(context, "Add", function () { testMessage(context, "TODO: addEntityPage<br>Selection: '" +
            dropdownEntities.options[dropdownEntities.selectedIndex].text + "'", "blue"); });
        createButton(context, "Edit", function () { testMessage(context, "TODO: editEntityPage<br>Selection: '" +
            dropdownEntities.options[dropdownEntities.selectedIndex].text + "'", "blue"); });
        createButton(context, "Delete", function () { testMessage(context, "TODO: delEntityPage<br>Selection: '" +
            dropdownEntities.options[dropdownEntities.selectedIndex].text + "'", "blue"); });

        // Fill entity ID dropdown with correct entity data
        changeEntList(dropdownEntTypes, dropdownEntities, entities, data);

        // In case of error, display error message
        if (data.error) {
            testMessage(context, data.error, "red");
            data.error = null;
        }

        // Show message if available
        if (data.message) {
            testMessage(context, data.message, "green");
            data.message = null;
        }
    };

    var showServicePage = function showServicePage(context, data) {
        clearPage(context);

        if (data.currentService) {
            createHeadline(context, "Edit service '" + data.currentService.apikey + "'");
        } else {
            createHeadline(context, "Add new service");
        }

        addNewLine(context);
        createLabel(context, "API key:");
        var apikey = createInput(context, "text");
        addNewLine(context);
        createLabel(context, "Service path:");
        var servicePath = createInput(context, "text");
        addNewLine(context);
        createLabel(context, "Entity type:");
        var entType = createInput(context, "text");
        addNewLine(context);
        addNewLine(context);
        createButton(context, "Save", function () {
            if (!data.currentService) {
                data.newService.subservice = servicePath.value;
                data.newService.apikey = apikey.value;
            }

            data.newService.entity_type = entType.value;

            if (data.currentService) {
                updateService(data, function (updateData) {
                    getServiceData(updateData, function (servData) {
                        getEntityData(servData, function (entData) {
                            showHomePage(context, entData);
                        });
                    });
                });
            } else {
                addService(data, function (addData) {
                    getServiceData(addData, function (servData) {
                        getEntityData(servData, function (entData) {
                            showHomePage(context, entData);
                        });
                    });
                });
            }
        });
        createButton(context, "Back", init);

        if (data.currentService) {
            apikey.value = data.currentService.apikey;
            servicePath.value = data.currentService.subservice;
            entType.value = data.currentService.entity_type;
            apikey.disabled = "disabled"; // API key only displayed for information purposes, cannot be changed
            servicePath.disabled = "disabled"; // service path only displayed for information purposes, cannot be changed
        } else {
            servicePath.value = "/";
        }
    };

    var delServicePage = function delServicePage(context, data) {
        clearPage(context);

        createHeadline(context, "Delete service '" + data.currentService.apikey + "'");
        addNewLine(context);
        createLabel(context, "Do you really want to delete service '" + data.currentService.apikey + "'?");
        addNewLine(context);
        addNewLine(context);
        createButton(context, "Delete", function () {
            deleteService(data, function (delData) {
                getServiceData(delData, function (servData) {
                    getEntityData(servData, function (entData) {
                        showHomePage(context, entData);
                    });
                });
            });
        });
        createButton(context, "Back", init);
    };

    var clearPage = function clearPage(context) {
        while (context.firstChild) {
            context.removeChild(context.firstChild);
        }
    };

    var addNewLine = function addNewLine(context) {
        context.appendChild(document.createElement("br"));
    };

    var createHeadline = function createHeadline(context, text) {
        var headline = document.createElement("h3");
        headline.innerHTML = text;
        context.appendChild(headline);

        return headline;
    };

    var createDropdown = function createDropdown(context, content, func) {
        var dropdown = document.createElement("select");
        content.forEach(function (entry) {
            dropdown.options.add(new Option (entry));
        });

        // Prevent type error for optional function parameter
        try {
            dropdown.onchange = func;
        } catch (e) {}

        context.appendChild(dropdown);

        return dropdown;
    };

    var createLabel = function createLabel(context, text) {
        var label = document.createElement("label");
        label.innerHTML = text;
        context.appendChild(label);

        return label;
    };

    var createInput = function createInput(context, type) {
        var input = document.createElement("input");
        input.type = type;
        context.appendChild(input);

        return input;
    };

    var createButton = function createButton(context, text, func) {
        var button = document.createElement("button");
        button.type = "button";
        button.innerHTML = text;
        button.onclick = func;
        context.appendChild(button);

        return button;
    };

    var getServiceData = function getServiceData(data, callbackFunc) {
        var url = new URL('iot/services', data.idas);
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
                data.services = JSON.parse(response.responseText).services;
                callbackFunc(data);
            },
            onFailure: function (response) {
                if (response.status.toString().startsWith("5")) {
                    data.error = ">> Connection error. Please check your server settings! <<";
                } else {
                    data.error = ">> " + response.statusText + " <<";
                }

                callbackFunc(data);
            },
            onException: function (resp, except) {
                MashupPlatform.widget.log(except);
                data.error = ">> " + except + " <<";
                callbackFunc(data);
            }
        });
    };

    var getService = function getService(apikey, data) {
        var service;
        data.services.forEach(function (serv) {
            if (serv.apikey == apikey) {
                service = serv;
            }
        });

        return service;
    };

    var addService = function addService(data, callbackFunc) {
        var url = new URL('iot/services', data.idas);
        var headers = {};
        var payload = {"services": []};

        if (MashupPlatform.prefs.get('use_owner_credentials')) {
            headers['X-FIWARE-OAuth-Token'] = 'true';
            headers['X-FIWARE-OAuth-Header-Name'] = 'X-Auth-Token';
            headers['X-FIWARE-OAuth-Source'] = 'workspaceowner';
        }

        headers['FIWARE-Service'] = MashupPlatform.prefs.get('ngsi_tenant').trim().toLowerCase();
        headers['FIWARE-ServicePath'] = data.newService.subservice;

        payload.services.push({
            "apikey": data.newService.apikey,
            "token": data.token,
            "cbroker": MashupPlatform.prefs.get('orion'),
            "entity_type": data.newService.entity_type,
            "resource": data.resource
        });

        MashupPlatform.http.makeRequest(url, {
            method: "POST",
            postBody: JSON.stringify(payload),
            contentType: "application/json",
            requestHeaders: headers,
            onSuccess: function (response) {
                data.newService = null;
                data.message = "Service created successfully!";
                callbackFunc(data);
            },
            onFailure: function (response) {
                if (response.status.toString().startsWith("5")) {
                    data.error = ">> Connection error. Please check your server settings! <<";
                } else {
                    data.error = ">> " + response.statusText + " <<";
                }

                data.newService = null;
                callbackFunc(data);
            },
            onException: function (resp, except) {
                MashupPlatform.widget.log(except);
                data.error = ">> " + except + " <<";
                data.newService = null;
                callbackFunc(data);
            }
        });
    };

    var updateService = function updateService(data, callbackFunc) {
        var url = new URL('iot/services', data.idas);
        var headers = {};
        var params = {};

        if (MashupPlatform.prefs.get('use_owner_credentials')) {
            headers['X-FIWARE-OAuth-Token'] = 'true';
            headers['X-FIWARE-OAuth-Header-Name'] = 'X-Auth-Token';
            headers['X-FIWARE-OAuth-Source'] = 'workspaceowner';
        }

        headers['FIWARE-Service'] = MashupPlatform.prefs.get('ngsi_tenant').trim().toLowerCase();
        headers['FIWARE-ServicePath'] = data.currentService.subservice;

        params.apikey = data.currentService.apikey;
        params.resource = data.currentService.resource;

        MashupPlatform.http.makeRequest(url, {
            method: "PUT",
            postBody: JSON.stringify(data.newService),
            parameters: params,
            contentType: "application/json",
            requestHeaders: headers,
            onSuccess: function (response) {
                data.currentService = null;
                data.newService = null;
                data.message = "Service updated successfully!";
                callbackFunc(data);
            },
            onFailure: function (response) {
                if (response.status.toString().startsWith("5")) {
                    data.error = ">> Connection error. Please check your server settings! <<";
                } else {
                    data.error = ">> " + response.statusText + " <<";
                }

                data.currentService = null;
                data.newService = null;
                callbackFunc(data);
            },
            onException: function (resp, except) {
                MashupPlatform.widget.log(except);
                data.error = ">> " + except + " <<";
                data.currentService = null;
                data.newService = null;
                callbackFunc(data);
            }
        });
    };

    var deleteService = function deleteService(data, callbackFunc) {
        var url = new URL('iot/services', data.idas);
        var headers = {};
        var params = {};

        if (MashupPlatform.prefs.get('use_owner_credentials')) {
            headers['X-FIWARE-OAuth-Token'] = 'true';
            headers['X-FIWARE-OAuth-Header-Name'] = 'X-Auth-Token';
            headers['X-FIWARE-OAuth-Source'] = 'workspaceowner';
        }

        headers['FIWARE-Service'] = MashupPlatform.prefs.get('ngsi_tenant').trim().toLowerCase();
        headers['FIWARE-ServicePath'] = data.currentService.subservice;

        params.apikey = data.currentService.apikey;
        params.resource = data.currentService.resource;

        MashupPlatform.http.makeRequest(url, {
            method: "DELETE",
            parameters: params,
            contentType: "application/json",
            requestHeaders: headers,
            onSuccess: function (response) {
                data.currentService = null;
                data.message = "Service deleted successfully!";
                callbackFunc(data);
            },
            onFailure: function (response) {
                if (response.status.toString().startsWith("5")) {
                    data.error = ">> Connection error. Please check your server settings! <<";
                } else {
                    data.error = ">> " + response.statusText + " <<";
                }

                data.currentService = null;
                callbackFunc(data);
            },
            onException: function (resp, except) {
                MashupPlatform.widget.log(except);
                data.error = ">> " + except + " <<";
                data.currentService = null;
                callbackFunc(data);
            }
        });
    };

    var getEntityData = function getEntityData(data, callbackFunc) {
        var url = new URL('v2/entities', data.orion);
        var headers = {};

        if (MashupPlatform.prefs.get('use_owner_credentials')) {
            headers['X-FIWARE-OAuth-Token'] = 'true';
            headers['X-FIWARE-OAuth-Header-Name'] = 'X-Auth-Token';
            headers['X-FIWARE-OAuth-Source'] = 'workspaceowner';
        }

        headers['FIWARE-Service'] = MashupPlatform.prefs.get('ngsi_tenant').trim().toLowerCase();

        MashupPlatform.http.makeRequest(url, {
            method: "GET",
            requestHeaders: headers,
            onSuccess: function (response) {
                data.entities = JSON.parse(response.responseText);
                callbackFunc(data);
            },
            onFailure: function (response) {
                if (response.status.toString().startsWith("5")) {
                    data.error = ">> Connection error. Please check your server settings! <<";
                } else {
                    data.error = ">> " + response.statusText + " <<";
                    MashupPlatform.widget.log(response);
                }

                callbackFunc(data);
            },
            onException: function (resp, except) {
                MashupPlatform.widget.log(except);
                data.error = ">> " + except + " <<";
                callbackFunc(data);
            }
        });
    };

    var changeEntList = function changeEntList(typeDropdown, entityDropdown, entities, data) {
        while (entityDropdown.firstChild) {
            entityDropdown.removeChild(entityDropdown.firstChild);
        }
        var selection = typeDropdown.options[typeDropdown.selectedIndex].text;
        entities.forEach(function (ent) {
            if (ent.type == selection) {
                entityDropdown.options.add(new Option(ent.id));
            }
        });

        if (entityDropdown.options.length === 0) {
            entityDropdown.options.add(new Option(data.emptyElement));
        }
    };

    // Function for testing
    var testMessage = function testMessage(context, text, color) {
        if (document.getElementById("testmsg")) {
            context.removeChild(document.getElementById("testmsg"));
        }

        var hl = createHeadline(context, text);
        hl.id = "testmsg";
        hl.style = "color:" + color;
    };

    MashupPlatform.prefs.registerCallback(function (new_values) {
        init();
    }.bind(this));

    window.addEventListener("DOMContentLoaded", init, false);

})();
