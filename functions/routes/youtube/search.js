const express = require('express');
const router = express.Router();
// const { db, admin, firebase } = require('../../util/admin');
const fetch = require('node-fetch');
const { apiKey } = require('../../config');

const baseURL = 'https://www.googleapis.com/youtube/v3';


// TODO: Configure URL parameters as we need

// Retrives a batched query of YT videos based on keywords. Can be configured further as needed.
router.post('/:query', (req, res) => {
  const query = req.params.query;
  const apiURL = `${baseURL}/search?part=snippet&key=${apiKey}&q=${query}&maxResults=20&order=viewCount&type=video`;

  // Fetch YouTube videos based on query (TODO: Cache into db for reuse)
  fetch(apiURL)
    .then(results => {
      return results.json();
    })
    .then(data => {
      // Store video url into video object
      const items = data.items;
      items.forEach(video => {
        const videoID = video.id.videoId;
        video['videoURL'] = `https://www.youtube.com/watch?v=${videoID}`;
      });

      return res.json(data.items);
    })
    .catch(err => {
      console.error(err);
      return res.send(404);
    });
});

module.exports = router;