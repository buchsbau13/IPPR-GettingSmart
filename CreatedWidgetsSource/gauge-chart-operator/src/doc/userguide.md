Gauge Chart Operator
====================

The Gauge Chart Operator is an operator that prepares data for a gauge chart with the Google Chart Widget of WireCloud. (https://github.com/Wirecloud/googlecharts-widget) More information about Google Charts can be found in the official documentation.

Settings
--------

- **Attribute to show:** For which attribute the gauge chart should be shown e.g. humidity.
- **Unit:** The unit attribute for the selected attribute e.g. humid_sensor_unit.
- **Chart Options:** The chart options in JSON format that will be used for the gauge chart. 

    ```json
    {
       "min":"0",
       "max":"100",
       "yellowFrom":"65",
       "yellowTo":"100",
       "yellowColor":"#2E2EFE",
       "redFrom":"0",
       "redTo":"35",
       "greenFrom":"35",
       "greenTo":"65",
       "minorTicks":"5"
    }
    ```

Input Endpoints
--------

- **Entity:** The entity for which the gauge chart should be displayed.

Output Endpoints
--------

-   **Gauge:** All the data that is required by the Google Chart Widget.

    ```json
    {
       "data":[
          [
             "Label",
             "Value"
          ],
          [
             "humidity",
             "65"
          ]
       ],
       "options":{
          "min":"0",
          "max":"100",
          "yellowFrom":"65",
          "yellowTo":"100",
          "yellowColor":"#2E2EFE",
          "redFrom":"0",
          "redTo":"35",
          "greenFrom":"35",
          "greenTo":"65",
          "minorTicks":"5"
       },
       "type":"Gauge",
       "unit":"%"
    }
    ```