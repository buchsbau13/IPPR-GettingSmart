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

    var attribute;
    var minMaxValues = {};
    var gradient = [];

    // attribute to be shown for POI
    MashupPlatform.wiring.registerCallback("attribute", function (attr) {
        attribute = attr;
        init();
    });

    MashupPlatform.prefs.registerCallback(function () {
        if (attribute) {
            init();
        }
    });

    var init = function init() {
        // get the min and max value for the attribute
        if (MashupPlatform.prefs.get('min_max_values')) {
            var keyValueList = MashupPlatform.prefs.get('min_max_values').split(new RegExp(',\\s*'));
            keyValueList.forEach(function (entry) {
                var pair = entry.split(new RegExp('=\\s*'));
                if (pair.length == 2) {
                    var vals = pair[1].split(new RegExp('/\\s*'));
                    if (vals.length == 2) {
                        minMaxValues[pair[0]] = {
                            "min": vals[0],
                            "max": vals[1]
                        };
                    } else {
                        minMaxValues = {};
                    }
                } else {
                    minMaxValues = {};
                }
            });
        } else {
            minMaxValues = {};
        }

        // get the JSON with the gradient information for the attribute
        var json = JSON.parse(MashupPlatform.prefs.get('gradientsJSON').trim());
        if(json){
            json.attributes.forEach(function (attr) {
                if (attr.name == attribute) {
                    gradient = attr.gradient;
                }
            });
        }

        if (minMaxValues && minMaxValues[attribute] && gradient) {
            MashupPlatform.wiring.pushEvent("minValue", minMaxValues[attribute].min);
            MashupPlatform.wiring.pushEvent("maxValue", minMaxValues[attribute].max);
            MashupPlatform.wiring.pushEvent("gradient", gradient);
            gradient = [];
        }
    };
})();
