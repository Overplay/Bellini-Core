/**
 * ActivationController
 *
 * @description :: Server-side logic for managing Activations
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {

    generateCode: function (req, res) {
        var code = Math.random().toString(36).substr(2, 6).toUpperCase();

        //need to make sure that the code is not already in use and maybe make sure
        //the code is clean 

        //create a code for the user 
        if (req.session && req.session.user) {
            //store the code in relation to the user
            return res.json({code: code});
        }

        return res.json({code: "No Code"});
    },

    registerDevice: function (req, res) {
        //get code
        //find user with that activation code
        //tie device to user
    }
};

