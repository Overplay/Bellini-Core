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
     <div class="container">
            <div class="row">
                <div class="col-sm-10 col-lg-10 material-panel">
                    <h2><i class="fa fa-building" aria-hidden="true" style="color: #999999"></i>&nbsp;&nbsp;{{ $ctrl.venue.name }}</h2>
                    <google-map address="$ctrl.venue.address" geolocation="$ctrl.venue.geolocation" name="$ctrl.venue.name"></google-map>
                    <div style="margin: 20px; border: 1px solid #d0d0d0; border-radius: 3px; padding: 10px;">
                    <table class="table table-striped table-bordered top15">
                            <tbody>
                            <tr>
                                <td>Venue Name</td>
                                <td>{{ $ctrl.venue.name }}</td>
                            </tr>
                            <tr>
                                <td>UUID</td>
                                <td>{{ $ctrl.venue.uuid }}
                                </td>
                            </tr>
                            <tr ng-show="$ctrl.venue.logo">
                                <td>Logo</td>
                                <td></td>
                            </tr>
                            <tr>
                                <td>Address</td>
                                <td>{{ $ctrl.venue.addressString() }}</td>
                            </tr>
                            <tr>
                                <td>Shown in Mobile App</td>
                                <td>
                                            {{ $ctrl.venue.showInMobileApp ? 'YES' : 'NO'}}
                                </td>
                            </tr>
                            <!--<tr>-->
                                <!--<td>Hidden from Public</td>-->
                                <!--<td>-->
                                    <!--<div class="checkbox" style="margin: 0;">-->
                                        <!--<label>-->
                                            <!--<input type="checkbox" ng-model="$ctrl.venue.hiddenFromPublic" ng-change="$ctrl.hiddenFromPublic()">-->
                                            <!--Hide-->
                                        <!--</label>-->
                                    <!--</div>-->
                                <!--</td>-->
                            <!--</tr>-->
                            <tr>
                                <td>Registered On</td>
                                <td>{{ $ctrl.venue.createdAt | date : "MMMM d, yyyy" }}</td>
                            </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    `
} );