const express = require('express');
const passport = require('passport');
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

const { Review } = require('../models/review');

const router = express.Router();

const usersRouter = require('./account');
router.use(usersRouter)


router.post('/requestreview', async function (req, res) {

    const { cookies } = req
    const jwt = cookies.token
    const user = cookies.user

    if (jwt && user) {

        const checkExistingReview = await Review.findOne({ id: req.body.id, author: user })

        if (!checkExistingReview) {

            const endpoint = "https://tasty-tv-api.herokuapp.com/review/addreview"

            const requestOptions = {
                method: 'POST',
                credentials: 'include',
                headers: {
                    Accept: '*/*',
                    'Content-Type': 'application/json',
                    'Authorization': `jwt ${jwt}`
                },
                body: JSON.stringify({
                    author: user,
                    id: req.body.id,
                    name: req.body.name,
                    poster: req.body.poster,
                    watched: req.body.watched,
                    review: req.body.review,
                    posted: req.body.posted,
                    comment: req.body.comment
                })
            }

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
            const endpoint = "http://localhost:4000/review/amendreview/"

            const requestOptions = {
                method: 'PATCH',
                credentials: 'include',
                headers: {
                    Accept: '*/*',
                    'Content-Type': 'application/json',
                    'Authorization': `jwt ${jwt}`
                },
                body: JSON.stringify({
                    review: req.body.review,
                    posted: req.body.posted
                })
            }

            try {
                callToApi = await fetch(`${endpoint}${req.body.id}/${user}`, requestOptions)
                const response = await callToApi.json()
                res.status(200).json({
                    message: response.message
                })
            }

            catch (e) {
                console.log(e, "Error connecting to server")
            }

        }
    }
    else {
        res.status(401).json({
            message: "Oops! It looks like you need to sign in!"
        })
    }
})

router.post('/addreview', passport.authenticate("jwt", { session: false }), async function (req, res) {

    // const { cookies } = req
    // const jwt = cookies.token

    try {
        const review = new Review({
            author: req.body.author,
            id: req.body.id,
            name: req.body.name,
            poster: req.body.poster,
            watched: req.body.watched,
            review: req.body.review,
            posted: !req.body.posted,
            comment: req.body.comment
        });
        await review.save();

        const endpoint = "http://localhost:4000/watch/updatereview/"

            const requestOptions = {
                method: 'PATCH',
                credentials: 'include',
                headers: {
                    Accept: '*/*',
                    'Content-Type': 'application/json',
                    // 'Authorization': `jwt ${jwt}`
                },
                body: JSON.stringify({
                    review: req.body.review,
                    posted: !req.body.posted
                })
            }

            try {
                callToApi = await fetch(`${endpoint}${req.body.id}/${req.body.author}`, requestOptions)
                const response = await callToApi.json()
                res.status(200).json({
                    message: response.message
                })
            }

            catch (e) {
                console.log(e, "Error connecting to server")
            }

        // res.status(200).json({ message: review.review });
    }
    catch (err) {
        res.status(400).json({
            message: `Oh dear, ${err}.`
        });
    }
}
)


router.patch('/amendreview/:id/:author', passport.authenticate("jwt", { session: false }), async function (req, res) {

    try {

        const review = await Review.where({ id: req.params.id, author: req.params.author }).update({ review: req.body.review });
        console.log(review)
        // return res.send(review);
        const endpoint = "http://localhost:4000/watch/updatereview/"

        const requestOptions = {
            method: 'PATCH',
            credentials: 'include',
            headers: {
                Accept: '*/*',
                'Content-Type': 'application/json',
                // 'Authorization': `jwt ${jwt}`
            },
            body: JSON.stringify({
                review: req.body.review,
                posted: !req.body.posted
            })
        }

        try {
            callToApi = await fetch(`${endpoint}${req.params.id}/${req.params.author}`, requestOptions)
            const response = await callToApi.json()
            res.status(200).json({
                message: response.message
            })
        }

        catch (e) {
            console.log(e, "Error connecting to server")
        }
    }
    catch {
        res.status(404).json(
            { message: "Oops no user" }
        )
    }
}
)

router.get('/requestreviews', async (req, res) => {
    const endpoint = "http://localhost:4000/review/retrieve/"
    const { cookies } = req
    const jwt = cookies.token
    // const user = cookies.user

    const requestOptions = {
        method: 'GET',
        credentials: 'include',
        headers: {
            Accept: '*/*',
            'Content-Type': 'application/json',
            'Authorization': `jwt ${jwt}`
        }
    }
    if (jwt) {

        try {
            callToApi = await fetch(endpoint, requestOptions)
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

router.get('/retrieve', passport.authenticate("jwt", { session: false }), async function (req, res) {

    try {
        const reviews = await Review.find({});
        console.log(reviews)
        return res.send(reviews);

    }
    catch {
        res.status(404).json(
            { message: "Oops no user" }
        )
    }
});

module.exports = router;