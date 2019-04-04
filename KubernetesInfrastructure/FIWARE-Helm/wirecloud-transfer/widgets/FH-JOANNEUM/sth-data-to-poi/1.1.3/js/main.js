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
        if (data) {
            try {
                data = JSON.parse(data);
            } catch (err) {
                MashupPlatform.operator.log("Invalid Input Data. Error: " + (err));
            }
        }

        var id = data.entityId;
        var timestamps = data.timestamps;
        var dataseries = data.dataseries;
        var dataseriesLocation = data.dataseriesLocation;
        var entity = JSON.parse(data.entity);
        var attribute = data.attribute;
        var poiSetIdentifier = new Date().getTime();

        for (var i = 0; i < timestamps.length; i++) {
            if (dataseriesLocation[i]) {
                var locationParts = dataseriesLocation[i].split(new RegExp(',\\s*'));
                var coordinates = {
                    system: "WGS84",
                    lng: parseFloat(locationParts[1]),
                    lat: parseFloat(locationParts[0])
                };
            }

            var infoWindow = "<div>";
            infoWindow += '<span style="font-size:12px;"><b>Id: </b>' + id + '</span><br />';
            infoWindow += '<span style="font-size:12px;"><b>' + attribute + ": </b>" + dataseries[i] + "</span><br />";
            infoWindow += '<span style="font-size:12px;"><b>Location: </b>' + dataseriesLocation[i] + '</span><br />';
            infoWindow += "</div>";

            var updatedEntity = entity;
            updatedEntity[attribute] = dataseries[i].toString();
            updatedEntity.timestamp = new Date(timestamps[i]).toISOString();

            var poi = {
                id: id,
                tooltip: id,
                data: updatedEntity,
                infoWindow: infoWindow,
                currentLocation: coordinates,
                currentValue: dataseries[i],
                poiSetIdentifier: poiSetIdentifier
            };

            MashupPlatform.wiring.pushEvent("poiOutput", JSON.stringify(poi));
        }
    });
})();
