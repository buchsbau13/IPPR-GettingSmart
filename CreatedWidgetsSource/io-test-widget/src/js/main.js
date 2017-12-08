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

    MashupPlatform.wiring.registerCallback("input", function (data) {
        if (MashupPlatform.prefs.get('auto_forward')) {
            MashupPlatform.wiring.pushEvent("output", data);
        }

        init(data);
    });

    var init = function init(data) {
        clearPage(document.body);

        var page = document.createElement("div");
        var textArea = document.createElement("textarea");
        var btnSend = document.createElement("button");

        textArea.rows = 20;
        textArea.cols = 50;

        if (data && data != "[object Event]") {
            try {
                var json = JSON.parse(data);
                textArea.value = JSON.stringify(json, undefined, 2);
            } catch (e) {
                textArea.value = data;
            }
        }

        btnSend.type = "button";
        btnSend.innerHTML = "Send";
        btnSend.onclick = function () { MashupPlatform.wiring.pushEvent("output", textArea.value); };

        page.appendChild(textArea);
        page.appendChild(document.createElement("br"));
        page.appendChild(btnSend);

        document.body.appendChild(page);
    };

    var clearPage = function clearPage(context) {
        while (context.firstChild) {
            context.removeChild(context.firstChild);
        }
    };

    window.addEventListener("DOMContentLoaded", init, false);

})();
