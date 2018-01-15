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

 /* global MashupPlatform */

(function () {

    "use strict";

    MashupPlatform.wiring.registerCallback("poi", function (data) {
        var input;
        try {
            input = JSON.parse(data);
            if (input && input.infoWindow) {
                MashupPlatform.widget.getVariable('poiSave').set(input.infoWindow);
            }
        } catch (e) {
            input = null;
        }

        init();
    });

    var init = function init() {
        clearPage(document.body);

        var poiSave = MashupPlatform.widget.getVariable('poiSave');
        var text = document.createElement('div');

        if (poiSave.get()) {
            text.innerHTML = poiSave.get();
        }

        text.className = "data";
        document.body.appendChild(text);
    };

    var clearPage = function clearPage(context) {
        while (context.firstChild) {
            context.removeChild(context.firstChild);
        }
    };

    window.addEventListener("DOMContentLoaded", init, false);
})();
