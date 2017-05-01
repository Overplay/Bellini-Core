/**
 * Created by mkahn on 5/1/17.
 */

app.component( 'deviceBasicEditPane', {

    bindings:   {
        device:   '<',
        editable: '<'
    },
    controller: function ( $log, toastr, uibHelper, sailsVenues ) {

        var ctrl = this;

        var allVenues = [];

        ctrl.changeName = function () {
            toastr.error( "Eat me ass" );
        }

        ctrl.changeName = function () {

            uibHelper.stringEditModal( "Device Name", "Enter the new device name below.", this.device.name )
                .then( function ( name ) {
                    $log.info( "New device name chosen: " + name );
                    if ( name ) {
                        ctrl.device.name = name;
                        ctrl.device.save()
                            .then( function ( resp ) {
                                toastr.success( "Device name changed" );
                            } )
                            .catch( function ( e ) {
                                toastr.error( "Error changing device name" );
                            } );
                    } else {
                        toastr.error( "You can't have a blank event name, Sparky." );
                    }
                } )


        }

        ctrl.changeVenue = function () {

            sailsVenues.getAll()
                .then( function ( venues ) {
                    allVenues = venues;
                    var venueList = venues.map( function ( v ) {
                        return v.name;
                    } );

                    uibHelper.selectListModal( "Device Venue", "Pick the new device venue from the list below.", venueList, 0 )
                        .then( function ( idx ) {
                            $log.info( "New venue chosen: " + idx );
                            ctrl.device.atVenueUUID = venues[ idx ].uuid;
                            ctrl.device.save()
                                .then( function ( d ) {
                                    toastr.success( "Venue Changed" );
                                } )
                                .catch( function ( err ) {
                                    toastr.error( "Venue Could not be Changed" );
                                } )

                        } );

                } );
        }


    },

    template: `
              <table class="table table-striped" style="width: 80%; margin-top: 20px;">
                    <tbody>
                    <tr>
                        <td style="font-weight: bold; width: 20%;">Device Name</td>
                        <td style="text-align: left;">{{ $ctrl.device.name }}
                            <button class="btn btn-sm pull-right" ng-click="$ctrl.changeName()">CHANGE NAME</button>
                        </td>
                    </tr>

                    <tr>
                        <td style="font-weight: bold; width: 20%;">Device UDID</td>
                        <td style="text-align: left;">{{ $ctrl.device.deviceUDID }}</td>
                    </tr>
                    <tr>
                        <td style="font-weight: bold; width: 20%;">Device Database ID</td>
                        <td style="text-align: left;">{{ $ctrl.device.id }}</td>
                    </tr>
                    <tr>
                        <td style="font-weight: bold; width: 20%;">Venue Name</td>
                        <td style="text-align: left;">{{ $ctrl.device.atVenue ? $ctrl.device.atVenue.name : "Not Associated "}}
                            <button class="btn btn-sm pull-right" ng-click="$ctrl.changeVenue()">CHANGE VENUE</button>
                        </td>
                    </tr>
                    <tr>
                        <td style="font-weight: bold; width: 20%;">Venue UUID</td>
                        <td style="text-align: left;">{{ $ctrl.device.atVenue ? $ctrl.device.atVenue.uuid : "Not Associated "}}
                        </td>
                    </tr>
                    <tr>
                        <td style="font-weight: bold; width: 20%;">Venue Database ID</td>
                        <td style="text-align: left;">{{ $ctrl.device.atVenue ? $ctrl.device.atVenue.id : "Not Associated "}}
                        </td>
                    </tr>
                    <tr>
                        <td style="font-weight: bold; width: 20%;">Last Contact</td>
                        <td style="text-align: left;">{{ $ctrl.device.lastContact ? $ctrl.device.lastContact : "NEVER"}}
                        </td>
                    </tr>
                    <tr>
                    <tr>
                        <td style="font-weight: bold; width: 20%;">Software</td>
                        <td style="text-align: left;">
                            <pre>{{ $ctrl.device.software | json }}</pre>
                        </td>
                    </tr>
                    <tr>
                        <td style="font-weight: bold; width: 20%;">Hardware</td>
                        <td style="text-align: left;">
                            <pre>{{ $ctrl.device.hardware | json }}</pre>
                        </td>
                    </tr>
                    </tbody>
                </table>

          
    
    `

} );