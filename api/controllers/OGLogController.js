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
            res.badRequest("Missing log type");
        if (!params.message)
            res.badRequest("Missing message");

        OGLog.create(params)
            .then( function (log) {
                res.ok();
            })
            .catch( function (err) {
                res.serverError(err);
            })
    }
};

