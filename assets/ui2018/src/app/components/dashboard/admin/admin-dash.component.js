/*********************************

 File:       admin-dash.component.js
 Function:   Admin dashboard
 Copyright:  Ourglass TV
 Date:       3/24/18 1:11 AM
 Author:     mkahn


 **********************************/


require( './admin-dash.scss' );

class AdminDashController {
    constructor( $log, uibHelper, $state, toastr ) {
        this.$log = $log;
        this.uibHelper = uibHelper;
        this.$state = $state;
        this.toastr = toastr;
        this.userChartObj = {
            type:    'PieChart',
            options: { title: 'User Breakdown by Highest Permission' }
        };

        this.$log.debug( "loading adminDashboard component" );

    }

    $onInit() {
        this.buildChart();
    }

    $onDestroy() {
    }

    buildChart() {

        this.userChartObj.data = {
            "cols":    [
                { id: "p", label: "Permission", type: "string" },
                { id: "c", label: "Count", type: "number" }
            ], "rows": [
                {
                    c: [
                        { v: "Admin" },
                        { v: this.userinfo.admin },
                    ]
                },
                {
                    c: [
                        { v: "Sponsor" },
                        { v: this.userinfo.sponsor }
                    ]
                },
                {
                    c: [
                        { v: "Owner" },
                        { v: this.userinfo.po },
                    ]
                },
                {
                    c: [
                        { v: "Manager" },
                        { v: this.userinfo.pm },
                    ]
                },
                {
                    c: [
                        { v: "Patron" },
                        { v: this.userinfo.u },
                    ]
                }
            ]
        };

    }


    // injection here
    static get $inject() {
        return [ '$log', 'uibHelper', '$state', 'toastr' ];
    }

}

export const name = 'adminDashComponent';

const Component = {
    $name$:       name,
    bindings:     {
        user:      '<',
        userinfo:  '<',
        venueinfo: '<',
        ads:       '<'
    },
    controller:   DashController,
    controllerAs: '$ctrl',
    template:     `
     <div class="container">
            <div class="row">
                <h1>Admin Dashboard</h1>
                <div class="col-lg-5 col-md-5 material-panel">
                     <h4>System Status</h4>
                     <div google-chart chart="$ctrl.userChartObj" style="height:300px; width:100%;"></div>
                    </div>
                <div class="col-md-5 col-lg-5 material-panel">
                    <h4>To Do</h4>
                    <div ng-if="$ctrl.ads.length">
                        <h5>Ads to Review</h5>
                            <ul>
                                <li ng-repeat="ad in $ctrl.ads"><a ui-sref="admin.editad({id:ad.id})">{{ ad.name }}</a> </li>
                            </ul>
                        </div>
                </div>
            </div>
        </div>
`
}

export default Component