/**
 * OGLogController
 *
 * @description :: Server-side logic for managing Oglogs
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {

    upload: function (req, res) {

        var params = req.allParams();

        return ProxyService.post(sails.config.localIp + ":2001/OGLog/upload", params)
            .then( function (data) {
                return res.json(data.body);
            })
            .catch( res.serverError )
    },

    //if device id in OGLog, include ad id? this is complicated 
    //more in the ad controller
    impressions: function (req, res) {
        return ProxyService.get(sails.config.localIp + ":2001/OGLog/impressions")
            .then( function (data) {
                return res.json(data.body);
            })
            .catch( res.serverError )
    },

    deviceHeartbeat: function (req, res) {

        return ProxyService.get(sails.config.localIp + ":2001/OGLog/deviceHeartbeat", { id: id })
            .then( function (data) {
                return res.json(data.body)
            })
            .catch( res.serverError )
    },

    getAll: function (req, res) {
        return ProxyService.get(sails.config.localIp + ":2001/OGLog/getAll")
            .then( function (data) {
                return res.json(data.body)
            })
            .catch( res.serverError )
    }


    //maybe make endpoints for each type and have it sortable 
    //like impressions could take an ad or user id and query 
};

