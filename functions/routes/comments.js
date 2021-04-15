const express = require('express');
const router = express.Router();
const { db, admin } = require('../util/admin');


// Post a new comment
router.post('/:postID', (req, res) => {
  let commentData = {
    profileURL: req.user.profileURL,
    postID: req.params.postID,
    content: req.body.content,
    username: req.user.username,
    timeStamp: admin.firestore.FieldValue.serverTimestamp(),
  };

  const { errors, valid } = validateData(commentData);
  if (!valid)
    return res.status(400).json(errors);

  db.collection('comments').add(commentData)
    .then(doc => {
      return res.json({ commentID: doc.id, message: 'Success' });
    })
    .catch(err => {
      return res.status(500).json({ err });
    });
});

// Post a reply to a comment
router.post('/reply/:commentID', (req, res) => {
  const replyData = {
    profileURL: req.user.profileURL,
    postID: req.params.postID,
    content: req.body.content,
    username: req.user.username,
    timeStamp: admin.firestore.Timestamp.now()
  };

  const { errors, valid } = validateData(replyData);
  if (!valid)
    return res.status(400).json(errors);

  const commentID = req.params.commentID;

  db.collection('comments').doc(commentID).get()
    .then(doc => {
      if (!doc.exists)
        return res.status(404).json({ message: 'Comment does not exist' });

      db.collection('comments').doc(commentID)
        .update({
          replies: admin.firestore.FieldValue.arrayUnion(replyData)
        })
        .then(() => {
          return res.json({ message: 'Successfully replied' });
        });
    })
    .catch(err => {
      console.log(err.message);
      return res.status(500).json({ message: err.message });
    });
});

// Get comments for a post
router.get('/:postID', (req, res) => {
  const postID = req.params.postID;

  db.collection('comments')
    .where('postID', '==', postID)
    .orderBy('timeStamp', 'desc')
    .get()
    .then(snapshot => {
      const commentData = snapshot.docs
        .map(doc => {
          let commentDoc = doc.data();
          commentDoc.commentID = doc.id;
          return commentDoc;
        });
      return res.json({ results: commentData });
    })
    .catch(err => {
      return res.status(500).json({ message: err.message });
    });
});

const isEmpty = str => {
  return (str === undefined || str === '');
};

const validateData = data => {
  let errors = {};

  if (isEmpty(data.content))
    errors.content = 'Cannot be empty';

  return {
    errors,
    valid: Object.keys(errors).length === 0 ? true : false
  };
};

// Like a comment
router.post('/like/:commentID', (req, res) => {
  const commentID = req.params.commentID;

  db.collection('comments').doc(commentID).get()
    .then(doc => {
      if (!doc.exists)
        return res.status(404).json({ message: 'Comment does not exist' });

      db.collection('comments').doc(commentID)
        .update({
          likes: admin.firestore.FieldValue.arrayUnion(req.user.username)
        })
        .then(() => {
          return res.json({ message: 'Successfully liked Comment' });
        });
    })
    .catch(err => {
      console.log(err.message);
      return res.status(500).json({ message: err.message });
    });
});

// Unlike a comment
router.post('/unlike/:commentID', (req, res) => {
  const commentID = req.params.commentID;

  db.collection('comments').doc(commentID).get()
    .then(doc => {
      if (!doc.exists)
        return res.status(404).json({ message: 'Comment does not exist' });

      db.collection('comments').doc(commentID)
        .update({
          likes: admin.firestore.FieldValue.arrayRemove(req.user.username)
        })
        .then(() => {
          return res.json({ message: 'Successfully unliked Comment' });
        });
    })
    .catch(err => {
      console.log(err.message);
      return res.status(500).json({ message: err.message });
    });
});

module.exports = router;
