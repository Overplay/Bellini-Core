/**
 * LandingController
 *
 * @description :: Just a place to chain in a policy for the landing (home) page
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */


const fs = require('fs');



module.exports = {

    
    landing: function ( req, res ) {

        const landingPage = "landing/landingpage" + ThemeService.getTheme();
        const debugFlagPath = __dirname + '/../../debug.txt';
        const productionSite = !fs.existsSync( debugFlagPath );

        return res.view( landingPage, { layout: false, production: productionSite, someinfo: "This is passed to locals too!" } );
    }

};

