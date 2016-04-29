/**
 * AuthController
 *
 * @module      :: Controller
 * @description    :: Provides the base authentication
 *                 actions used to make waterlock work.
 *
 * @docs        :: http://waterlock.ninja/documentation
 */

module.exports = require( 'waterlock' ).waterlocked( {

    status: function ( req, res ) {

        if ( req.session && req.session.user )
            return res.json( req.session.user );
        else
            return res.forbidden();

    },

    // Show the login page from a template
    loginPage: function ( req, res ) {

        var themeExt = '';
        if ( sails.config.theme && sails.config.theme.themeName ) {
            themeExt = themeExt + '-' + sails.config.theme.themeName;
        }
        res.view( 'users/login' + themeExt );

    },

    /**
     * Does the same stuff as the built-in waterlock logout,
     * but lets us do a redirect that won't affect REST usage.
     *
     * @param req
     * @param res
     */
    logoutPage: function ( req, res ) {

        delete( req.session.user );
        req.session.authenticated = false;
        res.redirect( '/' );

    },

    changePwd: function ( req, res ) {

        var params = req.allParams();

        if ( params.newpass === undefined ) {
            // Must have a password or this is a waste of time
            res.badRequest();

        } else if ( params.email ) {

            // Email based reset
            AdminService.changePwd( { email: params.email, password: params.newpass } )
                .then( function () {
                    return res.json( { "message": "Password changed" } );
                } )
                .catch( function ( err ) {
                    return res.error( err );
                } )

        } else if ( params.resetToken ) {

            // Attempt at token based reset. Let's make sure they are really cool
            if ( params.resetToken != req.session.resetToken.token ) {
                return res.forbidden();
            }

            AdminService.changePwd( { resetToken: params.resetToken, password: params.newpass } )
                .then( function () {
                    return res.json( { "message": "Password changed" } );
                } )
                .catch( function ( err ) {
                    return res.error( err );
                } )


        } else {
            res.badRequest();
        }


    },

    addRole: function ( req, res ) {

        var params = req.allParams();

        if ( ( params.email === undefined) || (params.newpass === undefined) ) {
            res.badRequest();
        } else {
            AdminService.changePwd( params.email, params.newpass )
                .then( function () {
                    return res.json( { "message": "Password changed" } );
                } )
                .catch( function ( err ) {
                    return res.error( err );
                } )
        }

    },

    addUser: function ( req, res ) {

        var params = req.allParams();

        if ( ( params.email === undefined) || (params.password === undefined) || (params.user === undefined) )
            return res.badRequest();

        AdminService.addUser( params.email, params.password, params.user )
            .then( function ( data ) {
                return res.json( data );
            } )
            .catch( function ( err ) {
                return res.error( err );
            } )


    },

    resetPwd: function ( req, res ) {

        return res.view( 'users/resetPassword' );

    },

    validatedOk: function ( req, res ) {

        var themeExt = '';
        if ( sails.config.theme && sails.config.theme.themeName ) {
            themeExt = themeExt + '-' + sails.config.theme.themeName;
        }

        return res.view( 'users/validationOk' + themeExt );
    }


} );