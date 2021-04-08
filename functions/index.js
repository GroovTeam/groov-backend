// Firebase initialization
const functions = require('firebase-functions');
// const admin = require('firebase-admin'); // May or may not need
const auth = require('./util/auth');

// Server intialization
const express = require('express');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors({ origin: true }));

// DB Initialization
// const { db } = require('./util/admin');

// Auth Routes
app.use('/auth/register', require('./routes/auth/register'));
app.use('/auth/login', require('./routes/auth/login'));
app.use('/utils', require('./routes/auth/utils'));

// API Routes
app.use('/posts', auth, require('./routes/posts'));
app.use('/user', auth, require('./routes/user'));
app.use('/posses', auth, require('./routes/posses'));
app.use('/beats', auth, require('./routes/beats'));

// External API Routes
app.use('/youtube/search', require('./routes/youtube/search'));

// Boilerplate test stuff for requesting anything
// app.get('*', (req, res) => {
//   res.send('Hello from Express on Firebase!');
// });

exports.api = functions.https.onRequest(app);


// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//   functions.logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });
