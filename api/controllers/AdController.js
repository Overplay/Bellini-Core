/**
 * AdvertisementController
 *
 * @description :: Server-side logic for managing Advertisements
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

var _ = require('lodash')
var moment = require('moment')

module.exports = {

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

                var media = a.media;
                _.forEach(media, function (val, key) {
                    if (val != null) {
                        chain = chain.then(function () {
                            return Media.findOne(val)
                                .then(function (m) {
                                    media[key] = m;
                                })
                        })
                    }

                })

                chain = chain.then(function () {
                    //sails.log.debug(media)
                    return res.ok(media);
                });
            })
            .catch(function (err) {
                //something bad
                sails.log.debug(err);
                res.serverError(err);
            })

    },

    review: function (req, res) {
        //if rejecting - send email
        var params = req.allParams();

        if (typeof params.accepted == 'undefined' || !params.id) {
            return res.badRequest("Invalid req params ")
        }
        else {
            Ad.update(params.id, {accepted: params.accepted, reviewed: true})
                .then(function (updated) {
                    if (updated.length == 1) {
                        if (params.accepted == false) { //rejected by admin 
                            MailingService.adRejectNotification(updated[0].creator, updated[0].name, "not meeting guidelines")
                        }

                        return res.json(updated[0])
                    }
                    else return res.serverError("Too many or too few ads updated")
                })
                .catch(function (err) {
                    sails.log.debug(err)
                    return res.serverError(err)
                })
        }
    },

    pauseOrResume: function (req, res) {
        var params = req.allParams();
        if (!params.id) {
            return res.badRequest("Invalid req Params")
        }
        else {
            Ad.findOne(params.id)
                .then(function (ad) {
                    ad.paused = !ad.paused;
                    ad.save(function (err) {
                        if (err) {
                            sails.log.debug("ad save err", err)
                            return res.serverError(err)
                        }
                        else
                            return res.ok(ad)
                    })
                })
        }
    },

    toggleDelete: function (req, res) {
        var params = req.allParams();
        if (!params.id) {
            return res.badRequest("Invalid req Params")
        }
        else {
            Ad.findOne(params.id)
                .then(function (ad) {
                    ad.deleted = !ad.deleted;
                    ad.save(function (err) {
                        if (err) {
                            sails.log.debug("ad save err", err)
                            return res.serverError(err)
                        }
                        else
                            return res.ok(ad)
                    })
                })
        }
    },

    forReview: function (req, res) {
        Ad.find({where: {reviewed: false}, sort: 'createdAt ASC'})
            .then(function (ads) {
                return res.ok(ads)
            })
            .catch(function (err) {
                return res.serverError(err)
            })
    },

    //use this for when an advertiser updates ads == gets sent to admin for review 
    editAd: function (req, res) {
        var params = req.allParams()

        if (!params.ad) {
            return res.badRequest({err: "no ad given for updated"})
        }
        else {
            params.ad.reviewed = false;
            params.ad.accepted = false;
            Ad.update(params.ad.id, params.ad)
                .then(function (ads) {
                    if (ads.length > 1) {
                        return res.serverError("no freaking way. multiple ads updated")
                    }
                    else {
                        MailingService.adReviewNotification("TODO EMAIL")
                        return res.ok(ads[0])
                    }
                })
                .catch(function (err) {
                    return res.serverError(err)
                })
        }

    }
    ,

    getAccepted: function (req, res) {
        Ad.find({reviewed: true, accepted: true, deleted: false})
            .then(function (ads) {
                return res.ok(ads)
            })
            .catch(function (err) {
                return res.serverError(err)
            })
    },

    //add a date filter on this or front end? 
    impressions: function (req, res) {
        var params = req.allParams();
        if (!params.id){
            return res.badRequest("No Id")
        }
        var id = params.id;

        var adLogs;
        //TODO populate venue? thatd be cool af to have that
        OGLog.find({logType: 'impression'})
            .then(function(logs) {
                adLogs = _.filter(logs, {message: {adId: id}})
                async.each(adLogs, function (log, cb) {
                        return Device.findOne(log.deviceUniqueId) //TODO this is gonna change what key is used
                            .populate('venue')
                            .then(function (dev) {
                                log.venue = dev.venue;
                                cb()
                            })
                            .catch(function (err) {
                                return cb(err)
                            })
                    },
                    function (err) {
                        if (err) {
                            return res.serverError(err)
                        }
                        else {
                            return res.ok(adLogs)

                        }

                    })
            })

            .catch(function(err){
                return res.serverError(err)
            })
    },

    //maybe an impression endpoint that does hourly counts for each ad for a certain date
    dailyCount: function (req, res) {
        var params = req.allParams()
        if (!params.date) {
            return res.badRequest("No date given")
        }
        OGLog.find({logType: 'impression', loggedAt: {'>': new Date(moment(params.date).startOf('day')), '<': new Date(moment(params.date).endOf('day'))}})
            .then(function (logs) {
                if (params.id){
                    //logs by adId TODO
                }
                //otherwise return counts for each all ads...um maybe not 
                return res.ok(logs)
            })
            .catch(function(err){
                return res.serverError(err)
            })
    }


    //impression data : sort by venue and date so its easier to chart

};

