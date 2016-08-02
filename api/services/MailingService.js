/**
 * Created by cgrigsby on 8/1/16.
 */
var nodemailer = require('nodemailer');
var jade = require('jade')
var path = require('path')
var jwt = require('jwt-simple')
var secret = sails.config.jwt.secret;

var transport = nodemailer.createTransport(sails.config.mailing.emailConfig); 


module.exports = {


    //sails.config.whatever options will be accessible hop;efulyl 
    inviteEmail: function (email, name, venue, role) {

        var viewVars = {
            name: name,
            venue: venue.name,
            role: role
        };
        viewVars.url = inviteUrl(sails.config.mailing.inviteUrl, email, venue, role)
        ; //TODO auth/signuppage url? send stuff to view?? ughhhhh maybe new route

        //AWFUL awful awful. also needs to be fixed in local auth 
        var templatePath = path.normalize(__dirname + "../../../views/inviteemail.jade"); 
        var html = jade.renderFile(templatePath, viewVars);

        //TODO actual venue id probably 
        
        
        var mailOptions = {
            from: "no-reply@ourglass.tv", // sender address
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


var inviteUrl = function (url, email, venue, role) {
    var payload = {
        email: email,
        venue: venue.id,
        role: role
    }

    var token = jwt.encode(payload, secret)

    sails.log.debug(token)

    return url + "?token=" + token;

}

