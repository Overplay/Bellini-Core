/**
 * AdvertisementController
 *
 * @description :: Server-side logic for managing Advertisements
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

var _ = require('lodash');
var excel = require('node-excel-export');
var moment = require('moment');

module.exports = {

    /*
     getMedia returns the media objects of an advertisement
     It steps through the array of media ids and finds the Media entries with those ids and pushes them to a returned array 
     */
    getMedia: function (req, res) {

        if (!req.allParams().id) {
            return res.badRequest({ "error" : "no id" });
        }
        var chain = Promise.resolve();

        return Ad.findOne(req.allParams().id)
            .then(function (a) {

                var media = a.advert.media;
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

                return chain;
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
            return res.badRequest({ "error" : "Invalid req params " })
        }
        else {
            return Ad.update(params.id, {accepted: params.accepted, reviewed: true})
                .then(function (updated) {
                    if (updated.length == 1) {
                        if (params.accepted == false) { //rejected by admin 
                            MailingService.adRejectNotification(updated[0].creator, updated[0].name, "not meeting guidelines")
                        }

                        return res.json(updated[0])
                    }
                    else return res.serverError({ "error" : "Too many or too few ads updated"})
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
            return res.badRequest({ "error" : "Invalid req Params" })
        }
        else {
            return Ad.findOne(params.id)
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
            return res.badRequest({ "error" : "Invalid req Params" })
        }
        else {
            return Ad.findOne(params.id)
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

    exportExcel: function (req, res) {

        if (!req.allParams().id)
            return res.badRequest({ "error" : "Missing ad id" });

        var id = req.allParams().id;
        var chain = Promise.resolve();
        var ad, impressions;

        var styles = {
            headerDark: {
                fill: {
                    fgColor: { rgb: 'FF999999' }
                },
                font: { sz: "14" },
                border: {
                    bottom: {
                        style: 'medium',
                        color: { rgb: "00000000" }
                    }
                },
                alignment: {
                    vertical: "center",
                    horizontal: "center"
                }
            },
            cellLight: {
                fill: {
                    fgColor: { rgb: 'FFF0F0F0' }
                },
                alignment: { wrapText: false }
            },
            cellDate: {
                fill: { fgColor: { rgb: 'FFF0F0F0' }},
                alignment: { wrapText: false },
                numFmt: "mmm d, yyyy - h:mm AM/PM"
            },
            cellDark: {
                fill: {
                    fgColor: { rgb: 'FF999999' }
                }
            }
        };

        chain = chain.then( function () {
            return Ad.findOne({id: id})
                .then( function (a) {
                    if (!a)
                        return res.error('Could not find ad');
                    else {
                        ad = a;
                        return OGLog.find({ logType: "impression" })
                            .sort('loggedAt DESC')
                            .then( function (logs) {
                                impressions = _.filter(logs, { message: { adId: id }});
                                return impressions;
                            })
                    }
                })
        });

        chain = chain.then( function () {
            if (impressions) {
                async.each(impressions, function (log, cb) {
                        return Device.findOne(log.deviceUniqueId) //TODO this is gonna change what key is used
                            .populate('venue')
                            .then(function (dev) {
                                var venue = dev.venue;
                                var addr = venue.address;
                                log.venue = venue.name +
                                    " (" + addr.street +
                                    (addr.street2 ? " " + addr.street2 : "") +
                                    " " + addr.city +
                                    ", " + addr.state +
                                    " " + addr.zip + ")";
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
                            var report = excel.buildExport(
                                [{
                                    name: 'Advertisement Info',
                                    specification: {
                                        name: {
                                            displayName: 'Name',
                                            width: 120,
                                            headerStyle: styles.headerDark,
                                            cellStyle: styles.cellLight
                                        },
                                        description: {
                                            displayName: 'Description',
                                            width: 120,
                                            headerStyle: styles.headerDark,
                                            cellStyle: styles.cellLight
                                        },
                                        reviewed: {
                                            displayName: 'Reviewed',
                                            width: 80,
                                            headerStyle: styles.headerDark,
                                            cellStyle: styles.cellLight
                                        },
                                        accepted: {
                                            displayName: 'Accepted',
                                            width: 80,
                                            headerStyle: styles.headerDark,
                                            cellStyle: styles.cellLight
                                        },
                                        paused: {
                                            displayName: 'Paused',
                                            width: 80,
                                            headerStyle: styles.headerDark,
                                            cellStyle: styles.cellLight
                                        },
                                        deleted: {
                                            displayName: 'Deleted',
                                            width: 80,
                                            headerStyle: styles.headerDark,
                                            cellStyle: styles.cellLight
                                        }
                                    },
                                    data: [{
                                        name: ad.name,
                                        description: ad.description,
                                        // creator: ad.creator.firstName + " " + ad.creator.lastName,
                                        reviewed: ad.reviewed ? "True" : "False",
                                        accepted: ad.accepted ? "True" : "False",
                                        paused: ad.paused ? "True" : "False",
                                        deleted: ad.deleted ? "True" : "False"
                                    }]
                                },
                                    {
                                        name: 'Impressions',
                                        specification: {
                                            venue: {
                                                displayName: "Venue",
                                                width: 200,
                                                headerStyle: styles.headerDark,
                                                cellStyle: styles.cellLight
                                            },
                                            loggedAt: {
                                                displayName: "Time Shown",
                                                width: 160,
                                                headerStyle: styles.headerDark,
                                                cellStyle: styles.cellDate
                                            }
                                        },
                                        data: impressions
                                    }]
                            );

                            res.attachment('AdReport.xlsx');
                            return res.send(200, report);
                        }
                    })
            }
        })

        return chain;
    },

    forReview: function (req, res) {
        return Ad.find({where: {reviewed: false}, sort: 'createdAt ASC'})
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
            return res.badRequest({ "error" : "no ad given for updated"})
        }
        else {
            params.ad.reviewed = false;
            params.ad.accepted = false;
            return Ad.update(params.ad.id, params.ad)
                .then(function (ads) {
                    if (ads.length > 1) {
                        return res.serverError({ "error" : "no freaking way. multiple ads updated" })
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
        return Ad.find({reviewed: true, accepted: true, deleted: false})
            .then(function (ads) {
                return res.ok(ads)
            })
            .catch(function (err) {
                return res.serverError(err)
            })
    },

    //TODO add a date filter on this or front end?
    impressions: function (req, res) {
        var params = req.allParams();
        if (!params.id) {
            return res.badRequest({ "error" : "No Id" })
        }
        var id = params.id;

        var adLogs;
        return OGLog.find({logType: 'impression'})
            .then(function (logs) {
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

            .catch(function (err) {
                return res.serverError(err)
            })
    },

    //maybe an impression endpoint that does hourly counts for each ad for a certain date
    dailyCount: function (req, res) { // TODO only get session users ads :)
        var params = req.allParams()
        if (!params.date) {
            return res.badRequest({ "error" : "No date given" })
        }
        var query = {
            logType: 'impression',
            loggedAt: {
                '>': moment(new Date(params.date)).startOf('day').toDate(),
                '<': moment(new Date(params.date)).endOf('day').toDate()
            }
        }
        return OGLog.find(query)
            .then(function (logs) {
                if (params.id) {
                    //logs by adId TODO
                    logs = _.filter(logs, {message: {adId: params.id}})
                }
                //otherwise return counts for each all ads...um maybe not
                async.each(logs, function (log, cb) {
                    return Ad.findOne(log.message.adId)
                        .then(function (ad) {
                            log.adName = ad.name;
                            cb()
                        })
                        .catch(function(err){
                            cb(err)
                        })
                }, function (err) {
                    if (err)
                        return res.serverError(err)
                    else {
                        logs = _.groupBy(logs, 'adName')
                        return res.ok(logs)
                    }
                })
            })

            .catch(function (err) {
                return res.serverError(err)
            })
    }


    //impression data : sort by venue and date so its easier to chart

};

