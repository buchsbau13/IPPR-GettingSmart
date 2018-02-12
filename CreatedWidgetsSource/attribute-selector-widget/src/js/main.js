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

    var layout,
        form;

    var init = function init() {
        var entries = [];
        var attributes = MashupPlatform.prefs.get('attributes').trim();
        if (attributes) {
            attributes = attributes.split(new RegExp(',\\s*'));
            attributes.forEach(function (element) {
                entries.push({value: element});
            });
        }

        layout = new StyledElements.BorderLayout({'class': 'loading'});
        var fields = {
            "attribute": {
                label: 'Attribute',
                type: 'select',
                initialEntries: entries,
                required: true
            },
        };
        form = new StyledElements.Form(fields, {cancelButton: false, acceptButton: false});
        form.fieldInterfaces.attribute.inputElement.addEventListener('change', onInputChange);

        layout.getCenterContainer().appendChild(form);
        layout.insertInto(document.body);
    };

    MashupPlatform.widget.context.registerCallback(function (newValues) {
        if (layout && ("heightInPixels" in newValues || "widthInPixels" in newValues)) {
            layout.repaint();
        }
    }.bind(this));

    var onInputChange = function onInputChange() {
        MashupPlatform.wiring.pushEvent("reload", "Reload NGSI Source");
        MashupPlatform.widget.log(
            "Reload NGSI Source", MashupPlatform.log.INFO);
    };

    window.addEventListener("DOMContentLoaded", init, false);

    MashupPlatform.wiring.registerCallback("entity", function (entity) {
        MashupPlatform.wiring.pushEvent('attribute', form.fieldInterfaces.attribute.inputElement.getValue());
        MashupPlatform.wiring.pushEvent('entity', entity);
    });

})();
