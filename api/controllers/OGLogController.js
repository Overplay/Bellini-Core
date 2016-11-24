/**
 * OGLogController
 *
 * @description :: Server-side logic for managing Oglogs
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {

    upload: function (req, res) {

        var params = req.allParams();
        var chain = Promise.resolve();

        if (!params.logType)
            return res.badRequest({error: "Missing log type"});
        if (!params.message)
            return res.badRequest({error: "Missing message"});
        if (!params.deviceUniqueId)
            return res.badRequest({error: "Missing device id"});
        if (!params.loggedAt)
            return res.badRequest({error: "Missing logged at time"});

        params.loggedAt = new Date(params.loggedAt);
        sails.log.debug(params);

        chain = chain.then( function () {
            return OGLog.create(params)
                .then( function (log) {
                    if (log.logType == "alert") {
                        // return TwilioService.sendText('+13033249551', "RED ALERT!!!!");
                    }
                })

        });

        chain = chain.then( function () {
            return res.ok();
        })
            .catch( function (err) {
                return res.serverError({error: err});
            })

        return chain;
    },

    //if device id in OGLog, include ad id? this is complicated 
    //more in the ad controller
    impressions: function (req, res) {
        return OGLog.find({where: { logType: 'impression'}, sort: 'loggedAt DESC' })
            .then(function(logs) {
                return res.ok(logs); //all logs
            })
    },

    deviceHeartbeat: function (req, res) {

        if (!req.allParams().id)
            return res.badRequest({error: "Missing device id"});

        var id = req.allParams().id;

        return OGLog.find({ where: { logType: 'heartbeat'}, sort: 'loggedAt DESC'})
            .then( function (logs) {
                var venueLogs = _.filter(logs, function (o) { return o.deviceUniqueId == id });
                return res.json(venueLogs);
            })
            .catch(function(err){
                return res.serverError({error: err})
            })
    },

    getAll: function (req, res) {
        return OGLog.find()
            .then(function (logs) {
                return res.ok(logs)
            })
    }


    //maybe make endpoints for each type and have it sortable 
    //like impressions could take an ad or user id and query 
};
