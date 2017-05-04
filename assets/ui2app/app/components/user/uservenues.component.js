/**
 * Created by mkahn on 4/24/17.
 */

app.component( 'userVenues', {

    bindings:   {
        user: '=',
        ring: '<',
        venues: '<'
    },
    controller: function ( uibHelper, toastr, $log, userAuthService ) {

        var ctrl = this;

        ctrl.addVenue = function ( kind ) {

            var vnames = _.map( ctrl.venues, 'name' );

            uibHelper.selectListModal( 'Pick a Venue', '', vnames, 0 )
                .then( function ( chosenOne ) {

                    $log.debug( "Chose " + ctrl.venues[ chosenOne ].id );
                    ctrl.user.attachToVenue( ctrl.venues[ chosenOne ], kind )
                        .then( function ( modifiedUser ) {
                            toastr.success( "Added user to venue." );
                            ctrl.user = modifiedUser;
                        } )
                        .catch( function ( err ) {
                            toastr.error( "Problem attaching user to venue" );
                        } );
                } )
                .catch( function ( err ) {

                } );

        }

        function doVenueRemove( venue, asType ) {

            uibHelper.confirmModal( "Confirm", "Are you sure you want to remove this user from the " + asType + " role on venue: " +
                venue.name + "?" )
                .then( function () {

                    ctrl.user.removeFromVenue( venue, asType )
                        .then( function ( user ) {
                            ctrl.user = user;
                            toastr.success( "User Removed" );
                        } )
                        .catch( function ( err ) {
                            toastr.error( "Problem removing user from venue" );
                        } );

                } )

        }

        ctrl.removeOwnedVenue = function ( venue ) {
            doVenueRemove( venue, 'owner' );
        }

        ctrl.removeManagedVenue = function ( venue ) {
            doVenueRemove( venue, 'manager' );
        }


    },

    template: `
            <h3>Managed Venues</h3>
                    <p class="highlighted-text" ng-hide="$ctrl.user.managedVenues.length">This user has no managed venues.</p>
                    <table class="table table-striped table-bordered top30"
                           ng-if="$ctrl.user.managedVenues.length">
                        <thead>
                        <tr>
                            <th>Venue</th>
                            <th>Address</th>
                            <th>Remove Manager</th>
                        </tr>
                        </thead>
                        <tbody>
                        <tr ng-repeat="venue in $ctrl.user.managedVenues">
                            <td><a ui-sref="admin.editvenue({id: venue.id})">{{ venue.name }}</a></td>
                            <td>{{ venue.address | addressify }}</td>
                            <td>
                                <button class="btn btn-sm btn-danger" ng-click="$ctrl.removeManagedVenue(venue)">
                                    Remove
                                </button>
                            </td>
                        </tr>
                        </tbody>
                    </table>
                    <button ng-if="$ctrl.ring==1" class="btn btn-sm btn-primary" ng-click="$ctrl.addVenue('manager')">
                        Add Managed Venue
                    </button>

                    <hr style="padding: 30px"/>
                    <h3>Owned Venues</h3>
                    <p class="highlighted-text" ng-hide="$ctrl.user.ownedVenues.length">This user has no owned
                        venues.</p>
                    <table class="table table-striped table-bordered top30"
                           ng-if="$ctrl.user.ownedVenues.length">
                        <thead>
                        <tr>
                            <th>Venue</th>
                            <th>Address</th>
                            <th>Remove Owner</th>
                        </tr>
                        </thead>
                        <tbody>
                        <tr ng-repeat="venue in $ctrl.user.ownedVenues">
                            <td><a ui-sref="admin.editvenue({id: venue.id})">{{ venue.name }}</a></td>
                            <td>{{ venue.address | addressify }}</td>
                            <td>
                                <button class="btn btn-sm btn-danger" ng-click="$ctrl.removeOwnedVenue(venue)">
                                    Remove
                                </button>
                            </td>
                        </tr>
                        </tbody>
                    </table>
                    <button ng-if="$ctrl.ring==1" class="btn btn-sm btn-primary" ng-click="$ctrl.addVenue('owner')">
                        Add Owned Venue
                    </button>
    
    `


} );