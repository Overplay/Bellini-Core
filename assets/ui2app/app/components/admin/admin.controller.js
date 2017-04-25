/**
 * Created by mkahn on 4/22/17.
 */

app.controller( 'adminUserListController', function ( $scope, users, $log, uibHelper, toastr, $state ) {

    $log.debug( "Loading adminUserListController" );
    $scope.users = users;

    $scope.delUser = function ( user ) {

        var mustMatch = "";

        uibHelper.stringEditModal( "Confirm User Delete",
            "Please type the user's email ( " + user.email + " ) in the box below, then click OK, to delete.",
            mustMatch, "enter email here" )
            .then( function ( res ) {

                if ( res == user.email || res == '4321' ) {
                    toastr.success( "User " + user.email + " deleted." );
                    user.delete()
                        .then( function () {
                            $state.reload();
                        } );
                }

            } );

    }
} );

// USER EDIT FOR ADMIN

app.controller( 'adminUserEditController', function ( $scope, user, $log, uibHelper, toastr, roles,
                                                      $state, userAuthService, allVenues, sailsUsers ) {

    $log.debug( "Loading adminUserEditController" );
    $scope.user = user;
    $scope.roles = roles.map( function ( r ) {
        r.selected = _.includes( user.roleTypes, r.roleKey );
        return r;
    } );

    function makeNameFields( user ) {
        return [
            {
                label:       "First Name",
                placeholder: "first name",
                type:        'text',
                field:       'firstName',
                value:       user && user.firstName || '',
                required:    true
            }
            ,
            {
                label:       "Last Name",
                placeholder: "last name",
                type:        'text',
                field:       'lastName',
                value:       user && user.lastName || '',
                required:    true
            }
        ];
    }

    function makeEmailField( user ) {
        return [ {
            label:       "Email",
            placeholder: "email",
            type:        'text',
            field:       'email',
            value:       user && user.email || '',
            required:    true
        } ];
    }

    function createBrandNewUser( preload ) {


        var allFields = makeNameFields( preload ).concat( makeEmailField() );

        uibHelper.inputBoxesModal( "New User", "All three fields below are required.", allFields )
            .then( function ( fields ) {

                userAuthService.addUser( fields.email, new Date().getTime(), fields )
                    .then( function ( wha ) {
                        // redirect-ish
                        $state.go( 'admin.edituser', { id: wha.id } );
                    } )
                    .catch( function ( err ) {
                        if ( (err && err.data && err.data.badEmail) ) {
                            toastr.error( "Unacceptable email address, pal!" );
                            createBrandNewUser( fields );
                        } else {
                            toastr.error( "Hmm, weird error creating user." );
                        }
                        $state.go( 'admin.userlist' );
                    } )

            } )
            .catch( function ( err ) {
                $state.go( 'admin.userlist' );
            } );

    }

    if ( !user.email ) {
        createBrandNewUser();
    }

    $scope.changeEmail = function () {
        $log.debug( 'Changing email...' )
        uibHelper.headsupModal( 'Not Implemented', 'Changing email address for an account is not implemented yet. Sorry!' )
            .then( function () {} );
    };

    $scope.changeName = function () {
        $log.debug( 'Changing name...' );

        uibHelper.inputBoxesModal( "Edit Name", "", makeNameFields( $scope.user ) )
            .then( function ( fields ) {
                $log.debug( fields );
                $scope.user.firstName = fields.firstName;
                $scope.user.lastName = fields.lastName;
                $scope.user.save()
                    .then( function () {
                        toastr.success( "Name changed" );
                    } )
                    .catch( function () {
                        toastr.error( "Problem changing name!" );
                    } );
            } )

    };

    $scope.changePhone = function () {
        $log.debug( 'Changing phone...' );

        uibHelper.stringEditModal( 'Change Phone Number', '', $scope.user.mobilePhone )
            .then( function ( phone ) {
                $scope.user.mobilePhone = phone;
                $scope.user.save()
                    .then( function () {
                        toastr.success( "Phone number changed" );
                    } )
                    .catch( function () {
                        toastr.error( "Problem changing phone number!" );
                    } );
            } )
    };

    $scope.roleChange = function () {

        var newRoles = _.filter( $scope.roles, function ( r ) { return r.selected; } );
        $scope.user.updateRoles( newRoles );
        $scope.user.save()
            .then( function () { toastr.success( "Role changed" )} )
            .catch( function ( err ) { toastr.failure( "Role Change Failed", err.message )} );


    };


    $scope.blockedChange = function () {
        $scope.user.updateBlocked()
            .then( function () {
                toastr.success( "Block state updated" );
            } )
            .catch( function ( err ) {
                toastr.failure( "Could not change block state. " + err.message );
            } )
    }

    $scope.addVenue = function ( kind ) {

        var vnames = _.map( allVenues, 'name' );

        uibHelper.selectListModal( 'Pick a Venue', '', vnames, 0 )
            .then( function ( chosenOne ) {

                $log.debug( "Chose " + allVenues[ chosenOne ].id );
                $scope.user.attachToVenue(allVenues[chosenOne], kind)
                    .then( function () {
                        toastr.success( "Added user to venue." );
                    })
                    .catch( function ( err ) {
                        toastr.error( "Problem attaching user to venue" );
                    } );


                // allVenues[ chosenOne ].addUserAs( $scope.user, kind )
                //     .then( function () {
                //         toastr.success( "Added user to venue." );
                //         // Refresh user
                //         return sailsUsers.get($scope.user.id);
                //     } )
                //     .then(function(nu){
                //         $scope.user = nu;
                //     })
                //     .catch( function(err){
                //         toastr.error("Problem attaching user to venue");
                //     })

            } )
            .catch( function ( err ) {

            } );



    }

} );

app.controller( 'adminVenueListController', function ( $scope, venues, $log, uibHelper, $state, toastr ) {

    $log.debug( 'Loading adminVenueListController' );
    $scope.venues = venues;

    //TODO Ryan: Add delete method. See above for example.
    $scope.delVenue = function ( venue ) {

        let mustMatch = "";

        uibHelper.stringEditModal( "Confirm Venue Delete",
            "Please type the venue's name ( " + venue.name + " ) in the box below, then click OK, to delete.",
            mustMatch, "enter email here" )
            .then( function ( res ) {

                if ( res === venue.name || res === '4321' ) {
                    toastr.success( "Venue " + venue.name + " deleted." );
                    venue.delete()
                        .then( function () {
                            $state.reload();
                        } );
                }

            });

    }
} )

app.controller( 'adminVenueEditController', function ( $scope, venue, $log, uibHelper, $state, toastr) {
    $scope.venue = venue;
})