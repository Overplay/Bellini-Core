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

    inviteEmail: function (email, name, venue, role) {

        var viewVars = {
            name: name,
            venue: venue.name,
            role: role
        };
        viewVars.url = inviteUrl(sails.config.mailing.inviteUrl, email, venue, role, sails.config.mailing.inviteSub)

        //awful path imo. also needs to be fixed in waterlock local auth 
        var templatePath = path.normalize(__dirname + "../../../views/emails/inviteemail.jade"); 
        var html = jade.renderFile(templatePath, viewVars);
        
        var mailOptions = {
            from: "no-reply@ourglass.tv", // sender address
            subject: "You have been invited to Ourglass!",
            text: html, // plaintext body
            html: html // html body
        };

        mailOptions.to = email;
        transport.sendMail(mailOptions, mailCallback);
    },

    inviteRole: function (email, name, venue, role) {

        var viewVars = {
            name: name,
            venue: venue.name,
            role: role
        };
        viewVars.url = inviteUrl(sails.config.mailing.inviteRoleUrl, email, venue, role, sails.config.mailing.roleSub)
        var templatePath = path.normalize(__dirname + "../../../views/emails/inviterole.jade");
        var html = jade.renderFile(templatePath, viewVars);

        var mailOptions = {
            from: "no-reply@ourglass.tv", // sender address
            subject: "You have been invited to manage a venue",
            text: html, // plaintext body
            html: html // html body
        };

        mailOptions.to = email;
        //front end assumes email sends without issues, might need to handle this at some point
        transport.sendMail(mailOptions, mailCallback);


    },

    adReviewNotification: function (email) {
        viewVars = {
            url: sails.config.mailing.login
        }

        var templatePath = path.normalize(__dirname + "../../../views/emails/adreview.jade");
        var html = jade.renderFile(templatePath, viewVars);

        var mailOptions = {
            from: "no-reply@ourglass.tv", // sender address
            subject: "You have an Advertisement to review",
            text: html, // plaintext body
            html: html // html body
        };


        User.find()
            .populate('auth')
            .then(function (users) {
                return _.filter(users, function (u) {
                    return RoleCacheService.hasAdminRole(u.roles)
                })
            })
            .then(function (us) {
                sails.log.debug(us)
                var emails = "";
                us.forEach(function (u) {
                    emails += u.auth.email + ","
                })
                return emails;
            })
            .then(function (e) {
                mailOptions.to = 'cole.grigsby@gmail.com'//e; TODO
                transport.sendMail(mailOptions, mailCallback);
            })

    },

    adRejectNotification: function (userId, name, reason) {

        viewVars = {
            url: sails.config.mailing.login,
            name: name,
            reason: reason
        }

        var templatePath = path.normalize(__dirname + "../../../views/emails/adrejection.jade");
        var html = jade.renderFile(templatePath, viewVars);

        var mailOptions = {
            from: "no-reply@ourglass.tv", // sender address
            subject: "You're advertisement has been reviewed",
            text: html, // plaintext body
            html: html // html body
        };


        Auth.findOne({user: userId})
            .then(function (a) {
                if (a) {
                    mailOptions.to = 'cole.grigsby@gmail.com'//a.email TODO
                    transport.sendMail(mailOptions, mailCallback);
                }
                else return new error("Shit hit the fan")
            })        
        
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


var inviteUrl = function (url, email, venue, role, subject) {
    var issued = Date.now();
    var uuid = require('node-uuid');
    var moment = require('moment')();
    var expiration = moment.add(sails.config.jwt.expDays, 'days');


    var payload = {
        sub: subject,
        exp: expiration,
        nbf: issued,
        iat: issued,
        jti: uuid.v1(),
        email: email,
        venue: venue.id,
        role: role
    }

    var token = jwt.encode(payload, secret)

    return url + "?token=" + token;

}


