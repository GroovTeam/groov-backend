const express = require('express');
const router = express.Router();
const { db, admin } = require('../util/admin');

// TODO: req.poster should be replaced with auth once set up
router.post('/', (req, res) => {
  const post = {
    poster: req.body.poster,
    contents: req.body.contents,
    tags: req.body.tags,
    timeStamp: admin.firestore.FieldValue.serverTimestamp(),
  };
  db.collection('posts').add(post).then((doc) => {
    res.json({ postID: doc.id, result: 'Success' });
  }).catch((err) => {
    res.status(500).json({ error: 'Error when adding post.' });
  });
});

// TODO: Separate searchTags in chunks of 10 due to limit for array-contains-any
router.get('/getPostsByTags', (req, res) => {
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
        res.status(500).json({ error: 'Issue with post collection search' });
      });
});

module.exports = router;
