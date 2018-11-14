var config = {};

// Used only if https is disabled
config.pep_port = 8666;

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
	host: 'comet',
	port: '8666',
	ssl: false // Use true if the app server listens in https
}


// Credentials obtained when registering PEP Proxy in app_id in Account Portal
config.pep = {
	app_id: '60fe48c3-8111-4999-a7d7-c181c9433914',
	username: 'pep_proxy_fda264d1-2711-47a1-87a7-421f3aca40c2',
	password: 'pep_proxy_2290ba4f-5196-4d5d-b55a-cff6d25ae713',
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
