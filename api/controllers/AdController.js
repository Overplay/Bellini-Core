/**
 * AdvertisementController
 *
 * @description :: Server-side logic for managing Advertisements
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

var _ = require('lodash')

module.exports = {

    //todo add rest endpoints for boxes to call for ad stuff? 

    /*
     getMedia returns the media objects of an advertisement
     It steps through the array of media ids and finds the Media entries with those ids and pushes them to a returned array 
     */
    getMedia: function (req, res) {

        if (!req.allParams().id) {
            return res.badRequest("no id");
        }
        var chain = Promise.resolve();

        Ad.findOne(req.allParams().id)
            .then(function (a) {
                /*
                 var medias = [];


                 a.marr.forEach(function (m) {
                 chain = chain.then(function () {
                 return Media.findOne(m)
                 .then(function (media) {
                 medias.push(media);
                 })
                 })

                 });
                 */
                var media = a.media;
                sails.log.debug(media)
                _.forEach(media, function (val, key) {
                    if (val != null) {
                        chain = chain.then(function () {
                            return Media.findOne(val)
                                .then(function (m) {
                                    sails.log.debug(m)
                                    media[key] = m;
                                })
                        })
                    }

                })

                chain = chain.then(function () {
                    sails.log.debug(media)
                    return res.json(media);
                });
            })
            .catch(function (err) {
                //something bad
                sails.log.debug(err);
                res.serverError(err);
            })

    }

};

