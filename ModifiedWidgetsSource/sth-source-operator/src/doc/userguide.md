## Introduction

The STH source operator is a WireCloud operator that allows you to retrieve
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
- **Attribute**: Attribute of the entity to query about.

## Wiring

### Input Endpoints

- This operator has no input endpoint

### Output Endpoints

- **Values**: Historical values as an array.
- **Timestamps**: Timestamps of the values provided by the `Values` endpoint.

## References

* [Orion Context Broker][orion]
* [Short Time History (Comet)][sth]

[orion]: http://catalogue.fiware.org/enablers/publishsubscribe-context-broker-orion-context-broker "Orion Context Broker info"
[sth]: https://github.com/telefonicaid/fiware-sth-comet
