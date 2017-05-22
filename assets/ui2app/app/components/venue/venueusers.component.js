/**
 * Created by ryanhartzell on 5/11/17.
 */

app.component('venueUsers', {

    bindings:   {
        venue: '='
    },
    controller: function ( uibHelper, toastr ) {
        var ctrl = this;

        this.remove = function (user, asType) {
            var confirmValue = '';

            uibHelper.stringEditModal( "Confirm",
                                       "To confirm deletion, type the user's first name (" + user.firstName + ") below and then click OK.",
                                       confirmValue )
                .then( function ( rval ) {
                    if ( rval && rval === user.firstName ) {
                        ctrl.venue.removeUserAs(user, asType)
                            .then( function (venue) {
                                toastr.success( asType.toUpperCase() + " Removed" );
                                ctrl.venue = venue;
                            } )
                    }
                } )
        }
    },

    template: `
    <h2>Owners</h2>
    <h3 ng-hide="$ctrl.venue.venueOwners.length">This venue has no owners</h3>

    <table class="table table-striped top15" ng-show="$ctrl.venue.venueOwners.length">
        <thead>
        <tr>
            <td>Name</td>
            <td></td>
            <td></td>
        </tr>
        </thead>
        <tbody>
        <tr ng-repeat="user in $ctrl.venue.venueOwners">
            <td>{{user.firstName}}&nbsp;{{user.lastName}}</td>
            <td>
                <button class="btn btn-sm btn-danger pull-right" ng-disabled="$ctrl.venue.venueOwners.length <= 1" ng-click="remove(user, 'owner')">Remove
                </button>
            </td>
            <td width="10%"><a class="btn btn-sm btn-warning pull-right" ui-sref="admin.edituser({id: user.id})">More
                info</a></td>
        </tr>
        </tbody>

    </table>
    
    <h2>Managers</h2>
    <h3 ng-hide="$ctrl.venue.venueManagers.length">This venue has no managers</h3>
    
    <table class="table table-striped top15" ng-show="$ctrl.venue.venueManagers.length">
        <thead>
        <tr>
            <td>Name</td>
            <td></td>
        </tr>
        </thead>
        <tbody>
        <tr ng-repeat="user in $ctrl.venue.venueManagers">
            <td>{{user.firstName}}&nbsp;{{user.lastName}}</td>
            <td>
                <button class="btn btn-sm btn-danger pull-right" ng-click="$ctrl.remove(user, 'manager')">Remove</button>
            </td>
            <td width="10%">
                <a class="btn btn-sm btn-warning pull-right" ui-sref="admin.edituser({id: user.id})">More info</a>
            </td>
        </tr>
        </tbody>

    </table>
    
    
    `
})