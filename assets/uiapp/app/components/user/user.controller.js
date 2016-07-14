/**
 * Created by mkahn on 4/8/16.
 */

/**
 * This is the non-privileged controller
 */
app.controller( "editUserController", function ( $scope, $log, user, toastr, nucleus ) {

    //TODO for anyone that can edit this particular user 
    $log.debug( "userController starting for userauth: " + user.id );
    $scope.user = user;
    $scope.userUpdate = JSON.parse(JSON.stringify(user));
    $scope.user.email = user.auth.email;
    
    $scope.user.newPwd1 = '';
    $scope.user.newPwd2 = '';
    $scope.user.currentPwd = '';

    $scope.ui = { pwdMsg: ''};


    $scope.updateUserInfo = function () {

        nucleus.updateUser( user.id, {
                lastName: $scope.userUpdate.lastName,
                firstName: $scope.userUpdate.firstName,
                mobilePhone: $scope.userUpdate.mobilePhone
            } )
            .then(function (u) {
                toastr.success( "Account info updated", "Success!" );
                $scope.user = u;
                $scope.user.email = user.auth.email;
                $scope.userUpdate = JSON.parse(JSON.stringify(u));
            } )
            .catch( function ( err ) {
                toastr.error( "Something went wrong", "Damn!" );
            } );
    };
    
    $scope.pwdStatus = function(){
    
        return nucleus.getPasswordStatus( $scope.user.newPwd1, $scope.user.newPwd2 );
    };

    $scope.changePassword = function(){


        nucleus.changePassword({ email: $scope.user.email, newpass: $scope.user.newPwd1 })
            .then( function ( res ) {
                toastr.success( "Password updated", "Success!" );
            } )
            .catch( function ( err ) {
                toastr.error( "Something went wrong", "Dang!" );
            } );
    }

} );

/**
 * Created by mkahn on 4/8/16.
 */

app.controller("editUserAdminController", function ($scope, $http, $state, $log, user, roles, toastr, uibHelper, nucleus) {
    
    //TODO for admin only 
    $log.debug( "editUserAdminController starting for userauth: " + user.id );
    $scope.user = user;
    $scope.userUpdate = JSON.parse(JSON.stringify(user));
    $scope.user.newPwd = "";
    $scope.confirm = {checked: false};

    //returns devices.owned and devices.managed

    $http.get('/user/getDevices/' + $scope.user.id)
        .then(function (data) {
            var devices = data.data;
            user.ownedDevices = _.filter(devices.owned, {regCode: ''});
            user.managedDevices = _.filter(devices.managed, {regCode: ''});

            _.forEach(_.union(user.ownedDevices, user.managedDevices), function (dev) {
                $http.get('api/v1/venue/' + dev.venue)
                    .then(function (data) {
                        dev.venue = data.data;
                    })
                    .catch(function (err) {
                        toastr.error("Venue not found", "Damn!");
                    });
            })

        })
        .catch(function (err) {
            toastr.error(err, "Damn! Really not good");
        });

    $scope.proprietor = user.user.roleTypes.indexOf("proprietor.owner") > -1 || user.user.roleTypes.indexOf("proprietor.manager") > -1;

    $scope.roles = roles;
    $scope.roles = _.map( $scope.roles, function ( element ) {
        return _.assignIn( {}, element, { selected: false } );
    } );

    user.user.roleTypes.forEach( function ( r ) {

        var query = { roleName: r };

        if ( r.indexOf( '.' ) > -1 ) {
            var bits = r.split( '.' );
            query = { roleName: bits[ 0 ], subRole: bits[ 1 ] };
        }

        // add field selected to every item that is selected
        _.find( $scope.roles, query ).selected = true;

    });
        

    function updateUser( modelChanges ) {

        //TODO sync roles for cache 
        nucleus.updateUser( user.user.id, modelChanges )
            .then( function ( u ) {
                toastr.success( "Account info updated", "Success!" );
                $scope.user.user = u;
                $scope.userUpdate.user = JSON.parse(JSON.stringify(u));
            } )
            .catch( function ( err ) {
                toastr.error( "Something went wrong", "Damn!" );
            } );
        
    }

    $scope.updateUserInfo = function () {

        updateUser(
            {
                lastName: $scope.userUpdate.user.lastName,
                firstName: $scope.userUpdate.user.firstName,
                mobilePhone: $scope.userUpdate.user.mobilePhone
            } );

    };

    $scope.adminPwdChange = function () {

        nucleus.changePassword( { email: $scope.user.email, newpass: $scope.user.newPwd })
            .then( function ( res ) {
                toastr.success( "Don't forget it!", "Password Updated" );
            } )
            .catch( function ( err ) {
                toastr.error( "Code: " + err.status, "Problem Changing Password" );
            } )

    };

    $scope.adminAuthLevelChange = function () {

        var newRoles = [];
        $scope.roles.forEach( function ( r ) {
            if ( r.selected ) {
                newRoles.push( r.id );
            }
        } );

        $scope.user.user.roles = newRoles;

        updateUser(
            {
                roles: newRoles
            } );

    };


    $scope.updateBlockedState = function () {

        updateUser(
            {
                blocked: $scope.user.user.blocked
            } );

    };

    $scope.deleteUser = function () {
        uibHelper.confirmModal( "Delete User?", "Are you sure you want to delete user " + $scope.user.email, true )
            .then( function ( confirmed ) {
                if ( confirmed ) { // probably not necessary since reject should be called for cancel
                    
                    nucleus.deleteUser($scope.user)
                        .then( function () {
                            toastr.success( "See ya later!", "User Deleted" );
                            $state.go( 'admin.manageUsers' )
                        } )
                        .catch( function ( err ) {
                            toastr.error( err.status, "Problem Deleting User" );
                        } )

                    
                }

                },
                function (rejected) {
                    $scope.confirm.checked = false;
                })


    }

} );


app.controller( "addUserController", function ( $scope, $state, $log, toastr, nucleus ) {

    $log.debug( "addUserController starting.");
    $scope.user = {};

    $scope.addUser = function(){

        nucleus.addUser( $scope.user.email, $scope.user.password, {
            firstName: $scope.user.firstName,
            lastName: $scope.user.lastName,
            mobilePhone: $scope.user.mobilePhone
        })
            .then( function ( u ) {
                toastr.success( "Account added!", "Success!" );
                $state.go('user.editUserAdmin', { id: u.auth.id } );
            } )
            .catch( function ( err ) {
                toastr.error( "Something went wrong", "Damn!" );
            });
    }

});

app.controller( 'listUserController', function ( $scope, $state, $log, nucleus, managers ) {
    $scope.managers = managers;
    $scope.$parent.ui.pageTitle = "Managers";
    $scope.$parent.ui.panelHeading = "";
})