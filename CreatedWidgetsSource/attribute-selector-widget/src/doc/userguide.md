# Introduction

The Attribute Selector Widget is designed to allow the selection of one attribute from a list of attributes for the STH Multiple Entities Operator. 
Moreover, the NGSI Source has to provide the input entity for the widget.

## Settings

- **Attributes** Comma separated list of the attributes that are available for selection.

## Wiring

### Input Endpoints

- **Entity**: The short term historic data will be retrieved for this entity.
			  It is recommended to use the NGSI Source Operator with the Reload Input Endpoint.
			  Otherwise the widget won't work properly.
- **Friendly name entity**: This endpoint is used for the translations of the attribute list. 

### Output Endpoints

- **Reload**: Endpoint to trigger the reload of the NGSI Source. 
- **Entity**: The short term historic data will be retrieved for this entity.
- **Attribute**: Selected Attribute.