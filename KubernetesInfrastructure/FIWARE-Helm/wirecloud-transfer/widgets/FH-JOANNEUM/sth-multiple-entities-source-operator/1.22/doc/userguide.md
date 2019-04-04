## Introduction

The STH Multiple Entities Source Operator is a WireCloud operator that allows you to retrieve
historical information about context broker entities through the use of the
[Short Time Historic](https://github.com/telefonicaid/fiware-sth-comet)
(Comet) component.

## Settings

- **STH server URL**: URL of the STH server to use for retrieving entity
  information
- **NGSI tenant/service**: Tenant/service to use when connecting to the context
  broker. Must be a string of alphanumeric characters (lowercase) and the `_`
  symbol. Maximum length is 50 characters. If empty, the default tenant will be
  used
- **NGSI scope**: Scope/path to use when connecting to the context broker. Must
  be a string of alphanumeric characters (lowercase) and the `_` symbol
  separated by `/` slashes. Maximum length is 50 characters. If empty, the
  default service path will be used: `/`
- **Number of Entries**: How many values should be retrieved for the attribute of the entity.

## Wiring

### Input Endpoints

- **Entity**: The entity for that the historical data should be retrieved.
- **Attribute**: The attribute of the entity for that the historical data should be retrieved.

### Output Endpoints

- **Output Data**: JSON object with the output data with the following attributes: an array of values, an array of timestamps of the values, the entity and the attribute. 
- **Clear Map**: If no data was found for the entity and attribute this endpoint can be used to send a clear message to a map, in case the map has a suitable input endpoint for it.

## References

* [Orion Context Broker][orion]
* [Short Time History (Comet)][sth]

[orion]: http://catalogue.fiware.org/enablers/publishsubscribe-context-broker-orion-context-broker "Orion Context Broker info"
[sth]: https://github.com/telefonicaid/fiware-sth-comet
