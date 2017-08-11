/**
 * Created by mkahn on 8/8/17.
 */

app.component( 'venueList', {

    bindings:   {
        venues: '<',
        header: '<',
        user:   '<'
    },
    controller: function ( uibHelper, toastr, $state, $log ) {
        $log.debug("loading venueList component");

        var ctrl = this;

        this.$onInit = function () {
        }

    },
    template:   `

    <div class="container">
    <div class="row">
        <div class="col-lg-10">
            <h2><i class="fa fa-globe" aria-hidden="true" style="color: #999999"></i>&nbsp;&nbsp;{{ $ctrl.header }}</h2>

            <div ng-if="$ctrl.venues.length">
                <input type="text" ng-model="$ctrl.searchTerm" class="form-control" placeholder="Search venues...">
                <table class="table table-striped" ng-if="$ctrl.venues.length">
                    <thead>
                    <tr>
                        <th>Name</th>
                        <th>Address</th>
                        <th></th>
                    </tr>
                    </thead>
                    <tbody>
                    <tr ng-repeat="v in $ctrl.venues | orderBy: 'name' | filter:searchTerm">
                        <td width="40%">{{v.name}}</td>
                        <td width="40%">{{ v.address.street + " " + (v.address.street2 || "")}}<br/>{{ v.address.city + ", " +
                            v.address.state }}
                        </td>
                        <td>
                            <a ui-sref="admin.editvenue({ id: v.id })" style="margin-right: 10px;" ng-if="$ctrl.user.isAnyManager"
                               class="btn btn-thin btn-primary"><i class="fa fa-pencil-square-o" aria-hidden="true"></i>&nbsp;EDIT</a>
                            <button class="btn btn-thin btn-danger" ng-click="delVenue(v)" ng-if="$ctrl.user.isAdmin"><i class="fa fa-times-circle"
                                                                                            aria-hidden="true"></i>&nbsp;DELETE
                            </button>
                        </td>
                    </tr>
                    </tbody>
                </table>
            </div>

            <h3 ng-if="!$ctrl.venues.length" style="text-align: center; padding-bottom: 10px;">No Venues</h3>

        </div>
    </div>
</div>

    `
});