/**
 * Created by mkahn on 4/8/16.
 */

/**
 * This is the non-privileged controller
 */

addressify = function (address) {
    return address.street + ' '
        + address.city + ', '
        + address.state + ' '
        + address.zip
};

app.controller( "editUserController", function ( $scope, $log, user, toastr, nucleus, links ) {

    //TODO for anyone that can edit this particular user 
    $log.debug( "userController starting for userauth: " + user.id );
    $scope.user = user;
    $scope.userUpdate = JSON.parse(JSON.stringify(user));
    $scope.user.email = user.auth.email;


    $scope.$parent.ui.panelHeading = user.email;
    $scope.$parent.ui.pageTitle = "Edit User";

    $scope.user.newPwd1 = '';
    $scope.user.newPwd2 = '';
    $scope.user.currentPwd = '';
    $scope.$parent.ui.pageTitle = "Manage My Account";
    $scope.$parent.ui.panelHeading = user.auth.email;
    $scope.$parent.links = links;

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

app.controller("editUserAdminController", function ($scope, $http, $state, $log, user, roles, toastr, uibHelper, nucleus, links) {
    
    //TODO for admin only 
    $log.debug( "editUserAdminController starting for userauth: " + user.id );
    $scope.user = user;
    $scope.userUpdate = JSON.parse(JSON.stringify(user));
    $scope.user.newPwd = "";
    $scope.confirm = {checked: false};
    $scope.$parent.ui.panelHeading = user.email;
    $scope.$parent.ui.pageTitle = "Manage User";
    $scope.$parent.links = links;
    $scope.admin = true;

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


app.controller("editUserOwnerController", function ($scope, $http, $state, $log, user, toastr, uibHelper, nucleus, links, owned) {

    $log.debug( "editUserOwnerController starting for userauth: " + user.id );
    $scope.user = user;
    $scope.userUpdate = JSON.parse(JSON.stringify(user));
    $scope.user.newPwd = "";
    $scope.confirm = {checked: false};
    $scope.$parent.ui.panelHeading = user.email;
    $scope.$parent.ui.pageTitle = "Manage User";
    $scope.$parent.links = links;
    $scope.owner = true;
    $scope.ownedVenues = owned;
    $scope.newVenue = null;
    $scope.addressify = addressify;

    $scope.removeVenue = function (venue) {
        uibHelper.confirmModal('Remove Manager?', 'Remove ' + $scope.user.user.firstName + ' as a manager of ' + venue.name + '?' )
            .then( function (confirmed) {
                $http.post('/venue/removeManager', { params : {userId : user.user.id, venueId: venue.id}})
                    .then( function ( u ) {
                        toastr.success( "Removed as venue manager", "Success!" );
                        $scope.user.user.managedVenues.splice($scope.user.user.managedVenues.indexOf(venue), 1);
                        if (!$scope.user.user.managedVenues.length)
                            $state.go('user.managerList');
                    })
                    .catch( function (err) {
                        toastr.error( "Something went wrong", "Error!" );
                    })
            })

    }

    $scope.addVenue = function () {
        var dup = false;
        if ($scope.newVenue) {
            //TODO change to lodash findIndex
            angular.forEach($scope.user.user.managedVenues, function(venue) {
                if (venue.id === $scope.newVenue.id) {
                    toastr.error("User already manages this venue", "Error!");
                    dup = true;
                    $scope.newVenue = null;
                }
            })
            if (!dup) {
                $http.post('/venue/addManager', {params : { userId: user.user.id, venueId: $scope.newVenue.id }})
                    .then( function ( u ) {
                        toastr.success( "Manager added to venue", "Success!");
                        $scope.user.user.managedVenues.push($scope.newVenue);
                        $scope.newVenue = null;
                    })
                    .catch( function (err) {
                        toastr.error( "There was a problem adding the manager", "Error!");
                    })
            }
        }
    }
} );

app.controller( "addUserController", function ( $scope, $state, $log, toastr, nucleus, links ) {

    $log.debug( "addUserController starting.");
    $scope.user = {};
    $scope.$parent.ui = { pageTitle: "Add User", panelHeading: "" };
    $scope.$parent.links = links;

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

app.controller( 'listUserController', function ( $scope, $state, $log, nucleus, users, links, admin ) {
    $scope.users = users;
    $scope.$parent.links = links;
    $scope.$parent.ui.pageTitle = admin ? "Users" : "Venue Managers";
    $scope.$parent.ui.panelHeading = "";
    $scope.admin = admin;
});