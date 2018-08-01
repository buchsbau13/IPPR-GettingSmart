var config = {};

// Used only if https is disabled
config.pep_port = 1026;

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
	host: 'orion',
	port: '1026',
	ssl: false // Use true if the app server listens in https
}


// Credentials obtained when registering PEP Proxy in app_id in Account Portal
config.pep = {
	app_id: '9f8dc445-be27-4d85-b084-0588b057ded5',
	username: 'pep_proxy_c85de59f-dae1-483d-b684-aef475bde24a',
	password: 'pep_proxy_358e90f6-cc97-4f05-bfc6-d1b745179492',
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