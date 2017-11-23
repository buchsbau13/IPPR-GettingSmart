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

 /* globals MashupPlatform, StyledElements */

(function () {

    "use strict";

    var init = function init() {
        var data = {};
        
        clearPage(document.body);
        
        var page = document.createElement("div");
        document.body.appendChild(page);

        // Value for element initialization
        var emptyElement = "-------";

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
            data.error = "Please enter the tenant/service information in the settings!"
        }

        data.emptyElement = emptyElement;
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
        createButton(context, "Add", function () { testMessage(context, "TODO: addServicePage<br>Selection: '" +
            dropdownServices.options[dropdownServices.selectedIndex].text + "'", "blue"); });
        createButton(context, "Edit", function () { testMessage(context, "TODO: editServicePage<br>Selection: '" +
            dropdownServices.options[dropdownServices.selectedIndex].text + "'", "blue"); });
        createButton(context, "Delete", function () { testMessage(context, "TODO: delServicePage<br>Selection: '" +
            dropdownServices.options[dropdownServices.selectedIndex].text + "'", "blue"); });
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
        }
    };

    var editServicePage = function editServicePage(context, data, selection) {
        var serv;
        data.services.forEach(function (entry) {
            if (entry.service_path == selection) {
                serv = entry;
            }
        });

        clearPage(context);

        // Code for testing
        createHeadline(context, "Edit service '" + selection + "'");
        addNewLine(context);
        createLabel(context, "Current values:");
        addNewLine(context);
        addNewLine(context);
        createLabel(context, JSON.stringify(serv));
        addNewLine(context);
        addNewLine(context);
        createButton(context, "Back", showHomePage);
    };

    var delObjectPage = function delObjectPage(context, objType, selection) {
        clearPage(context);

        // Code for testing
        createHeadline(context, "Delete " + objType + " '" + selection + "'");
        addNewLine(context);
        createLabel(context, "Do you really want to delete " + objType + " '" + selection + "'?");
        addNewLine(context);
        addNewLine(context);
        createButton(context, "Delete", function () { showHomePage(function () {
            testMessage(context, ">> The " + objType + " '" + selection + "' has been successfully deleted! <<", "green"); }); });
        createButton(context, "Back", showHomePage);
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

    window.addEventListener("DOMContentLoaded", init, false);

})();
