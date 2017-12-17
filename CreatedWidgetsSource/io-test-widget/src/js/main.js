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

    MashupPlatform.wiring.registerCallback("input", function (data) {
        if (MashupPlatform.prefs.get('auto_forward')) {
            MashupPlatform.wiring.pushEvent("output", data);
        }

        if (data !== "[object Event]") {
            MashupPlatform.widget.getVariable('textAreaSave').set(data);
        }

        init();
    });

    var init = function init() {
        clearPage(document.body);

        var textAreaSave = MashupPlatform.widget.getVariable('textAreaSave');
        var layout = new StyledElements.VerticalLayout();
        var textArea = new StyledElements.TextArea({
            class: "textarea",
            cols: 50,
            rows: 20
        });
        var btnSend = new StyledElements.Button({
            class: "se-btn-circle send-button z-depth-3",
            text: "Send"
        });

        layout.center.addClassName('layout');
        layout.center.appendChild(textArea);
        layout.insertInto(document.body);
        layout.repaint();

        if (textAreaSave.get()) {
            try {
                var json = JSON.parse(textAreaSave.get());
                textArea.value = JSON.stringify(json, undefined, 2);
            } catch (e) {
                textArea.value = textAreaSave.get();
            }
        }

        btnSend.addEventListener('click', function () {
            var output;
            if (textArea.value) {
                output = textArea.value;
                textAreaSave.set(output);
            } else {
                output = "{}";
            }
            MashupPlatform.wiring.pushEvent("output", output);
        });
        layout.center.appendChild(btnSend);
    };

    var clearPage = function clearPage(context) {
        while (context.firstChild) {
            context.removeChild(context.firstChild);
        }
    };

    window.addEventListener("DOMContentLoaded", init, false);
})();
