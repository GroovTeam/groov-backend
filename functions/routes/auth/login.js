const express = require('express');
const router = express.Router();
const { db, admin, firebase } = require('../../util/admin');

router.post('/', (req, res) => {
  const userData = {
    email: req.body.email,
    username: req.body.username,
    password: req.body.password,
  };

  const { errors, valid } = validateData(userData);

  if (!valid)
    return res.status(400).json(errors);

  // Authenticate normally with email, if it is present
  if (isEmpty(userData.username)) {
    firebase.auth().signInWithEmailAndPassword(userData.email, userData.password)
      .then(data => {
        const userId = data.user.uid;

        // Make some custom tokens to be used with signInWithCustomToken() method (TODO: configure options)
        admin.auth().createCustomToken(userId)
          .then(customToken => {
            return res.json({ customToken });
          })
          .catch(err => {
            console.log('Error creating custom token:', err);
          });
      })
      .catch(err => {
        console.error(err);
        // auth/invalid-email
        // auth/user-disabled
        // auth/user-not-found
        // auth/wrong-password
        if (err.code.startsWith('auth')) {
          let message;
          console.log(err.code);
          switch(err.code) {
            case 'auth/invalid-email':
              message = 'Email is invalid.';
              break;
            case 'auth/user-disabled':
              message = 'User account is disabled.';
              break;
            case 'auth/user-not-found':
              message = 'User not found.';
              break;
            case 'auth/wrong-password':
              message = 'Incorrect password.';
              break;
          }
          return res.status(400).json({ message: message });
        }
        else
          return res.status(500).json({ message: err.code });
      });
    return;
  }

  // Query db to check for existing user
  db.doc(`/users/${userData.username}`).get()
    .then(doc => {
      console.log(doc);
      if (!doc.exists)
        return res.status(400).json({ message: 'User does not exist' });

      // Extract unique email from user document
      const userEmail = doc.data().email;

      // Sign in with extracted email as usual
      firebase.auth().signInWithEmailAndPassword(userEmail, userData.password)
        .then(data => {
          const userId = data.user.uid;

          admin.auth().createCustomToken(userId)
            .then(customToken => {
              return res.json({ customToken });
            })
            .catch(err => {
              console.log('Error creating custom token:', err);
            });
        })
        .catch(err => {
          console.log(err.code);
          // auth/invalid-email
          // auth/user-disabled
          // auth/user-not-found
          // auth/wrong-password
          if (err.code.startsWith('auth')) {
            let message;
            switch(err.code) {
              case 'auth/invalid-email':
                message = 'Email is invalid.';
                break;
              case 'auth/user-disabled':
                message = 'User account is disabled.';
                break;
              case 'auth/user-not-found':
                message = 'User not found.';
                break;
              case 'auth/wrong-password':
                message = 'Incorrect password.';
                break;
            }
            return res.status(400).json({ message: message });
          }
          else
            return res.status(500).json({ message: err.code });
        });
    })
    .catch(err => {
      console.error(err);
    });
});

const isEmpty = str => {
  return (str === undefined || str === '');
};

// Data validation
const validateData = data => {
  let errors = {};

  if (isEmpty(data.email) && isEmpty(data.username))
    errors.email = 'Cannot be empty';
  if (isEmpty(data.password))
    errors.password = 'Cannot be empty';

  return {
    errors,
    valid: Object.keys(errors).length === 0 ? true : false
  };
};

module.exports = router;