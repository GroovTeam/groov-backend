const { admin, db } = require('./admin');

module.exports = (req, res, next) => {
  let idToken;

  if (req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer ')) {
    idToken = req.headers.authorization.split('Bearer ')[1];
  } 
  else {
    console.error('No token');
    return res.status(401).json({ error: 'Unauthorized' });
  }

  admin.auth().verifyIdToken(idToken)
      .then((decodedToken) => {
        if (!decodedToken.email_verified && !req.body.bypass) 
          throw new Error('User email not verified');

        req.user = decodedToken;
        return db.collection('users')
        .where('uid', '==', req.user.uid)
        .get();
      })
      .then((data) => {
        // req.user.username = data.docs[0].data().username;
        req.user = data.docs[0].data();
        return next();
      })
      .catch((err) => {
        console.error('Error while verifying token', err);
        return res.status(403).json({ message: err.message });
      });
};
