const express = require('express');
const router = express.Router();
const { db } = require('../util/admin');

router.post('/profile', (req, res) => {
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

router.get('/profile', (req, res) => {
  // let userData = {};
  const userInterests = {
    likes: req.user.likes,
    dislikes: req.user.dislikes,
    neutrals: req.user.neutrals,
  };

  res.status(200).json(userInterests);
});

// Users Feed
router.get('/feed', (req, res) => {

});

// Get current user's liked posts
router.get('/likedPosts', (req, res) => {
  const resArr = [];
  db.collectionGroup('likers').where('username', '==', req.user.username).get()
  .then((snapshot) => {
    snapshot.forEach((postDoc) => {
      // May want to only serve parts of data, for now just passing all data
      const postData = postDoc.data();
      resArr.push(postData);
    });
    res.json({ results: resArr });
  });
});

// Get current user's posts
router.get('/posts', (req, res) => {

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