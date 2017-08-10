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
                    <p>This should be an attractive summary of the venue information. An edit button should appear only if the user
                    has admin or owner rights for this particular venue.</p>
                    
                </div>
            </div>
        </div>
    `
} );