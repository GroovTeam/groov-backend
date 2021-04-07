const express = require('express');
const router = express.Router();
const { db } = require('../../util/admin');

router.get('/userexists/:username', (req, res) => {
  db.doc(`/users/${req.params.username}`).get()
  .then(userDoc => {
    return res.json({ result: userDoc.exists });
  })
  .catch(err => {
    console.log(err.message);
    return res.status(500).json({ message: err.message });
  });
});

router.get('/emailexists/:email', (req,res) => {
  const email = req.params.email;
  console.log(email);
  if(!email)
    return res.status(400).json({ message: 'Missing email param.' });

  db.collection('users')
    .where('email', '==', email)
    .limit(1)
    .get()
    .then(snapshot => {
      if(snapshot.docs[0])
        return res.json({ result: true });
      else
        return res.json({ result: false });
    })
    .catch( err => {
      console.log(err.message);
      return res.status(500).json({ message: err.message });
    });
});

module.exports = router;
