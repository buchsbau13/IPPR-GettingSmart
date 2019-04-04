/*
 * Copyright (c) 2016 CoNWeT Lab., Universidad Politécnica de Madrid
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

/* globals MashupPlatform, JSONEditor, StyledElements*/

(function () {

    "use strict";

    var MP = MashupPlatform;

    var layout, editor, readonly = [];

    var init = function init() {
        layout = new StyledElements.VerticalLayout();
        layout.insertInto(document.body);

        // Set the editor options
        var options = {
            indentation: 4,
            mode: 'tree',
            modes: ['tree'],
            onEditable: onEditable,
            sortObjectKeys: true,
            error: function (err) {
                MP.widget.log(err.toString());
            }
        };

        // Create the editor
        layout.center.addClassName('jsoncontainer');
        editor = new JSONEditor(layout.center.wrapperElement, options);

        // Create the send button
        var sendbutton = new StyledElements.Button({id: 'sendbutton', text: 'Apply'});
        sendbutton.addEventListener('click', function () {
            MP.wiring.pushEvent('output', editor.getText());
        });
        layout.center.appendChild(sendbutton);
        
        // Create the close button
        var closebutton = new StyledElements.Button({id: 'closebutton', text: 'Close'});
        closebutton.addEventListener('click', function () {
            MP.wiring.pushEvent('output', 'exit');
        });
        layout.center.appendChild(closebutton);

        // Create loading animation
        layout.center.addClassName('loading').disable();

        editor.set({});

        MP.wiring.registerCallback('input', function (data) {
            updateContent(data);
        });
        MP.wiring.registerCallback('configure', function (options) {
            configure(options);
        });
        MP.wiring.registerStatusCallback(updateWiringFeatures);

        updateWiringFeatures();
    };

    var different = function different(currentValue, index, array) {
        return currentValue !== this[index];
    };

    var equalList = function equalList(list1, list2) {
        if (list1.length !== list2.length) {
            return false;
        }

        return !list1.some(different, list2);
    };

    var onEditable = function onEditable(node) {
        if (readonly.some(equalList.bind(null, node.path))) {
            return false;
        }

        return true;
    };

    var parseData = function parseData(data) {
        if (typeof data === 'string') {
            try {
                editor.setText(data);
            } catch (e) {
                throw new MP.wiring.EndpointTypeError('data is not a valid JSON string');
            }
        } else {
            editor.set(data);
        }

        if (editor.options.mode !== 'code') {
            editor.expandAll();
        }
    };

    var updateWiringFeatures = function updateWiringFeatures() {
    };

    var configure = function configure(conf) {
        readonly = conf.readonly || [];
    };

    var updateContent = function updateContent(data) {
        // Remove the loading animation
        layout.center.enable();
        parseData(data);
    };


    init();

})();
