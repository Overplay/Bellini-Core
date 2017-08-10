/**
 * Created by mkahn on 8/8/17.
 */

app.component( 'managerDashboard', {

        bindings:   {
            user: '<',
            myVenues: '<'
        }
        ,
        controller: function ( uibHelper, toastr, $state, $log ) {
            $log.debug( "loading managerDashboard component" );
            var ctrl = this;

            this.$onInit = function () {
                $log.debug("Yo homie");
            }

        }
        ,
        template:   `
        
         <div class="container">
            <div class="row">
                <div class="col-sm-10 col-lg-10 material-panel">
                    <h2><i class="fa fa-tasks" aria-hidden="true" style="color: #999999"></i>&nbsp;&nbsp;Proprietor Dashboard</h2>
                    <h5 class="top30">Owned Venues</h5>
                        <ul class="list-unstyled">
                        <li  ng-repeat="v in $ctrl.myVenues.owned">  <a ui-sref="venue.view({id: v.id})">{{ v.name }}</a> </li>
                        </ul>
                        <!--<venue-card ng-repeat="v in $ctrl.myVenues.owned" venue="v"></venue-card>-->
                       
                    
                    <h5 class="top30">Managed Venues</h5>
                     <ul class="list-unstyled">
                        <li  ng-repeat="v in $ctrl.myVenues.managed">  <a ui-sref="venue.view({id: v.id})">{{ v.name }}</a> </li>
                        </ul>
                        
                    
                </div>
            </div>
        </div>
        
        `
    }
);


app.component( 'patronDashboard', {

        bindings:   {
            user: '<'
        }
        ,
        controller: function ( uibHelper, toastr, $state, $log ) {
            $log.debug( "loading patronDashboard component" );
            var ctrl = this;

            this.$onInit = function () {
            }

        }
        ,
        template:   `
        
         <div class="container">
            <div class="row">
                <div class="col-sm-10 col-lg-10 material-panel">
                    <h2><i class="fa fa-tasks" aria-hidden="true" style="color: #999999"></i>&nbsp;&nbsp; Hi {{ user.firstName }}!</h2>
                    <p>This is the Patron Dashboard. It does nothing right now :).</p>
                </div>
            </div>
        </div>
        
        `
    }
);


app.component( 'adminDashboard', {

        bindings:   {
            user: '<',
            userinfo: '<',
            venueinfo: '<',
            ads: '<'
        },

        controller: function ( uibHelper, toastr, $state, $log ) {
            $log.debug( "loading adminDashboard component" );
            var ctrl = this;


            // Can't build the graph object until the values are stable.
            this.$onInit = function () {

                ctrl.userChartObj.data = {
                    "cols":    [
                        { id: "p", label: "Permission", type: "string" },
                        { id: "c", label: "Count", type: "number" }
                    ], "rows": [
                        {
                            c: [
                                { v: "Admin" },
                                { v: ctrl.userinfo.admin },
                            ]
                        },
                        {
                            c: [
                                { v: "Sponsor" },
                                { v: ctrl.userinfo.sponsor }
                            ]
                        },
                        {
                            c: [
                                { v: "Owner" },
                                { v: ctrl.userinfo.po },
                            ]
                        },
                        {
                            c: [
                                { v: "Manager" },
                                { v: ctrl.userinfo.pm },
                            ]
                        },
                        {
                            c: [
                                { v: "Patron" },
                                { v: ctrl.userinfo.u },
                            ]
                        }
                    ]
                };
            };


            this.userChartObj = {};

            this.userChartObj.type = "PieChart";

            this.userChartObj.options = {
                'title': 'User Breakdown by Highest Permission'
            };


        }
        ,
        template:   `
        
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
);