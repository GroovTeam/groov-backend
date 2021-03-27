const express = require('express');
const router = express.Router();
const { db, admin } = require('../util/admin');

// TODO: Music clip
// Create a new post
router.post('/', (req, res) => {
  let postData = {
    username: req.user.username,
    content: req.body.content,
    posses: req.body.posses,
    tags: req.body.tags,
    timeStamp: admin.firestore.FieldValue.serverTimestamp(),
  };
  
  const { errors, valid } = validateData(postData);
  if (!valid)
    return res.status(400).json(errors);
  
  db.collection('posts').add(postData)
  .then((doc) => {
    return res.json({ postID: doc.id, message: 'Success' });
  })
  .catch((err) => {
    return res.status(500).json({ err });
  });
});

// Delete a post
// WARNING: Deleting a document does not delete its subcollections! 
// (Luckily we currently do not use subcollections for docs)
router.delete('/delete/:id', (req, res) => {
  const postID = req.params.id;

  db.collection('posts').doc(postID).get()
    .then((doc) => {
      if(!doc.exists)
        return res.status(404).json({ message: 'Post does not exist.' });
      
      const postData = doc.data();
      if (req.user.username !== postData.username)
        return res.status(403).json({ message: 'You do not have the authorization to delete this post.' });

      db.collection('posts').doc(postID).delete()
        .then(() => {
          return res.json({ message: 'Post has been successfully deleted.' });
        });
    })
    .catch((err) => {
      console.log(err.message);
      return res.status(500).json({ message: err.message });
    });
});

// Get specific post
router.get('/post/:id', (req, res) => {
  const postID = req.params.id;

  db.collection('posts').doc(postID).get()
    .then((doc) => {
      if(!doc.exists)
        return res.status(404).json({ message: 'Post does not exist.' });
      
      // Probably more stuff here
      return res.status(200).json({ result: doc.data() });
    })
    .catch((err) => {
      console.log(err.message);
      return res.status(500).json({ message: err.message });
    });
});

// Get user's posse feed
router.get('/feed', (req, res) => {
  const userPosses = req.user.posses;
  if (!userPosses || userPosses.length === 0)
    return res.json({ message: 'User has not joined any posses' }); // TODO: STATUS
  const resArr = [];

  // TODO: Current limit of posse request is 10
  db.collection('posts')
    .where('posses', 'array-contains-any', userPosses)
    .orderBy('timeStamp', 'desc')
    .get()
    .then((snapshot) => {
      snapshot.forEach((postDoc) => {
        const postData = postDoc.data();
        postData.postID = postDoc.id;
        resArr.push(postData);
      });
      return res.json({ results: resArr });
    })
    .catch((err) => {
      return res.status(500).json({ message: err.message });
    });
});

// Gets all posts by new
router.get('/new', (req, res) => {
  const resArr = [];
  db.collection('posts')
    .orderBy('timeStamp', 'desc')
    .get()
    .then((snapshot) => {
      snapshot.forEach((postDoc) => {
        let postData = postDoc.data();
        postData.postID = postDoc.id;
        resArr.push(postData);
      });
      return res.json({ results: resArr });
    })
    .catch((err) => {
      return res.status(500).json({ message: err.message });
    });
});

// Like a post
router.post('/like/:postID', (req, res) => {
  const postID = req.params.postID;

  db.collection('posts').doc(postID).get()
    .then((doc) => {
      if (!doc.exists)
        return res.status(404).json({ message: 'Post does not exist' });

      db.collection('posts').doc(postID)
        .update({
          likes: admin.firestore.FieldValue.arrayUnion(req.user.username)
        })
        .then(() => {
          return res.json({ message: 'Successfully liked Post' });
        });
    })
    .catch((err) => {
      console.log(err.message);
      return res.status(500).json({ message: err.message });
    });
});

// Unlike a post
router.post('/unlike/:postID', (req, res) => {
  const postID = req.params.postID;

  db.collection('posts').doc(postID).get()
    .then((doc) => {
      if (!doc.exists)
        return res.status(404).json({ message: 'Post does not exist' });

      db.collection('posts').doc(postID)
        .update({
          likes: admin.firestore.FieldValue.arrayRemove(req.user.username)
        })
        .then(() => {
          return res.json({ message: 'Successfully unliked Post' });
        });
    })
    .catch((err) => {
      console.log(err.message);
      return res.status(500).json({ message: err.message });
    });
});

// Get posts by tags
// TODO: Separate searchTags in chunks of 10 due to limit for array-contains-any
router.get('/tags', (req, res) => {
  let tags = req.query.tag;
  if (!tags)
    return res.json({ results: [] });

  if (!Array.isArray(tags))
    tags = [req.query.tag];

  console.log(tags);
  const resArr = [];
  db.collection('posts')
      .where('tags', 'array-contains-any', tags)
      .orderBy('timeStamp', 'desc').get()
      .then((snapshot) => {
        snapshot.forEach((postDoc) => {
          // May want to only serve parts of data, for now just passing all data
          const postData = postDoc.data();
          postData.postID = postDoc.id;
          resArr.push(postData);
        });
        res.json({ results: resArr });
      })
      .catch((err) => {
        res.status(500).json({ err });
      });
});

const isEmpty = (str) => {
  return (str === undefined || str === '');
};

const validateData = (data) => {
  let errors = {};

  if(isEmpty(data.content))
    errors.contents = 'Cannot be empty';
  if(isEmpty(data.tags))
    errors.tags = 'Cannot be empty';

  return { 
    errors, 
    valid: Object.keys(errors).length === 0 ? true : false 
  };
};

module.exports = router;
