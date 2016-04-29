/**
 * LandingController
 *
 * @description :: Just a place to chain in a policy for the landing (home) page
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */


// MAK: For now, this is here just to test authorization

module.exports = {

    
    landing: function ( req, res ) {

        var landingPage = "landing/landingpage";

        if (sails.config.theme && sails.config.theme.themeName){
            landingPage = landingPage + "-" + sails.config.theme.themeName;
        }

        return res.view( landingPage, { layout: false, someinfo: "This is passed to locals too!" } );
    }

};

