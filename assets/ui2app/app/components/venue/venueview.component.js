/**
 * Created by mkahn on 8/10/17.
 */

// TODO: Need to flesh out the venue card which will replace the UL on the Proprietor Dash
app.component( 'venueCard', {

    bindings:   {
        venue: '='
    },
    controller: function ( $log ) {
        var ctrl = this;

    },
    template:   `
        <div class="material-panel-md">{{ $ctrl.venue.name }}</div>
    
    `
} );

app.component( 'venueView', {

    bindings:   {
        venue: '<',
        user:  '<'
    },
    controller: function ( $log ) {
        var ctrl = this;

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
                        <h2>{{ $ctrl.venue.name }}</h2>
                        <p>{{ $ctrl.venue.addressString() }}</p>
                        <hr>
                    </div>
                    <div class="col-md-3 col-xs-6 info-panel">
                        <h3>Owners</h3>
                        <span>{{$ctrl.venue.venueOwners.length}}</span>
                    </div>
                    <div class="col-md-3 col-xs-6 info-panel">
                        <h3>Managers</h3>
                        <span>{{$ctrl.venue.venueManagers.length}}</span>
                    </div>
                    <div class="col-md-3 col-xs-6 info-panel">
                        <h3>Devices</h3>
                        <span>{{$ctrl.venue.devices.length}}</span>
                    </div>
                    <div class="col-md-3 col-xs-6 info-panel">
                        <h3>Sponsorships</h3>
                        <span>{{$ctrl.venue.sponsorships.length}}</span>
                    </div>
                </div>
                <div class="col-xs-12 col-sm-10 material-panel" style="padding: 0;">
                    <!--<h2><i class="fa fa-building" aria-hidden="true" style="color: #999999"></i>&nbsp;&nbsp;{{ $ctrl.venue.name }}</h2>-->
                    <!--<p>This should be an attractive summary of the venue information. An edit button should appear only if the user-->
                    <!--has admin or owner rights for this particular venue.</p>-->
                    <google-map 
                        address="$ctrl.venue.address" 
                        geolocation="$ctrl.venue.geolocation" 
                        name="$ctrl.venue.name"
                    >
                    </google-map>                    
                </div>
                <div class="col-xs-12 col-sm-10 material-panel" style="min-height: 0px;">
                    <venue-users venue="$ctrl.venue" users="$ctrl.venue.users" control="false"></venue-users>
                </div>  
            </div>
        </div>
    `
} );