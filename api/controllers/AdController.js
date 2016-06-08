/**
 * AdvertisementController
 *
 * @description :: Server-side logic for managing Advertisements
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {

    getMedia: function (req, res) {

        if (!req.allParams().id) {
            return res.badRequest("no id");
        }
        var chain = Promise.resolve();

        Ad.findOne(req.allParams().id)
            .then(function (a) {
                var medias = [];

                a.marr.forEach(function (m) {
                    chain = chain.then(function () {
                        return Media.findOne(m)
                            .then(function (media) {
                                medias.push(media);
                            })
                    })

                });
                chain = chain.then(function () {
                    return res.json(medias);
                });
            })
            .catch(function (err) {
                //something bad
                sails.log.debug(err);
                res.serverError(err);
            })

    }

};

