/**
 * SMSController
 *
 * @description :: Server-side logic for managing SMS
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
	


  /**
   * `SMSController.notify()`
   */
    notify: function (req, res) {
        var params = req.allParams();

        if (!params.destination)
            return res.badRequest("Missing destination phone number");
        if (!params.deviceId)
            return res.badRequest("Missing device ID");
        if (!params.payload)
            return res.badRequest("Missing message body");
        // if (!params.jwt)
        //     return res.badRequest("Missing JWT");

        if (!isNaN(params.destination) && params.destination.charAt(0) !== '+')
            return res.badRequest("Invalid destination");

        if (params.destination.length == 10)
            params.destination = "+1" + params.destination;

        return TwilioService.sendText(params.destination, params.payload)
            .then( function (message) {
                return res.ok();
            })
            .catch( function (err) {
                return res.serverError(err);
            })

    }
};

