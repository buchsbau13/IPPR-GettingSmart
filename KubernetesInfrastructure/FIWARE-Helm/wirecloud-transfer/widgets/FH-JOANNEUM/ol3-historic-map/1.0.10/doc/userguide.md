OpenLayers Historic Map Widget
======================

Map viewer widget using OpenLayers. It can receive Point of Interest data and display them on the map as a heatmap.

Settings
--------

- **Initial Location:** Decimal coordinates where map will be centered on load (e.g. 52, 5). Leave this setting empty if you don't want to center the map at init. Remember to change the initial zoom level if you provide an initial location.
- **Initial Zoom Level:** Initial zoom level. From 1 to 22, where '1' represents the furthest level and '22' the maximum zoom level.
- **Min Zoom:** Minimal zoom level.

Input Endpoints
--------

- **Heatmap PoIs**: Insert or update a Point of Interest for the Heatmap Layer.
- **Min Attribute Value**: Min Value which is needed to calculate the weight for the heatmap points.
- **Max Attribute Value**: Max Value which is needed to calculate the weight for the heatmap points.
- **Clear Heatmap**: If no values could be found for the heatmap the map will be cleared.
- **Gradient**: List of values (colors) to set the gradient for the heatmap.

Output Endpoints
--------

This widget has no output endpoints. 