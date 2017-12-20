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

    var SubscriptionManager = function SubscriptionManager() {
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
            this.getSubOutput.pushEvent(null);
        }.bind(this));

        MashupPlatform.wiring.registerCallback("filterByDev", function (input) {
            var data = JSON.parse(input);
            if (data.subservice && data.service) {
                this.filter = {
                    "entity_name": " ",
                    "entity_type": " ",
                    "attributes": [" "]
                };
                if (data.entity_name && data.entity_type && data.attributes) {
                    this.filter.entity_name = data.entity_name;
                    this.filter.entity_type = data.entity_type;
                    this.filter.attributes = data.attributes;
                }
                MashupPlatform.prefs.set("ngsi_service_path", data.subservice);
                MashupPlatform.prefs.set("ngsi_tenant", data.service);
                initOperator.call(this);
                this.getSubOutput.pushEvent(JSON.stringify(this.filter));
            }
        }.bind(this));
    };

    SubscriptionManager.prototype.init = function init() {
        this.layout = new StyledElements.VerticalLayout();
        createSource.call(this);
        createTable.call(this);
        this.layout.center.addClassName('loading');
        this.layout.insertInto(document.body);
        this.layout.repaint();

        this.subInput = MashupPlatform.widget.createInputEndpoint(receiveSubs.bind(this));
        this.getSubOutput = MashupPlatform.widget.createOutputEndpoint();
        this.addSubOutput = MashupPlatform.widget.createOutputEndpoint();
        this.editSubOutput = MashupPlatform.widget.createOutputEndpoint();
        this.delSubOutput = MashupPlatform.widget.createOutputEndpoint();

        this.showButton = new StyledElements.Button({
            class: "se-btn-circle show-subs-button z-depth-3",
            text: "Show all"
        });

        this.showButton.addEventListener('click', function () {
            this.filter = null;
            initOperator.call(this);
            this.getSubOutput.pushEvent(null);
        }.bind(this));
        this.layout.center.appendChild(this.showButton);

        this.addButton = new StyledElements.Button({
            class: "se-btn-circle add-sub-button z-depth-3",
            iconClass: "icon-plus",
        });

        this.editorConfigOutput = MashupPlatform.widget.createOutputEndpoint();
        this.templateOutput = MashupPlatform.widget.createOutputEndpoint();
        this.newSubInput = MashupPlatform.widget.createInputEndpoint(newSub.bind(this));
        this.addButton.addEventListener('click', function () {
            var nameValue = "";
            var typeValue = "";
            if (this.filter && this.filter.entity_name && this.filter.entity_type && this.filter.entity_name !== " " &&
                this.filter.entity_type !== " ") {
                nameValue = this.filter.entity_name;
                typeValue = this.filter.entity_type;
            }
            this.addSubAction = true;
            this.editSubAction = false;
            initEditorWidget.call(this, this.addButton);
            this.editorConfigOutput.pushEvent({
                "readonly": []
            });
            this.templateOutput.pushEvent(JSON.stringify({
                "description": "",
                "subject": {
                    "entities": [
                        {
                            "id": nameValue,
                            "type": typeValue
                        }
                    ],
                    "condition": {
                        "attrs": [
                            ""
                        ]
                    }
                },
                "notification": {
                    "http": {
                        "url": MashupPlatform.prefs.get("cygnus_server")
                    },
                    "attrs": [
                        ""
                    ],
                    "attrsFormat": "legacy"
                },
                "throttling": 5
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
        this.getSubOutput.pushEvent(null);
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

            this.subInput.connect(this.orionWidget.outputs.subOutput);
            this.getSubOutput.connect(this.orionWidget.inputs.getSubscriptions);
            this.addSubOutput.connect(this.orionWidget.inputs.addSubscription);
            this.editSubOutput.connect(this.orionWidget.inputs.editSubscription);
            this.delSubOutput.connect(this.orionWidget.inputs.delSubscription);
        }
    };

    var initEditorWidget = function initEditorWidget(button) {
        this.editorWidget = MashupPlatform.mashup.addWidget('CoNWeT/json-editor/1.0', {refposition: button.getBoundingClientRect()});
        this.editorWidget.addEventListener('remove', function () { this.editorWidget = null; }.bind(this));

        this.editorConfigOutput.connect(this.editorWidget.inputs.configure);
        this.templateOutput.connect(this.editorWidget.inputs.input);
        this.newSubInput.connect(this.editorWidget.outputs.output);
    };

    var receiveSubs = function receiveSubs(input) {
        this.input = input;
        this.source.goToFirst();
        if (this.orionWidget) {
            this.orionWidget.remove();
        }
    };

    var newSub = function newSub(input) {
        if (this.addSubAction) {
            this.addSubAction = false;
            initOperator.call(this);
            this.addSubOutput.pushEvent(input);
        } else if (this.editSubAction) {
            this.editSubAction = false;
            initOperator.call(this);
            this.editSubOutput.pushEvent(input);
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
                            "id": data.subscriptions[entry].id,
                            "description": data.subscriptions[entry].description,
                            "entities": data.subscriptions[entry].subject.entities,
                            "condition_attrs": data.subscriptions[entry].subject.condition.attrs,
                            "subscription": data.subscriptions[entry]
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
                        var sub;
                        if (list.length > 0) {
                            sub = JSON.parse(JSON.stringify(list[0].subscription));
                            sub.subservice = MashupPlatform.prefs.get("ngsi_service_path");
                            sub.service = MashupPlatform.prefs.get("ngsi_tenant");
                        } else {
                            sub = {
                                "subservice": MashupPlatform.prefs.get("ngsi_service_path"),
                                "service": MashupPlatform.prefs.get("ngsi_tenant")
                            };
                        }
                        sendSelection(sub);
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

    var listBuilder = function listBuilder(data) {
        var list = data.map(function (entry) {
            if (entry.id && entry.type) {
                return entry.id + " (" + entry.type + ")";
            } else {
                return entry;
            }
        });
        return list.join(', ');
    };

    var createTable = function createTable() {
        var fields = [
            {field: 'id', label: 'Subscription ID', sortable: false},
            {field: 'description', label: 'Description', sortable: false},
            {field: 'entities', label: 'Entities', sortable: false, contentBuilder: function (row) {
                return listBuilder(row.entities);
            }},
            {field: 'condition_attrs', label: 'Monitored attributes', sortable: false, contentBuilder: function (row) {
                return listBuilder(row.condition_attrs);
            }},
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
                            this.editSubAction = true;
                            this.addSubAction = false;
                            initEditorWidget.call(this, button);
                            this.editorConfigOutput.pushEvent({
                                "readonly": [
                                    ["id"]
                                ]
                            });
                            this.templateOutput.pushEvent(JSON.stringify(entry.subscription));
                        }.bind(this));
                        content.appendChild(button);
                    }

                    if (MashupPlatform.prefs.get('allow_delete')) {
                        button = new StyledElements.Button({'class': 'btn-danger', 'iconClass': 'icon-trash', 'title': 'Delete'});
                        button.addEventListener('click', function () {
                            initOperator.call(this);
                            this.delSubOutput.pushEvent(JSON.stringify(entry.subscription));
                        }.bind(this));
                        content.appendChild(button);
                    }

                    return content;
                }.bind(this),
                sortable: false
            });
        }

        this.table = new StyledElements.ModelTable(fields, {id: 'name', pageSize: 30, source: this.source, 'class': 'table-striped'});
        this.table.addEventListener("click", function (entry) {
            var subscr = JSON.parse(JSON.stringify(entry.subscription));
            subscr.subservice = MashupPlatform.prefs.get("ngsi_service_path");
            subscr.service = MashupPlatform.prefs.get("ngsi_tenant");
            sendSelection(subscr);
        });
        this.table.reload();
        this.layout.center.clear();
        this.layout.center.appendChild(this.table);
    };

    var sendSelection = function sendSelection(data) {
        MashupPlatform.wiring.pushEvent('selection', JSON.stringify(data));
    };

    var widget = new SubscriptionManager();
    window.addEventListener("DOMContentLoaded", widget.init.bind(widget), false);
})();