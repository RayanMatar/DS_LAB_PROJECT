const express = require('express');
const path = require('path');
const app = express();
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');

dotenv.config({ path: './.env' });
const db = require('./model/db');

// Parse URL-encoded bodies (as sent by HTML forms)
app.use(express.urlencoded({ extended: false }));
// Parse JSON bodies (as sent by API clients)
app.use(express.json());
app.use(cookieParser());

const mysql = require('mysql');

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'nodejs-login'
});

connection.connect((error) => {
  if (error) {
    console.error(`Error connecting to database: ${error.stack}`);
    return;
  }

  console.log(`Connected to database as id ${connection.threadId}`);
});

// Use the connection to execute SQL queries
connection.query('SELECT * FROM users', (error, results, fields) => {
  if (error) {
    console.error(`Error executing SQL query: ${error.stack}`);
    return;
  }

  console.log(`Query results: ${JSON.stringify(results)}`);
});

// Close the connection when you're done with it
connection.end();


app.set('view engine', 'hbs');

const publicDirectoryPath = path.join(__dirname, "../public");
app.use(express.static(publicDirectoryPath));

//Define Routes
app.use('/', require('./routes/pages'));
app.use('/auth', require('./routes/auth'));

app.listen(5000, () => {
  console.log("listening on port 5000");
})