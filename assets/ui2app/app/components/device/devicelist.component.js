app.component( 'deviceList', {

    bindings:   {
        devices: '<',
        header: '<',
        user:   '<'
    },
    controller: function ( uibHelper, toastr, $state, $log ) {
        $log.debug("loading deviceList component");

        var ctrl = this;

        this.$onInit = function () {
            _.forEach(ctrl.devices, function (d) {
                d.populateVenue();
            })
        }

    },
    template:   `

    <div class="container">
    <div class="row">
        <div class="col-sm-10 col-lg-10 material-panel">
            <h1><i class="fa fa-television" aria-hidden="true" style="color: #999999"></i>&nbsp;&nbsp;{{ $ctrl.header }}</h1>

            <div ng-if="$ctrl.devices.length">
                <input type="text" ng-model="$ctrl.searchTerm" class="form-control" placeholder="Search devices...">
                <table class="table table-striped" ng-if="$ctrl.devices.length">
                    <thead>
                    <tr>
                        <th>Name</th>
                        <th>UDID</th>
                        <th>Venue</th>
                        <th></th>
                    </tr>
                    </thead>
                    <tbody>
                    <tr ng-repeat="d in $ctrl.devices | orderBy: 'name' | filter:searchTerm">
                        <td width="30%">{{ d.name }}</td>
                        <td width="30%">{{ d.deviceUDID }}</td>
                        <td width="30%"><a ui-sref="admin.editvenue({ id: d.atVenue.id })">{{ d.atVenue.name }}</a></td>
                        <td>
                            <a ui-sref="admin.deviceview({ id: d.deviceUDID })" style="margin-right: 10px;" ng-if="$ctrl.user.isAnyManager"
                               class="btn btn-sm btn-primary pull-right"><i class="fa fa-pencil-square-o" aria-hidden="true"></i>&nbspDETAILS</a>
                        </td>
                    </tr>
                    </tbody>
                </table>
            </div>

            <h3 ng-if="!$ctrl.devices.length" style="text-align: center; padding-bottom: 10px;">No Devices</h3>

        </div>
    </div>
</div>

    `
});