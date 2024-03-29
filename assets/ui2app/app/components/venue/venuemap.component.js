/**
 * Created by mkahn on 8/14/17.
 */

app.component( 'venueMap', {

    // Header is optional, user can be used if something needs to be enabled/disabled based on permissions
    bindings:   {
        venues: '<',
        header: '<',
        user:   '<'
    },
    controller: function ( uibHelper, toastr, $state, $log ) {
        $log.debug( "loading venueMap component" );

        var ctrl = this;

        ctrl.map = { center: { latitude: 45, longitude: -73 }, zoom: 8 };

        this.$onInit = function () {
            $log.debug('venueMap $onInit called');
        }

    },
    template:   `

    <div class="container">
    <div class="row">
        <div class="col-lg-10">
            <h2><i class="fa fa-globe" aria-hidden="true" style="color: #999999"></i>&nbsp;&nbsp;{{ $ctrl.header || 'Venue Map' }}</h2>

            <p>{{ $ctrl.venues.length }} venues found, now map them!</p>

            <!-- Google Map goes here -->
            <ui-gmap-google-map center='$ctrl.map.center' zoom='$ctrl.map.zoom'></ui-gmap-google-map>
            
        </div>
    </div>
</div>

    `
} );