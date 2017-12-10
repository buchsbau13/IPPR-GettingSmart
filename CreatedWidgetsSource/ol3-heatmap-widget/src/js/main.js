/*
 * Copyright (c) 2014-2017 CoNWeT Lab., Universidad Politécnica de Madrid
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

/* global Widget */


(function () {

    "use strict";

    var widget = new Widget('body', '#incoming-modal');
    widget.init();

    MashupPlatform.wiring.registerCallback('poiInput', (poi_info) => {
        if (typeof poi_info === "string") {
            poi_info = JSON.parse(poi_info);
        }
        if (!Array.isArray(poi_info)) {
            poi_info = [poi_info];
        }
        poi_info.forEach(widget.registerPoI, widget);
        poi_info.forEach(widget.addHeatmap, widget);
    });
})();
