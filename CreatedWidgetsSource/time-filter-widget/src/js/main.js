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

        var timestampSave = MashupPlatform.widget.getVariable('timestampSave');
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
        endTime.value = "00:00";

        var buttonSend = new StyledElements.Button({
            class: "se-btn-circle z-depth-3",
            text: "Send"
        });
        buttonSend.addEventListener('click', function () { sendData(startDate.value, startTime.value, endDate.value, endTime.value); });

        var buttonReset = new StyledElements.Button({
            class: "se-btn-circle z-depth-3",
            text: "Reset filter"
        });
        buttonReset.addEventListener('click', function () {
            startDate.value = today;
            startTime.value = "00:00";
            endDate.value = today;
            endTime.value = "00:00";

            resetFilter();
        });

        startLabel.appendChild(startDate);
        startLabel.appendChild(startTime);
        endLabel.appendChild(endDate);
        endLabel.appendChild(endTime);

        layout.center.addClassName('layout');
        layout.center.appendChild(startLabel);
        layout.center.appendChild(endLabel);
        layout.center.appendChild(buttonSend);
        layout.center.appendChild(buttonReset);
        layout.insertInto(document.body);
        layout.repaint();

        if (timestampSave.get()) {
            var data = JSON.parse(timestampSave.get());

            startDate.value = data.startDate;
            startTime.value = data.startTime;
            endDate.value = data.endDate;
            endTime.value = data.endTime;

            sendData(data.startDate, data.startTime, data.endDate, data.endTime);
        } else {
            resetFilter();
        }
    };

    var sendData = function sendData(startDate, startTime, endDate, endTime) {
        var offsetString;
        var ts = {};
        var saveData = {};
        var timestampSave = MashupPlatform.widget.getVariable('timestampSave');

        var offset = Math.round((new Date()).getTimezoneOffset() * -1 / 60);
        if (offset >= 0) {
            offsetString = "+" + offset.toString();
        } else {
            offsetString = offset.toString();
        }

        saveData.startDate = startDate;
        saveData.startTime = startTime;
        saveData.endDate = endDate;
        saveData.endTime = endTime;
        timestampSave.set(JSON.stringify(saveData));

        ts.start = Date.parse((new Date(startDate + " " + startTime + " UTC" + offsetString)).toISOString());
        ts.end = Date.parse((new Date(endDate + " " + endTime + " UTC" + offsetString)).toISOString());

        MashupPlatform.wiring.pushEvent("timestamps", JSON.stringify(ts));
    };

    var resetFilter = function resetFilter() {
        var ts = {
            "start": "",
            "end": ""
        };

        MashupPlatform.widget.getVariable('timestampSave').set(null);
        MashupPlatform.wiring.pushEvent("timestamps", JSON.stringify(ts));
    };

    var clearPage = function clearPage(context) {
        while (context.firstChild) {
            context.removeChild(context.firstChild);
        }
    };

    window.addEventListener("DOMContentLoaded", init, false);
})();
