STH Dual Chart Operator
====================

The STH Dual Chart Operator is an operator that can be used to retrieve historic data from to sources and combine the data for output with google charts.

Settings
--------

- **STH Server URL:** URL of the STH server to retrieve Short Term Historic Data
- **Use the FIWARE credentials of the user:** Use the FIWARE credentials of the
  user logged into WireCloud. Take into account this option cannot be enabled if
  you want to use this widget in a public workspace as anonoymous users doesn't
  have a valid FIWARE auth token. As an alternative, you can make use of the
  "Use the FIWARE credentials of the workspace owner" preference.
- **Use the FIWARE credentials of the workspace owner**: Use the FIWARE
  credentials of the owner of the workspace. This preference takes preference
  over "Use the FIWARE credentials of the user". This feature is available on
  WireCloud 0.7.0+ in a experimental basis, future versions of WireCloud can
  change the way to use it making this option not funcional and requiring you to
  upgrade this operator.
- **Tenant/service**: Tenant/service to use when connecting to the context
  broker. Must be a string of alphanumeric characters (lowercase) and the `_`
  symbol. Maximum length is 50 characters. If empty, the default tenant will be
  used
- **Scope**: Scope/path to use when connecting to the context broker. Must
  be a string of alphanumeric characters (lowercase) and the `_` symbol
  separated by `/` slashes. Maximum length is 50 characters. If empty, the
  default service path will be used: `/`

Input Endpoints
--------

- **Input Widget Data:** This input receives the following JSON object with . 


    ```json
    {
        "aggregationMethod": "max",
        "aggregationPeriod": "day",
        "attribute1": "airPressure",
        "attribute2": "airPressure",
        "datetime": "23. Juli 2018 00:00 - 12. August 2018 23:00",
        "entity1": "Sensor3",
        "entity2": "Sensor6"
    }
    ```

Input Endpoints
--------

Output Endpoints
--------

-   **Values:** This widget sends an JSON Object with the selected values from the form.

    ```json
    {
        "entity": { "id": "Trafficlight_2", "type": "static", "TimeInstant": "2018-02-05T12:29:35.00Z", "...": "..."},
        "attribute": "humidity",
        "unit": "%",
        "startDate": "2018-03-19T23:00:00.000Z",
        "endDate": "2018-03-20T22:59:00.000Z"
    }
    ```

    - **Message:** This output endpoint can be used to send a info or error message. The message should have the following format. 

    ```json
    {
        "type": "error",
        "text": "No data found"
    }
    ```
