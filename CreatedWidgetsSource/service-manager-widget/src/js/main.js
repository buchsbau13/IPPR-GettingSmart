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
            if (MashupPlatform.prefs.get('allow_add')) {
                this.addButton.show();
            } else {
                this.addButton.hide();
            }

            initOperator.call(this);
            this.getServiceOutput.pushEvent(null);
        }.bind(this));
    };

    ServiceManager.prototype.init = function init() {
        this.layout = new StyledElements.VerticalLayout();
        createSource.call(this);
        createTable.call(this);
        this.layout.center.addClassName('loading');
        this.layout.insertInto(document.body);
        this.layout.repaint();

        this.serviceInput = MashupPlatform.widget.createInputEndpoint(receiveServices.bind(this));
        this.getServiceOutput = MashupPlatform.widget.createOutputEndpoint();
        this.addServiceOutput = MashupPlatform.widget.createOutputEndpoint();
        this.editServiceOutput = MashupPlatform.widget.createOutputEndpoint();
        this.delServiceOutput = MashupPlatform.widget.createOutputEndpoint();

        this.addButton = new StyledElements.Button({
            class: "se-btn-circle add-service-button z-depth-3",
            iconClass: "icon-plus",
        });

        this.editorConfigOutput = MashupPlatform.widget.createOutputEndpoint();
        this.templateOutput = MashupPlatform.widget.createOutputEndpoint();
        this.newServiceInput = MashupPlatform.widget.createInputEndpoint(newService.bind(this));
        this.addButton.addEventListener('click', function () {
            this.addServiceAction = true;
            this.editServiceAction = false;
            initEditorWidget.call(this, this.addButton);
            this.editorConfigOutput.pushEvent({
                "readonly": [
                    ["token"],
                    ["cbroker"]
                ]
            });
            this.templateOutput.pushEvent(JSON.stringify({
                "apikey": "",
                "token": "token2",
                "cbroker": MashupPlatform.prefs.get('ngsi_server'),
                "entity_type": "",
                "resource": "",
                "subservice": "/"
            }));
        }.bind(this));
        this.layout.center.appendChild(this.addButton);

        if (MashupPlatform.prefs.get('allow_add')) {
            this.addButton.show();
        } else {
            this.addButton.hide();
        }

        initOperator.call(this);
        this.getServiceOutput.pushEvent(null);
    };

    var initOperator = function initOperator() {
        this.idasWidget = MashupPlatform.mashup.addOperator('FH-JOANNEUM/idas-rest-calls/1.0', {
            "preferences": {
                "idas_server": {"value": MashupPlatform.prefs.get("idas_server")},
                "use_user_fiware_token": {"value": MashupPlatform.prefs.get("use_user_fiware_token")},
                "use_owner_credentials": {"value": MashupPlatform.prefs.get("use_owner_credentials")},
                "ngsi_tenant": {"value": MashupPlatform.prefs.get("ngsi_tenant")}
            }
        });
        this.idasWidget.addEventListener('remove', function () { this.idasWidget = null; }.bind(this));

        this.serviceInput.connect(this.idasWidget.outputs.serviceOutput);
        this.getServiceOutput.connect(this.idasWidget.inputs.getServices);
        this.addServiceOutput.connect(this.idasWidget.inputs.addService);
        this.editServiceOutput.connect(this.idasWidget.inputs.editService);
        this.delServiceOutput.connect(this.idasWidget.inputs.delService);
    };

    var initEditorWidget = function initEditorWidget(button) {
        this.editorWidget = MashupPlatform.mashup.addWidget('CoNWeT/json-editor/1.0', {refposition: button.getBoundingClientRect()});
        this.editorWidget.addEventListener('remove', function () { this.editorWidget = null; }.bind(this));

        this.editorConfigOutput.connect(this.editorWidget.inputs.configure);
        this.templateOutput.connect(this.editorWidget.inputs.input);
        this.newServiceInput.connect(this.editorWidget.outputs.output);
    };

    var receiveServices = function receiveServices(input) {
        this.input = input;
        this.source.goToFirst();
        this.idasWidget.remove();
    };

    var newService = function newService(input) {
        var data = JSON.parse(input);
        if (this.addServiceAction) {
            this.addServiceAction = false;
            initOperator.call(this);
            var service = {"services": []};
            service.services.push(data);
            this.addServiceOutput.pushEvent(JSON.stringify(service));
        } else if (this.editServiceAction) {
            this.editServiceAction = false;
            initOperator.call(this);
            this.editServiceOutput.pushEvent(input);
        }
        this.editorWidget.remove();
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
                    var loopCount = 0;
                    var list = [];

                    for (var entry = (page - 1) * options.pageSize; entry < data.count; entry++) {
                        if (loopCount >= options.pageSize) {
                            break;
                        }

                        list.push({
                            "apikey": data.services[entry].apikey,
                            "resource": data.services[entry].resource,
                            "entity_type": data.services[entry].entity_type,
                            "service": data.services[entry].service,
                            "subservice": data.services[entry].subservice
                        });

                        loopCount++;
                    }

                    if (data.statusAdd && data.statusAdd.state != "success") {
                        MashupPlatform.widget.log(data.statusAdd.message);
                    } else if (data.statusEdit && data.statusEdit.state != "success") {
                        MashupPlatform.widget.log(data.statusEdit.message);
                    } else if (data.statusDel && data.statusDel.state != "success") {
                        MashupPlatform.widget.log(data.statusDel.message);
                    }

                    onSuccess(list, {resources: list, total_count: data.count, current_page: page});
                } else if (data && data.statusGet.state != "success") {
                    onError(data.statusGet.message);
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
        var fields = [
            {field: 'apikey', label: 'API key', sortable: false},
            {field: 'resource', label: 'Resource', sortable: false},
            {field: 'entity_type', label: 'Entity type', sortable: false},
            {field: 'service', label: 'Tenant', sortable: false},
            {field: 'subservice', label: 'Service path', sortable: false}
        ];

        if (MashupPlatform.prefs.get('allow_edit') || MashupPlatform.prefs.get('allow_delete')) {
            fields.push({
                label: 'Actions',
                width: '80px',
                contentBuilder: function (entry) {
                    var content, button;

                    content = new StyledElements.Container({class: "btn-group"});

                    if (MashupPlatform.prefs.get('allow_edit')) {
                        button = new StyledElements.Button({'iconClass': 'fa fa-pencil', 'title': 'Edit'});
                        button.addEventListener('click', function () {
                            this.editServiceAction = true;
                            this.addServiceAction = false;
                            initEditorWidget.call(this, button);
                            this.editorConfigOutput.pushEvent({
                                "readonly": [
                                    ["apikey"],
                                    ["resource"],
                                    ["service"],
                                    ["subservice"]
                                ]
                            });
                            this.templateOutput.pushEvent(JSON.stringify(entry));
                        }.bind(this));
                        content.appendChild(button);
                    }

                    if (MashupPlatform.prefs.get('allow_delete')) {
                        button = new StyledElements.Button({'class': 'btn-danger', 'iconClass': 'icon-trash', 'title': 'Delete'});
                        button.addEventListener('click', function () {
                            initOperator.call(this);
                            this.delServiceOutput.pushEvent(JSON.stringify(entry));
                        }.bind(this));
                        content.appendChild(button);
                    }

                    return content;
                }.bind(this),
                sortable: false
            });
        }

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