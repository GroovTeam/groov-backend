const admin = require('firebase-admin'); // May or may not need
const firebase = require('firebase');
const config = require('../config');
admin.initializeApp();
firebase.initializeApp(config);
// firebase.auth().useEmulator('http://localhost:9099');

const db = admin.firestore();

db.settings({
  ignoreUndefinedProperties: true,
});

exports.db = db;
exports.admin = admin;
exports.firebase = firebase;
