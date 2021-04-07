const express = require('express');
const router = express.Router();
const { db } = require('../util/admin');

// TODO: profile picture
// Post to current user's profile
router.post('/profile', (req, res) => {
  const userData = {
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    bio: req.body.bio,
    tagLikes: req.body.tagLikes,
    tagDislikes: req.body.tagDislikes,
    tagNeutrals: req.body.tagNeutrals,
  };

  db.doc(`/users/${req.user.username}`)
  .set(userData, { merge: true })
  .then(() => {
    return res.status(200).json({ message: 'Successfully posted user data' });
  })
  .catch(err => {
    return res.status(500).json(err);
  });
});

// Get current user's profile info
router.get('/profile', (req, res) => {
  db.doc(`/users/${req.user.username}`).get()
  .then(userDoc => {
    let userData = userDoc.data();
    
    // Strip some data
    let profileData = {
      firstName: userData.firstName,
      lastName: userData.lastName,
      username: userData.username,
      bio: userData.bio,
      tagLikes: userData.tagLikes,
      tagDislikes: userData.tagDislikes,
      tagNeutrals: userData.tagNeutrals,
      posses: userData.posses
    };

    return res.status(200).json(profileData);
  })
  .catch(err => {
    return res.status(500).json(err);
  });
});

// Get user profile info by username
router.get('/profile/:username', (req, res) => {
  db.doc(`/users/${req.params.username}`).get()
  .then(userDoc => {
    if (!userDoc.exists)
        return res.status(404).json({ message: 'User does not exist' });

    let userData = userDoc.data();
    
    // Strip some data
    let profileData = {
      firstName: userData.firstName,
      lastName: userData.lastName,
      username: userData.username,
      bio: userData.bio,
      tagLikes: userData.tagLikes,
      tagDislikes: userData.tagDislikes,
      tagNeutrals: userData.tagNeutrals,
      posses: userData.posses
    };

    return res.status(200).json(profileData);
  })
  .catch(err => {
    return res.status(500).json(err);
  });
});

// Get current user's liked posts
router.get('/likedPosts', (req, res) => {
  const username = req.user.username;

  db.collection('posts')
    .where('likes', 'array-contains', username).get()
    .then(snapshot => {
      const postData = snapshot.docs
      .map(doc => {
        let postDoc = doc.data();
        postDoc.postID = doc.id;
        return postDoc;
      });
      return res.json({ results: postData });
    })
    .catch(err => {
      console.log(err.message);
      return res.status(500).json({ message: err.message });
    });
});

// Get user liked posts by username
router.get('/likedPosts/:username', (req, res) => {
  const username = req.params.username;

  db.collection('posts')
    .where('likes', 'array-contains', username).get()
    .then(snapshot => {
      const postData = snapshot.docs
      .map(doc => {
        let postDoc = doc.data();
        postDoc.postID = doc.id;
        return postDoc;
      });
      return res.json({ results: postData });
    })
    .catch(err => {
      console.log(err.message);
      return res.status(500).json({ message: err.message });
    });
});

// Get current user's posts
router.get('/posts', (req, res) => {
  const username = req.user.username;

  db.collection('posts')
    .where('username', '==', username)
    .orderBy('timeStamp', 'desc').get()
    .then(snapshot => {
      const postData = snapshot.docs
        .map(doc => {
          let postDoc = doc.data();
          postDoc.postID = doc.id;
          return postDoc;
        });
      return res.json({ results: postData });
    })
    .catch(err => {
      res.status(500).json({ err });
    });
});

// Get user posts by username
router.get('/posts/:username', (req, res) => {
  const username = req.params.username;

  db.collection('posts')
    .where('username', '==', username)
    .orderBy('timeStamp', 'desc').get()
    .then(snapshot => {
      const postData = snapshot.docs
        .map(doc => {
          let postDoc = doc.data();
          postDoc.postID = doc.id;
          return postDoc;
        });
      return res.json({ results: postData });
    })
    .catch(err => {
      res.status(500).json({ err });
    });
});

module.exports = router;