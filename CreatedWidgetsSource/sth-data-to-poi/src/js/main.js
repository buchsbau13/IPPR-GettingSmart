/*
 * Copyright (c) 2014 CoNWeT Lab., Universidad Politécnica de Madrid
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

/* globals MashupPlatform */

(function () {

    "use strict";

    MashupPlatform.wiring.registerCallback("sthData", function (data) {
        if (data && typeof data === "string") {
            try {
                data = JSON.parse(data);
            } catch (err) {
                MashupPlatform.operator.log("Please provide a string with a valid JSON format as Input. Error Message: " + (err));
            }
        }

        var id = data.entityId;
        var timestamps = data.timestamps;
        var dataseries = data.dataseries;
        var dataseriesLocation = data.dataseriesLocation;
        var entity = data.entity;
        var attribute = data.attribute;
        var poiSetIdentifier = new Date().getTime();

        for (var i = 0; i < timestamps.length; i++) {
            var locationParts = dataseriesLocation[i].split(new RegExp(',\\s*'));
            var coordinates = {
                system: "WGS84",
                lng: parseFloat(locationParts[1]),
                lat: parseFloat(locationParts[0])
            };

            var infoWindow = "<div>";
            infoWindow += '<span style="font-size:12px;"><b>' + attribute + ": </b>" + dataseries[i] + "</span><br />";
            infoWindow += "</div>";

            var poi = {
                id: id,
                tooltip: id,
                data: JSON.parse(entity),
                infoWindow: infoWindow,
                currentLocation: coordinates,
                currentValue: dataseries[i],
                poiSetIdentifier: poiSetIdentifier
            };

            MashupPlatform.operator.log(poi, MashupPlatform.log.INFO);
            MashupPlatform.wiring.pushEvent("poiOutput", JSON.stringify(poi));
        }
    });
})();
