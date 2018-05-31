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

        var rangeLabel = document.createElement('label');
        rangeLabel.innerHTML = "Date range:&nbsp;";
        var dateRange = document.createElement('input');
        dateRange.type = "text";

        $(dateRange).daterangepicker({
            timePicker: true,
            timePicker24Hour: true,
            timeZone: null,
            timePickerIncrement: 5,
            locale: {
                format: 'LLL'
            }
        });

        var buttonSend = new StyledElements.Button({
            class: "se-btn-circle z-depth-3",
            text: "Apply"
        });
        buttonSend.addEventListener('click', function () { sendData(dateRange.value); });

        var buttonReset = new StyledElements.Button({
            class: "se-btn-circle z-depth-3",
            text: "Reset"
        });
        buttonReset.addEventListener('click', function () {
            today = (new Date()).toISOString().slice(0, 10);

            dateRange.value = today;
            startTime.value = "00:00";
            endDate.value = today;
            endTime.value = "23:59";
        });

        var buttonExit = new StyledElements.Button({
            class: "se-btn-circle z-depth-3",
            text: "Close"
        });
        buttonExit.addEventListener('click', function () { MashupPlatform.wiring.pushEvent("timestamps", "exit"); });

        rangeLabel.appendChild(dateRange);
        rangeLabel.appendChild(startTime);
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

    var sendData = function sendData(dateRange, startTime, endDate, endTime) {
        var offsetString;
        var ts = {};

        var offset = Math.round((new Date()).getTimezoneOffset() * -1 / 60);
        if (offset >= 0) {
            offsetString = "+" + offset.toString();
        } else {
            offsetString = offset.toString();
        }

        ts.start = Date.parse((new Date(dateRange + " " + startTime + " UTC" + offsetString)).toISOString());
        ts.end = Date.parse((new Date(endDate + " " + endTime + " UTC" + offsetString)).toISOString());

        MashupPlatform.wiring.pushEvent("timestamps", JSON.stringify(ts));
    };

    var clearPage = function clearPage(context) {
        while (context.firstChild) {
            context.removeChild(context.firstChild);
        }
    };

    window.addEventListener("DOMContentLoaded", init, false);
})();