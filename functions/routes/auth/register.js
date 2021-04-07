const express = require('express');
const router = express.Router();
const { db, admin, firebase } = require('../../util/admin');

router.post('/', (req, res) => {
  let userData = {
    email: req.body.email,
    password: req.body.password,
    username: req.body.username,
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    tagLikes: req.body.tagLikes,
    tagDislikes: req.body.tagDislikes,
    tagNeutrals: req.body.tagNeutrals,
    dateCreated: admin.firestore.FieldValue.serverTimestamp(),
  };

  const { errors, valid } = validateData(userData);
  if(!valid)
    return res.status(400).json(errors);

  let token;
  db.doc(`/users/${userData.username}`).get()
    .then(doc => {
      if (doc.exists) {
        res.status(409).json({ message: 'Username is already in use' });
        throw new Error('Username already in use.');
      }
      else {
        return firebase.auth().createUserWithEmailAndPassword(userData.email, userData.password);
      }
    })
    .then(data => {
      data.user.sendEmailVerification()
        .then(() => {
          console.log('Email verifcation sent!');
        })
        .catch(err => {
          console.error(err);
        });
      userData.uid = data.user.uid;
      return data.user.getIdToken();
    })
    .then(idToken => {
      token = idToken;
      return db.doc(`/users/${userData.username}`).set(userData);
    })
    .then(() => {
      return res.status(201).json({ token });
    })
    .catch(err => {
      console.error(err);

      // Firebase auth errors:
      // auth/email-already-in-use
      // auth/invalid-email
      // auth/operation-not-allowed
      // auth/weak-password
      if(err.code) {
        if(err.code.startsWith('auth'))
          return res.status(400).json({ message: err.code });
        else
          return res.status(500).json({ message: err.code });
      }
    });
});

const isEmpty = str => {
  return (str === undefined || str === '');
};

// Data validation
const validateData = data => {
  let errors = {};

  if (isEmpty(data.email))
    errors.email = 'Cannot be empty';
  if(isEmpty(data.password))
    errors.password = 'Cannot be empty';
  if(isEmpty(data.username))
    errors.username = 'Cannot be empty';
  if(isEmpty(data.firstName))
    errors.firstName = 'Cannot be empty';
  if(isEmpty(data.lastName))
    errors.lastName = 'Cannot be empty';

  return { 
    errors, 
    valid: Object.keys(errors).length === 0 ? true : false 
  };
};

module.exports = router;
