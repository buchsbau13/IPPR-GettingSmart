var config = {};

config.host = 'http://localhost:5000';
config.port = 5000

// HTTPS enable
config.https = {
    enabled: false,
    cert_file: 'certs/idm-2018-cert.pem',
    key_file: 'certs/idm-2018-key.pem',
    ca_certs: [],
    port: 443
};

// Config email list type to use domain filtering
config.email_list_type = null   // whitelist or blacklist 

// Secret for user sessions in web
config.session = {
    secret: 'scvbvWFz54hfs',       // Must be changed
    expires: 60 * 60 * 1000     // 1 hour
}

// Key to encrypt user passwords
config.password_encryption = {
	key: 'rjNEsz647tzewu'		// Must be changed
}

// Config oauth2 parameters
config.oauth2 = {
    authorization_code_lifetime: 5 * 60,            // Five minutes
    access_token_lifetime: 60 * 60,                 // One hour
    refresh_token_lifetime: 60 * 60 * 24 * 14       // Two weeks
}

// Config api parameters
config.api = {
    token_lifetime: 60 * 60     // One hour
}

// Configure Policy Decision Point (PDP)
//  - IdM can perform basic policy checks (HTTP verb + path)
//  - AuthZForce can perform basic policy checks as well as advanced 
// If authorization level is advanced you can create rules, HTTP verb+resource and XACML advanced. In addition
// you need to have an instance of authzforce deployed to perform advanced authorization request from a Pep Proxy.
// If authorization level is basic, only HTTP verb+resource rules can be created
config.authorization = {
    level: 'advanced',     // basic|advanced 
    authzforce: {
        enabled: true,
        host: 'authzforce',
        port: 8080,
    } 
}

var database_host = (process.env.DATABASE_HOST) ? process.env.DATABASE_HOST : 'localhost'

// Database info
config.database = {
    host: database_host,         // default: 'localhost' 
    password: 'idm',             // default: 'idm'
    username: 'root',            // default: 'root'
    database: 'idm',             // default: 'idm'
    dialect: 'mysql',            // default: 'mysql'
    port: undefined              // default: undefined (which means that the port 
                                 //          is the default for each dialect)
};

// External user authentication
config.external_auth = {
    enabled: false,
    authentication_driver: 'custom_authentication_driver',
    database: {
        host: 'localhost',
        database: 'db_name',
        username: 'db_user',
        password: 'db_pass',
        user_table: 'user',
        dialect: 'mysql',
        port: undefined
    }
}

// Email configuration
config.mail = {
    host: 'smtp.gmail.com',
    port: 587,
    auth: {
      user: 'fiwaregraz@gmail.com',
      pass: 'IPPR_aim16'      
    },
    from: 'fiwaregraz@gmail.com'
}


// Config themes
config.site = {
    title: 'Identity Manager',
    theme: 'default'
};

// Config eIDAs Authentication
config.eidas = {
    enabled: false,
    gateway_host: 'localhost',
    idp_host: 'https://se-eidas.redsara.es/EidasNode/ServiceProvider',
    metadata_expiration: 60 * 60 * 24 * 365 // One year
}

module.exports = config;