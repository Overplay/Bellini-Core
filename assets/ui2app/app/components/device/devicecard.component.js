/**
 * Created by mkahn on 4/24/17.
 */

app.component( 'deviceCard', {

    bindings:   {
        device: '<'
    },
    controller: function () {

        var ctrl = this;


        function update() {
            ctrl.device.populateVenue();
        }

        ctrl.$onChanges = update;


    },

    template: `
        <div class="device-card">
            <div class="dccell dc-icon"><i class="fa fa-television" aria-hidden="true"></i></div>
            <div class="dccell dc-udid">{{ $ctrl.device.deviceUDID }}</div>
            <div class="dccell dc-name">{{ $ctrl.device.name }}</div>
            <div class="dccell dc-venue">{{ $ctrl.device.atVenue.name }}</div>
        </div>  
    `

} );