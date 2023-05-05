const jwt = require('jsonwebtoken');
const db = require('../model/db');
const bcrypt = require('bcryptjs');
const { promisify } = require('util');
const express = require('express');
const router = express.Router();
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


exports.login = async (req, res, next) => {
  const { email, password } = req.body;

  // 1) Check if email and password exist
  if (!email || !password) {
    return res.status(400).render("login", {
      message: 'Please provide email and password'
    });
  }


  connection.query('SELECT * FROM users WHERE name = ?', [email], (error, results, fields) => {
    if (error) {
      console.error(`Error executing SQL query: ${error.stack}`);
      return;
    }
  
    console.log(`Query results: ${JSON.stringify(results)}`);
    if(password === results[0].password) {
      console.log('matched')
      
      res.status(200).redirect("/steven");
    }
  });

  
};

exports.register = (req, res) => {
  console.log(req.body);
  const { name, email, password, passwordConfirm } = req.body;

  // 2) Check if user exists && password is correct
  connection.query('SELECT email FROM users WHERE email = ?', [email], async (error, results) => {
    if(error) {
      console.log(error)
    } else if(password !== passwordConfirm) {
      return res.render('register', {
        message: 'Passwords do not match'
      });
    }
      
    let hashedPassword = await bcrypt.hash(password, 8);
    console.log(hashedPassword);

    connection.query('INSERT INTO users SET ?', { name: name, email: email, password: hashedPassword }, (error, result) => {
      if(error) {
        console.log(error)
      } 
    });

    res.status(200).redirect("/steven");

  });
};

// Only for rendered pages, no errors!
exports.isLoggedIn = async (req, res, next) => {
  console.log(req.cookies);
  if (req.cookies.jwt) {
    try {
      // 1) verify token
      const decoded = await promisify(jwt.verify)(
        req.cookies.jwt,
        process.env.JWT_SECRET
      );

      console.log("decoded");
      console.log(decoded);

      // 2) Check if user still exists
      db.start.query('SELECT * FROM users WHERE id = ?', [decoded.id], (error, result) => {
        console.log(result)
        if(!result) {
          return next();
        }
        // THERE IS A LOGGED IN USER
        req.user = result[0];
        // res.locals.user = result[0];
        console.log("next")
        return next();
      });
    } catch (err) {
      return next();
    }
  } else {
    next();
  }
};

exports.logout = (req, res) => {
  res.cookie('jwt', 'loggedout', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  });
  res.status(200).redirect("/");
};