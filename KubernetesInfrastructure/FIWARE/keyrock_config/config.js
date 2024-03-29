var config = {};

config.port = (process.env.IDM_PORT || 31533);
config.host = (process.env.IDM_HOST || 'http://i101v181.intra.graz.at:' + config.port);


// HTTPS enable
config.https = {
    enabled: (process.env.IDM_HTTPS_ENABLED || false),
    cert_file: 'certs/idm-2018-cert.pem',
    key_file: 'certs/idm-2018-key.pem',
    ca_certs: [],
    port: (process.env.IDM_HTTPS_PORT || 443 )
};

// Config email list type to use domain filtering
config.email_list_type = null   // whitelist or blacklist 

// Secret for user sessions in web
config.session = {
    secret:  (process.env.IDM_SESSION_SECRET || require('crypto').randomBytes(20).toString('hex')),       // Must be changed
    expires: 60 * 60 * 1000     // 1 hour
}

// Key to encrypt user passwords
config.password_encryption = {
    key: (process.env.IDM_ENCRYPTION_KEY || 'rjNEsz647tzewu')   // Must be changed
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
    level: (process.env.IDM_PDP_LEVEL || 'advanced'),     // basic|advanced 
    authzforce: {
        enabled: (process.env.IDM_AUTHZFORCE_ENABLED || true),
        host: (process.env.IDM_AUTHZFORCE_HOST || 'authzforce'),
        port: (process.env.IDM_AUTHZFORCE_PORT||  8080),
    } 
}

var database_host = (process.env.DATABASE_HOST) ? process.env.DATABASE_HOST : 'localhost'

// Database info
config.database  = {
    host:     (process.env.DATABASE_HOST || 'localhost'),      
    password: (process.env.IDM_DB_PASS || 'idm'),
    username: (process.env.IDM_DB_USER || 'root'),
    database: (process.env.IDM_DB_NAME || 'idm'),
    dialect:  (process.env.IDM_DIALECT || 'mysql'),
    port:     (process.env.IDM_DB_PORT || undefined)
};
// External user authentication
config.external_auth = {
    enabled: (process.env.IDM_EX_AUTH_ENABLED || false ),
    authentication_driver: (process.env.IDM_EX_AUTH_DRIVER ||'custom_authentication_driver'),
    database: {
        host: (process.env.IDM_EX_AUTH_DB_HOST ||'localhost'),
        database: (process.env.IDM_EX_AUTH_DB_NAME ||'db_name'),
        username: (process.env.IDM_EX_AUTH_DB_USER || 'db_user'),
        password: (process.env.IDM_EX_AUTH_DB_PASS ||'db_pass'),
        user_table: (process.env.IDM_EX_AUTH_DB_USER_TABLE ||'user'),
        dialect: (process.env.IDM_EX_AUTH_DIALECT || 'mysql'),
        port: (process.env.IDM_EX_AUTH_PORT || undefined)
    }
}

// Email configuration
config.mail = {
    host: (process.env.IDM_EMAIL_HOST || 'smtp.gmail.com'),
    port: (process.env.IDM_EMAIL_PORT || 587),
    auth: {
      user: 'fiwaregraz@gmail.com',
      pass: 'IPPR_aim16'      
    },
    from: (process.env.IDM_EMAIL_ADDRESS || 'FIWARE Graz')
}

// Config themes
config.site = {
    title: (process.env.IDM_TITLE || 'Identity Manager'),
    theme: (process.env.IDM_THEME || 'default')
};

// Config eIDAs Authentication
config.eidas = {
    enabled:       (process.env.IDM_EIDAS_ENABLED || false),
    gateway_host:  (process.env.IDM_EIDAS_GATEWAY_HOST || 'localhost'),
    idp_host:      (process.env.IDM_EIDAS_IDP_HOST || 'https://se-eidas.redsara.es/EidasNode/ServiceProvider'),
    metadata_expiration: 60 * 60 * 24 * 365 // One year
}


if (config.session.secret === 'nodejs_idm' || config.password_encryption.key  === 'nodejs_idm'){
    console.log( "****************");
    console.log( "WARNING: The current encryption keys match the defaults found in the plaintext " + 
        "template file - please update for a production instance");
    console.log( "****************");
}


module.exports = config;