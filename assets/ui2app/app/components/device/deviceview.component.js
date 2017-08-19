app.component( 'deviceView', {

    bindings:   {
        device: '<',
        user:  '<'
    },
    controller: function ( $log, sailsVenues ) {
        var ctrl = this;

        ctrl.$onInit= function () {
            ctrl.device.populateVenue()
                .then( function () {
                    if (ctrl.device.atVenue.address) {
                        ctrl.device.atVenue.addressString = sailsVenues.addressStr(ctrl.device.atVenue.address);
                    }
                })
        }

    },
    template:   `
     <style>
        .info-panel {
            text-align: center;
        }
        .info-panel span {
            font-size: 40px;
            font-weight: 100;
        }
     </style>
     <div class="container">
        <div class="row">
            <div class="col-xs-12 col-sm-10 material-panel" style="min-height: 0; padding: 10px 30px;">
                <div class="col-xs-12 info-panel">
                    <h2>{{ $ctrl.device.name }}</h2>
                    <p>{{ $ctrl.device.deviceUDID }}</p>
                    <hr>
                    <h3>{{ $ctrl.device.atVenue.name }}</h3>
                    <p>{{ $ctrl.device.atVenue.addressString }}</p>
                    <br>
                    <a class="btn btn-default">LAUNCH CONTROL APP</a>
                </div>
            </div>
        </div>
    </div>
    `
} );