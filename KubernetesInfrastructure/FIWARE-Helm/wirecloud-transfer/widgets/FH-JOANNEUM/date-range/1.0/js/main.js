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
        clearPage(document.body);

        var layout = new StyledElements.VerticalLayout();
        var today = (new Date()).toISOString().slice(0, 10);

        var startLabel = document.createElement('label');
        startLabel.innerHTML = "From:&nbsp;";
        var endLabel = document.createElement('label');
        endLabel.innerHTML = "Until:&nbsp;";
        var startDate = document.createElement('input');
        startDate.type = "date";
        startDate.value = today;
        var endDate = document.createElement('input');
        endDate.type = "date";
        endDate.value = today;
        var startTime = document.createElement('input');
        startTime.type = "time";
        startTime.value = "00:00";
        var endTime = document.createElement('input');
        endTime.type = "time";
        endTime.value = "23:59";

        var buttonSend = new StyledElements.Button({
            class: "se-btn-circle z-depth-3",
            text: "Apply"
        });
        buttonSend.addEventListener('click', function () { sendData(startDate.value, startTime.value, endDate.value, endTime.value); });

        var buttonReset = new StyledElements.Button({
            class: "se-btn-circle z-depth-3",
            text: "Reset"
        });
        buttonReset.addEventListener('click', function () {
            today = (new Date()).toISOString().slice(0, 10);

            startDate.value = today;
            startTime.value = "00:00";
            endDate.value = today;
            endTime.value = "23:59";
        });

        var buttonExit = new StyledElements.Button({
            class: "se-btn-circle z-depth-3",
            text: "Close"
        });
        buttonExit.addEventListener('click', function () { MashupPlatform.wiring.pushEvent("timestamps", "exit"); });

        startLabel.appendChild(startDate);
        startLabel.appendChild(startTime);
        endLabel.appendChild(endDate);
        endLabel.appendChild(endTime);

        layout.center.addClassName('layout');
        layout.center.appendChild(startLabel);
        layout.center.appendChild(endLabel);
        layout.center.appendChild(buttonSend);
        layout.center.appendChild(buttonReset);
        layout.center.appendChild(buttonExit);
        layout.insertInto(document.body);
        layout.repaint();
    };

    var sendData = function sendData(startDate, startTime, endDate, endTime) {
        var offsetString;
        var ts = {};

        var offset = Math.round((new Date()).getTimezoneOffset() * -1 / 60);
        if (offset >= 0) {
            offsetString = "+" + offset.toString();
        } else {
            offsetString = offset.toString();
        }

        MashupPlatform.widget.log(String(startDate));
        MashupPlatform.widget.log(String(startTime));
        MashupPlatform.widget.log(String(endDate));
        MashupPlatform.widget.log(String(endTime));
        MashupPlatform.widget.log(offsetString);

        ts.start = Date.parse((new Date(startDate + " " + startTime + " UTC" + offsetString)).toISOString());
        ts.end = Date.parse((new Date(endDate + " " + endTime + " UTC" + offsetString)).toISOString());

        MashupPlatform.widget.log(ts.start);
        MashupPlatform.widget.log(ts.end);

        MashupPlatform.wiring.pushEvent("timestamps", JSON.stringify(ts));
    };

    var clearPage = function clearPage(context) {
        while (context.firstChild) {
            context.removeChild(context.firstChild);
        }
    };

    window.addEventListener("DOMContentLoaded", init, false);
})();