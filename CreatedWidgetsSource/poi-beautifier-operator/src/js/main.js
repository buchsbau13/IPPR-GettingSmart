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

    var friendlyEnt;
    var displayAttrs = [];
    var compAttributes = {};
    var unitAttributes = {};

    MashupPlatform.wiring.registerCallback("poiInput", function (poi) {
        // If friendly names entity should be used, wait until the entity is available (at most two seconds)
        if (MashupPlatform.wiring.hasInputConnections("friendlyEntInput")) {
            (function loop(count) {
                setTimeout(function () {
                    if (friendlyEnt || count == 0) {
                        sendOuput(JSON.parse(poi));
                    } else if (--count > 0) {
                        loop(count);
                    }
                }, 200)
            })(10);
        } else {
            sendOuput(JSON.parse(poi));
        }
    });

    MashupPlatform.wiring.registerCallback("friendlyEntInput", function (entity) {
        friendlyEnt = JSON.parse(entity);
        if (friendlyEnt instanceof Array) {
            friendlyEnt = friendlyEnt[0];
        }
    });

    MashupPlatform.wiring.registerCallback("addAttributes", function (attrs) {
        var attrList = attrs.split(new RegExp(',\\s*'));
        if (MashupPlatform.prefs.get('attributes')) {
            displayAttrs = MashupPlatform.prefs.get('attributes').split(new RegExp(',\\s*'));
        } else {
            displayAttrs = [];
        }
        attrList.forEach(function (attr) {
            displayAttrs.push(attr);
        });
    });

    MashupPlatform.prefs.registerCallback(function () {
        init();
    });

    var init = function init() {
        if (MashupPlatform.prefs.get('attributes')) {
            displayAttrs = MashupPlatform.prefs.get('attributes').split(new RegExp(',\\s*'));
        } else {
            displayAttrs = [];
        }

        if (MashupPlatform.prefs.get('comp_attributes')) {
            var keyValueList = MashupPlatform.prefs.get('comp_attributes').split(new RegExp(',\\s*'));
            keyValueList.forEach(function (entry) {
                var pair = entry.split(new RegExp('=\\s*'));
                if (pair.length == 2) {
                    compAttributes[pair[0]] = pair[1];
                } else {
                    compAttributes = {};
                }
            });
        } else {
            compAttributes = {};
        }

        if (MashupPlatform.prefs.get('unit_attributes')) {
            var keyValueList = MashupPlatform.prefs.get('unit_attributes').split(new RegExp(',\\s*'));
            keyValueList.forEach(function (entry) {
                var pair = entry.split(new RegExp('=\\s*'));
                if (pair.length == 2) {
                    unitAttributes[pair[0]] = pair[1];
                } else {
                    unitAttributes = {};
                }
            });
        } else {
            unitAttributes = {};
        }
    };

    var sendOuput = function sendOutput(poi) {
        poi.infoWindow = buildInfoWindow(poi);
        MashupPlatform.wiring.pushEvent("poiOutput", JSON.stringify(poi));
    };

    var buildInfoWindow = function buildInfoWindow(poi) {
        var infoWindow;

        if (displayAttrs.length > 0) {
            infoWindow = "<div>";

            displayAttrs.forEach(function (attr) {
                if (poi.data[attr]) {
                    var name = attr;
                    var value = poi.data[attr];

                    if (compAttributes && compAttributes[attr]) {
                        var attrs = compAttributes[attr].split(new RegExp('&\\s*'));
                        var vals = [];
                        attrs.forEach(function (entry) {
                            if (poi.data[attr][entry]) {
                                vals.push(poi.data[attr][entry]);
                            }
                        });
                        if (vals.length > 0) {
                            value = vals.join(", ");
                        }
                    } else if (unitAttributes && unitAttributes[attr] && !isNaN(parseFloat(poi.data[attr])) &&
                        poi.data[unitAttributes[attr]]) {
                        value = String(round(poi.data[attr], 1)) + " " + poi.data[unitAttributes[attr]];
                    }

                    if (attr == MashupPlatform.prefs.get('timestamp_name')) {
                        var timestamp = new Date(poi.data[attr]);
                        value = "yyyy-mm-dd HH:MM:ss";
                        if (MashupPlatform.prefs.get('timestamp_format')) {
                            value = MashupPlatform.prefs.get('timestamp_format');
                        }

                        if (value.includes("yyyy")) {
                            value = value.replace("yyyy", String(timestamp.getFullYear()));
                        } else {
                            value = value.replace("yy", String(timestamp.getFullYear()).slice(-2));
                        }
                        value = value.replace("mm", ((timestamp.getMonth() + 1) < 10 ? "0" : "") + (timestamp.getMonth() + 1));
                        value = value.replace("dd", (timestamp.getDate() < 10 ? "0" : "") + timestamp.getDate());
                        value = value.replace("HH", (timestamp.getHours() < 10 ? "0" : "") + timestamp.getHours());
                        value = value.replace("MM", (timestamp.getMinutes() < 10 ? "0" : "") + timestamp.getMinutes());
                        value = value.replace("ss", (timestamp.getSeconds() < 10 ? "0" : "") + timestamp.getSeconds());
                    }

                    if (friendlyEnt && friendlyEnt[attr]) {
                        if (attr == "id" && friendlyEnt.entity_id) {
                            name = friendlyEnt.entity_id;
                        } else if (attr == "type" && friendlyEnt.entity_type) {
                            name = friendlyEnt.entity_type;
                        } else {
                            name = friendlyEnt[attr];
                        }
                    }

                    infoWindow += '<span style="font-size:12px;"><b>' + name + ": </b> " + value +  "</span><br />";
                }
            });

            infoWindow += "</div>";
        } else {
            infoWindow = poi.infoWindow;
        }

        return infoWindow;
    };

    var round = function round(value, decimals) {
        return Number(Math.round(value + 'e' + decimals) + 'e-' + decimals);
    }

    init();
})();
