/**
 * UserController.js
 *
 * @module      :: Controller
 * @description :: Provides the base user
 *                 actions used to make waterlock work.
 *
 * @docs        :: http://waterlock.ninja/documentation
 */

var _ = require("lodash")


module.exports = require('waterlock').actions.user({
    /* e.g.
     action: function(req, res){

     }
     */

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

    ownedDevices: function (req, res) {

        User.find(req.session.user)
            .populate("ownedDevices")

    },

    //TODO document endpoint
    //ONLY DEVICES OF OWNED VENUES FOR THE PO
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
                    return res.json(user.ownedVenues); //TODO refactor all places this is called
                }
                else
                    return res.badRequest();
            })
            .catch(function (err) {
                return res.serverError(err);
            })
    },

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

    //endpoint that finds users with either first, last or email in their auth

    queryFirstLastEmail: function(req, res) {
        //TODO policies (very important so nobody malicious queries user info

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
                    sort: 'firstName DESC'
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
            return Auth.find({email: {'contains': query}})
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

        





    }

});



