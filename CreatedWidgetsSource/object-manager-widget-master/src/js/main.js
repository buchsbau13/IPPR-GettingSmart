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

 //global MashupPlatform, StyledElements

(function () {

    "use strict";

    var page = document.createElement("div");

    var init = function init() {
        document.body.appendChild(page);

        // Show "home screen"
        showHomePage();
    };

    var showHomePage = function showHomePage(func) {
        var dropdownServices, dropdownEntTypes, dropdownEntities;
        // Static values for testing
        var listSrv = ["/static", "/mobile"];
        var listTypes = ["static", "mobile"];
        var listEnt = ["Lamp_1"];
        var serviceData = {
            "count": 2,
            "services": [
                {
                    "apikey": "apistatic",
                    "service": "graziot",
                    "service_path": "/static",
                    "token": "token2",
                    "cbroker": "http://127.0.0.1:1026",
                    "entity_type": "static",
                    "resource": "/iot/d"
                },
                {
                    "apikey": "apimobile",
                    "service": "graziot",
                    "service_path": "/mobile",
                    "token": "token2",
                    "cbroker": "http://127.0.0.1:1026",
                    "entity_type": "mobile",
                    "resource": "/iot/d"
                }
            ]
        };

        clearPage();

        createHeadline(page, "[Services]");
        addNewLine(page);
        createLabel(page, "Service Path:");
        dropdownServices = createDropdown(page, listSrv);
        createButton(page, "Add", function () { testMessage("TODO: Add a new service"); });
        createButton(page, "Edit", function () { editServicePage(serviceData, dropdownServices.options[dropdownServices.selectedIndex].text); });
        createButton(page, "Delete", function () { delObjectPage("service", dropdownServices.options[dropdownServices.selectedIndex].text); });
        addNewLine(page);
        addNewLine(page);
        addNewLine(page);

        createHeadline(page, "[Entities]");
        addNewLine(page);
        createLabel(page, "Filter by Type:");
        dropdownEntTypes = createDropdown(page, listTypes, function () { testChangeEntities(dropdownEntTypes, dropdownEntities); });
        addNewLine(page);
        addNewLine(page);
        createLabel(page, "Entity ID:");
        dropdownEntities = createDropdown(page, listEnt);
        createButton(page, "Add", function () { testMessage("TODO: Add a new entity"); });
        createButton(page, "Edit", function () { testMessage("TODO: Edit entity '" + dropdownEntities.options[dropdownEntities.selectedIndex].text + "'"); });
        createButton(page, "Delete", function () { delObjectPage("entity", dropdownEntities.options[dropdownEntities.selectedIndex].text); });

        // Prevent type error for optional function parameter
        try {
            func();
        } catch (e) {}
    };

    var editServicePage = function editServicePage(data, selection) {
        var serv;
        data.services.forEach(function (entry) {
            if (entry.service_path == selection) {
                serv = entry;
            }
        });

        clearPage();

        // Code for testing
        createHeadline(page, "Edit service '" + selection + "'");
        addNewLine(page);
        createLabel(page, "Current values:");
        addNewLine(page);
        addNewLine(page);
        createLabel(page, JSON.stringify(serv));
        addNewLine(page);
        addNewLine(page);
        createButton(page, "Back", showHomePage);
    };

    var delObjectPage = function delObjectPage(objType, selection) {
        clearPage();

        // Code for testing
        createHeadline(page, "Delete " + objType + " '" + selection + "'");
        addNewLine(page);
        createLabel(page, "Do you really want to delete " + objType + " '" + selection + "'?");
        addNewLine(page);
        addNewLine(page);
        createButton(page, "Delete", function () { showHomePage(function () { testMessage(">> The " + objType + " '" + selection + "' has been successfully deleted! <<"); }); });
        createButton(page, "Back", showHomePage);
    };

    var clearPage = function clearPage() {
        while (page.firstChild) {
            page.removeChild(page.firstChild);
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

    // Function for testing
    var testMessage = function testMessage(text) {
        if (document.getElementById("testmsg")) {
            page.removeChild(document.getElementById("testmsg"));
        }

        var hl = document.createElement("h3");
        hl.innerHTML = text;
        hl.id = "testmsg";
        page.appendChild(hl);
    };

    // Function for testing
    var testChangeEntities = function testChangeEntities(types, entities) {
        while (entities.firstChild) {
            entities.removeChild(entities.firstChild);
        }
        if (types.options[types.selectedIndex].text == "mobile") {
            entities.options.add(new Option("Bus_1"));
            entities.options.add(new Option("Tram_1"));
        } else {
            entities.options.add(new Option("Lamp_1"));
        }
    };

    window.addEventListener("DOMContentLoaded", init, false);

})();
