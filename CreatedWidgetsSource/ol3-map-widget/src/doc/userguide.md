OpenLayers Map Widget
======================

Map viewer widget using OpenLayers. It can receive Point of Interest data and display them on the map in different ways.

Settings
--------

- **Initial Location:** Decimal coordinates where map will be centered on load (e.g. 52, 5). Leave this setting empty if you don't want to center the map at init. Remember to change the initial zoom level if you provide an initial location.
- **Initial Zoom Level:** Initial zoom level. From 1 to 22, where '1' represents the furthest level and '22' the maximum zoom level.
- **Min Zoom:** Minimal zoom level.
- **POI types for Layers:** JSON Object with the information about entity types so that different layers can be created for each type. If empty there will be one default layer for all types of entities.

    ```json
    {
        "static": "Static Sensors",
        "mobile": "Mobile Sensors"
    }
    ```

Input Endpoints
--------

- **Insert/Update PoI**: Insert or update a Point of Interest. This endpoint
  supports sending just a PoI or severals through an array. Each PoI is composed
  of the following fields:
    - **`id`** (required): id used for identifying this PoI. Used in the update
      and delete operations for locating the associated PoI.
    - `currentLocation` (deprecated, required if `location` not used):
        - `longitude` (required):
		- `latitude` (required):
        - `system`: geodetic datum system (usually WGS84, it can be UTM)
    - `data`: Data associated with the point of interest, used by the **PoI
      selected** output endpoint.
    - `icon`: URL of the icon to use for the marker or an object describing the
        icon to use. Available options:
        - `anchor`: Anchor position. Default value is `[0.5, 0.5]` (icon
          center).
        - `anchorXUnits`: Units in which the anchor x value is specified. A
          value of `'fraction'` indicates the x value is a fraction of the
          icon. A value of `'pixels'` indicates the x value in pixels. Default
          is `'fraction'`.
        - `anchorYUnits`: Units in which the anchor y value is specified. A
          value of `'fraction'` indicates the y value is a fraction of the
          icon. A value of `'pixels'` indicates the y value in pixels. Default
          is `'fraction'`.
        - `opacity`: Opacity of the icon (range from 0 to 1). Default is `1`.
        - `scale`: Scale. Default is `1`.
        - `src`: Image source URI.
    - `infoWindow`: content (using HTML) associated with the PoI.
    - `location` (required if `currentLocation` not used): a GeoJSON geometry.
      e.g. `{"type": "Point", "coordinates": [125.6, 10.1]}`
    - `style`: Style to use for rendering. Supported options:
        - `fill`:
            - `color`: fill color. CSS3 color, that is, an hexadecimal, `rgb` or
            `rgba` color.
        - `stroke`:
            - `color`: stroke color. CSS3 color, that is, an hexadecimal, `rgb`
            or `rgba` color.
            - `width`: stroke width in pixels.
    - `subtitle`: subtitle associated to the PoI
    - `title`: title associated to the PoI
    - `tooltip`: text to be displayed as tooltip when the mouse is over the PoI.
- **Heatmap PoIs**: Insert or update a Point of Interest for the Heatmap Layer. PoIs have a similiar structure as normal PoIs.
- **Min Attribute Value**: Min Value which is needed to calculate the weight for the heatmap points.
- **Max Attribute Value**: Max Value which is needed to calculate the weight for the heatmap points.
- **Clear**: If no values could be found for the heatmap the map will be cleared. 

Output Endpoints
--------

This widget has no output endpoints. 