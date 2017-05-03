/*********************************

 File:       PolicyService.js
 Function:   Common Policy Helper Functions
 Copyright:  Overplay TV
 Date:       5/3/17 9:42 AM
 Author:     mkahn


 **********************************/


module.exports = {

    isAdmin: function(req){

        return sails.config.policies.wideOpen ||
            ( req.session.authenticated && !req.session.user.auth.blocked && req.session.user.auth.ring == 1 );

    }

};