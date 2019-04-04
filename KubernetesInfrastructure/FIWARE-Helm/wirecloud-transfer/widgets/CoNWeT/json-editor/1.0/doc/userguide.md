Introduction
------------

This widget allows you to view, edit, format and validate JSON
structures.

Settings
--------

No settings requiered for this widget to work.


Wiring
------

Input Endpoints:

- Input: Data to be edited.
- Configuration: Configuration to use in the JSON editor. Currently, only the `readonly` option is supported.

    Example:

    ```json
    {
        readonly: [["id"], ["type"], ["key", "subkey"]]
    }
    ```

Output Endpoints:

- Output: Modified data.
