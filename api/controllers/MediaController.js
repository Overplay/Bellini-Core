/**
 * MediaController
 *
 * @description :: Server-side logic for managing Media v2
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

var util = require('util');
var verror = require('verror');
var promise = require("bluebird");


module.exports = {

    /**
     * Static method to count the # of records
     * @param req
     * @param res
     */
    count: function (req, res) {

        //Count in time window
        if (req.body && req.body.start && req.body.end) {

            var count = 0, now = Date.now();

            //TODO can't this be done with a straight query? waterline queries 
            //sails.js ex. = Model.find({ date: { '>': new Date('2/4/2014'), '<': new Date('2/7/2014') } })
            Media.find().then(function (data) {
                data.forEach(function (media) {
                    media.createdAt = new Date(media.createdAt);
                    if (media.createdAt > req.body.start && media.createdAt < req.body.end) {
                        count++;
                    }
                });

                res.ok({count: count});

            }, function (err) {

                var err1 = new verror(err, "count failed");
                err1.status = 500;
                sails.log.error(err1.message);
                res.negotiate(err1);

            })
        }
        else {

            Media.count({})
                .then(function (found) { return res.ok({count: found}) })
                .catch(function (err) {
                           var err1 = new verror(err, "count failed");
                           err1.status = 500;
                           sails.log.error(err1.message);
                           return res.negotiate(err1);

                       });


        }

    },


    upload: function (req, res) {

        var destinationFolder = require('path').resolve(sails.config.paths.media);

        var uploadOptions = {
            dirname: destinationFolder,
            maxBytes: 10 * 1024 * 1024
        };

        req.file('file').upload(uploadOptions, function whenDone(err, uploadedFiles) {

            if (err) {
                sails.log.error("Media upload error: " + util.inspect(err));
                res.serverError(err);
            }

            // If no files were uploaded, respond with an error.
            else if ((uploadedFiles === undefined) || (uploadedFiles.length === 0)) {
                res.badRequest('No file(s) uploaded.');
            }

            else {

                sails.log.silly("Processing uploaded files.");

                var ops = [];

                for (var uploadedFile in uploadedFiles) {

                    //TODO need hasOwnProperty check here?
                    var localFile = uploadedFiles[uploadedFile];

                    var mObj = {
                        path: localFile.fd,
                        file: {
                            size: localFile.size,
                            type: localFile.type
                        },
                        metadata: req.param('metadata'),
                        source: req.param('source')
                    };

                    ops.push(Media.create(mObj));
                }

                //Resolve creation of all media
                promise.all(ops)
                    .then(
                    function (newMedias) {

                        sails.log.silly("Media.create: [ " + util.inspect(_.pluck(newMedias, 'id')) + " ]");

                        if (req.param('experienceId')) {

                            var eid = req.param('experienceId');

                            Experience.update({id: req.param('experienceId')}, {media: newMedias})
                                .exec(function (err, updated) {

                                          if (updated) {
                                              res.status(201).json(updated);
                                          } else if (err) {
                                              res.negotiate(err);
                                          } else {
                                              res.serverError("oops");
                                          }


                                      });

                        } else {
                            //TODO are all these checks realy necessary?
                            if (_.isArray(newMedias) && (_.size(newMedias) === 0)) res.status(201).json({});
                            else if (_.isArray(newMedias) && (_.size(newMedias) === 1)) res.status(201).json(newMedias[0]);
                            else res.status(201).json(newMedias);
                        }

                    })
                    .catch(
                    function (err) {
                        sails.log.error("Media.create (error): " + util.inspect(err));
                        res.serverError(err);
                    });

            }

        });


    },


    download: function (req, res) {

        // This will spit out a bad request via req.bad_request
        // http://sailsjs.org/#!/documentation/reference/res/res.badRequest.html
        req.validate({
            id: 'string'
        });

        var mediaId = req.param('id');

        Media.findOne(mediaId).then(
            function (media) {

                /**
                 * Throw errors if
                 * 1: path is empty
                 * 2: file doesn't exist
                 * 3: error on read
                 */

                if (!media) {

                    var err1 = new verror("Media `%s` not found", mediaId);
                    err1.status = 404;
                    err1.propertyName = "id";
                    err1.propertyValue = mediaId;
                    return res.negotiate(err1);

                } else if (!media.path) {

                    var err1 = new verror("Media `%s` missing path. This is an error in the upload logic or a Media item was improperly modified.", mediaId);
                    err1.status = 404;
                    err1.propertyName = "path";
                    err1.propertyValue = media.path;
                    return res.negotiate(err1);

                } else {

                    var SkipperDisk = require('skipper-disk');
                    var fileAdapter = SkipperDisk(/* optional opts */);

                    // Stream the file down
                    fileAdapter.read(media.path)
                        .on('error', function (err) {

                                var err1 = new verror(err, "Download media `%s` read failed", mediaId);
                                err1.status = 500;
                                err1.propertyName = "path";
                                err1.propertyValue = media.path;
                                return res.negotiate(err1);
                            })
                        .pipe(res);
                }
            },

            function (err) {
                var err1 = new verror(err, "Download media `%s` failed", mediaId);
                err1.status = 500;
                err1.propertyName = "id";
                err1.propertyValue = mediaId;
                return res.negotiate(err1);
            }
        );
    },

    statistics: function (req, res) {

        Media.find()
            .then(
            function (media) {
                var typeAnalysis = [0, 0, 0];
                var guestMedia = {
                    lastMedia: null,
                    count:0,
                    countInLast8: 0,
                    typeAnalysis: [0,0,0]
                }, twitterMedia = {
                    lastMedia: null,
                    count:0,
                    countInLast8: 0,
                    typeAnalysis: [0,0,0]
                }, instagramMedia = {
                    lastMedia: null,
                    count:0,
                    countInLast8: 0,
                    typeAnalysis: [0,0,0]
                };
                var eightHoursAgo = new Date();
                eightHoursAgo.setHours(eightHoursAgo.getHours() - 8);
                for (var i = 0; i < media.length; i++) {
                    var mediaDate = new Date(media[i].createdAt) > eightHoursAgo;
                    if (media[i].source == "instagram"){
                        instagramMedia.count++;
                        instagramMedia.lastMedia = media[i];
                        instagramMedia.countInLast8 += mediaDate ? 1 : 0;

                        if (media[i].file != undefined && media[i].file.type) {
                            if (media[i].file.type.indexOf('image') != -1) {
                                instagramMedia.typeAnalysis[0]++;
                            }
                            else if (media[i].file.type.indexOf('video') != -1) {
                                instagramMedia.typeAnalysis[1]++;
                            }
                            else if (media[i].file.type.indexOf('audio') != -1) {
                                instagramMedia.typeAnalysis[2]++;
                            }
                        }
                    }
                    else if (media[i].source == "twitter"){
                        twitterMedia.count++;
                        twitterMedia.lastMedia = media[i];
                        twitterMedia.countInLast8 += mediaDate ? 1 : 0;

                        if (media[i].file != undefined && media[i].file.type) {
                            if (media[i].file.type.indexOf('image') != -1) {
                                twitterMedia.typeAnalysis[0]++;
                            }
                            else if (media[i].file.type.indexOf('video') != -1) {
                                twitterMedia.typeAnalysis[1]++;
                            }
                            else if (media[i].file.type.indexOf('audio') != -1) {
                                twitterMedia.typeAnalysis[2]++;
                            }
                        }
                    }
                    else{
                        guestMedia.count++;
                        guestMedia.lastMedia = media[i];
                        guestMedia.countInLast8 += mediaDate ? 1 : 0;

                        if (media[i].file != undefined && media[i].file.type) {
                            if (media[i].file.type.indexOf('image') != -1) {
                                guestMedia.typeAnalysis[0]++;
                            }
                            else if (media[i].file.type.indexOf('video') != -1) {
                                guestMedia.typeAnalysis[1]++;
                            }
                            else if (media[i].file.type.indexOf('audio') != -1) {
                                guestMedia.typeAnalysis[2]++;
                            }
                        }
                    }
                    if (media[i].file != undefined && media[i].file.type) {
                        if (media[i].file.type.indexOf('image') != -1) {
                            typeAnalysis[0]++;
                        }
                        else if (media[i].file.type.indexOf('video') != -1) {
                            typeAnalysis[1]++;
                        }
                        else if (media[i].file.type.indexOf('audio') != -1) {
                            typeAnalysis[2]++;
                        }
                    }
                }
                res.ok({typeAnalysis: typeAnalysis, count: media.length, instagramMedia: instagramMedia, twitterMedia: twitterMedia, guestMedia: guestMedia});
            })
    },

    // TODO: This is very dangerous in Asahi. Maybe we should remove?
    deleteAllEntries: function (req, res) {
        if(req.method != "DELETE"){
            res.negotiate(new verror("This endpoint is only available for DELETE"));
            return;
        }
            Media.find().then( function ( data ) {
                killMediaArrayThenRespond( data, res, 0 );
            }, res.negotiate );


    }
};

function killMediaArrayThenRespond(array, response, count){
    if(array.length){
        Media.destroy(array[0].id).then(function(data){
            array.splice(0,1);
            killMediaArrayThenRespond(array, response, count + 1);
        }, response.negotiate);
    }
    else{
        response.ok("Successfully deleted " + count + " media");
    }
}