// Firebase initialization
const functions = require('firebase-functions');
const admin = require('firebase-admin'); // May or may not need

// Server intialization
const express = require('express');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors({ origin: true }));

// DB Initialization
const { db } = require('./util/admin');

// Auth Routes
app.use('/auth/users', require('./routes/auth/users'));

// API Routes
app.use('/posts', require('./routes/posts'));

// Boilerplate test stuff for requesting anything
app.get('*', (req, res) => {
  res.send('Hello from Express on Firebase!');
});

exports.api = functions.https.onRequest(app);


// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//   functions.logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });
