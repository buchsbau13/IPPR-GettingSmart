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

 /* global MashupPlatform, StyledElements */

(function () {

    "use strict";

    var BatchAddDelete = function BatchAddDelete() {
        this.layout = null;
        this.textArea = null;
        this.btnSend = null;
        this.objectType = null;
        this.idasWidget = null;
        this.orionWidget = null;
        this.textAreaSave = MashupPlatform.widget.getVariable('textAreaSave');
        this.objectCount = 0;
        this.successful = 0;
        this.failed = 0;
        this.deleteMode = false;
        this.delSubList = [];
        this.delSubCount = 0;

        MashupPlatform.widget.context.registerCallback(function (newValues) {
            if (this.layout && ("heightInPixels" in newValues || "widthInPixels" in newValues)) {
                this.layout.repaint();
            }
        }.bind(this));
    };

    BatchAddDelete.prototype.init = function init() {
        clearPage(document.body);

        this.layout = new StyledElements.VerticalLayout();
        this.textArea = new StyledElements.TextArea({
            class: "textarea",
            cols: 50,
            rows: 40
        });
        this.btnSend = new StyledElements.Button({
            class: "se-btn-circle send-button z-depth-3",
            text: "Send"
        });

        this.layout.center.addClassName('layout');
        this.layout.center.appendChild(this.textArea);
        this.layout.insertInto(document.body);
        this.layout.repaint();

        if (this.textAreaSave.get()) {
            try {
                var json = JSON.parse(this.textAreaSave.get());
                this.textArea.value = JSON.stringify(json, undefined, 2);
            } catch (e) {
                this.textArea.value = "";
            }
        }

        this.btnSend.addEventListener('click', addDelObject.bind(this));
        this.layout.center.appendChild(this.btnSend);

        this.objectInput = MashupPlatform.widget.createInputEndpoint(receiveObjects.bind(this));
        this.objectOutput = MashupPlatform.widget.createOutputEndpoint();
        this.subFilterInput = MashupPlatform.widget.createInputEndpoint(delFilteredSubs.bind(this));
        this.subFilterOutput = MashupPlatform.widget.createOutputEndpoint();
    };

    var initIDASOperator = function initIDASOperator() {
        if (!this.idasWidget) {
            this.idasWidget = MashupPlatform.mashup.addOperator(MashupPlatform.prefs.get('idas_operator'), {
                "preferences": {
                    "idas_server": {"value": MashupPlatform.prefs.get("idas_server")},
                    "use_user_fiware_token": {"value": MashupPlatform.prefs.get("use_user_fiware_token")},
                    "use_owner_credentials": {"value": MashupPlatform.prefs.get("use_owner_credentials")},
                    "ngsi_tenant": {"value": MashupPlatform.prefs.get("ngsi_tenant")},
                    "ngsi_service_path": {"value": MashupPlatform.prefs.get("ngsi_service_path")},
                }
            });
            this.idasWidget.addEventListener('remove', function () { this.idasWidget = null; }.bind(this));

            if (this.objectType === "service") {
                this.objectInput.connect(this.idasWidget.outputs.serviceOutput);
                if (this.deleteMode) {
                    this.objectOutput.connect(this.idasWidget.inputs.delService);
                } else {
                    this.objectOutput.connect(this.idasWidget.inputs.addService);
                }
            } else {
                this.objectInput.connect(this.idasWidget.outputs.deviceOutput);
                if (this.deleteMode) {
                    this.objectOutput.connect(this.idasWidget.inputs.delDevice);
                } else {
                    this.objectOutput.connect(this.idasWidget.inputs.addDevice);
                }
            }
        }
    };

    var initORIONOperator = function initORIONOperator() {
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

            if (this.objectType === "entity") {
                this.objectInput.connect(this.orionWidget.outputs.entityOutput);
                if (this.deleteMode) {
                    this.objectOutput.connect(this.orionWidget.inputs.delEntity);
                } else {
                    this.objectOutput.connect(this.orionWidget.inputs.addEntity);
                }
            } else {
                if (this.deleteMode) {
                    this.subFilterInput.connect(this.orionWidget.outputs.subOutput);
                    this.objectOutput.connect(this.orionWidget.inputs.getSubscriptions);
                    this.subFilterOutput.connect(this.orionWidget.inputs.delSubscription);
                } else {
                    this.objectInput.connect(this.orionWidget.outputs.subOutput);
                    this.objectOutput.connect(this.orionWidget.inputs.addSubscription);
                }
            }
        }
    };

    var addDelObject = function addDelObject() {
        var json;
        this.btnSend.disable();
        this.textArea.readOnly = true;
        this.deleteMode = false;

        try {
            json = JSON.parse(this.textArea.value);
            this.textAreaSave.set(this.textArea.value);
        } catch (e) {
            json = null;
        }

        if (json && json.mode && (json.mode === "delete")) {
            this.deleteMode = true;
        }

        if (json && json.services) {
            this.objectType = "service";
            this.objectCount = json.services.length;
            initIDASOperator.call(this);
            if (this.deleteMode) {
                this.textArea.value = "Attempting to delete " + this.objectCount + " services...";
            } else {
                this.textArea.value = "Attempting to add " + this.objectCount + " new services...";
            }

            json.services.forEach(function (serv) {
                var data;
                if (this.deleteMode) {
                    data = serv;
                } else {
                    data = {"services": [serv]};
                }
                this.objectOutput.pushEvent(JSON.stringify(data));
            }.bind(this));
        } else if (json && json.devices) {
            this.objectType = "device";
            this.objectCount = json.devices.length;
            initIDASOperator.call(this);
            if (this.deleteMode) {
                this.textArea.value = "Attempting to delete " + this.objectCount + " devices...";
            } else {
                this.textArea.value = "Attempting to add " + this.objectCount + " new devices...";
            }

            json.devices.forEach(function (dev) {
                var data;
                if (this.deleteMode) {
                    data = dev;
                } else {
                    data = {"devices": [dev]};
                }
                this.objectOutput.pushEvent(JSON.stringify(data));
            }.bind(this));
        } else if (json && json.entities) {
            this.objectType = "entity";
            this.objectCount = json.entities.length;
            initORIONOperator.call(this);
            if (this.deleteMode) {
                this.textArea.value = "Attempting to delete " + this.objectCount + " entities...";
            } else {
                this.textArea.value = "Attempting to add " + this.objectCount + " new entities...";
            }

            json.entities.forEach(function (ent) {
                this.objectOutput.pushEvent(JSON.stringify(ent));
            }.bind(this));
        } else if (json && json.subscriptions) {
            this.objectType = "subscription";
            this.objectCount = json.subscriptions.length;
            this.delSubCount = 0;
            this.delSubList = [];
            initORIONOperator.call(this);
            if (this.deleteMode) {
                this.textArea.value = "Attempting to delete " + this.objectCount + " subscriptions...";
            } else {
                this.textArea.value = "Attempting to add " + this.objectCount + " new subscriptions...";
            }

            json.subscriptions.forEach(function (sub) {
                if (this.deleteMode) {
                    sub = {"entity_name": sub.subject.entities[0].id, "entity_type": sub.subject.entities[0].type,
                        "attributes": sub.subject.condition.attrs};
                }
                this.objectOutput.pushEvent(JSON.stringify(sub));
            }.bind(this));
        } else {
            this.objectType = null;
            this.objectCount = 0;
            this.btnSend.enable();
            this.textArea.readOnly = false;
            this.textArea.value = '>>> Invalid input detected! <<<\n\n' +
                'Please input object data in JSON format.\n' +
                'To switch between add and delete mode, change the "mode" attribute to "add" or "delete".\n' +
                'If the attribute is omitted, the widget operates in add mode by default.\n\n' +
                'Example data for adding new services (adapt accordingly for entities, devices and subscriptions):\n' +
                '{\n' +
                '  "mode": "add",\n' +
                '  "services": [\n' +
                '    {\n' +
                '      "apikey": "example_apikey",\n' +
                '      "token": "token2",\n' +
                '      "cbroker": "http://example:1026",\n' +
                '      "entity_type": "example_entity_type",\n' +
                '      "resource": "/iot/example"\n' +
                '    }\n' +
                '  ]\n' +
                '}\n\n' +
                'Example for deleting the subscription of an entity with the monitored attribute "temperature":\n' +
                '{\n' +
                '  "mode": "delete",\n' +
                '  "subscriptions": [\n' +
                '    {\n' +
                '      "subject": {\n' +
                '        "entities": [\n' +
                '          {\n' +
                '            "id": "example_id",\n' +
                '            "type": "example_type"\n' +
                '          }\n' +
                '        ],\n' +
                '        "condition": {\n' +
                '          "attrs": [\n' +
                '            "temperature"\n' +
                '          ]\n' +
                '        }\n' +
                '      }\n' +
                '    }\n' +
                '  ]\n' +
                '}';
        }
    };

    var delFilteredSubs = function delFilteredSubs(input) {
        var json;

        try {
            json = JSON.parse(input);
        } catch (e) {
            json = null;
        }

        if (json && json.subscriptions) {
            this.delSubCount++;
            this.delSubList = this.delSubList.concat(json.subscriptions);

            if (this.delSubCount === this.objectCount) {
                this.objectCount = this.delSubList.length;
                this.subFilterInput.disconnect(this.orionWidget.outputs.subOutput);
                this.objectInput.connect(this.orionWidget.outputs.subOutput);

                if (this.objectCount > 0) {
                    this.delSubList.forEach(function (sub) {
                        this.subFilterOutput.pushEvent(JSON.stringify(sub));
                    }.bind(this));
                } else {
                    this.subFilterOutput.pushEvent("{}");
                }
            }
        }
    };

    var receiveObjects = function receiveObjects(input) {
        var json;
        this.objectCount--;

        try {
            json = JSON.parse(input);
        } catch (e) {
            json = null;
        }

        if (json && json.statusAdd && json.statusAdd.state === "success") {
            this.successful++;
        } else if (json && json.statusDel && json.statusDel.state === "success") {
            this.successful++;
        } else {
            this.failed++;
        }

        if (this.objectCount <= 0) {
            this.objectType = null;
            this.btnSend.enable();
            this.textArea.readOnly = false;
            this.textArea.value += "\n\n";

            if (this.objectCount < 0) {
                this.textArea.value += "No objects found matching these criteria.";
            } else {
                if (this.successful > 0) {
                    if (this.deleteMode) {
                        this.textArea.value += String(this.successful) + " object(s) deleted successfully.\n";
                    } else {
                        this.textArea.value += String(this.successful) + " object(s) added successfully.\n";
                    }
                }

                if (this.failed > 0) {
                    if (this.deleteMode) {
                        this.textArea.value += "Delete-procedure failed for " + String(this.failed) + " object(s).";
                    } else {
                        this.textArea.value += "Add-procedure failed for " + String(this.failed) + " object(s).";
                    }
                }
            }

            if (this.orionWidget) {
                this.orionWidget.remove();
            }

            if (this.idasWidget) {
                this.idasWidget.remove();
            }

            this.successful = 0;
            this.failed = 0;
        }
    };

    var clearPage = function clearPage(context) {
        while (context.firstChild) {
            context.removeChild(context.firstChild);
        }
    };

    var widget = new BatchAddDelete();
    window.addEventListener("DOMContentLoaded", widget.init.bind(widget), false);
})();
