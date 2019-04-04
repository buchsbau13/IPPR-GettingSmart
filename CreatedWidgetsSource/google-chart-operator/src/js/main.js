/* globals MashupPlatform */

(function () {

    "use strict";

    var timestamps = null; // Chart timestamps (X axis)
    var values = null; // Chart data series (Y axis)
    var unit = null;

    var generateData = function generateData() {
        // Check if all the required data is there
        if (values === null || values.length === 0 || timestamps == null || timestamps.length === 0 || (unit == null && MashupPlatform.prefs.get('unit') === "")) {
            return;
        }

        var label;
        var chart = {};
        var chartData = [];
        var chartType = MashupPlatform.prefs.get('chartType');
        var xAxis = MashupPlatform.prefs.get('xaxis');
        var yAxis = MashupPlatform.prefs.get('yaxis');
        var title = MashupPlatform.prefs.get('title');
        if (!unit) {
            unit = MashupPlatform.prefs.get('unit');
        }

        label = [xAxis, yAxis];
        chartData.push(label);

        for (var i = 0; i < timestamps.length; i++) {
            var formattedDate = formatDate(new Date(timestamps[i]));
            chartData.push([formattedDate, values[i]])
        }

        chart.type = chartType;
        chart.options = setChartOptions(title, xAxis, yAxis);
        chart.data = chartData;
        chart.unit = unit;

        MashupPlatform.wiring.pushEvent("chart", JSON.stringify(chart));
        MashupPlatform.operator.log(JSON.stringify(chart), MashupPlatform.log.INFO);

        // set back fields to null
        timestamps = null;
        values = null;
        unit = null;
    };

    var setChartOptions = function setChartOptions(title, xAxis, yAxis) {
        var chartOptions = MashupPlatform.prefs.get('options');
        if (chartOptions && chartOptions !== undefined) {
            try {
                chartOptions = JSON.parse(chartOptions);
            } catch (err) {
                MashupPlatform.operator.log("Please enter a string with a valid JSON format in the field 'options'. Error Message: " + (err));
            }
        } else {
            chartOptions = {
                "title": title,
                "hAxis": {
                    "title": xAxis
                },
                "vAxis": {
                    "title": yAxis
                },
                "legend": {
                    "position": "none"
                }
            }
        }
        return chartOptions;
    };

    var formatDate = function formatDate(date) {
        var year = date.getFullYear();
        var month = date.getMonth() + 1;
        var day = date.getDate();
        var sec = date.getSeconds();
        var min = date.getMinutes();
        var hour = date.getHours();

        if (day < 10) {
            day = '0' + day;
        }
        if (month < 10) {
            month = '0' + month;
        }
        if (min < 10) {
            min = '0' + min;
        }
        if (hour < 10) {
            hour = '0' + hour;
        }
        if (sec < 10) {
            sec = '0' + sec;
        }

        return day + '.' + month + '.' + year + ' ' + hour + ':' + min + ':' + sec;

    };

    var unitCallback = function unitCallback(data) {
        unit = data;
        generateData();
    };

    var timestampCallback = function timestampCallback(data) {
        timestamps = data;
        generateData();
    };
    var dataserieCallback = function dataserieCallback(data) {
        values = data;
        generateData();
    };

    // Callback for the endpoints
    MashupPlatform.wiring.registerCallback("timestamps", timestampCallback);
    MashupPlatform.wiring.registerCallback("data-serie", dataserieCallback);
    MashupPlatform.wiring.registerCallback("unit", unitCallback);
})();


