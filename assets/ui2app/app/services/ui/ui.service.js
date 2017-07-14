/**
 * Created by mkahn on 4/22/17.
 */

app.factory( 'navService', function ( $rootScope ) {

    var currentSideKey = '';
    var currentTopKey = '';


    var sideMenuGroups = {
        adminMenu:   [
            { label: "All Users", sref: "admin.userlist", icon: "users" },
            { label: "Add User", sref: "admin.edituser({id: 'new'})", icon: "user" },
            { label: "All Venues", sref: "admin.venuelist", icon: "globe" },
            { label: "Add Venue", sref: "admin.editvenue({id: 'new'})", icon: "building-o" },
            { label: "All Ads", sref: "admin.adlist", icon: "bullhorn"},
            { label: "Create Ad", sref: "admin.editad({id: 'new'})", icon: "paint-brush" },
            { label: "Devices", sref: "admin.devicelist", icon: "television" },
            { label: "Maintenance", sref: "admin.maint", icon: "gears" }
        ],
        accountMenu: [
            { label: "Invite Users", sref: "invite", icon: "users" }
        ]
    };

    var topMenuGroups = {

        managerMenu: [
            { label: "venues", sref: "manager.venues", icon: "building" },
            { label: "devices", sref: "manager.devices", icon: "television" }
        ],

        ownerMenu: [
            { label: "venues", sref: "owner.venues", icon: "building" },
            { label: "devices", sref: "owner.devices", icon: "television" },
            { label: "patrons", sref: "owner.patrons", icon: "users" }
        ],

        advertiserMenu: [
            { label: "ads", sref: "sponsor.dashboard", icon: "bullhorn" }
        ],

        adminMenu: [
            { label: "admin dashboard", sref: "admin.dashboard", icon: "cube" }
        ]

    }

    return {

        sideMenu: {

            change: function ( group ) {
                currentSideKey = group;
            },

            getMenu: function () {
                if ( currentSideKey )
                    return sideMenuGroups[ currentSideKey ];

                return [];
            }
        },

        topMenu: {

            buildForUser: function ( user ) {

                var menu = [];

                // TODO maybe this should be if-then since fallthrough is weird
                switch (user.auth.ring){

                    case 1:
                        // Admin
                        menu = menu.concat(topMenuGroups.adminMenu);
                        //menu = menu.concat(topMenuGroups.advertiserMenu);
                        //menu = menu.concat(topMenuGroups.ownerMenu);
                        break;

                    case 4:
                        menu = menu.concat(topMenuGroups.advertiserMenu);
                        // intentionally no break to add these if needed
                    case 3:
                        // User
                        if ( user.isOwner ) {
                            menu = menu.concat(topMenuGroups.ownerMenu)
                        } else if ( user.isManager ){
                            menu = menu.concat(topMenuGroups.managerMenu);
                        }
                        break;

                }

                return menu;

            }


        },


    }

} );


app.controller( 'redirectController', [ '$state', 'user', function ( $state, user ) {
    // TODO think about removing the individual dashbaords and just add tiles to one unified dash


    if ( user.isAdmin ) {
        $state.go( 'admin.dashboard' );
    }

    else if ( user.isSponsor ) {
        $state.go( 'sponsor.dashboard' );
    }

    else if ( user.isOwner ) {
        $state.go( 'owner.dashboard' );
    }

    else if ( user.isManager ) {
        $state.go( 'manager.dashboard' );
    }

    else {
        $state.go( 'user.dashboard' );
    }


} ] );

app.factory( 'dialogService', function ( $uibModal, uibHelper, $log ) {

    var service = {};

    service.passwordDialog = function () {

        var modalInstance = $uibModal.open( {
            templateUrl: '/ui2app/app/services/ui/passwordchange.dialog.html',
            controller:  function ( $scope, $uibModalInstance ) {

                $scope.password = { pass: '', match: '' };

                $scope.ok = function () {
                    $uibModalInstance.close( $scope.password.pass );
                }

                $scope.cancel = function () {
                    $uibModalInstance.dismiss( 'cancel' );
                }

            }
        } );

        return modalInstance.result;

    }

    service.adSelect = function (ads) {
        var modalInstance = $uibModal.open( {
            templateUrl: '/ui2app/app/services/ui/adselect.template.html',
            controller: function ( $scope, $uibModalInstance ) {
                $scope.modalUi = {
                    sponsorships: ads,
                    mediaSizes: ['widget', 'crawler']
                }
                $scope.ok = function (sponsorship) {
                    $uibModalInstance.close(sponsorship);
                };
                $scope.cancel = function () {
                    $uibModalInstance.dismiss('cancel');
                }
            }
        })

        return modalInstance.result;
    }

    service.addressDialog = function (name, location, geocode, ring, yelp) {
        var modalInstance = $uibModal.open( {
            templateUrl: '/ui2app/app/services/ui/addresschange.dialog.html',
            controller: function ( $scope, $uibModalInstance, sailsVenues, toastr, geocode ) {
                $scope.data = {
                    address: location.address || {},
                    geolocation: location.geolocation || {},
                    name: name || "",
                    yelpId: "",
                    googlePlaceId: ""
                };
                $scope.ring = ring;
                $scope.yelp = yelp;
                $scope.parameters = {limit: 8};
                $scope.zipRegex = "\\d{5}([\\-]\\d{4})?";
                $scope.setForm = function(form) { $scope.form = form; };

                $scope.initializeLocation = function() {
                    $scope.parameters.location = "Locating...";
                    geocode.locate()
                        .then( geocode.revGeocode )
                        .then( function (loc) {
                            $scope.parameters.location = loc.city + ", " + loc.state;
                            toastr.success("Successfully located!");
                        })
                        .catch( function (err) {
                            $scope.parameters.location = "";
                            $log.error(err);
                            toastr.error("Could not find your location");
                        })
                };

                $scope.yelpSearch = function () {
                    return sailsVenues.yelp($scope.parameters)
                        .catch( function (err) {
                            toastr.error("Error fetching Yelp suggestions");
                            $log.error(err);
                        });
                };

                $scope.yelpCopy = function ($item, $model) {
                    $scope.data.name = $model.name;
                    $scope.data.address = {
                        street: $model.location.address1,
                        street2: $model.location.address2,
                        city: $model.location.city,
                        state: $model.location.state,
                        zip: $model.location.zip_code
                    };
                    $scope.data.geolocation = {
                        latitude: $model.coordinates.latitude,
                        longitude: $model.coordinates.longitude
                    };
                    $scope.data.yelpId = $model.id;
                };

                $scope.geoCheck = function() {
                    if (geocode && $scope.form.$valid) {
                        toastr.success("", "Geocoding...");
                        sailsVenues.geocode(sailsVenues.addressStr($scope.data.address))
                            .then( function (res) {
                                toastr.success(res[0].formatted_address, "Geocoded successfully");
                                $scope.data.geolocation.longitude = res[0].geometry.location.lng;
                                $scope.data.geolocation.latitude = res[0].geometry.location.lat;
                                $scope.data.googlePlaceId = res[0].place_id;
                            })
                            .catch( function (err) {
                                toastr.error(err.toString(), "Error geocoding");
                            })
                    }
                }

                $scope.ok = function () {
                    $uibModalInstance.close( $scope.data );
                }

                $scope.cancel = function () {
                    $uibModalInstance.dismiss( 'cancel' );
                }
            },
            size: 'lg'

        });

        return modalInstance.result;
    }

    return service;

} );

app.directive( 'ogSpinner', function () {

    return {
        template: `
    
    <div style="width: 80vw; height: 80vh;">
    <div class="spinner-holder">
        <div class="spinner">
            <div class="dot1"></div>
            <div class="dot2"></div>
        </div>
    </div>
</div>
    
    `
    }

} )