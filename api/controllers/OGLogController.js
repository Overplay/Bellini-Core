/**
 * OGLogController
 *
 * @description :: Server-side logic for managing Oglogs
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {

    upload: function (req, res) {

        var params = req.allParams();


        if (!params.logType)
            return res.badRequest({error: "Missing log type"});
        if (!params.message)
            return res.badRequest({error: "Missing message"});
        if (!params.deviceUniqueId)
            return res.badRequest({error: "Missing device id"});
        if (!params.loggedAt)
            return res.badRequest({error: "Missing logged at time"});

        params.loggedAt = new Date(params.loggedAt)
        sails.log.debug(params)

        OGLog.create(params)
            .then( function (log) {
                sails.log.debug(log)
                return res.ok();
            })
            .catch( function (err) {
                return res.serverError({error: err});
            })
    },

    //if device id in OGLog, include ad id? this is complicated 
    //more in the ad controller
    impressions: function (req, res) {
        OGLog.find({logType: 'impression'})
            .then(function(logs) {
                return res.ok(logs); //all logs
            })
    },

    deviceHeartbeat: function (req, res) {

        if (!req.allParams().id)
            return res.badRequest({error: "Missing device id"});

        var id = req.allParams().id;

        OGLog.find({logType: 'heartbeat'})
            .sort('loggedAt DESC')
            .then( function (logs) {
                var venueLogs = _.filter(logs, function (o) { return o.deviceUniqueId === id });
                return res.json(venueLogs);
            })
            .catch(function(err){
                return res.serverError({error: err})
            })
    },


    getAll: function (req, res) {
        OGLog.find()
            .then(function (logs) {
                return res.ok(logs)
            })
    }


    //maybe make endpoints for each type and have it sortable 
    //like impressions could take an ad or user id and query 
};

