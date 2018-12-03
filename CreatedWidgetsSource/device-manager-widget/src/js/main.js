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

    var DeviceManager = function DeviceManager() {
        this.layout = null;
        this.table = null;
        this.input = null;
        this.filter = null;

        MashupPlatform.widget.context.registerCallback(function (newValues) {
            if (this.layout && ("heightInPixels" in newValues || "widthInPixels" in newValues)) {
                this.layout.repaint();
            }
        }.bind(this));

        MashupPlatform.prefs.registerCallback(function (newValues) {
            if (MashupPlatform.prefs.get('allow_add')) {
                this.showButton.style("right", "50px");
                this.addButton.show();
            } else {
                this.addButton.hide();
                this.showButton.style("right", "5px");
            }

            this.filter = null;
            initOperator.call(this);
            this.getDeviceOutput.pushEvent(null);
        }.bind(this));

        MashupPlatform.wiring.registerCallback("filterByEnt", function (input) {
            var data = JSON.parse(input);
            if (data.subservice && data.service) {
                this.filter = {
                    "entity_name": " ",
                    "entity_type": " "
                };
                if (data.id && data.type) {
                    this.filter.entity_name = data.id;
                    this.filter.entity_type = data.type;
                }
                MashupPlatform.prefs.set("ngsi_service_path", data.subservice);
                MashupPlatform.prefs.set("ngsi_tenant", data.service);
                initOperator.call(this);
                this.getDeviceOutput.pushEvent(JSON.stringify(this.filter));
            }
        }.bind(this));
    };

    DeviceManager.prototype.init = function init() {
        this.layout = new StyledElements.VerticalLayout();
        createSource.call(this);
        createTable.call(this);
        this.layout.center.addClassName('loading');
        this.layout.insertInto(document.body);
        this.layout.repaint();

        this.deviceInput = MashupPlatform.widget.createInputEndpoint(receiveDevices.bind(this));
        this.getDeviceOutput = MashupPlatform.widget.createOutputEndpoint();
        this.addDeviceOutput = MashupPlatform.widget.createOutputEndpoint();
        this.editDeviceOutput = MashupPlatform.widget.createOutputEndpoint();
        this.delDeviceOutput = MashupPlatform.widget.createOutputEndpoint();

        this.showButton = new StyledElements.Button({
            class: "se-btn-circle show-devices-button z-depth-3",
            text: "Show all"
        });

        this.showButton.addEventListener('click', function () {
            this.filter = null;
            initOperator.call(this);
            this.getDeviceOutput.pushEvent(null);
        }.bind(this));
        this.layout.center.appendChild(this.showButton);

        this.addButton = new StyledElements.Button({
            class: "se-btn-circle add-device-button z-depth-3",
            iconClass: "icon-plus",
        });

        this.editorConfigOutput = MashupPlatform.widget.createOutputEndpoint();
        this.templateOutput = MashupPlatform.widget.createOutputEndpoint();
        this.newDeviceInput = MashupPlatform.widget.createInputEndpoint(newDevice.bind(this));
        this.addButton.addEventListener('click', function () {
            var nameValue = "";
            var typeValue = "";
            if (this.filter && this.filter.entity_name && this.filter.entity_type && this.filter.entity_name !== " " &&
                this.filter.entity_type !== " ") {
                nameValue = this.filter.entity_name;
                typeValue = this.filter.entity_type;
            }
            this.addDeviceAction = true;
            this.editDeviceAction = false;
            initEditorWidget.call(this, this.addButton);
            this.editorConfigOutput.pushEvent({
                "readonly": []
            });
            this.templateOutput.pushEvent(JSON.stringify({
                "device_id": "",
                "entity_name": nameValue,
                "entity_type": typeValue,
                "attributes": [
                    {
                        "object_id": "",
                        "name": "",
                        "type": "Text"
                    }
                ]
            }));
        }.bind(this));
        this.layout.center.appendChild(this.addButton);

        if (MashupPlatform.prefs.get('allow_add')) {
            this.showButton.style("right", "50px");
            this.addButton.show();
        } else {
            this.addButton.hide();
            this.showButton.style("right", "5px");
        }

        initOperator.call(this);
        this.getDeviceOutput.pushEvent(null);
    };

    var initOperator = function initOperator() {
        if (!this.idasWidget) {
            this.idasWidget = MashupPlatform.mashup.addOperator(MashupPlatform.prefs.get("idas_operator"), {
                "preferences": {
                    "idas_server": {"value": MashupPlatform.prefs.get("idas_server")},
                    "use_user_fiware_token": {"value": MashupPlatform.prefs.get("use_user_fiware_token")},
                    "use_owner_credentials": {"value": MashupPlatform.prefs.get("use_owner_credentials")},
                    "ngsi_tenant": {"value": MashupPlatform.prefs.get("ngsi_tenant")},
                    "ngsi_service_path": {"value": MashupPlatform.prefs.get("ngsi_service_path")}
                }
            });
            this.idasWidget.addEventListener('remove', function () { this.idasWidget = null; }.bind(this));

            this.deviceInput.connect(this.idasWidget.outputs.deviceOutput);
            this.getDeviceOutput.connect(this.idasWidget.inputs.getDevices);
            this.addDeviceOutput.connect(this.idasWidget.inputs.addDevice);
            this.editDeviceOutput.connect(this.idasWidget.inputs.editDevice);
            this.delDeviceOutput.connect(this.idasWidget.inputs.delDevice);
        }
    };

    var initEditorWidget = function initEditorWidget(button) {
        if (this.editorWidget) {
            this.editorWidget.remove();
        }
        this.editorWidget = MashupPlatform.mashup.addWidget(MashupPlatform.prefs.get("json_editor_widget"), {refposition: button.getBoundingClientRect()});
        this.editorWidget.addEventListener('remove', function () { this.editorWidget = null; }.bind(this));

        this.editorConfigOutput.connect(this.editorWidget.inputs.configure);
        this.templateOutput.connect(this.editorWidget.inputs.input);
        this.newDeviceInput.connect(this.editorWidget.outputs.output);
    };

    var receiveDevices = function receiveDevices(input) {
        this.input = input;
        this.source.goToFirst();
        if (this.idasWidget) {
            this.idasWidget.remove();
        }
    };

    var newDevice = function newDevice(input) {
        if (input !== "exit") {
            var data = JSON.parse(input);
            if (this.addDeviceAction) {
                this.addDeviceAction = false;
                initOperator.call(this);
                var device = {"devices": []};
                device.devices.push(data);
                this.addDeviceOutput.pushEvent(JSON.stringify(device));
            } else if (this.editDeviceAction) {
                this.editDeviceAction = false;
                initOperator.call(this);
                this.editDeviceOutput.pushEvent(input);
            }
        }
        this.editorWidget.remove();
    };

    var createSource = function createSource() {
        this.source = new StyledElements.PaginatedSource({
            'pageSize': 30,
            'requestFunc': function (page, options, onSuccess, onError) {
                var data;
                if (this.input) {
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
                            "device_id": data.devices[entry].device_id,
                            "entity_name": data.devices[entry].entity_name,
                            "entity_type": data.devices[entry].entity_type,
                            "attributes": data.devices[entry].attributes
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

                    if (MashupPlatform.prefs.get("auto_forward")) {
                        var dev;
                        if (list.length > 0) {
                            dev = JSON.parse(JSON.stringify(list[0]));
                            dev.subservice = MashupPlatform.prefs.get("ngsi_service_path");
                            dev.service = MashupPlatform.prefs.get("ngsi_tenant");
                        } else {
                            dev = {
                                "subservice": MashupPlatform.prefs.get("ngsi_service_path"),
                                "service": MashupPlatform.prefs.get("ngsi_tenant")
                            };
                        }
                        sendSelection(dev);
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

    var listBuilder = function listBuilder(row) {
        var attrList = row.attributes.map(function (attr) {
            return attr.name;
        });
        return attrList.join(', ');
    };

    var createTable = function createTable() {
        var fields = [
            {field: 'device_id', label: 'Device ID', sortable: false},
            {field: 'entity_name', label: 'Entity ID', sortable: false},
            {field: 'entity_type', label: 'Entity type', sortable: false},
            {field: 'attributes', label: 'Attributes', width: '40%', sortable: false, contentBuilder: listBuilder}
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
                            this.editDeviceAction = true;
                            this.addDeviceAction = false;
                            initEditorWidget.call(this, button);
                            this.editorConfigOutput.pushEvent({
                                "readonly": [
                                    ["device_id"],
                                    ["entity_name"],
                                    ["entity_type"]
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
                            this.delDeviceOutput.pushEvent(JSON.stringify(entry));
                        }.bind(this));
                        content.appendChild(button);
                    }

                    return content;
                }.bind(this),
                sortable: false
            });
        }

        this.table = new StyledElements.ModelTable(fields, {id: 'name', pageSize: 30, source: this.source, 'class': 'table-striped'});
        this.table.addEventListener("click", function (dev) {
            var device = JSON.parse(JSON.stringify(dev));
            device.subservice = MashupPlatform.prefs.get("ngsi_service_path");
            device.service = MashupPlatform.prefs.get("ngsi_tenant");
            sendSelection(device);
        });
        this.table.reload();
        this.layout.center.clear();
        this.layout.center.appendChild(this.table);
    };

    var sendSelection = function sendSelection(data) {
        MashupPlatform.wiring.pushEvent('selection', JSON.stringify(data));
    };

    var widget = new DeviceManager();
    window.addEventListener("DOMContentLoaded", widget.init.bind(widget), false);
})();