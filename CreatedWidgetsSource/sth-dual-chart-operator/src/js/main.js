
/*
 * Copyright (c) 2013-2016 CoNWeT Lab., Universidad Politécnica de Madrid
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

/* globals, $, MashupPlatform */
(function (mp) {

    "use strict";

    const requestData = function requestData(inputData) {

        const server = getServer()

        const requestParams = {
            dateFrom: inputData.startDate,
            dateTo: inputData.endDate,
            aggrMethod: inputData.aggregationMethod,
            aggrPeriod: inputData.aggregationPeriod
        };

        const urlSensorOne = createUrl(inputData.entity1, inputData.attribute1, server);
        const urlSensorTwo = createUrl(inputData.entity2, inputData.attribute2, server);

        async function getData() {
            const dataSensorOne = await getSensorData(urlSensorOne, requestParams)
            const dataSensorTwo = await getSensorData(urlSensorTwo, requestParams)
            await processData(dataSensorOne, dataSensorTwo, inputData);
        }
        const result = getData();
        MashupPlatform.operator.log(result, MashupPlatform.log.INFO);
    };

    const getSensorData = function getSensorData(url, requestParams) {
        MashupPlatform.operator.log("GET " + url, MashupPlatform.log.INFO);
        return new Promise((resolve, reject) => {
            mp.http.makeRequest(url, {
                method: "GET",
                requestHeaders: getRequestHeaders(),
                parameters: requestParams,
                onSuccess: resolve,
                onFailure: reject
            })
        }).then(response => JSON.parse(response.responseText).contextResponses[0].contextElement)
    };

    const processData = function processData(dataOne, dataTwo, inputData) {
        Promise.all([dataOne, dataTwo]).then(result => {
            const data = {}
            data.header = ["Time", inputData.attribute1 + ' - ' + inputData.entity1.id ,inputData.attribute2 + ' - ' + inputData.entity2.id]
            data.timeStamps = [...new Set([...result[0].attributes[0].values.map(_ => _.recvTime),...result[1].attributes[0].values.map(_ => _.recvTime)])]
            data.sensorOneValues = result[0].attributes[0].values
            data.sensorTwoValues = result[1].attributes[0].values
            if(data.sensorOneValues.length == 0) throw new Error(inputData.entity1.id);
            if(data.sensorTwoValues.length == 0) throw new Error(inputData.entity2.id);
            return data
        }).then(data => {
            const chartData = [];
            let row = [];
            chartData.push(data.header)
            data.timeStamps.forEach(timeStamp => {
                row = []
                row.push(formatDate(timeStamp,inputData.aggregationPeriod))
                data.sensorOneValues.forEach(value => {
                    if(timeStamp === value.recvTime) row.push(parseFloat(value.attrValue))
                })
                if(row.length == 1) row.push(null)
                data.sensorTwoValues.forEach(value => {
                    if(timeStamp === value.recvTime) row.push(parseFloat(value.attrValue))
                })
                if(row.length == 2) row.push(null)
                chartData.push(row)
            })
            return chartData;
        }).then(_ => {
            const chartData = {
                "type": "LineChart",
                "options": createChartOptions(inputData),
                "data": _
            }
            mp.wiring.pushEvent("values", JSON.stringify(chartData));
        }).catch(e => {
            MashupPlatform.operator.log("CATCH" + e, MashupPlatform.log.INFO)
            mp.wiring.pushEvent("values", JSON.stringify(dummyChart));
            sendMessage("error", e+" - no data available ")
        })
    }

    const createChartOptions = function createChartOptions(inputData) {
        const options = {
            "title": "",
            "series": {
                0: {targetAxisIndex: 0},
                1: {targetAxisIndex: 1}
            },
            "vAxes": {
                // Adds titles to each axis.
                0: {title: ""},
                1: {title: ""}
            },
            "hAxis": {
                "title": "Datum und Zeit"
            },
            "pointSize": 1
        }
        options.title = getAggrMethodOrPeriod(inputData.aggregationMethod) + " pro " + getAggrMethodOrPeriod(inputData.aggregationPeriod)
        options.vAxes[0].title = inputData.attribute1 + " [" + inputData.unit1 + "]"
        options.vAxes[1].title = inputData.attribute2 + " [" + inputData.unit2 + "]"

        return options
    }

    const formatDate = function (dateString, aggrPeriod) {
        switch(aggrPeriod){
        case 'month':
            return moment(dateString).format("MM.YY")
        case 'day':
            return moment(dateString).format("DD.MM.YY")
        case 'hour':
            return moment(dateString).format("DD.MM.YY HH:mm")
        default:
            return moment(dateString).format();
        }
    }

    const getAggrMethodOrPeriod = function (aggrString) {
        switch (aggrString) {
        case 'max':
            return 'Maximum';
        case 'min':
            return 'Minimum';
        case 'avg':
            return 'Durchschnitt';
        case 'day':
            return 'Tag';
        case 'month':
            return 'Monat';
        case 'hour':
            return 'Stunde';
        default:
            return aggrString;
        }
    }

    const getServer = function getServer() {
        var server = new URL(mp.prefs.get('sth_server'));
        if (server.pathname[server.pathname.length - 1] !== "/") {
            server.pathname += "/";
        }
        return server;
    }

    const getRequestHeaders = function getRequestHeaders() {
        var requestHeaders = {};

        if (mp.prefs.get('use_user_fiware_token') || mp.prefs.get('use_owner_credentials')) {
            requestHeaders['FIWARE-OAuth-Token'] = 'true';
            requestHeaders['FIWARE-OAuth-Header-Name'] = 'X-Auth-Token';

            if (mp.prefs.get('use_owner_credentials')) {
                requestHeaders['FIWARE-OAuth-Source'] = 'workspaceowner';
            }
        }

        var tenant = mp.prefs.get('ngsi_tenant').trim().toLowerCase();
        if (tenant !== '') {
            requestHeaders['FIWARE-Service'] = tenant;
        }

        var path = mp.prefs.get('ngsi_service_path').trim().toLowerCase();
        if (path !== '' && path !== '/') {
            requestHeaders['FIWARE-ServicePath'] = path;
        } else {
            requestHeaders['FIWARE-ServicePath'] = '/';
        }
        return requestHeaders
    }

    const createUrl = function createUrl(entity, attribute, server) {
        return new URL('v1/contextEntities/type/' + entity.type + '/id/' + entity.id + '/attributes/' + attribute, server)
    }
    
    const sendMessage = function errorMessage(type, msg) {
        const message = {}
        message.type = type
        message.text = msg
        mp.wiring.pushEvent("message", JSON.stringify(message))
    }

    const dummyChart = {
        min_length: 2,    
        type: 'LineChart',
        data: [
            ['Time', 'dummy'],
            ['', 0],
        ],
        options: {
            title: "No Data",
            width: '100%',
            height: '100%',
            hAxis: {
                title: "none"
            },
            legend: {
                position: 'none'
            }
        }
    }

    mp.wiring.registerCallback("inputWidgetData", function (inputDataString) {
        requestData(JSON.parse(inputDataString))
    })

})(MashupPlatform)