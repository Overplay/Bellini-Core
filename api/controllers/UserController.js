/**
 * UserController.js
 *
 * @module      :: Controller
 * @description :: Provides the base user
 *                 actions used to make waterlock work.
 *
 * @docs        :: http://waterlock.ninja/documentation
 */

var Promise = require('bluebird');
var _ = require("lodash")
var jwt = require("jwt-simple")


module.exports = require('waterlock').actions.user({
    /* e.g.
     action: function(req, res){

     }
     */

    //searches if the email is in use
    hasAccount: function (req, res) {

        Auth.findOne({email: req.query.email})
            .then(function (auth) {
                if (auth)
                    return res.ok('found user');
                else
                    return res.notFound('no such user');

            })
            .catch(function (err) {
                return res.error(err);
            });
    },


    //ONLY DEVICES OF OWNED VENUES FOR THE PO
    //returns the devices a user has control over (exist in the users ownedVenues
    getDevices: function (req, res) {

        var id;

        if (req.allParams() && req.allParams().id)
            id = req.allParams().id; //given ID
        else if (req.session && req.session.user.id)
            id = req.session.user.id; //otherwise use current user
        else
            return res.badRequest('Not logged in and no given id')

        User.findOne({id: id})
            .populate("ownedVenues")
            .then(function (user) {
                if (user) {
                    //sails.log.debug(user)
                    var devices = [];

                    var chain = Promise.resolve()


                    user.ownedVenues.forEach(function (venue) {
                        chain = chain.then(function () {
                            return Venue.findOne({id: venue.id})
                                .populate("devices")
                                .then(function (v) {
                                    devices = _.union(devices, v.devices);
                                })
                        })
                    })

                    chain.then(function () {
                        return res.json(devices)
                    })

                }
                else
                    return res.badRequest();
            })

            .catch(function (err) {
                return res.serverError(err);
            })

    },

    getManagedDevices: function (req, res) {

        var id;

        if (req.allParams() && req.allParams().id)
            id = req.allParams().id; //given ID
        else if (req.session && req.session.user.id)
            id = req.session.user.id; //otherwise use current user
        else
            return res.badRequest('Not logged in and no given id')

        User.findOne({id: id})
            .populate("managedVenues")
            .then(function (user) {
                if (user) {
                    //sails.log.debug(user)
                    var devices = [];

                    var chain = Promise.resolve()


                    user.managedVenues.forEach(function (venue) {
                        chain = chain.then(function () {
                            return Venue.findOne({id: venue.id})
                                .populate("devices")
                                .then(function (v) {
                                    devices = _.union(devices, v.devices);
                                })
                        })
                    })

                    chain.then(function () {
                        return res.json(devices)
                    })

                }
                else
                    return res.badRequest();
            })

            .catch(function (err) {
                return res.serverError(err);
            })

    },

    //gets the owned Venues of the user
    getVenues: function (req, res) {
        var id;

        if (req.allParams() && req.allParams().id)
            id = req.allParams().id;
        else if (req.session && req.session.user.id)
            id = req.session.user.id;
        else
            return res.badRequest('Not logged in and no given id')

        User.findOne({id: id})
            .populate("ownedVenues")
            .populate("managedVenues")
            .then(function (user) {
                if (user) {
                    return res.json(user.ownedVenues);
                }
                else
                    return res.badRequest();
            })
            .catch(function (err) {
                return res.serverError(err);
            })
    },

    //gets the advertisements the user owns
    getAlist: function (req, res) { //cant have ad or advertisement in name of endpoint due to adblock
        var id;

        if (req.allParams() && req.allParams().id)
            id = req.allParams().id;
        else if (req.session && req.session.user.id)
            id = req.session.user.id;
        else
            return res.badRequest('Not logged in and no given id')

        User.findOne({id: id})
            .populate("advertisements")
            .then(function (user) {
                if (user) {
                    return res.json(user.advertisements);
                }
                else
                    return res.badRequest();
            })
            .catch(function (err) {
                return res.serverError(err);
            })
    },

    //endpoint that finds users with either firstname, lastname or email
    //Huge security hole coal wrote - might be useful for OG's to lookup users tho 
    /*queryFirstLastEmail: function(req, res) {

        var params = req.allParams();

        var query = params.query;

        var users = [];
        
        var chain = Promise.resolve();

        chain = chain.then(function() {
            return User.find(
                {
                    or: [
                        {firstName: {'contains': query}},
                        {lastName: {'contains': query}},
                    ],
                    sort: 'firstName DESC',
                    limit: 10
                })
                .populate("auth")
                .then(function (userList) {
                    users = _.unionWith(users, userList, _.isEqual)
                })
                .catch(function (err) {
                    sails.log.debug(err)
                    return res.badRequest(err)
                })
        })
        chain = chain.then(function(){
            return Auth.find({
                    email: {'contains': query}, sort: 'firstName DESC',
                    sort: 'email DESC',
                    limit: 10
                })
                .then(function(auths){
                    return auths.map(function(a){
                        return a.user;
                    })
                })
                .then(function(userIDs){
                    return User.find({id: userIDs})
                        .populate("auth")
                        .then(function(userList){
                            users = _.unionWith(users, userList, _.isEqual)
                        })
                })
        })

        chain.then(function(){
            return res.json(users)
        })


     },*/

    //only returns user ID so info is kept secure 
    findByEmail: function (req, res) {
        var params = req.allParams();

        if (!params.email) {
            res.badRequest();
        } else {
            Auth.findOne({email: params.email})
                .populate("user")
                .then(function (auth) {
                    if (auth) {
                        //success
                        return res.json({userId: auth.user.id})
                    }
                    else {
                        //failure
                        return res.json({message: "Not found"})
                    }
                })
        }
    },

    inviteUser: function (req, res) {
        var params = req.allParams()

        //check params
        if (!params.email || !params.name || !params.venue || !params.role)
            return res.badRequest();
        else {
            //assumes email sends without issues, might need to handle this at some point
            MailingService.inviteEmail(params.email, params.name, params.venue, params.role)
            return res.ok()
        }

    },

    //these two endpoints are super duper similar

    inviteRole: function (req, res) {
        //todo check auth (policies.js)

        var params = req.allParams()

        //check params
        if (!params.email || !params.name || !params.venue || !params.role)
            return res.badRequest();
        else {
            MailingService.inviteRole(params.email, params.name, params.venue, params.role)
            return res.ok()
        }
    },

    acceptRole: function (req, res) {
        if (req.allParams().token) { //TODO token expiration and what not 

            try {
                var decoded = jwt.decode(req.allParams().token, sails.config.jwt.secret)
                var _reqTime = Date.now();
                // If token is expired
                if (decoded.exp <= _reqTime)
                    return res.forbidden('Your token is expired.');
                // If token is early
                if (_reqTime <= decoded.nbf)
                    return res.forbidden('This token is early.');
                // If the subject doesn't match
                if (sails.config.mailing.roleSub !== decoded.sub)
                    return res.forbidden('This token cannot be used for this request.');

                //token passes 
                Auth.findOne({email: decoded.email})
                    .populate("user")
                    .then(function (auth) {
                        if (auth) {
                            var user = auth.user;
                            //add role and add venue 
                            var role = decoded.role == "Manager" ? "proprietor.manager" : "proprietor.owner"
                            user.roles = _.union(user.roles, [RoleCacheService.roleByName(role)])
                            if (decoded.role == "Manager")
                                user.managedVenues.add(decoded.venue)
                            else if (decoded.role == "Owner")
                                user.ownedVenues.add(decoded.venue)
                            else
                                return res.badRequest()
                            user.save(function (err) {
                                if (err)
                                    return res.serverError(err)
                                else {
                                    //log them in??
                                    //TODO feedback 
                                    return res.redirect("/auth/loginPage")
                                }

                            })
                        }
                        else //user not found hahaha fuckkkk bad token probably 
                            return res.badRequest("No user found with that email")
                            
                    })
            }
            catch (err) {
                sails.log.debug("CAUGHT: bad token req", err)
                
                return res.badRequest(err);
            }
        }
        else
            res.badRequest();

    },

    addRole: function (req, res) {

        var params = req.allParams();

        if (!params.id || !params.roleName) {
            res.badRequest();
        } else {
            User.findOne(params.id)
                .then(function (u) {
                    u.roles = _.union(u.roles, [RoleCacheService.roleByName(params.roleName)])
                    u.save(function (err) {
                        if (err)
                            return res.serverError("Add role error ")
                        else {
                            req.session.user = u
                            return res.json(u)
                        }
                    })
                })
        }

    }

});



