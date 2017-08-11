/**
 * Created by mkahn on 8/8/17.
 */

app.component( 'managerPatrons', {

    bindings:   {
        myVenues: '<',
        header:   '<',
        user:     '<'
    },
    controller: function ( uibHelper, toastr, $state, $log, $http ) {
        $log.debug( "loading managerPatrons component" );

        var ctrl = this;

        ctrl.venuePatrons = { managed: [], owned: [] };

        this.$onInit = function () {

            ctrl.myVenues.managed.forEach( function ( v ) {
                v.getUniquePatrons()
                    .then( function ( ps ) {
                        ctrl.venuePatrons.managed.push( { venue: v, patrons: ps } );
                    } )
            } )

            ctrl.myVenues.owned.forEach( function ( v ) {
                v.getUniquePatrons()
                    .then( function ( ps ) {
                        ctrl.venuePatrons.owned.push( { venue: v, patrons: ps } );
                    } )
            } )

        }

    },
    template:   `

    <div class="container">
    <div class="row">
        <div class="col-lg-10">
            <h2><i class="fa fa-user-circle" aria-hidden="true" style="color: #999999"></i>&nbsp;&nbsp;{{ $ctrl.header }}</h2>

           <h3 class="top30">Owned</h3>
           
           <div ng-repeat="v in $ctrl.venuePatrons.owned">
                <h4 class="top15">{{ v.venue.name }}</h4>
                <ul><li ng-repeat="p in v.patrons">{{ p.firstName }}&nbsp;{{ p.lastName }}&nbsp;({{ p.auth.email }})</li> </ul>
                <p ng-if="!v.patrons.length" class="text-muted">No partons found for this venue. Sorry dude.</p>
           
            </div>
           
           <h3 class="top30">Managed</h3>
           <div ng-repeat="v in $ctrl.venuePatrons.managed">
                <h4 class="top15">{{ v.venue.name }}</h4>
                <ul><li ng-repeat="p in v.patrons">{{ p.firstName }}&nbsp;{{ p.lastName }}&nbsp;({{ p.auth.email }})</li> </ul>
                <p ng-if="!v.patrons.length" class="text-muted">No partons found for this venue. Sorry dude.</p>

            </div>
           
           
           <!--<p>Placeholder</p>-->
           <!--<pre>{{ $ctrl.myVenues | json }}</pre>-->

        </div>
    </div>
</div>

    `
} );