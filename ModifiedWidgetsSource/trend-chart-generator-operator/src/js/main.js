/*
 * trend-chart-generator
 * https://repo.conwet.fi.upm.es/wirecloud/agile-dashboards
 *
 * Copyright (c) 2015 CoNWeT
 * Licensed under the Apache2 license.
 */

/* globals MashupPlatform */

(function () {

    "use strict";

    var timestamps = null; // Chart timestamps (X axis)
    var values = null; // Chart data series (Y axis)
    var xAxisUnit;
    var series = [];

    //Creates a serie from a list of data
    var build_serie = function build_serie(serie) {
        //Check if somethings wrong
        if (serie.length != timestamps.length) {
            return;
        }
        //Create the serie
        var i, data = [];
        for (i = 0; i < timestamps.length; i++) {
            var time = new Date(timestamps[i]).getTime();
            data.push({x: time, y: serie[i], originalStamp: timestamps[i]});
        }
        return data;
    };

    //Creates all series
    var build_series = function build_series() {
        //Wipes current series
        series = [];

        //Check if theres data
        if (values === null || values.length === 0 || timestamps == null || timestamps.length === 0) {
            return;
        }

        if (!Array.isArray(values[0])) {
            //Single series
            series.push({name: getMetadataVerbose(values), data: build_serie(values)});
            xAxisUnit = getMetadataVerbose(values);
        } else {
            //Multiple series
            values.forEach(function (serie) {
                series.push({name: getMetadataVerbose(serie), data: build_serie(serie)});
                xAxisUnit = getMetadataTag(serie);
            });
        }

        plot();
    };

    var dataHandler = function dataHandler(point) {
        var filterBy = point.originalStamp;
        var meta = timestamps.metadata;
        return [{type: meta.filterAttributeType || "eq", value: filterBy, attr: meta.filterAttribute}];
    };


    //Gets the metadata, if any
    var getMetadataTag = function getMetadataTag(o) {
        return o.metadata ? o.metadata.tag || "values" : "values";
    };
    var getMetadataVerbose = function getMetadataMsg(o) {
        return o.metadata ? o.metadata.verbose || getMetadataTag(o) : "values";
    };

    //Draws the chart
    var plot = function plot() {
        var options, max;

        options = {
            chart: {
                type: 'area'
            },
            title: {
                text: MashupPlatform.prefs.get('title')
            },
            legend: {
                enabled: series.length === 1 ? false : true //Enable legend if there are more than 1 series
            },
            xAxis: {
                type: 'datetime',
                dateTimeLabelFormats: { // don't display the dummy year
                    hour: '%Y-%m-%d<br/>%H:%M',
                    day: '%Y<br/>%m-%d',
                    month: '%e. %b',
                    year: '%b'
                },
                title: {
                    text: MashupPlatform.prefs.get('xaxis')
                }
            },
            yAxis: {
                title: {
                    text: MashupPlatform.prefs.get('yaxis')
                }
            },
            tooltip: {
                headerFormat: '',
                pointFormat: '{point.x:%e. %b}: {point.y:.2f}'
            },
            plotOptions: {
                area: {
                    lineWidth: 1,
                    marker: {
                        lineWidth: 1
                    }
                }
            },
            series: series,
            colors: colors()
        };

        if (timestamps.metadata && timestamps.metadata.filterAttribute) {
            options.dataHandler = dataHandler;
        }

        max = MashupPlatform.prefs.get('max').trim();
        if (max !== '') {
            options.yAxis.max = parseInt(max, 10);
        }
        MashupPlatform.wiring.pushEvent("chart-options", options);
    };

    var timestampCallback = function timestampCallback(data) {
        timestamps = data;
        build_series();
    };
    var dataserieCallback = function dataserieCallback(data) {
        values = data;
        build_series();
    };

    var colors = function colorsGenerator() {
        var color = MashupPlatform.prefs.get('color').trim().toLowerCase();
        var colors = [];
        if (color === "red") {
            colors.push("#581845", "#FF5733", "#C70039", "#900C3F");
        }
        if (color === "blue") {
            colors.push("#154360", "#3498db", "#1f618d", "#1a5276");
        } else {
            colors.push("#145a32", "#58d68d", "#27ae60", "#1e8449");
        }
        return colors;
    };

    //Callback for the endpoints
    MashupPlatform.wiring.registerCallback("timestamps", timestampCallback);
    MashupPlatform.wiring.registerCallback("data-serie", dataserieCallback);

    /* test-code */
    window.timestampCallback = timestampCallback;
    window.dataserieCallback = dataserieCallback;
    /* end-test-code */

})();
