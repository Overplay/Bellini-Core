/**
 * Created by mkahn on 4/21/17.
 */

app.factory('userAuthService', function($http, $log ){

    $log.debug("Loading userAuthService");

    function stripData(data){ return data.data; }

    service = {};

    service.getCurrentUser = function(){
        return $http.get('/user/checksession').then(stripHttpData);
    };

    // =========== ROLES ==========
    service.getRole = function ( userId ) {
        var endPoint = '/api/v1/role' + (userId ? '/' + userId : '');
        return $http.get( endPoint ).then(stripData);
    };
    
    service.getRoles = function(){
        return service.getRole();
    };

    // ========== ADDING USERS ===========
    //TODO test validate TODO handle facebookId
    service.addUser = function ( email, password, userObj, facebookId, validate ) {

        return $http.post( '/auth/newUser', {
            email:      email,
            password:   password,
            user:       userObj,
            facebookId: facebookId,
            validate:   validate
        } )
            .then( stripData );

    }

    return service;
})