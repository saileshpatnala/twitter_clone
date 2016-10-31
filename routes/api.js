var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var Post = mongoose.model('Post');

//used for routes that must be authenticated
function isAuthenticated(req, res, next) {
    // if user is authenticated in the session, call the next() to call the next request handler
    // passport adds this method to request object
    // a middleware is allowed to add properties to request and response objects

    if (req.method === "GET") {
        // continue to next middleware or handler
        return next();
    }

    if (!req.isAuthenticated()) {
        // user not authenticated, redirect to login page
        res.redirect('/#login');
    }

    // user authenticated, continue to next middleware or handler
    return next();
}

// register the authentication middleware
router.use('/posts', isAuthenticated)

router.route('/posts')

    //create a new post
    .post(function(req, res){

        var post = new Post();
        post.text = req.body.text;
        post.created_by = req.body.created_by;
        post.save(function(err, post) {
            if (err) {
                return res.send(500, err);
            }
            return res.json(post);
        });
    })

    // get all posts
    .get(function(req, res){

        Post.find(function(err, posts) {
            if (err) {
                return res.send(500, err);
            }
            return res.send(posts);
        });
    });

//api for a specfic post
router.route('/posts/:id')

    // gets specified post
    .get(function(req, res) {
        Post.findById(req.params.id, function(err, post){
            if (err){
                return res.send(err);
            }
            return res.json(post);
        });
    })

    //updates specified post
    .put(function(req, res){
        Post.findById(req.params.id, function(err, post){
            if(err){
                return res.send(err);
            }

            post.username = req.body.created_by;
            post.text = req.body.text;

            post.save(function(err, post){
                if(err)
                    return res.send(err);
                return res.json(post);
            });
        });
    })

    // deletes specified post
    .delete(function(req, res){
        Post.remove({
            _id: req.params.id
        }, function(err){
            if(err)
                return res.send(err);
            return res.json("deleted");
        });
    });



module.exports = router;
