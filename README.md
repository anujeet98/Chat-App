# Project setup steps

Prerequisites: Install NodeJS v20.10.0 and NPM 10.4.0
```
npm install
```

### Add/Configure .env file into the root directory

```
# Sample .env

# AWS S3 credentials
AWS_S3_KEY = "AK**************W5"
AWS_S3_SECRET = "m***********************Dd"
AWS_S3_BUCKET = "xpense-tracker-app"

# forget password mail service credentials - mailjet API
MJ_APIKEY_PUBLIC = "8a*************************c0"
MJ_APIKEY_PRIVATE = "36*****************************c1"
FP_SENDER_EMAIL = "anujeet***@gmail.com"
FP_SENDER_NAME = "SOCIO-CHAT"
BACKEND_ADDR = "http://www.sociochat.work.gd"

# DB credentials
DB_HOST = "database-1.**********.us-east-1.rds.amazonaws.com"
DB_USERNAME = "*************"
DB_PASSWORD = "*************"
DB_NAME = "chatapp"

# Sentry configuration 
DSN = "https://5*****************cafca75@o45****************6.ingest.sentry.io/45*************76"

# Application port
APP_PORT = "4000"

# JWT and CRYPT secret for encryption
TOKEN_SECRET = "a*************************************************************************************07a0"
CRYPT_SECRET = "13**************************************************************************************95"

# List of accepted origins for CORS
ACCEPTED_ORIGINS = '["http://localhost","http://www.sociochat.work.gd"]'
```

### To Sync DB
```
//Inside app.js: uncomment below

await sequelize.sync({force: true});
 
```

### Start Server
```
npm start
```
