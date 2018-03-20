Google Chart Operator
====================

The Google Chart Operator is an operator that prepares data for a chart with the Google Chart Widget of WireCloud. (https://github.com/Wirecloud/googlecharts-widget) More information about Google Charts can be found in the official documentation.

Settings
--------

- **Chart Type:** Which type of chart should be displayed.
- **Chart Title:** The chart title that will be used if there are no custom chart options provided.
- **X-Axis Label:** The X-Axis label that will be used if there are no custom chart options provided.
- **Y-Axis Label:** The Y-Axis label that will be used if there are no custom chart options provided.
- **Unit:** The unit of for the formatting of the values.
- **Custom Chart Options:** Custom chart options in form of a JSON Object.

    ```json
    {
       "title":"Historic Values",
       "hAxis":{
          "title":"Date and time"
       },
       "vAxis":{
          "title":"values"
       },
       "legend":{
          "position":"none"
       },
       "pointSize":15
    }
    ```

Input Endpoints
--------

- **Data Serie:** The data for which the chart should be displayed.
- **Timestamp List:** The corresponding timestamps to the data.
- **Unit:** The unit for the formatting of the data.

Output Endpoints
--------

-   **Chart:** All the data that is required by the Google Chart Widget.

    ```json
    {
       "type":"LineChart",
       "options":{
          "title":"Historic Values",
          "hAxis":{
             "title":"Date and time"
          },
          "vAxis":{
             "title":"Temperature"
          },
          "legend":{
             "position":"none"
          }
       },
       "data":[
          [
             "Date and time",
             "Temperature"
          ],
          [
             "22.01.2018 19:18:51",
             4.86201526719
          ],
          [
             "22.01.2018 19:20:10",
             5.49455545865
          ],
          [
             "22.01.2018 19:22:07",
             3.39052994478
          ],
          [
             "22.01.2018 19:23:58",
             5.20653336383
          ],
          [
             "22.01.2018 19:27:21",
             4.12287192522
          ],
          [
             "22.01.2018 19:30:22",
             4.54859091647
          ],
          [
             "22.01.2018 19:32:22",
             3.10909946574
          ],
          [
             "22.01.2018 19:35:32",
             5.3405685836
          ],
          [
             "22.01.2018 19:37:20",
             3.45290004877
          ],
          [
             "05.02.2018 13:29:37",
             3.796211457571957
          ]
       ],
       "unit":"°C"
    }
    ```