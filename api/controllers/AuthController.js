/**
 * AuthController
 *
 * @module      :: Controller
 * @description    :: Provides the base authentication
 *                 actions used to make waterlock work.
 *
 * @docs        :: http://waterlock.ninja/documentation
 */

var wl = require('waterlock-local-auth')

module.exports = require( 'waterlock' ).waterlocked( {

    //returns the session user 
    status: function ( req, res ) {

        if ( req.session && req.session.user )
            return res.json( req.session.user );
        else
            return res.forbidden();

    },

    // Show the login page from a template
    loginPage: function ( req, res ) {

        res.view('users/login' + ThemeService.getTheme());

    },

    signupPage: function (req, res) {

        res.view('users/signup' + ThemeService.getTheme());
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
        //sails.log.debug(req)
        var params = req.allParams();

        if ( ( params.email === undefined) || (params.password === undefined) || (params.user === undefined) )
            return res.badRequest();

        if (params.user.roleNames) {
            params.user.roles = [];
            async.forEach(params.user.roleNames, function (name) {
                params.user.roles.push(RoleCacheService.roleByName(name.role, name.sub))
            })
            delete params.user.roleNames;

        }

        AdminService.addUser( params.email, params.password, params.user, true ) //TRUE requires validation
            .then( function ( data ) {
                //sails.log.debug(data)
                return res.json(data)

            } )
            .catch( function ( err ) {
                //sails.log.debug(err)
                return res.badRequest( err );
            } )


    },


    signupPage: function ( req, res ) {

        return res.view('users/signup' + ThemeService.getTheme());

    },

    resetPwd: function ( req, res ) {

        return res.view('users/resetPassword' + ThemeService.getTheme());

    },

    validatedOk: function ( req, res ) {

        return res.view('users/validationOk' + ThemeService.getTheme());
    }


} );