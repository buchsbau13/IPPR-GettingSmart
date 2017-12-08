/*
 * Copyright (c) 2015-2016 CoNWeT Lab., Universidad Politécnica de Madrid
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

/* global MashupPlatform, StyledElements */

(function () {

    "use strict";

    var ServiceManager = function ServiceManager() {
        this.layout = null;
        this.table = null;
        this.input = null;

        MashupPlatform.widget.context.registerCallback(function (newValues) {
            if (this.layout && ("heightInPixels" in newValues || "widthInPixels" in newValues)) {
                this.layout.repaint();
            }
        }.bind(this));

        MashupPlatform.prefs.registerCallback(function (newValues) {
            initOperator.call(this);
            this.serviceOutput.pushEvent(null);
        }.bind(this));
    };

    ServiceManager.prototype.init = function init() {
        this.layout = new StyledElements.VerticalLayout();
        createSource.call(this);
        createTable.call(this);
        this.layout.center.addClassName('loading');
        this.layout.insertInto(document.body);

        initOperator.call(this);
        this.serviceOutput.pushEvent(null);
    };

    var initOperator = function initOperator() {
        this.idasWidget = MashupPlatform.mashup.addOperator('CoNWeT/idas-rest-calls/1.0', {
            "preferences": {
                "idas_server": {"value": MashupPlatform.prefs.get("idas_server")},
                "use_user_fiware_token": {"value": MashupPlatform.prefs.get("use_user_fiware_token")},
                "use_owner_credentials": {"value": MashupPlatform.prefs.get("use_owner_credentials")},
                "ngsi_tenant": {"value": MashupPlatform.prefs.get("ngsi_tenant")}
            }
        });
        this.idasWidget.addEventListener('remove', function () { this.idasWidget = null; }.bind(this));

        this.serviceInput = MashupPlatform.widget.createInputEndpoint(receiveServices.bind(this));
        this.serviceOutput = MashupPlatform.widget.createOutputEndpoint();

        this.serviceOutput.connect(this.idasWidget.inputs.getServices);
        this.serviceInput.connect(this.idasWidget.outputs.serviceOutput);
    };

    var receiveServices = function receiveServices(input) {
        this.input = input;
        this.source.goToFirst();
        this.idasWidget.remove();
    };

    var createSource = function createSource() {
        this.source = new StyledElements.PaginatedSource({
            'pageSize': 30,
            'requestFunc': function (page, options, onSuccess, onError) {
                var data;
                if (this.input !== null) {
                    data = JSON.parse(this.input);
                }
                if (data && data.statusGet.state == "success") {
                    var list = [];
                    for (var entry = 0; entry < data.count; entry++) {
                        list.push({
                            "apikey": data.services[entry].apikey,
                            "resource": data.services[entry].resource,
                            "entity_type": data.services[entry].entity_type,
                            "service": data.services[entry].service,
                            "subservice": data.services[entry].subservice
                        });
                    }
                    onSuccess(list, {resources: list, total_count: data.count, current_page: page});
                } else {
                    onSuccess([], {resources: [], total_count: 0, current_page: 0});
                }
            }.bind(this)
        });
        this.source.addEventListener('requestStart', function () {
            this.layout.center.disable();
        }.bind(this));
        this.source.addEventListener('requestEnd', function () {
            this.layout.center.enable();
        }.bind(this));
    };

    var createTable = function createTable() {
        var fields;

        fields = [
            {field: 'apikey', label: 'API key', sortable: false},
            {field: 'resource', label: 'Resource', sortable: false},
            {field: 'entity_type', label: 'Entity type', sortable: false},
            {field: 'service', label: 'Tenant', sortable: false},
            {field: 'subservice', label: 'Service path', sortable: false}
        ];

        // TODO: Buttons

        this.table = new StyledElements.ModelTable(fields, {id: 'name', pageSize: 30, source: this.source, 'class': 'table-striped'});
        this.table.addEventListener("click", onRowClick);
        this.table.reload();
        this.layout.center.clear();
        this.layout.center.appendChild(this.table);
    };

    var onRowClick = function onRowClick(row) {
        MashupPlatform.wiring.pushEvent('selection', JSON.stringify(row));
    };

    var widget = new ServiceManager();
    window.addEventListener("DOMContentLoaded", widget.init.bind(widget), false);
})();