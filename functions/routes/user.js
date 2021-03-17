const express = require('express');
const router = express.Router();
const { db } = require('../util/admin');

router.post('/info', (req, res) => {
  const userData = {
    likes: req.body.likes,
    dislikes: req.body.dislikes,
    neutrals: req.body.neutrals
  };

  const { errors, valid } = validateData(userData);

  if(!valid)
    return res.status(400).json(errors);

  db.doc(`/users/${req.user.username}`)
  .set(userData, { merge: true })
  .then(() => {
    res.status(200).json({ message: 'Successfully posted user data' });
  })
  .catch((err) => {
    res.status(500).json(err);
  });
});

router.get('/info', (req, res) => {
  let userData = {};
  let userInterests = {};
  db.doc(`/users/${req.user.username}`)
  .get()
  .then((doc) => {
    userData = doc.data();
    userInterests = {
      likes: userData.likes,
      dislikes: userData.dislikes,
      neutrals: userData.neutrals
    };
    res.status(200).json(userInterests);
  })
  .catch((err) => {
    res.status(500).json(err);
  });
});

const validateData = (data) => {
  let errors = {};

  if (data.likes === undefined || !Array.isArray(data.likes))
    errors.likes = 'must have likes array'
  if (data.dislikes === undefined || !Array.isArray(data.dislikes))
    errors.dislikes = 'must have dislikes array'
  if (data.neutrals === undefined || !Array.isArray(data.neutrals))
    errors.neutrals = 'must have neutrals array'

  return {
    errors,
    valid: Object.keys(errors).length === 0 ? true : false
  };
};

module.exports = router;