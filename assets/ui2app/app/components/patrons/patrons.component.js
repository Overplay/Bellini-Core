/**
 * Created by mkahn on 8/8/17.
 */

app.component( 'managerPatrons', {

    bindings:   {
        patrons: '<',
        header: '<',
        user:   '<'
    },
    controller: function ( uibHelper, toastr, $state, $log ) {
        $log.debug("loading managerPatrons component");

        var ctrl = this;

        this.$onInit = function () {
        }

    },
    template:   `

    <div class="container">
    <div class="row">
        <div class="col-lg-10">
            <h2><i class="fa fa-user-circle" aria-hidden="true" style="color: #999999"></i>&nbsp;&nbsp;{{ $ctrl.header }}</h2>

           <p>Placeholder</p>

        </div>
    </div>
</div>

    `
});