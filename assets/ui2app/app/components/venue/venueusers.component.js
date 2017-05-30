/**
 * Created by ryanhartzell on 5/11/17.
 */

app.component('venueUsers', {

    bindings:   {
        venue: '=',
        users: '<'
    },
    controller: function ( uibHelper, toastr ) {
        var ctrl = this;

        this.addUser = function (type) {
            var list = type === 'manager' ? ctrl.venue.venueManagers : ctrl.venue.venueOwners;
            list = _.differenceBy(ctrl.users, list, function (o) { return o.id; });
            list = _.sortBy(list, ['lastName', 'firstName', 'email']);
            list = _.map(list, function (o) { return o.lastName + ", " + o.firstName + " - " + o.email});


            var params = {
                title: type === 'manager' ? 'Add Manager' : 'Add Owner',
                body: "Select a user to add as a" + (type === 'manager' ? " manager" : "n owner"),
                choices: list,
                selected: null
            }

            uibHelper.selectListModal(params.title, params.body, params.choices, params.selected)

        }

        this.remove = function (user, asType) {
            var confirmValue = '';

            uibHelper.stringEditModal( "Confirm",
                                       "To confirm " + asType + " removal, type the user's first name (" + user.firstName + ") below and then click OK.",
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
    <h2>
        Owners
        <button class="btn btn-sm btn-success pull-right" style="display: inline-block" ng-click="$ctrl.addUser('owner')">Add Owner</button>
    </h2>

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
    <br>    
    <hr>
    
    <h2>
        Managers
        <button class="btn btn-sm pull-right btn-success" style="display: inline-block" ng-click="$ctrl.addUser('manager')">Add Manager</button>        
    </h2>
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