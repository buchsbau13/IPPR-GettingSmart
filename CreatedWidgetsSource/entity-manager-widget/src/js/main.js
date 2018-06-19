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

    var EntityManager = function EntityManager() {
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
            this.getEntityOutput.pushEvent(null);
        }.bind(this));

        MashupPlatform.wiring.registerCallback("filterByType", function (input) {
            var data = JSON.parse(input);
            if (data.subservice && data.service) {
                this.filter = {"type": " "};
                if (data.entity_type) {
                    this.filter.type = data.entity_type;
                }
                MashupPlatform.prefs.set("ngsi_service_path", data.subservice);
                MashupPlatform.prefs.set("ngsi_tenant", data.service);
                initOperator.call(this);
                this.getEntityOutput.pushEvent(JSON.stringify(this.filter));
            }
        }.bind(this));
    };

    EntityManager.prototype.init = function init() {
        this.layout = new StyledElements.VerticalLayout();
        createSource.call(this);
        createTable.call(this);
        this.layout.center.addClassName('loading');
        this.layout.insertInto(document.body);
        this.layout.repaint();

        this.entityInput = MashupPlatform.widget.createInputEndpoint(receiveEntities.bind(this));
        this.getEntityOutput = MashupPlatform.widget.createOutputEndpoint();
        this.addEntityOutput = MashupPlatform.widget.createOutputEndpoint();
        this.editEntityOutput = MashupPlatform.widget.createOutputEndpoint();
        this.delEntityOutput = MashupPlatform.widget.createOutputEndpoint();

        this.showButton = new StyledElements.Button({
            class: "se-btn-circle show-entities-button z-depth-3",
            text: "Show all"
        });

        this.showButton.addEventListener('click', function () {
            this.filter = null;
            initOperator.call(this);
            this.getEntityOutput.pushEvent(null);
        }.bind(this));
        this.layout.center.appendChild(this.showButton);

        this.addButton = new StyledElements.Button({
            class: "se-btn-circle add-entity-button z-depth-3",
            iconClass: "icon-plus",
        });

        this.editorConfigOutput = MashupPlatform.widget.createOutputEndpoint();
        this.templateOutput = MashupPlatform.widget.createOutputEndpoint();
        this.newEntityInput = MashupPlatform.widget.createInputEndpoint(newEntity.bind(this));
        this.addButton.addEventListener('click', function () {
            var typeValue = "";
            if (this.filter && this.filter.type && this.filter.type !== " ") {
                typeValue = this.filter.type;
            }
            this.addEntityAction = true;
            this.editEntityAction = false;
            initEditorWidget.call(this, this.addButton);
            this.editorConfigOutput.pushEvent({
                "readonly": []
            });
            this.templateOutput.pushEvent(JSON.stringify({
                "id": "",
                "type": typeValue,
                "example_attribute": {
                    "value": "",
                    "type": "Text"
                }
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
        this.getEntityOutput.pushEvent(null);
    };

    var initOperator = function initOperator() {
        if (!this.orionWidget) {
            this.orionWidget = MashupPlatform.mashup.addOperator(MashupPlatform.prefs.get("orion_operator"), {
                "preferences": {
                    "ngsi_server": {"value": MashupPlatform.prefs.get("ngsi_server")},
                    "use_user_fiware_token": {"value": MashupPlatform.prefs.get("use_user_fiware_token")},
                    "use_owner_credentials": {"value": MashupPlatform.prefs.get("use_owner_credentials")},
                    "ngsi_tenant": {"value": MashupPlatform.prefs.get("ngsi_tenant")},
                    "ngsi_service_path": {"value": MashupPlatform.prefs.get("ngsi_service_path")}
                }
            });
            this.orionWidget.addEventListener('remove', function () { this.orionWidget = null; }.bind(this));

            this.entityInput.connect(this.orionWidget.outputs.entityOutput);
            this.getEntityOutput.connect(this.orionWidget.inputs.getEntities);
            this.addEntityOutput.connect(this.orionWidget.inputs.addEntity);
            this.editEntityOutput.connect(this.orionWidget.inputs.editEntity);
            this.delEntityOutput.connect(this.orionWidget.inputs.delEntity);
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
        this.newEntityInput.connect(this.editorWidget.outputs.output);
    };

    var receiveEntities = function receiveEntities(input) {
        this.input = input;
        this.source.goToFirst();
        if (this.orionWidget) {
            this.orionWidget.remove();
        }
    };

    var newEntity = function newEntity(input) {
        if (input !== "exit") {
            if (this.addEntityAction) {
                this.addEntityAction = false;
                initOperator.call(this);
                this.addEntityOutput.pushEvent(input);
            } else if (this.editEntityAction) {
                this.editEntityAction = false;
                initOperator.call(this);
                this.editEntityOutput.pushEvent(input);
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
                            "id": data.entities[entry].id,
                            "type": data.entities[entry].type,
                            "entity": data.entities[entry]
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
                        var ent;
                        if (list.length > 0) {
                            ent = JSON.parse(JSON.stringify(list[0].entity));
                            ent.subservice = MashupPlatform.prefs.get("ngsi_service_path");
                            ent.service = MashupPlatform.prefs.get("ngsi_tenant");
                        } else {
                            ent = {
                                "subservice": MashupPlatform.prefs.get("ngsi_service_path"),
                                "service": MashupPlatform.prefs.get("ngsi_tenant")
                            };
                        }
                        sendSelection(ent);
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

    var getAttributeList = function getAttributeList(data) {
        var keys = [];
        for (var key in data) {
            if (key !== "id" && key !== "type") {
                keys.push(key);
            }
        }
        return keys;
    };

    var listBuilder = function listBuilder(row) {
        var list = getAttributeList(row.entity);
        return list.join(', ');
    };

    var createTable = function createTable() {
        var fields = [
            {field: 'id', label: 'Entity ID', sortable: false},
            {field: 'type', label: 'Entity type', sortable: false},
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
                            this.editEntityAction = true;
                            this.addEntityAction = false;
                            initEditorWidget.call(this, button);
                            this.editorConfigOutput.pushEvent({
                                "readonly": [
                                    ["id"],
                                    ["type"]
                                ]
                            });
                            this.templateOutput.pushEvent(JSON.stringify(entry.entity));
                        }.bind(this));
                        content.appendChild(button);
                    }

                    if (MashupPlatform.prefs.get('allow_delete')) {
                        button = new StyledElements.Button({'class': 'btn-danger', 'iconClass': 'icon-trash', 'title': 'Delete'});
                        button.addEventListener('click', function () {
                            initOperator.call(this);
                            this.delEntityOutput.pushEvent(JSON.stringify(entry));
                        }.bind(this));
                        content.appendChild(button);
                    }

                    return content;
                }.bind(this),
                sortable: false
            });
        }

        this.table = new StyledElements.ModelTable(fields, {id: 'name', pageSize: 30, source: this.source, 'class': 'table-striped'});
        this.table.addEventListener("click", function (ent) {
            var entity = JSON.parse(JSON.stringify(ent.entity));
            entity.subservice = MashupPlatform.prefs.get("ngsi_service_path");
            entity.service = MashupPlatform.prefs.get("ngsi_tenant");
            sendSelection(entity);
        });
        this.table.reload();
        this.layout.center.clear();
        this.layout.center.appendChild(this.table);
    };

    var sendSelection = function sendSelection(data) {
        MashupPlatform.wiring.pushEvent('selection', JSON.stringify(data));
    };

    var widget = new EntityManager();
    window.addEventListener("DOMContentLoaded", widget.init.bind(widget), false);
})();