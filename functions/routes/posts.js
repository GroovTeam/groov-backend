const express = require('express');
const router = express.Router();
const { db, admin } = require('../util/admin');

// Create a new post
router.post('/', (req, res) => {
  const postData = {
    poster: req.user.username,
    contents: req.body.contents,
    tags: req.body.tags,
    timeStamp: admin.firestore.FieldValue.serverTimestamp(),
  };

  const { errors, valid } = validateData(postData);
  if (!valid)
    return res.status(400).json(errors);

  db.collection('posts').add(postData).then((doc) => {
    res.json({ postID: doc.id, result: 'Success' });
  }).catch((err) => {
    res.status(500).json({ err });
  });
});



// Getting users liked posts
router.get('/likes', (req, res) => {

});

// Like a post
router.post('/like', (req, res) => {
  const postID = req.body.postID;

  db.collection('posts').doc(postID).get()
    .then((postRef) => {
      if (!postRef.exists)
        res.status(400).json({ message: 'Post does not exist.' });
      else
        db.collection('posts').doc(postID).collection('likers').add({ 'username': req.user.username })
        .then((result) => {
          res.status(200).json({ message: 'Successfully liked post' });
        });
    })
    .catch((err) => {
      console.error(err);
      res.status(400).json({ message: err });
    });
});

// Get posts by array of tags
// TODO: Separate searchTags in chunks of 10 due to limit for array-contains-any
router.get('/tags', (req, res) => {
  const searchTags = req.body.tags;
  const resArr = [];
  db.collection('posts')
      .where('tags', 'array-contains-any', searchTags).get()
      .then((snapshot) => {
        snapshot.forEach((postDoc) => {
          // May want to only serve parts of data, for now just passing all data
          const postData = postDoc.data();
          resArr.push(postData);
        });
        res.json({ results: resArr });
      })
      .catch((err) => {
        res.status(500).json({ err });
      });
});

// Get full post by ID
router.get('/', (req, res) => {

});

const isEmpty = (str) => {
  return (str === undefined || str === '');
};

const validateData = (data) => {
  let errors = {};

  if (isEmpty(data.poster))
    errors.poster = 'Cannot be empty';
  if(isEmpty(data.contents))
    errors.contents = 'Cannot be empty';
  if(isEmpty(data.tags))
    errors.tags = 'Cannot be empty';

  return { 
    errors, 
    valid: Object.keys(errors).length === 0 ? true : false 
  };
};

module.exports = router;
