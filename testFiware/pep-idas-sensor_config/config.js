var config = {};

// Used only if https is disabled
config.pep_port = 7896;

// Set this var to undefined if you don't want the server to listen on HTTPS
config.https = {
    enabled: false,
    cert_file: 'cert/cert.crt',
    key_file: 'cert/key.key',
    port: 443
};

config.idm = {
	host: 'keyrock',
	port: 5000,
	ssl: false
}

config.app = {
	host: 'idas',
	port: '7896',
	ssl: false // Use true if the app server listens in https
}


// Credentials obtained when registering PEP Proxy in app_id in Account Portal
config.pep = {
	app_id: '2cc2a752-9c48-41e8-ad52-a5b6cfa9876a',
	username: 'pep_proxy_681c9d20-a4c4-4155-87ef-8c5350975c45',
	password: 'pep_proxy_8043208e-14dd-4b05-9743-a865e1e1de07',
	trusted_apps : []
}

// in seconds
config.cache_time = 300;

// if enabled PEP checks permissions with AuthZForce GE. 
// only compatible with oauth2 tokens engine
//
// you can use custom policy checks by including programatic scripts 
// in policies folder. An script template is included there
config.azf = {
	enabled: true,
	protocol: 'http',
    host: 'authzforce',
    port: 8080,
    custom_policy: undefined // use undefined to default policy checks (HTTP verb + path).
};

// list of paths that will not check authentication/authorization
// example: ['/public/*', '/static/css/']
config.public_paths = [];

config.magic_key = undefined;

module.exports = config;
