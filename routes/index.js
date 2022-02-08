require('dotenv').config()
var express = require('express');
var router = express.Router();
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

const apiKey = process.env.API_KEY

let IMAGE_BASE
let IMAGE_SIZE
let pageNumber = Math.floor(Math.random() * 500) + 1

const config = async () => {
  const configReply = await fetch(`https://api.themoviedb.org/3/configuration?api_key=${apiKey}`,
    { method: 'GET' }
  )
  const configReplyJSON = await configReply.json()
  const images = configReplyJSON.images
  const { base_url, poster_sizes } = images
  IMAGE_BASE = base_url
  IMAGE_SIZE = poster_sizes[2]
}

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Neal`s ISDB API' });
});

router.get(`/recommend`, async function (req, res) {
  config()
  const movieReply = await fetch(
    `https://api.themoviedb.org/3/discover/movie?api_key=${apiKey}&language=en-US&sort_by=popularity.desc&certification_country=GB&certification.lte=18&include_adult=false&include_video=false&page=${pageNumber}&with_watch_monetization_types=flatrate`,
    { method: 'GET' }
  );
  const movieReplyJSON = await movieReply.json();
  const movies = movieReplyJSON.results;
  const movieSend = movies.map((item) => {
    return {
      id: item.id,
      title: item.title,
      posterURL: `${IMAGE_BASE}${IMAGE_SIZE}${item.poster_path}`,
      overview: item.overview
    }
  })
  pageNumber = Math.floor(Math.random() * 500) + 1;
  res.send(movieSend)
});


module.exports = router;
