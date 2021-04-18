const express = require('express');
const router = express.Router();
const { db, admin } = require('../util/admin');

// Get a list of ALL current posses' data
router.get('/', (req, res) => {
  db.collection('posses').get()
    .then(snapshot => {
      const posseData = snapshot.docs
        .map(doc => {
          let posseDoc = doc.data();
          posseDoc.posseID = doc.id;
          return posseDoc;
        });
      return res.json({ results: posseData });
    })
    .catch(err => {
      console.log(err.message);
      return res.status(500).json({ message: err.message });
    });
});

// Get info of a specific posse
router.get('/info/:posseID', (req, res) => {
  const posseID = req.params.posseID;
  
  db.collection('posses').doc(posseID).get()
    .then(doc => {
      if (!doc.exists)
        return res.status(404).json({ message: 'Posse does not exist.' });

      const posseData = doc.data();
      posseData.posseID = doc.id;

      let usernames;
      // Get members of posse
      db.collection('users')
        .where('posses', 'array-contains', posseData.name).get()
        .then(snapshot => {
          usernames = snapshot.docs
            .map(doc => {
              let userDoc = doc.data();
              return userDoc.username;
            });
          posseData.usernames = usernames;
          return res.status(200).json(posseData);
        });
    })
    .catch(err => {
      console.log(err.message);
      return res.status(500).json({ message: err.message });
    });
});

// Join a posse
router.post('/join/:posseID', (req, res) => {
  const posseID = req.params.posseID;

  db.collection('posses').doc(posseID).get()
    .then(doc => {
      if (!doc.exists)
        return res.status(404).json({ message: 'Posse does not exist' });
      
      const posseData = doc.data();
      const storedData = {
        name: posseData.name,
        posseID: doc.id
      };

      db.collection('users')
        .doc(req.user.username)
        .update({
          posses: admin.firestore.FieldValue.arrayUnion(storedData)
        })
        .then(() => {
          return res.json({ message: 'Successfully joined posse' });
        });
    })
    .catch(err => {
      console.log(err.message);
      return res.status(500).json({ message: err.message });
    });
});

// Leave a posse
router.post('/leave/:posseID', (req, res) => {
  const posseID = req.params.posseID;

  db.collection('posses').doc(posseID).get()
    .then(doc => {
      if (!doc.exists)
        return res.status(404).json({ message: 'Posse does not exist' });
      
      const posseData = doc.data();
      const storedData = {
        name: posseData.name,
        posseID: doc.id
      };

      db.collection('users')
        .doc(req.user.username)
        .update({
          posses: admin.firestore.FieldValue.arrayRemove(storedData)
        })
        .then(() => {
          return res.json({ message: 'Successfully left posse' });
        });
    })
    .catch(err => {
      console.log(err.message);
      return res.status(500).json({ message: err.message });
    });
});

// Get all posts for a posse, given posse name
router.get('/feed/', (req, res) => {
  const posseName = req.query.posseName;

  const resArr = [];
  db.collection('posts')
    .where('posses', 'array-contains', posseName)
    .orderBy('timeStamp', 'desc')
    .get()
    .then(snapshot => {
      snapshot.forEach(postDoc => {
        const postData = postDoc.data();
        postData.postID = postDoc.id;
        resArr.push(postData);
      });
      return res.json({ results: resArr });
    })
    .catch(err => {
      return res.status(500).json({ message: err.message });
    });
});

// Make a posse
router.post('/create', (req, res) => {
  const posseData = {
    name: req.body.name,
    createdBy: req.user.username,
    timeStamp: admin.firestore.FieldValue.serverTimestamp(),
    tags: req.body.tags,
    bio: req.body.bio,
    picURL: req.body.picURL,
  };

  if(!posseData.name)
    return res.status(400).json({ message: 'Request body must have name of posse.' });

  db.collection('posses')
  .where('name', '==', posseData.name)
  .limit(1)
  .get()
  .then(snapshot => {
    if(snapshot.docs[0])
      return res.status(409).json({ message: 'Posse already exists.' });

    db.collection('posses').add(posseData)
      .then(posseDoc => {
        return res.json({ message: 'Posse has been created.', posseID: posseDoc.id });
      });
  })
  .catch(err => {
    console.log(err.message);
    return res.status(500).json({ message: err.message });
  });
});

module.exports = router;