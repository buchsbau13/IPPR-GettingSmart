/* globals ol, StyledElements */

(function () {

    "use strict";

    var map;

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

    // Create base Layers
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

    // Create Layer Options to switch Layers
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

    var calculateHeatmapWeight = function calculateHeatmapWeight(attributeValue, min, max) {
        min = parseFloat(min);
        max = parseFloat(max);
        attributeValue = parseFloat(attributeValue);
        if (min === 0 && max >= 0) {
            return (attributeValue / max).toFixed(2).toString();
        } else if (min > 0 && max >= 0 || min < 0 && max >= 0) {
            max = max - min;
            attributeValue = attributeValue - min;
            return (attributeValue / max).toFixed(2).toString();
        } else if (min < 0 && max < 0) {
            MashupPlatform.widget.log("Maximum Value has to be a positive value", MashupPlatform.log.INFO);
        }
    };

    var Widget = function Widget() {
        this.base_layer = null;
        this.layers = {};
    };

    Widget.prototype.init = function init() {
        var initialCenter = MashupPlatform.prefs.get("initialCenter").split(",").map(Number);
        if (initialCenter.length !== 2 || !Number.isFinite(initialCenter[0]) || !Number.isFinite(initialCenter[0])) {
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

    Widget.prototype.addHistoricHeatmap = function addHistoricHeatmap(poi_info, min, max) {
        var heatmapLayer = getLayerByName('heatmap', map);
        var id = poi_info.id;
        var poiSetIdentifier = poi_info.poiSetIdentifier;
        var currentValue = poi_info.currentValue;

        if (!heatmapLayer) {
            heatmapLayer = createEmptyHeatmap('heatmap');
            map.getLayers().insertAt(1, heatmapLayer);
        }

        var oldFeatures = heatmapLayer.getSource().getFeatures();

        // Delete old features if they do not belong to the same PoI Set
        for (var i = 0; i < oldFeatures.length; i++) {
            var featureName = oldFeatures[i].get('name');
            var featurePoiSetIdentifier = oldFeatures[i].get('identifier');
            if (featureName === id.toString() && featurePoiSetIdentifier !== poiSetIdentifier) {
                heatmapLayer.getSource().removeFeature(oldFeatures[i]);
            } else if (featureName === id.toString() && featurePoiSetIdentifier === undefined) {
                heatmapLayer.getSource().removeFeature(oldFeatures[i]);
            }
        }

        // Add new feature
        var heatmapFeature = new ol.Feature();
        heatmapFeature.set('name', id);
        heatmapFeature.set('identifier', poiSetIdentifier);
        heatmapFeature.set('content', poi_info.infoWindow);
        heatmapFeature.setGeometry(
            new ol.geom.Point(
                ol.proj.transform([poi_info.currentLocation.lng, poi_info.currentLocation.lat], 'EPSG:4326', 'EPSG:3857')
            )
        );
        heatmapFeature.set('weight', calculateHeatmapWeight(currentValue, min, max));
        heatmapLayer.getSource().addFeature(heatmapFeature);
    };

    Widget.prototype.clearHeatmap = function clearHeatmap() {
        var heatmapLayer = getLayerByName('heatmap', map);
        if (heatmapLayer) {
            heatmapLayer.getSource().clear();
        }
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
