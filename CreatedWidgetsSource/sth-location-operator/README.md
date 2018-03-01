# STH Location operator

The STH location operator is a WireCloud operator that allows you to retrieve location values for context broker entities and combine them with historic values of other attributes. 

## Build

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

## Documentation

Documentation about how to use this operator is available on the
[User Guide](src/doc/userguide.md). 