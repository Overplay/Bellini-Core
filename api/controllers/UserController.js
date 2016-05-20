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

        //this query does not populate deep enough
        User.findOne(req.session.user.id)
            .populate("ownedDevices")
            .populate("managedDevices")
            .then(function (user) {
                if (user) {
                    //TODO does not work cant figure out the async calls within this - cole
                    populateVenue(user.managedDevices);
                    populateVenue(user.ownedDevices);
                    devices.owned = user.ownedDevices;
                    devices.managed = user.managedDevices;
                    return res.json(devices);
                }
            })
            .catch(function (err) {
                return res.serverError(err);
            })

    },



});

//looks dumb, but it actually does stuff (id-> object)
//TODO make this work 
var populateVenue = function (devices) {
    return async.each(devices, function (device, callback) {
        Venue.findOne(device.venue)
            .then(function (venue) {
                if (!venue)
                    callback("venue not found")
                device.venue = venue;
                callback();
            })
    }, function (err) {
        if (err)
            sails.log.debug("Error in UserController populateVenue call");
    })

}