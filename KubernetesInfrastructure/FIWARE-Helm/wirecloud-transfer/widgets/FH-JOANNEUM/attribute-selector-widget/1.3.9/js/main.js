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

    var friendlyEnt,
        layout,
        form;
        // selectedType;

    MashupPlatform.wiring.registerCallback("friendlyEntInput", function (entity) {
        var save = MashupPlatform.widget.getVariable('friendlyEntSave');
        var oldSave = save.get();
        save.set(entity);

        // If old and new friendly entity are different, reload with new data
        if (oldSave !== entity) {
            clearWindow();
            init();
        }
    });

    MashupPlatform.widget.context.registerCallback(function (newValues) {
        if (layout && ("heightInPixels" in newValues || "widthInPixels" in newValues)) {
            layout.repaint();
        }
    }.bind(this));

    var init = function init() {
        var friendlyEntSave = MashupPlatform.widget.getVariable('friendlyEntSave');
        if (friendlyEntSave.get()) {
            friendlyEnt = JSON.parse(friendlyEntSave.get());
        }

        var fields = {};

        // Get JSON from Settings
        var json = JSON.parse(MashupPlatform.prefs.get('attributesJSON').trim());
        if (json) {
            json.devices.forEach(function(device) {
                var entries = [];
                // Set initial entry for drop down
                entries.push({value: "Select ---"});

                // Get all entries for drop down with friendly names
                device.attributes.forEach(function(attribute) {
                    if(friendlyEnt && friendlyEnt[attribute.name]) {
                        entries.push({value: attribute.name, label: friendlyEnt[attribute.name]});
                    }
                    else {
                        entries.push({value: attribute.name});
                    }
                });

                // drop down with entries
                fields[device.entity_type] = {
                    label: device.entity_type,
                    type: 'select',
                    initialEntries: entries,
                    required: true
                };
            });
        }

        layout = new StyledElements.BorderLayout({'class': 'loading'});

        form = new StyledElements.Form(fields, {cancelButton: false, acceptButton: false});

        // Event listener (on change) for drop down fields
        json.devices.forEach(function(device) {
            form.fieldInterfaces[device.entity_type].inputElement.addEventListener('change', function(){onInputChange(device.entity_type);});
        });

        layout.getCenterContainer().appendChild(form);
        layout.insertInto(document.body);
    };

    // Pushes selected attribute to next widget and sets the selected sensor type
    var onInputChange = function onInputChange(type) {
        // selectedType = type;
        MashupPlatform.wiring.pushEvent('attribute', form.fieldInterfaces[type].inputElement.getValue());
        MashupPlatform.wiring.pushEvent('type', type);
        console.log(form.fieldInterfaces[type].inputElement.getValue());
        console.log(type);
        // MashupPlatform.wiring.pushEvent("reload", "Reload NGSI Source");
        // MashupPlatform.widget.log("Reload NGSI Source", MashupPlatform.log.INFO);
    };

    var clearWindow = function clearWindow() {
        while (document.body.firstChild) {
            document.body.removeChild(document.body.firstChild);
        }
    };

    window.addEventListener("DOMContentLoaded", init, false);

    // Called after (re)load and checks, if entity has the selected type to push entity to next widget
    /*
    MashupPlatform.wiring.registerCallback("entity", function (entity) {
        if (form && form.fieldInterfaces) {
            if(JSON.parse(entity).type == selectedType) {
                // MashupPlatform.wiring.pushEvent('entity', entity);
            }
        }
    });
    */

})();