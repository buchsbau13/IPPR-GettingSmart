var config = {};

// Used only if https is disabled
config.pep_port = 4041;

// Set this var to undefined if you don't want the server to listen on HTTPS
config.https = {
    enabled: false,
    cert_file: 'cert/cert.crt',
    key_file: 'cert/key.key',
    port: 443
};

config.idm = {
	host: 'keyrock',
	port: 31533,
	ssl: false
}

config.app = {
	host: 'idas',
	port: '4041',
	ssl: false // Use true if the app server listens in https
}


// Credentials obtained when registering PEP Proxy in app_id in Account Portal
config.pep = {
	app_id: '777b7fee-6af9-44c0-b184-6c264fd9cbe9',
	username: 'pep_proxy_c13579a1-264a-4b13-a1e3-b370c961ef87',
	password: 'pep_proxy_50e7cded-b043-4831-84c9-895803d79db8',
	trusted_apps : []
}

// in seconds
config.cache_time = 300;

// if enabled PEP checks permissions in two ways:
//  - With IdM: only allow basic authorization
//  - With Authzforce: allow basic and advanced authorization. 
//	  For advanced authorization, you can use custom policy checks by including programatic scripts 
//    in policies folder. An script template is included there 
// 
//	This is only compatible with oauth2 tokens engine

config.authorization = {
	enabled: true,
	pdp: 'authzforce', 	// idm|authzforce  
	azf: {
		protocol: 'http',
	    host: 'authzforce',
	    port: 8080,
	    custom_policy: undefined // use undefined to default policy checks (HTTP verb + path).
	} 
}

// list of paths that will not check authentication/authorization
// example: ['/public/*', '/static/css/']
config.public_paths = [];

config.magic_key = undefined;

module.exports = config;