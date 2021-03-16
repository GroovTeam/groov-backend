const admin = require('firebase-admin'); // May or may not need
admin.initializeApp();

const db = admin.firestore();

exports.db = db;
exports.admin = admin;
