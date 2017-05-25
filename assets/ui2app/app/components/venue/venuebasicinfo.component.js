/**
 * Created by ryanhartzell on 4/25/17.
 */

app.component( 'venueBasicInfo', {

    bindings:   {
        venue: '=',
        ring: '<',
        geocode: '<',
        yelp: '<'
    },
    controller: function ( uibHelper, toastr, $log, dialogService ) {

        var ctrl = this;

        ctrl.changeName = function () {
            $log.debug( 'Changing name...' );

            var fields = [
                {
                    label:       "Venue Name",
                    placeholder: "venue name",
                    type:        'text',
                    field:       'name',
                    value:       ctrl.venue.name
                }

            ];

            uibHelper.inputBoxesModal( "Edit Name", "", fields )
                .then( function ( fields ) {
                    $log.debug( fields );
                    ctrl.venue.name = fields.name;
                    ctrl.venue.save()
                        .then( function () {
                            toastr.success( "Name changed" );
                        } )
                        .catch( function () {
                            toastr.error( "Problem changing name!" );
                        } );
                } );

        };

        this.changeAddress = function () {
            dialogService.addressDialog({ name: ctrl.venue.name, address: ctrl.venue.address, geolocation: ctrl.venue.geolocation },
                                        ctrl.geocode, ctrl.ring, ctrl.yelp)
                .then( function (locData) {
                    ctrl.venue.name = locData.name || ctrl.venue.name;
                    ctrl.venue.address = locData.address;
                    ctrl.venue.geolocation = locData.geolocation;
                    ctrl.venue.save()
                        .then( function () {
                            toastr.success( "Address changed" );
                        })
                        .catch( function () {
                            toastr.error( "Problem changing address" );
                        })
                })

        }

        this.showInApp = function () {
            ctrl.venue.save()
                .then( function () {
                    toastr.success("Will " + (ctrl.venue.showInMobileApp ? "" : "not ") + "be shown in mobile app");
                })
                .catch( function () {
                    toastr.error("Error saving setting");
                })
        }

    },

    template: `
        <table class="table table-striped table-bordered top15">
            <tbody>
            <tr>
                <td>Name</td>
                <td>{{ $ctrl.venue.name }}
                    <i class="fa fa-pencil-square-o ibut pull-right" aria-hidden="true"
                       ng-click="$ctrl.changeName()"></i>
                </td>
            </tr>
            <tr ng-show="$ctrl.venue.logo">
                <td>Logo</td>
                <td></td>
            </tr>
            <tr>
                <td>Address</td>
                <td>{{ $ctrl.venue.addressString() }}    
                    <i class="fa fa-pencil-square-o ibut pull-right" aria-hidden="true"
                       ng-click="$ctrl.changeAddress()"></i>
                </td>
            </tr>
            <tr>
                <td>Show in Mobile App</td>
                <td>
                    <div class="checkbox" style="margin: 0;">
                        <label>
                            <input type="checkbox" ng-model="$ctrl.venue.showInMobileApp" ng-change="$ctrl.showInApp()">
                            {{ $ctrl.venue.showInMobileApp ? 'Will be shown' : 'Will not be shown'}}
                        </label>
                    </div>
                </td>
            </tr>
            <tr>
                <td>Registered On</td>
                <td>{{ $ctrl.venue.createdAt | date : "MMMM d, yyyy" }}</td>
            </tr>
            </tbody>
        </table>
    `


});