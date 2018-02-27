Attribute Selector Widget
====================

The Attribute Selector Widget is designed to allow the selection of one attribute from a list of attributes for the STH Multiple Entities Operator. 
Moreover, the NGSI Source has to provide the input entity for the widget.

Build
-----

Be sure to have installed [Node.js](http://node.js). For example, you can install it on Ubuntu and Debian running the following commands:

```bash
curl -sL https://deb.nodesource.com/setup | sudo bash -
sudo apt-get install nodejs
sudo apt-get install npm
```

Install other npm dependencies by running:

```bash
npm install
```

For build the widget you need download grunt:

```bash
sudo npm install -g grunt-cli
```

And now, you can use grunt:

```bash
grunt
```

If everything goes well, you will find a wgt file in the `dist` folder.

Settings and Usage
------------------

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