/* globals MashupPlatform */

(function () {

    "use strict";

    MashupPlatform.wiring.registerCallback("entityInput", function (entityString) {
        var entity = JSON.parse(entityString);
        var attribute = MashupPlatform.prefs.get('attribute');
        var unit = MashupPlatform.prefs.get('unit');
        var valueType = MashupPlatform.prefs.get('valueType');

        if (attribute) {
            var value = entity[attribute];
            var jsonObject = {};

            if (valueType == "int") {
                jsonObject.value = parseInt(value);
            } else if (valueType == "float") {
                jsonObject.value = parseFloat(value);
            } else {
                jsonObject.value = value;
            }

            jsonObject.unit = unit;
        } else {
            return;
        }

        MashupPlatform.wiring.pushEvent("output", JSON.stringify(jsonObject));
    });
})();
