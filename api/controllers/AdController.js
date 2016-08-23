/**
 * AdvertisementController
 *
 * @description :: Server-side logic for managing Advertisements
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

var _ = require('lodash');
var excel= require('node-excel-export');

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
        var params = req.allParams();

        if (typeof params.accepted == 'undefined' || !params.id) {
            return res.badRequest("Invalid req params ")
        }
        else {
            Ad.update(params.id, {accepted: params.accepted, reviewed: true})
                .then(function (updated) {
                    if (updated.length == 1) {
                        return res.json(updated[0])
                    }
                    else return res.serverError("Too many or too few ads updated")
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

    exportExcel: function (req, res) {

        var params = req.allParams();

        if (!req.allParams().id)
            return res.badRequest("Missing ad id");

        var styles = {
            headerDark: {
                fill: {
                    fgColor: {
                        rgb: 'FF999999'
                    }
                },
                font: {
                    sz: "14"
                },
                border: {
                    bottom: {
                        style: 'medium',
                        color: {
                            rgb: "00000000"
                        }
                    }
                },
                alignment: {
                    vertical: "center",
                    horizontal: "center"
                }
            },
            cellLight: {
                fill: {
                    fgColor: {
                        rgb: 'FFF0F0F0'
                    }
                },
                alignment: {
                    wrapText: true
                }
            },
            cellDark: {
                fill: {
                    fgColor: {
                        rgb: 'FF999999'
                    }
                }
            }
        }

        Ad.findOne({ id: req.allParams().id })
            .populate('creator')
            .then( function (ad) {

                var report = excel.buildExport(
                    [
                        {
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
                                creator: {
                                    displayName: 'Creator',
                                    width: 100,
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
                            data: [
                                {
                                    name: ad.name,
                                    description: ad.description,
                                    creator: ad.creator.firstName + " " + ad.creator.lastName,
                                    reviewed: ad.reviewed ? "True" : "False",
                                    accepted: ad.accepted ? "True" : "False",
                                    paused: ad.paused ? "True" : "False",
                                    deleted: ad.deleted ? "True" : "False"
                                }
                            ]
                        }
                    ]
                );

                res.attachment('AdReport.xlsx');
                return res.send(200, report);
            })
    }

};

