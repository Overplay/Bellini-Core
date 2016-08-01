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
                        return res.json(auth)
                    }
                    else {
                        //failure
                        return res.json({message: "Not found"})
                    }
                })
        }
    },

    inviteUser: function (req, res) {
        //only allow PO's to do this... still kind of a security hole though
        //don't want someone sending thousands of emails....

        var params = req.allParams()

        //check params

        MailerService.inviteEmail()
        

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



