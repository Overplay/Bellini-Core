/**
 * Created by ryanhartzell on 5/11/17.
 */

app.component('venueUsers', {

    bindings:   {
        managers: '=',
        owners: '='
    },
    controller: function ( ) {
        var ctrl = this;
    },

    template: `
    <h2>Owners</h2>
    <h3 ng-hide="$ctrl.owners.length">This venue has no owners</h3>

    <table class="table table-striped top15" ng-show="$ctrl.owners.length">
        <thead>
        <tr>
            <td>Name</td>
            <td></td>
            <td></td>
        </tr>
        </thead>
        <tbody>
        <tr ng-repeat="user in $ctrl.owners">
            <td>{{user.firstName}}&nbsp;{{user.lastName}}</td>
            <td>
                <button class="btn btn-sm btn-danger pull-right" ng-disabled="$ctrl.owners.length <= 1">Remove
                </button>
            </td>
            <td width="10%"><a class="btn btn-sm btn-warning pull-right" ui-sref="admin.edituser({id: user.id})">More
                info</a></td>
        </tr>
        </tbody>

    </table>
    
    <h2>Managers</h2>
    <h3 ng-hide="$ctrl.managers.length">This venue has no managers</h3>
    
    <table class="table table-striped top15" ng-show="$ctrl.managers.length">
        <thead>
        <tr>
            <td>Name</td>
            <td></td>
        </tr>
        </thead>
        <tbody>
        <tr ng-repeat="user in $ctrl.managers">
            <td>{{user.firstName}}&nbsp;{{user.lastName}}</td>
            <td>
                <button class="btn btn-sm btn-danger pull-right" ng-click="removeManager(user)">Remove</button>
            </td>
            <td width="10%">
                <a class="btn btn-sm btn-warning pull-right">More info</a>
            </td>
        </tr>
        </tbody>

    </table>
    
    
    `
})