var LocalStrategy   = require('passport-local').Strategy;
var bCrypt = require('bcrypt-nodejs');
var mongoose = require('mongoose');
var User = mongoose.model('User');

module.exports = function(passport){

    // Passport needs to be able to serialize and deserialize users to support persistent login sessions
    passport.serializeUser(function(user, done) {
        // tell passport which id to use for user
        console.log('serializing user:',user.username);
        // return the unique id for the user
        // _id is a unique key provided my mongodb
        return done(null, user._id);
    });

    // Deserialize user will call with the unique id provided by serializer
    passport.deserializeUser(function(id, done) {
        // return user object back

        User.findById(id, function(err, user){
            if (err) {
                return done(err, false);
            }

            if(!user) {
                return done('user not found', false)
            }
            
            // we found the user object provide it back to passport
            console.log('deserializing user: ', user.username)
            return done(null, user);
        });

    });

    passport.use('login', new LocalStrategy({
            passReqToCallback : true
        },
        function(req, username, password, done) { 
            // check in mongo if a user with username exists or not
            User.findOne({'username': username}, function(err, user){
                // in case of eny error, return using the done method
                if (err) {
                    return done(err, false);
                }

                // username does not exist, log the error and redirect back
                if (!user) {
                    return done('user not found!', false);
                }

                // user exists but wrong password, log the error
                if (!isValidPassword(user, password)) {
                    return done('incorrect password', false);
                }

                // log in successful
                return done(null, user);
            });

        }
    ));

    passport.use('signup', new LocalStrategy({
            passReqToCallback : true // allows us to pass back the entire request to the callback
        },
        function(req, username, password, done) {

            User.findOne({'username': username}, function(err, user) {

                if(err) {
                    return done(err, false);
                }

                if(user) {
                    // we have already signed this user up
                    return done('username already taken', false);
                }

                var newUser = new User();

                newUser.username = username;
                newUser.password = createHash(password);

                newUser.save(function(err, user){
                    if(err){
                        return done(err, false);
                    }
                    console.log('successfully signed up user ' + username);

                    // sign up successful
                    return done(null, user);
                });
            });

        })
    );

    var isValidPassword = function(user, password){
        return bCrypt.compareSync(password, user.password);
    };
    // Generates hash using bCrypt
    var createHash = function(password){
        return bCrypt.hashSync(password, bCrypt.genSaltSync(10), null);
    };

};
