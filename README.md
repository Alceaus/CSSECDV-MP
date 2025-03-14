# CSSECDV-MP
```
Marasigan, Marc Daniel
Santiago, Nikolai Andre A.
Santos, Alejandro Gabriel T.
Zamora, Patricia Gabrielle A.
```
## Setup before running the website locally:
Make sure to download MySQL Workbench Version 8.0.41 and MySQL Server Version 8.0.41
When setting up your MySQL Server locally, match the details with your dotenv file. After finishing setting up, create a schema/database and name it accordingly, matching your dotenv file. Finally, don't forget to double-click the schema to make sure that it is the schema/database being used.


## First, install the required packages using:
```bash
npm install
   or
npm install (package required)
```
## Then install the other dependencies:
```bash
npm install mysql2 express-session express-rate-limit winston-syslog
```
## Then run the development server:
```bash
node app.js
```

Then open [http://localhost:3000](http://localhost:3000) with your browser to see the result.


## To see data in MySQL Workbench, change the contents of the .env file according to your MySQL Local Server settings:
```bash
DB_HOST = localhost or 127.0.0.1
DB_USER = (enter user)
DB_PASSWORD = (enter password)
DB_NAME = (enter database name)
PORT = 3000
SECRET = secretkey
PEPPER = (enter pepper key)
DEBUG = false
```


To create self-signed certificate
> openssl genrsa -out private-key.pem 2048
> openssl req -new -x509 -key private-key.pem -out certificate.pem -days 365


for testing error message
> npm install --save-dev jest supertest express
