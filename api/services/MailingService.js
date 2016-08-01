/**
 * Created by cgrigsby on 8/1/16.
 */
var nodemailer = require('nodemailer');
var transport = nodemailer.createTransport(); //TODO


module.exports = {


    //sails.config.whatever options will be accessible hop;efulyl 
    inviteEmail: function (email, name, venue, role) {


        var viewVars = {
            name: name,
            venue: venue,
            role: role
        };
        viewVars.url = "URL HERE HAHAHAHAHA"; //TODO auth/signuppage url? send stuff to view?? ughhhhh maybe new route 


        var templatePath = path.normalize(); //TODO /views/inviteemail.jade
        var html = jade.renderFile(templatePath, viewVars);

        var mailOptions = {
            from: sails.config.SOMETHING, // sender address
            subject: "You have been invited to Ourglass!",
            text: html, // plaintext body
            html: html // html body
        };

        mailOptions.to = email;
        transport.sendMail(mailOptions, mailCallback);
    }
}

var mailCallback = function (error, info) {
    if (error) {
        sails.log.error("ERROR emailing!");
        sails.log.error(error);
    } else {
        sails.log.info('Message sent: ' + info.response);
    }
};


