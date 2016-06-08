/**
 * UserController.js
 *
 * @module      :: Controller
 * @description :: Provides the base user
 *                 actions used to make waterlock work.
 *
 * @docs        :: http://waterlock.ninja/documentation
 */

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
    getDevices: function (req, res) {
        var id;

        //if an id is supplied, gets the devices for that user auth, otherwise, it gets current user devices 
        
        if (req.allParams() && req.allParams().id) //policy check too?? make sure admin
            id = req.allParams().id;
        else if (req.session && req.session.user.id)
            id = req.session.user.auth.id;
        else
            return res.badRequest('Not logged in and no given id')
        //this query does not populate deep enough --
        // currently fixed in controller with  api calls
        Auth.findOne({id: id}) //auth fix due to usercontroller in uiapp
            .then(function (auth) {
                User.findOne(auth.user)
                    .populate("ownedDevices")
                    .populate("managedDevices")
                    .then(function (user) { //NOTE: does not populate venue in devices 
                        if (user) {
                            var devices = {owned: [], managed: []};
                            devices.owned = user.ownedDevices;
                            devices.managed = user.managedDevices;
                            return res.json(devices);
                        }
                        else
                            return res.badRequest();
                    })
                    .catch(function (err) {
                        return res.serverError(err);
                    })
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
            .populate("venues")
            .then(function (user) {
                if (user) {
                    return res.json(user.venues);
                }
                else
                    return res.badRequest();
            })
            .catch(function (err) {
                return res.serverError(err);
            })
    },

    getAlist: function (req, res) {
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
    }

});

