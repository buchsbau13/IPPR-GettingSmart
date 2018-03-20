Chart Input Widget
====================

The Chart Input Widget is a widget that can be used to define specific values for the retrieval of historic data.

Settings
--------

- **NGSI Server:** URL of the Orion Context Broker to use for retrieving
  entity information.
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
- **Tenant**: Tenant/service to use when connecting to the context
  broker. Must be a string of alphanumeric characters (lowercase) and the `_`
  symbol. Maximum length is 50 characters. If empty, the default tenant will be
  used
- **Service path**: Scope/path to use when connecting to the context broker. Must
  be a string of alphanumeric characters (lowercase) and the `_` symbol
  separated by `/` slashes. Maximum length is 50 characters. If empty, the
  default service path will be used: `/`
- **NGSI entity types:** A comma separated list of entity types to use for
  filtering entities from the Orion Context broker. This field cannot be empty.
- **Entity Id Filter:** Id pattern for filtering entities. This preference can be
  empty, in that case, entities won't be filtered by id.
- **Attributes to display:** Comma separated list of attributes to be displayed in
  the widget as extra columns.
- **Unit values:** Comma separated list of attributes and the corresponding unit attribute e.g. temperature=temp_sensor_unit, humidity=humid_sensor_unit

Input Endpoints
--------

- **Message:** This input endpoint can be used to display a info or error message. The message should have the following format. 

    ```json
    {
        "type": "error",
        "text": "No data found"
    }
    ```

Output Endpoints
--------

-   **Output Data:** This widget sends an JSON Object with the selected values from the form.

    ```json
    {
        "entity": { "id": "Trafficlight_2", "type": "static", "TimeInstant": "2018-02-05T12:29:35.00Z", "...": "..."},
        "attribute": "humidity",
        "unit": "%",
        "startDate": "2018-03-19T23:00:00.000Z",
        "endDate": "2018-03-20T22:59:00.000Z"
    }
    ```