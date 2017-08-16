/**
 * Created by ryanhartzell on 5/10/17.
 */

app.component( 'googleMap', {

    bindings:   {
        address: '<',
        geolocation: '<',
        name: '<',
        zoom: '<'
    },
    controller: function (sailsVenues) {

        var ctrl = this;
        ctrl.map = {};

        this.$onInit = function () {
            ctrl.map = {
                name:     ctrl.name,
                center:   _.clone(ctrl.geolocation),
                marker:   _.clone(ctrl.geolocation),
                zoom:     ctrl.zoom || 18,
                address:  sailsVenues.addressStr(ctrl.address),
                markerId: 0,
                change:   false
            };
        };

        this.$onChanges = function (changesObj) {
            ctrl.map.change = false;
            if (changesObj.name) {
                ctrl.map.name = changesObj.name.currentValue;
            }
            if (changesObj.geolocation) {
                ctrl.map.center = _.clone(changesObj.geolocation.currentValue);
                ctrl.map.marker = _.clone(changesObj.geolocation.currentValue);
            }
            if (changesObj.address) {
                ctrl.map.address = sailsVenues.addressStr(changesObj.address.currentValue);
            }
            ctrl.map.change = true;
        }
    },

    template: `    
    <div ng-if="$ctrl.map.center && $ctrl.map.center.latitude && $ctrl.map.center.longitude">
        <ui-gmap-google-map center="$ctrl.map.center" zoom="$ctrl.map.zoom" refresh="$ctrl.map.change">
            <ui-gmap-marker idKey="$ctrl.map.markerId" coords="$ctrl.map.marker">
                <ui-gmap-window show="false">
                    <div style="text-align: center">
                        <h3>{{ $ctrl.map.name }}</h3>
                        <p style="font-size: 14px">{{ $ctrl.map.address }}</p>
                    </div>
                </ui-gmap-window>
            </ui-gmap-marker>
        </ui-gmap-google-map>
    </div>
    `
})