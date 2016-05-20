/**
 * Created by mkahn on 4/9/16.
 */

/**
 *
 * Provides a wrapper for common Nucleus calls
 *
 */

(function ( window, angular ) {

    'use strict';
    angular.module( 'nucleus.service', [] )
        .factory( 'nucleus', function ( $http, $q, $rootScope, $log ) {

            var service = {};

            var _apiPath = '/api/v1';
            var _authorized = false;


            // This little chunk of code is used all the time, just different endpoints
            function apiGet( endPoint ) {

                return $http.get( endPoint )
                    .then( function ( resp ) {
                        return resp.data;
                    } );

            }

            function apiPut( endPoint, params ) {

                return $http.put( endPoint, params )
                    .then( function ( resp ) {
                        return resp.data;
                    } );

            }

            function apiPost( endPoint, params ) {

                return $http.post( endPoint, params )
                    .then( function ( resp ) {
                        return resp.data;
                    } );

            }

            function apiDelete( endPoint ) {

                return $http.delete( endPoint )
                    .then( function ( resp ) {
                        return resp.data;
                    } );

            }


            service.authorize = function ( email, pass ) {

                return $http.post( '/auth/login', { email: email, password: pass } )
                    .then( function ( resp ) {
                        $log.debug( "User is authorized." );
                        _authorized = true;
                        return resp.data;
                    } )
                    .catch( function ( err ) {
                        $log.error( "User could not be authorized." );
                        _authorized = false;
                        throw err;
                    } )

            }

            service.logout = function () {

                return $http.post( '/auth/logout' )
                    .then( function ( resp ) {
                        $log.debug( "User is logged out." );
                        _authorized = false;
                        return resp.data;
                    } )
                    .catch( function ( err ) {
                        $log.error( "User could not be logged out." );
                        _authorized = false;
                        throw err;
                    } )

            }


            service.getPasswordStatus = function( p1, p2 ) {

                var messages = [];

                if (p1.length < 8 )
                    messages.push("Password must be 8+ characters");

                if ( p1 != p2 )
                    messages.push("Passwords must match");

                // TODO: code smell
                if (messages.length > 1)
                    return { message: messages[0]+', '+messages[1], pwdOk: false}
                else if (messages.length == 1)
                    return { message: messages[0], pwdOk: false}
                else return { message: 'Looks good!', pwdOk: true};

            }
            
            service.reqNewPwd = function( email ){
            
                return $http.post( '/auth/reset', { email: email });
            }

            // TODO this should be tested to see if deleting one, deletes the other (ripple)
            service.deleteUser = function(authObj){

                if ( !authObj )
                    throw new Error( "Bad auth object" );

                return apiDelete( _apiPath+ '/auth/' + authObj.id )
                    .then( function () {
                        return apiDelete( _apiPath+ '/user/' + authObj.user.id );
                    } );


            }
            
            service.addUser = function( email, password, userObj ){
                
                return $http.post( '/auth/addUser', { email: email, password: password, user: userObj})
                    .then( function(data){
                        return data.data;
                    });
            
            }

            // =========== USERS ==========
            service.getUser = function ( userId ) {

                var endPoint = _apiPath + '/user' + (userId ? '/' + userId : '');
                return apiGet( endPoint );

            }

            service.getUserDevices = function (userId, managed) {
                if (!userId)
                    throw new Error("Bad userId");
                // if managed === true -> get managed devices, else get owned devices
                var endPoint = _apiPath + '/user/' + userId + (managed ? '/managed' : '/owned') + 'Devices';
                return apiGet(endPoint);
            }

            service.getUserVenues = function (userId) {
                if (!userId)
                    throw new Error("Bad userId");

                var endPoint = _apiPath + '/user/' + userId + '/venues';
                return apiGet(endPoint);
            }

            service.updateUser = function ( userId, newFields ) {

                if (!userId)
                    throw new Error("Bad userId");
                
                
                var endPoint = _apiPath + '/user/' + userId;
                return apiPut( endPoint, newFields );

            }

            // =========== AUTHS ==========
            service.getAuth = function ( userId ) {

                var endPoint = _apiPath + '/auth' + (userId ? '/' + userId : '');
                return apiGet( endPoint );
            }

            service.updateAuth = function ( userId, newFields ) {

                if ( !userId )
                    throw new Error( "Bad userId" );


                var endPoint = _apiPath + '/auth/' + userId;
                return apiPut( endPoint, newFields );

            }
            
            service.changePwd = function( email, newPwd, resetToken ){
            
                return $http.post('auth/changePwd', { 
                    email: email,
                    newpass: newPwd,
                    resetToken: resetToken });
                    
            }

            // TODO can a non-admin user change someone else's password?? Check in authController on Sails side.
            /**
             * Change password. Must include either email or resetToken in the params
             * @param params email or resetToken must be in the params
             * @returns {HttpPromise}
             */
            service.changePassword = function ( params ) {

                return $http.post( 'auth/changePwd', params );

            }


            service.getMe = function(){
                return $http.get('auth/status').
                    then( function(data){
                        return data.data;
                    })
            }

            service.getMyEmail = function () {
                return $http.get( 'auth/status' ).then( function ( data ) {
                    return data.data.auth.email;
                } )
            }

            // =========== ROLES ==========
            service.getRole = function ( userId ) {

                var endPoint = _apiPath + '/role' + (userId ? '/' + userId : '');
                return apiGet( endPoint );
            }

            // =========== VENUES =========
            service.getVenue = function (venueId) {
                
                var endPoint = _apiPath + '/venue' + (venueId ? '/' + venueId : '');
                return apiGet(endPoint);
            }

            // =========== DEVICES ========
            service.getDevice = function (deviceId) {

                var endPoint = _apiPath + '/device' + (deviceId ? '/' + deviceId : '');
                return apiGet(endPoint);
            } 
            
            service.updateDevice = function (deviceId, newFields) {

                if (!deviceId)
                    throw new Error("Bad deviceId");


                var endPoint = _apiPath + '/device/' + deviceId;
                return apiPut(endPoint, newFields);

            }

            service.deleteDevice = function (deviceId) {

                if (!deviceId)
                    throw new Error("Bad deviceId");

                var endPoint = _apiPath + '/device/' + deviceId;
                return apiDelete(endPoint);
            }
            return service;

        } );

})( window, window.angular );