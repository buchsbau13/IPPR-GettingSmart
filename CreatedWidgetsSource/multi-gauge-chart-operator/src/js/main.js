/* globals MashupPlatform */

(function () {

    "use strict";

    let gaugeSize, gaugeRow, lastType;
    let entities, attrData = {}
    let gaugeOptions = []

    function init() {

        const permissions = {
            "move": true,
            "close": true,
            "resize":false
        };
        const attrLength = [];
        let rowCount = 0;
        let columnCount = 0;

        const typesAttr = JSON.parse(MashupPlatform.prefs.get('typesAttributes').trim());
        const attrOptions = JSON.parse(MashupPlatform.prefs.get('attrOptions').trim());
        gaugeSize = MashupPlatform.prefs.get('gaugeSize');
        gaugeRow = MashupPlatform.prefs.get('gaugeRow');

        entities = {}
        typesAttr.devices.forEach(_ => {
            const attributes = []
            attrLength.push(_.attributes.length)
            _.attributes.forEach(a => attributes.push(a.name))
            entities[_.entity_type] = {attributes: attributes}
        });

        attrData = {};
        attrOptions.attrOptions.forEach(_ => {
            attrData[_.name] = {};
            attrData[_.name].attrName = _.name;
            attrData[_.name].attrUnit = _.gaugeOption.preferences.unit.value;
            attrData[_.name].attrPreferences = _.gaugeOption;
            attrData[_.name].attrPreferences.preferences.options.value = JSON.stringify(attrData[_.name].attrPreferences.preferences.options.value);
            attrData[_.name].attrWidget = null;
            attrData[_.name].attrOperator = null;
        });

        for(var i = 0; i<Math.max(...attrLength); i++){
            if(columnCount%(gaugeRow+1) === 0) {
                rowCount++
                columnCount = 1;
            }
            gaugeOptions.push({
                "permissions": permissions,
                "title" : "TEST",
                "top" : (110+(rowCount-1)*(gaugeSize+30)).toString()+"px",
                "left" : (0+((columnCount-1)*gaugeSize)).toString()+"px",
                "width" : gaugeSize.toString()+"px",
                'height' : (gaugeSize+30).toString()+"px"
            });
            columnCount++;
        }
    }

    MashupPlatform.wiring.registerCallback("entityInput", function (entityString) {

        const entity = JSON.parse(entityString);
        let widgetNumber = 0;

        var createWiring = (widget, operator) => {
            operator.outputs.gauge.connect(widget.inputs.input);
            operator.inputs.entityInput.connect(MashupPlatform.operator.outputs.gauge);
        };

        var removeGauge = _ => {
            if(attrData[_].attrWidget !== null) {
                attrData[_].attrWidget.remove();
                attrData[_].attrWidget = null;
                attrData[_].attrOperator.remove();
                attrData[_].attrOperator = null;
            }
        };

        for(var attr in entities[entity.type].attributes){
            if(entity.type !== lastType && lastType !== undefined){
                for(var a in entities[lastType].attributes){
                    removeGauge(entities[lastType].attributes[a]);
                }
            }
            var a = entities[entity.type].attributes[attr]
            if(entity.hasOwnProperty(entities[entity.type].attributes[attr])){
                gaugeOptions[widgetNumber].title = entity[attrData[a].attrName+'.friendly']
                if(attrData[a].attrWidget === null) attrData[a].attrWidget = MashupPlatform.mashup.addWidget('CoNWeT/googlecharts/1.0.3', gaugeOptions[widgetNumber]);
                widgetNumber++;
                try{
                    if(attrData[a].attrOperator === null) attrData[a].attrOperator = MashupPlatform.mashup.addOperator('FH-JOANNEUM/gauge-chart-operator/1.3', attrData[a].attrPreferences);
                } catch(e) {
                    MashupPlatform.operator.log("ERROR: No preferences found for attribute: "+ a +"! Check Multi-Gauge-Chart-Operator settings!", MashupPlatform.log.ERROR);
                }
                createWiring(attrData[a].attrWidget, attrData[a].attrOperator);

            } else {
                removeGauge(a);
            }
            lastType = entity.type;
        }
        MashupPlatform.operator.outputs.gauge.pushEvent(JSON.stringify(entity));
    });

    init();
})();
