const express = require('express');
const passport = require('passport');
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

const { Comment } = require('../models/comment');

const router = express.Router();

const usersRouter = require('./account');
router.use(usersRouter)


router.post('/requestcomment', async function (req, res) {

    const { cookies } = req
    const jwt = cookies.token
    const user = cookies.user

    if (jwt && user) {

        const endpoint = "http://localhost:4000/comment/addcomment"

        const requestOptions = {
            method: 'POST',
            credentials: 'include',
            headers: {
                Accept: '*/*',
                'Content-Type': 'application/json',
                'Authorization': `jwt ${jwt}`
            },
            body: JSON.stringify({
                commentId: req.body.commentId,
                user: user,
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
        res.status(401).json({
            message: "Oops! It looks like you need to sign in!"
        })
    }
})


router.post('/addcomment', passport.authenticate("jwt", { session: false }), async function (req, res) {

        try {
            const comment = new Comment({
                commentId: req.body.commentId,
                user: req.body.user,
                comment: req.body.comment  
            });
            await comment.save();
            res.status(200).json({ message: `Cool! You added a comment!`});
        }
        catch (err) {
            res.status(400).json({
                message: `Oh dear, ${err}.`
            });
        }  
    })

    router.get('/requestretrievecomments/:_id', async (req, res) => {
        const endpoint = "http://localhost:4000/comment/retrievecomments/"
        const { cookies } = req
        const jwt = cookies.token
           
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
                callToApi = await fetch(`${endpoint}${req.params._id}`, requestOptions)
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
    
    router.get('/retrievecomments/:_id', passport.authenticate("jwt", { session: false }), async function (req, res) {
    
        try {
            const comments = await Comment.find({ commentId: req.params._id });
            console.log(comments)
            return res.send(comments);
    
        }
        catch {
            res.status(404).json(
                { message: "Oops no user" }
            )
        }
    });




module.exports = router;