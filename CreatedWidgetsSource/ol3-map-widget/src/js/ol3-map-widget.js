/* globals ol, StyledElements */

(function () {

    "use strict";

    var map;

    var internalUrl = function internalUrl(data) {
        var url = document.createElement("a");
        url.setAttribute('href', data);
        return url.href;
    };

    // Get Layer Information (basemap.at)
    var layerInfo = function layerInfo(method, url, done) {
        var xhr = new XMLHttpRequest();
        xhr.open(method, url);
        xhr.onload = function () {
            done(null, xhr.response);
        };
        xhr.onerror = function () {
            done(xhr.response);
        };
        xhr.send();
    };

    var createLayers = function createLayers(result, layerArray) {
        var BASE_LAYERS = {};

        layerArray.forEach(function (layer) {
            var identifier = layer.Identifier;
            var layerOptions = ol.source.WMTS.optionsFromCapabilities(result, {
                layer: identifier,
                matrixSet: 'google3857',
                requestEncoding: 'REST',
                style: 'normal'
            });
            BASE_LAYERS[identifier] = new ol.layer.Tile({
                source: new ol.source.WMTS(layerOptions)
            });
        });
        return BASE_LAYERS;
    };

    var createLayerOptions = function createLayerOptions(layerArray, map, baseLayers) {
        var button = document.getElementById('button');
        var rect = button.getBoundingClientRect();
        var items = [];
        var refpos = {
            top: rect.bottom,
            left: rect.left,
            width: 0,
            height: 0
        };

        layerArray.forEach(function (layer) {
            var identifier = layer.Identifier;
            var title = layer.Title;

            var item = new StyledElements.MenuItem(title, function () {
                map.getLayers().removeAt(0);
                map.getLayers().insertAt(0, baseLayers[identifier]);
            });
            items.push(item);
        });

        var popover = new StyledElements.PopupMenu();
        for (var i = 0; i < items.length; i++) {
            popover.append(items[i]);
        }

        button.addEventListener('click', function () {
            popover.show(refpos);
        });
    };

    var getLayerByName = function getLayerByName(name, map) {
        var resultLayer = null;
        map.getLayers().forEach(function (layer) {
            var layerName = layer.get('name');
            if (layerName === name) {
                resultLayer = layer;
            }
        });
        return resultLayer;
    };

    var build_basic_style = function build_basic_style(options) {
        if (options == null) {
            options = {};
        }

        if (options.image == null) {
            options.image = new ol.style.Icon({
                anchor: [0.5, 46],
                anchorXUnits: 'fraction',
                anchorYUnits: 'pixels',
                opacity: 0.75,
                src: internalUrl('images/icon.png')
            });
        }

        if (options.style == null) {
            options.style = {};
        }

        if (options.style.stroke == null) {
            options.style.stroke = 'blue';
        }

        if (options.style.fill == null) {
            options.style.fill = 'rgba(0, 0, 255, 0.1)';
        }

        return new ol.style.Style({
            image: options.image,
            stroke: new ol.style.Stroke({
                color: options.style.stroke,
                width: 3
            }),
            fill: new ol.style.Fill({
                color: options.style.fill
            })
        });
    };

    var createEmptyLayer = function createEmptyLayer(layerName) {
        var layerSource = new ol.source.Vector({});
        var layer = new ol.layer.Vector({source: layerSource, style: DEFAULT_MARKER});
        layer.set('name', layerName);
        map.addLayer(layer);
    };

    var createEmptyHeatmap = function createEmptyHeatmap(heatmapName) {
        document.getElementById('heatmap-settings').style.display = 'block';
        var blur = document.getElementById('blur');
        var radius = document.getElementById('radius');

        blur.addEventListener('input', function () {
            var heatmap = getLayerByName("heatmap", map);
            heatmap.setBlur(parseInt(blur.value, 10));
        });

        radius.addEventListener('input', function () {
            var heatmap = getLayerByName("heatmap", map);
            heatmap.setRadius(parseInt(radius.value, 10));
        });

        var mapSource = new ol.source.Vector();
        var heatmapLayer = new ol.layer.Colormap({
            source: mapSource,
            radius: parseInt(radius.value, 10),
            blur: parseInt(blur.value, 10)
        });
        heatmapLayer.set('name', heatmapName);
        return heatmapLayer;
    };

    var createCheckbox = function createCheckbox(value, label) {
        var container = document.getElementById("floating-panel");
        var checkbox = document.createElement('input');
        checkbox.type = "checkbox";
        checkbox.name = value;
        checkbox.value = value;
        checkbox.id = value;
        checkbox.checked = true;

        var checkboxLabel = document.createElement('label');
        checkboxLabel.appendChild(checkbox);
        checkboxLabel.appendChild(document.createTextNode(label));

        container.appendChild(checkboxLabel);
    };

    var toggleLayer = function toggleLayer(checkboxId, layerName, map) {
        var checkbox = document.getElementById(checkboxId);
        checkbox.addEventListener('change', function () {
            var layer = getLayerByName(layerName, map);
            if (this.checked) {
                layer.setVisible(true);
                if (layerName === 'heatmap') {
                    document.getElementById('heatmap-settings').style.display = 'block';
                }
            } else {
                layer.setVisible(false);
                if (layerName === 'heatmap') {
                    document.getElementById('heatmap-settings').style.display = 'none';
                }
            }
        });
    };

    var calculateHeatmapWeight = function calculateHeatmapWeight(attributeValue) {
        var maxValue = MashupPlatform.prefs.get("maxValue");
        if (maxValue === null || maxValue === undefined) {
            maxValue = 100;
        }
        var heatmapWeight = (attributeValue / maxValue).toFixed(2);
        return heatmapWeight;
    };

    // Create the default Marker style
    var DEFAULT_MARKER = build_basic_style();

    var Widget = function Widget() {
        this.base_layer = null;
        this.layers = {};
    };

    Widget.prototype.init = function init() {
        var initialCenter = MashupPlatform.prefs.get("initialCenter").split(",").map(Number);
        if (initialCenter.length != 2 || !Number.isFinite(initialCenter[0]) || !Number.isFinite(initialCenter[0])) {
            initialCenter = [0, 0];
        }

        map = new ol.Map({
            target: document.getElementById('map'),
            view: new ol.View({
                center: ol.proj.transform(initialCenter, 'EPSG:4326', 'EPSG:3857'),
                zoom: parseInt(MashupPlatform.prefs.get('initialZoom'), 10)
            })
        });

        layerInfo('GET', 'https://www.basemap.at/wmts/1.0.0/WMTSCapabilities.xml', function (err, res) {
            var result = new ol.format.WMTSCapabilities().read(res);
            var resultContents = result.Contents;
            var layerArray = resultContents.Layer;
            var baseLayers = createLayers(result, layerArray);
            var geolandBasemap = "geolandbasemap";

            map.getLayers().insertAt(0, baseLayers[geolandBasemap]);
            createLayerOptions(layerArray, map, baseLayers);

            if (err) {
                MashupPlatform.widget.log(err);
            }
        });

        try {
            var layerTypes = JSON.parse(MashupPlatform.prefs.get("layerTypes"));
        } catch (err) {
            MashupPlatform.widget.log(err, MashupPlatform.log.INFO);
        }
        if (layerTypes != null) {
            for (var key in layerTypes) {
                if (layerTypes.hasOwnProperty(key)) {
                    createEmptyLayer(key);
                    createCheckbox(key, layerTypes[key]);
                    toggleLayer(key, key, map);
                }
            }
        } else {
            createEmptyLayer("default");
            createCheckbox("default", "Default Layer");
            toggleLayer("default", "default", map);
        }

        // display popup on click
        map.on('click', function (event) {
            var feature = map.forEachFeatureAtPixel(event.pixel,
                function (feature) {
                    return feature;

                });

            if (feature != null && feature !== this.selected_feature) {
                this.select_feature(feature);
            } else if (feature !== this.selected_feature) {
                if (this.popover != null) {
                    this.popover.hide();
                    this.popover = null;
                }
            }
        }.bind(this));

        // change mouse cursor when over marker
        map.on('pointermove', function (event) {
            if (event.dragging) {
                if (this.popover != null) {
                    this.popover.hide();
                    this.popover = null;
                }
                return;
            }
            var pixel = map.getEventPixel(event.originalEvent);
            var hit = map.hasFeatureAtPixel(pixel);
            map.getTarget().style.cursor = hit ? 'pointer' : '';
        }.bind(this));
    };

    Widget.prototype.registerPoI = function registerPoI(poi_info) {
        var poiData = poi_info.data;
        var poiType = poiData.type;
        MashupPlatform.widget.log(poiType, MashupPlatform.log.INFO);

        var layer = getLayerByName(poiType, map);
        if (layer == null) {
            layer = getLayerByName("default", map)
        }

        var iconFeature, style;
        iconFeature = layer.getSource().getFeatureById(poi_info.id);

        if (iconFeature == null) {
            iconFeature = new ol.Feature();
            iconFeature.setId(poi_info.id);
            layer.getSource().addFeature(iconFeature);
        }

        iconFeature.set('data', poi_info.data);
        iconFeature.set('title', poi_info.title);
        iconFeature.set('content', poi_info.infoWindow);
        if ('location' in poi_info) {
            var geometry = this.geojsonparser.readGeometry(poi_info.location).transform('EPSG:4326', 'EPSG:3857');
            var marker = new ol.geom.Point(ol.extent.getCenter(geometry.getExtent()));
            iconFeature.setGeometry(new ol.geom.GeometryCollection([geometry, marker]));
        } else {
            iconFeature.setGeometry(
                new ol.geom.Point(
                    ol.proj.transform([poi_info.currentLocation.lng, poi_info.currentLocation.lat], 'EPSG:4326', 'EPSG:3857')
                )
            );
        }

        if (typeof poi_info.icon === 'string') {
            style = build_basic_style({
                image: new ol.style.Icon(/** @type {olx.style.IconOptions} */ ({
                    anchor: [0.5, 0.5],
                    anchorXUnits: 'fraction',
                    anchorYUnits: 'fraction',
                    opacity: 1,
                    src: poi_info.icon,
                    scale: 1
                })),
                style: poi_info.style
            });
        } else if (typeof poi_info.icon === 'object') {
            style = build_basic_style({
                image: new ol.style.Icon(/** @type {olx.style.IconOptions} */ ({
                    anchor: poi_info.icon.anchor,
                    anchorXUnits: 'fraction',
                    anchorYUnits: 'fraction',
                    opacity: 1,
                    src: poi_info.icon.src,
                    scale: poi_info.icon.scale
                })),
                style: poi_info.style
            });
        } else if (poi_info.style != null) {
            style = build_basic_style({style: poi_info.style});
        } else {
            style = DEFAULT_MARKER;
        }
        iconFeature.setStyle(style);
    };

    Widget.prototype.addHistoricHeatmap = function addHistoricHeatmap(poi_info) {
        var heatmapLayer = getLayerByName('heatmap', map);
        var id = poi_info.id;
        var poiSetIdentifier = poi_info.poiSetIdentifier;
        var currentValue = poi_info.currentValue;
        if (currentValue === null || currentValue === undefined) {
            var heatmapAttribute = MashupPlatform.prefs.get("heatmapAttribute");
            currentValue = poi_info.data[heatmapAttribute];
        }

        if (!heatmapLayer) {
            heatmapLayer = createEmptyHeatmap('heatmap');
            createCheckbox("heatmap", "Heatmap");
            map.getLayers().insertAt(1, heatmapLayer);
            toggleLayer('heatmap', 'heatmap', map);
        }

        var oldFeatures = heatmapLayer.getSource().getFeatures();

        for (var i = 0; i < oldFeatures.length; i++) {
            var featureName = oldFeatures[i].get('name');
            var featurePoiSetIdentifier = oldFeatures[i].get('identifier');
            if (featureName === id.toString() && featurePoiSetIdentifier !== poiSetIdentifier) {
                heatmapLayer.getSource().removeFeature(oldFeatures[i]);
            } else if (featureName === id.toString() && featurePoiSetIdentifier === undefined) {
                heatmapLayer.getSource().removeFeature(oldFeatures[i]);
            }
        }

        var heatmapFeature = new ol.Feature();
        heatmapFeature.set('name', id);
        heatmapFeature.set('identifier', poiSetIdentifier);
        heatmapFeature.set('content', poi_info.infoWindow);
        heatmapFeature.setGeometry(
            new ol.geom.Point(
                ol.proj.transform([poi_info.currentLocation.lng, poi_info.currentLocation.lat], 'EPSG:4326', 'EPSG:3857')
            )
        );
        heatmapFeature.set('weight', calculateHeatmapWeight(currentValue));

        heatmapLayer.getSource().addFeature(heatmapFeature);
    };

    Widget.prototype.center_popup_menu = function center_popup_menu(feature) {

        this.selected_feature = feature;
        this.popover = new StyledElements.Popover({
            placement: ['top', 'bottom', 'right', 'left'],
            title: feature.get('title'),
            content: new StyledElements.Fragment(feature.get('content'))
        });
        this.popover.on('show', function () {
            this.selected_feature = feature;
        }.bind(this));
        this.popover.on('hide', function () {
            if (this.selected_feature === feature) {
                this.selected_feature = null;
            }
        }.bind(this));

        // Delay popover show action
        setTimeout(function () {
            var marker_coordinates, marker_position, marker_image, marker_style, refpos;

            marker_coordinates = ol.extent.getCenter(feature.getGeometry().getExtent());
            marker_position = map.getPixelFromCoordinate(marker_coordinates);
            marker_style = feature.getStyle(map.getView().getResolution());
            if (marker_style != null) {
                marker_image = marker_style.getImage();
                var marker_scale = marker_image.getScale();
                var marker_size = marker_image.getSize().map(function (value) {
                    return value * marker_scale;
                });
                refpos = {
                    top: marker_position[1] - marker_size[1],
                    left: marker_position[0] - (marker_size[0] / 2),
                    width: marker_size[0],
                    height: marker_size[1]
                };
            } else {
                refpos = {
                    top: marker_position[1],
                    left: marker_position[0],
                    width: 0,
                    height: 0
                };
            }
            this.selected_feature = feature;
            this.popover.show(refpos);
        }.bind(this), 100);
    };

    Widget.prototype.select_feature = function select_feature(feature) {
        // this.selected_feature = feature;
        this.center_popup_menu(feature);
    };

    window.Widget = Widget;

})();
