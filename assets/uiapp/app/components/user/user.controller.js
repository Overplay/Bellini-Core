/**
 * Created by mkahn on 4/8/16.
 */

/**
 * This is the non-privileged controller
 */
app.controller( "editUserController", function ( $scope, $log, user, toastr, nucleus ) {

    $log.debug( "userController starting for userauth: " + user.id );
    $scope.user = user;
    $scope.user.email = user.auth.email;
    
    $scope.user.newPwd1 = '';
    $scope.user.newPwd2 = '';
    $scope.user.currentPwd = '';

    $scope.ui = { pwdMsg: ''};


    $scope.updateUserInfo = function () {

        nucleus.updateUser( user.id, {
                lastName:    $scope.user.lastName,
                firstName:   $scope.user.firstName,
                mobilePhone: $scope.user.mobilePhone
            } )
            .then( function ( res ) {
                toastr.success( "Account info updated", "Success!" );
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

app.controller( "editUserAdminController", function ( $scope, $state, $log, user, roles, toastr, uibHelper, nucleus ) {

    $log.debug( "editUserAdminController starting for userauth: " + user.id );
    $scope.user = user;
    $scope.user.newPwd = "";
    $scope.confirm = { checked: false };

    nucleus.getUserDevices(user.user.id, false)
        .then( function(res) {
            $scope.user.ownedDevices = res;
        })
        .then( function() {
            $scope.user.ownedDevices.forEach(function(d) {
                nucleus.getVenue(d.venue).then( function(v) {
                    d.venue = v;
                })
            })
        })
        .catch( function(err) {
            toastr.error( "Couldn't fetch owned devices", "Error!");
        });

    nucleus.getUserDevices(user.user.id, true)
        .then( function(res) {
            $scope.user.managedDevices = res;
        })
        .then( function() {
            $scope.user.managedDevices.forEach(function(d) {
                nucleus.getVenue(d.venue).then( function(v) {
                    d.venue = v;
                })
            })
        })
        .catch( function(err) {
            toastr.error( "Couldn't fetch managed devices", "Error!");
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

        nucleus.updateUser( user.user.id, modelChanges )
            .then( function ( u ) {
                toastr.success( "Account info updated", "Success!" );
                $scope.user.user = u;
            } )
            .catch( function ( err ) {
                toastr.error( "Something went wrong", "Damn!" );
            } );
        
    }

    $scope.updateUserInfo = function () {

        updateUser(
            {
                lastName:    $scope.user.user.lastName,
                firstName:   $scope.user.user.firstName,
                mobilePhone: $scope.user.user.mobilePhone
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
            function ( rejected ) {
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
            } );
    }

});