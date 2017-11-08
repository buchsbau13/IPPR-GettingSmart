/* globals MashupPlatform */

(function () {

    "use strict";

    MashupPlatform.wiring.registerCallback("entityInput", function (entityString) {
        var entity = JSON.parse(entityString);
        var attribute = MashupPlatform.prefs.get('attribute');
        var unit = MashupPlatform.prefs.get('unit');

        if (attribute) {
            var value = entity[attribute];
            var jsonObject = {};
            jsonObject.value = parseInt(value);
            jsonObject.unit = unit;
        } else {
            return;
        }

        MashupPlatform.wiring.pushEvent("output", JSON.stringify(jsonObject));
    });
})();
