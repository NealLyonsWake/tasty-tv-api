const express = require('express');
const passport = require('passport');
const { Review } = require('../models/review');
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

const { Movie } = require('../models/watchList');

const router = express.Router();

const usersRouter = require('./account');
router.use(usersRouter)

router.post('/requestmovie', async function (req, res) {

    const endpoint = "https://tasty-tv-api.herokuapp.com/watch/addmovie"
    const { cookies } = req
    const jwt = cookies.token
    const user = cookies.user

    const requestOptions = {
        method: 'POST',
        credentials: 'include',
        headers: {
            Accept: '*/*',
            'Content-Type': 'application/json',
            'Authorization': `jwt ${jwt}`
        },
        body: JSON.stringify({
            user: user,
            id: req.body.id,
            name: req.body.name,
            poster: req.body.poster,
            watched: req.body.watched,
            review: req.body.review,
            posted: req.body.posted
        })
    };

    if (jwt && user) {

        try {
            callToApi = await fetch(endpoint, requestOptions)
            const response = await callToApi.json()
            res.status(200).json({
                message: response.message
            })
        }

        catch (e) {
            console.log(e, "Error connecting to server")
        }

    }
    else {
        res.status(401).json({
            message: "Oops! It looks like you need to sign in!"
        })
    }
})

router.post('/addmovie', passport.authenticate("jwt", { session: false }), async function (req, res) {

    const checkExistingMovie = await Movie.findOne({ id: req.body.id, user: req.body.user })
    const checkExistingReview = await Review.findOne({ id: req.body.id, author: req.body.user })
    const review = checkExistingReview? checkExistingReview.review: req.body.review
    const posted = checkExistingReview? checkExistingReview.posted: req.body.posted

    if (!checkExistingMovie) {
        try {
            const movie = new Movie({
                user: req.body.user,
                id: req.body.id,
                name: req.body.name,
                poster: req.body.poster,
                watched: req.body.watched,
                review: review,
                posted: posted
            });
            await movie.save();
            res.status(200).json({ message: `Wow, you added the movie: ${req.body.name}, to your watch list!`});
        }
        catch (err) {
            res.status(400).json({
                message: `Oh dear, ${err}.`
            });
        }
    }
    else {
        console.log("Already exists")
        res.status(409).json({ message: `${req.body.name} is already on your watch list!`})
    }
})

router.get('/requestwatchlist', async (req, res) => {
    const endpoint = "https://tasty-tv-api.herokuapp.com/watch/getwatchlist/"
    const { cookies } = req
    const jwt = cookies.token
    const user = cookies.user

    const requestOptions = {
        method: 'GET',
        credentials: 'include',
        headers: {
            Accept: '*/*',
            'Content-Type': 'application/json',
            'Authorization': `jwt ${jwt}`
        }
    }
    if (jwt && user) {

        try {
            callToApi = await fetch(`${endpoint}${user}`, requestOptions)
            const response = await callToApi.json()
            res.send(response)
        }

        catch (e) {
            console.log(e, "Error connecting to server")
        }
    }
    else {
        res.status(401).json({
            message: "Oops! It looks like you need to sign in!"
        })
    }
})

router.get('/getwatchlist/:user', passport.authenticate("jwt", { session: false }), async function (req, res) {

    try {
        const movies = await Movie.find({ user: req.params.user });
        console.log(movies)
        return res.send(movies);

    }
    catch {
        res.status(404).json(
            { message: "Oops no user" }
        )
    }
});

router.delete('/requestdeletesingle/:id', async (req, res) => {
    const endpoint = "https://tasty-tv-api.herokuapp.com/watch/deletesingle/"
    const { cookies } = req
    const jwt = cookies.token
    const user = cookies.user
    const id = req.params.id

    const requestOptions = {
        method: 'DELETE',
        credentials: 'include',
        headers: {
            Accept: '*/*',
            'Content-Type': 'application/json',
            'Authorization': `jwt ${jwt}`
        }
    }
    if (jwt && user) {

        try {
            callToApi = await fetch(`${endpoint}${id}/${user}`, requestOptions)
            const response = await callToApi.json()
            res.send(response)
        }

        catch (e) {
            console.log(e, "Error connecting to server")
        }
    }
    else {
        res.status(401).json({
            message: "Oops! It looks like you need to sign in!"
        })
    }
})


router.delete('/deletesingle/:id/:user', passport.authenticate("jwt", { session: false }), async function (req, res) {

    try {
        const movies = await Movie.deleteOne({ id: req.params.id, user: req.params.user });
        console.log(movies)
        return res.send(movies);

    }
    catch {
        res.status(404).json(
            { message: "Oops no user" }
        )
    }
});

router.delete('/requestdeleteall', async (req, res) => {
    const endpoint = "https://tasty-tv-api.herokuapp.com/watch/deleteall/"
    const { cookies } = req
    const jwt = cookies.token
    const user = cookies.user
   
    const requestOptions = {
        method: 'DELETE',
        credentials: 'include',
        headers: {
            Accept: '*/*',
            'Content-Type': 'application/json',
            'Authorization': `jwt ${jwt}`
        }
    }
    if (jwt && user) {

        try {
            callToApi = await fetch(`${endpoint}${user}`, requestOptions)
            const response = await callToApi.json()
            res.send(response)
        }

        catch (e) {
            console.log(e, "Error connecting to server")
        }
    }
    else {
        res.status(401).json({
            message: "Oops! It looks like you need to sign in!"
        })
    }
})


router.delete('/deleteall/:user', passport.authenticate("jwt", { session: false }), async function (req, res) {

    try {
        const movies = await Movie.deleteMany({ user: req.params.user });
        console.log(movies)
        return res.send(movies);

    }
    catch {
        res.status(404).json(
            { message: "Oops no user" }
        )
    }
});


router.patch('/requestcheckwatched/:id', async (req, res) => {
    const endpoint = "https://tasty-tv-api.herokuapp.com/watch/checkwatched/"
    const { cookies } = req
    const jwt = cookies.token
    const user = cookies.user
    const id = req.params.id
    const watched = req.body.watched

    const requestOptions = {
        method: 'PATCH',
        credentials: 'include',
        headers: {
            Accept: '*/*',
            'Content-Type': 'application/json',
            'Authorization': `jwt ${jwt}`
        },
        body: JSON.stringify({
            watched: !watched
         })
    }
    if (jwt && user) {

        try {
            callToApi = await fetch(`${endpoint}${id}/${user}`, requestOptions)
            const response = await callToApi.json()
            res.send(response)
        }

        catch (e) {
            console.log(e, "Error connecting to server")
        }
    }
    else {
        res.status(401).json({
            message: "Oops! It looks like you need to sign in!"
        })
    }
})

router.patch('/checkwatched/:id/:user', passport.authenticate("jwt", { session: false }), async function (req, res) {

    try {
        const movies = await Movie.where({ id: req.params.id, user: req.params.user }).updateOne({watched: req.body.watched});
        console.log(movies)
        return res.send(movies);
   }
    catch {
        res.status(404).json(
            { message: "Oops no user" }
        )
    }
});

router.patch('/updatereview/:id/:user', async function (req, res) {
    
    try {
        const movies = await Movie.where({ id: req.params.id, user: req.params.user }).updateOne({review: req.body.review, posted: req.body.posted});
        console.log(movies)
        return res.send(movies);
   }
    catch {
        res.status(404).json(
            { message: "Oops no user" }
        )
    }
});


router.delete('/requestremovewatched', async (req, res) => {
    const endpoint = "https://tasty-tv-api.herokuapp.com/watch/removewatched/"
    const { cookies } = req
    const jwt = cookies.token
    const user = cookies.user
   
    const requestOptions = {
        method: 'DELETE',
        credentials: 'include',
        headers: {
            Accept: '*/*',
            'Content-Type': 'application/json',
            'Authorization': `jwt ${jwt}`
        }
    }
    if (jwt && user) {

        try {
            callToApi = await fetch(`${endpoint}${user}`, requestOptions)
            const response = await callToApi.json()
            res.send(response)
        }

        catch (e) {
            console.log(e, "Error connecting to server")
        }
    }
    else {
        res.status(401).json({
            message: "Oops! It looks like you need to sign in!"
        })
    }
})

router.delete('/removewatched/:user', passport.authenticate("jwt", { session: false }), async function (req, res) {

    try {
        const movies = await Movie.deleteMany({ user: req.params.user, watched: true });
        console.log(movies)
        return res.send(movies);

    }
    catch {
        res.status(404).json(
            { message: "Oops no user" }
        )
    }
});


module.exports = router;