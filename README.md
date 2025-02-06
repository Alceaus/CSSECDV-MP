# CSSECDV-MP

First, install required packages using:
```bash
npm install
   or
npm install (package required)
```
Then install the other dependencies:
```bash
npm mysql2
npm express-session
npm express-rate-limit
```
Then run the development server:
```bash
node app.js
```

Then open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

To see data in MySQL Workbench, change the contents of the .env file according to your MySQL Local Server settings:
```bash
DB_HOST = localhost or 127.0.0.1
DB_USER = (enter user)
DB_PASSWORD = (enter password)
DB_NAME = (enter database name)
PORT = 3000
SECRET = secretkey
```
