const express = require('express');
const router = express.Router();
const { db } = require('../util/admin');

// Get the beats!!!
router.get('/', (req, res) => {
  db.collection('beats').get()
    .then(snapshot => {
      const beatData = snapshot.docs
        .map(doc => {
          let beatDoc = doc.data();
          beatDoc.beatID = doc.id;
          return beatDoc;
        });
      return res.json({ results: beatData });
    })
    .catch(err => {
      console.log(err.message);
      return res.status(500).json({ message: err.message });
    });
});

module.exports = router;
