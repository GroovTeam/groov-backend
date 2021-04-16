const express = require('express');
const router = express.Router();
const { firebase } = require('../../util/admin');

router.post('/', (req, res) => {
  const userData = {
    email: req.body.email,
    password: req.body.password,
  };

  const { errors, valid } = validateData(userData);

  if (!valid)
    return res.status(400).json(errors);

  firebase.auth().signInWithEmailAndPassword(userData.email, userData.password)
    .then(data => {
      return data.user.getIdToken(true);
    })
    .then(token => {
      return res.json({ token });
    })
    .catch(err => {
      console.error(err);
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
});

const isEmpty = str => {
  return (str === undefined || str === '');
};

// Data validation
const validateData = data => {
  let errors = {};

  if (isEmpty(data.email))
    errors.email = 'Cannot be empty';
  if (isEmpty(data.password))
    errors.password = 'Cannot be empty';

  return {
    errors,
    valid: Object.keys(errors).length === 0 ? true : false
  };
};

module.exports = router;