## Introduction

The STH location operator is a WireCloud operator that allows you to retrieve location values for context broker entities and combine them with historic values of other attributes.

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
- **Attribute**: Attribute of the entity to query about. Should be a attribute with coordinates of type geo:point. 

## Wiring

### Input Endpoints

- **Input Data**: JSON object with the input data with the following attributes: an array of values, an array of timestamps of the values, the entity and the attribute.

### Output Endpoints

- **Output Data**: JSON object with the output data with the following attributes: an array of values, an array of timestamps for the values, an array of coordinates for the values, the entity and entity id. 

## References

* [Orion Context Broker][orion]
* [Short Time History (Comet)][sth]

[orion]: http://catalogue.fiware.org/enablers/publishsubscribe-context-broker-orion-context-broker "Orion Context Broker info"
[sth]: https://github.com/telefonicaid/fiware-sth-comet
