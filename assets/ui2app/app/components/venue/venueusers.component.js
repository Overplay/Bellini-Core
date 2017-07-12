/**
 * Created by ryanhartzell on 5/11/17.
 */

app.component('venueUsers', {

    bindings:   {
        venue: '=',
        users: '<'
    },
    controller: function ( uibHelper, toastr, $filter ) {
        var ctrl = this;

        this.$onInit = function () {
            ctrl.allUsers = _.sortBy(ctrl.users, ['lastName',  'firstName', 'email']);
        }


        this.addUser = function (type) {
            var exclude = type === 'manager' ? ctrl.venue.venueManagers : ctrl.venue.venueOwners;
            var options = _.differenceBy(ctrl.allUsers, exclude, function (o) { return o.id; });
            var strings = _.map(options, function (o) { return o.lastName + ", " + o.firstName + " - " + o.email});


            var params = {
                title: type === 'manager' ? 'Add Manager' : 'Add Owner',
                body: "Select a user to add as a" + (type === 'manager' ? " manager" : "n owner"),
                choices: strings,
                selected: null
            }

            uibHelper.selectListModal(params.title, params.body, params.choices, params.selected)
                .then( function (result) {
                    ctrl.venue.addUserAs(options[result], type)
                        .then( function (newVenue) {
                            ctrl.venue = newVenue;
                            toastr.success("User successfully added as a " + type);
                        })
                })
                .catch( function (err) {

                })

        }

        this.remove = function (user, asType) {
            var confirmValue = '';

            uibHelper.stringEditModal( "Confirm",
                                       "To confirm " + asType + " removal, type the user's last name (" + user.lastName + ") below and then click OK.",
                                       confirmValue )
                .then( function ( rval ) {
                    if ( rval && rval === user.lastName ) {
                        ctrl.venue.removeUserAs(user, asType)
                            .then( function (venue) {
                                toastr.success( $filter('capitalize')(asType) + " Removed" );
                                ctrl.venue = venue;
                            } )
                    }
                    else {
                        toastr.error("Names don't match");
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
                <button class="btn btn-sm btn-danger pull-right" ng-disabled="$ctrl.venue.venueOwners.length <= 1" ng-click="$ctrl.remove(user, 'owner')">Remove
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