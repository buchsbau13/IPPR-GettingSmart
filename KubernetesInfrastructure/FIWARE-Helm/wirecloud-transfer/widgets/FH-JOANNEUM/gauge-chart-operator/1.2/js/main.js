/* globals MashupPlatform */

(function () {

    "use strict";

    MashupPlatform.wiring.registerCallback("entityInput", function (entityString) {
        var label, value, rounded, chartOptions;
        var entity = JSON.parse(entityString);
        var attribute = MashupPlatform.prefs.get('attribute');
        var unit = MashupPlatform.prefs.get('unit');

        try {
            chartOptions = JSON.parse(MashupPlatform.prefs.get('options'));
            if (chartOptions == "{}") {
                chartOptions =  '{"min": "0", "max": "100", "minorTicks": "5"}'
            }
        } catch (err) {
            MashupPlatform.operator.log("Please enter a string with a valid JSON format in the field 'options'. Error Message: " + (err))
        }

        var chart = {};
        var chartData = [];

        rounded = Math.round(parseFloat(entity[attribute]) * 10) / 10;
        label = ['Label', 'Value'];
        value = [attribute, rounded];

        chartData.push(label);
        chartData.push(value);

        chart.type = "Gauge";
        chart.options = chartOptions;
        chart.data = chartData;
        chart.unit = entity[unit];

        MashupPlatform.wiring.pushEvent("gauge", JSON.stringify(chart));
    });
})();
