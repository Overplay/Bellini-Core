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

    //TODO document
    getDevices: function (req, res) {
        var devices = {};
        var id;

        sails.log.debug(req.allParams())

        //TODO test params to see if getting user devices or current user 

        if (req.allParams() && req.allParams().id) //policy check too?? make sure admin
            id = req.allParams().id;
        else if (req.session && req.session.user.id)
            id = req.session.user.id;
        else
            return res.badRequest('Not logged in and no given id')
        //this query does not populate deep enough --
        // currently fixed in controller with more api calls
        User.findOne({id: id})
            .populate("ownedDevices")
            .populate("managedDevices")
            .then(function (user) {
                sails.log.debug(user)
                if (user) {
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

    },



});

