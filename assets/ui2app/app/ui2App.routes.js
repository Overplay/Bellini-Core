/**
 * Created by mkahn on 4/6/16.
 */

app.config( function ( $stateProvider, $urlRouterProvider ) {

    console.debug( "Loading routes" );

    var navViews = {
        "navtop":  {
            templateUrl: '/ui2app/app/components/navtop/navtop.partial.html',
            controller:  'navTopController',
        },
        "navside": {
            templateUrl: '/ui2app/app/components/navside/navside.partial.html',
            controller:  'navSideController'
        }
    };

    function buildCompleteView( withView ) {
        return _.extend( navViews, { "appbody": withView } );
    }

    // The 'user' is automatically resolved for every single state via the decorator in the main module file!


    $urlRouterProvider.otherwise( '/' );

    $stateProvider

        .state( 'welcome', {
            url:   '/',
            views: buildCompleteView( {
                template:   '<og-spinner></og-spinner>',
                controller: 'redirectController'
            } )
        } )

        // ACCOUNT

        .state( 'myaccount', {
            url:   '/myaccount',
            views: buildCompleteView( {
                templateUrl: '/ui2app/app/components/account/myaccount.partial.html',
                controller:  'myAccountController'
            } )

        } )

        // ADMIN ROUTES

        // .state( 'admin.devicelist', {
        //     url:         '/devicelist',
        //     templateUrl: '/ui2app/app/components/admin/devicelist.partial.html',
        //     controller:  'adminDeviceListController',
        //     resolve:     {
        //         venues:  function ( sailsVenues ) {
        //             return sailsVenues.getAll();
        //         },
        //         devices: function ( sailsOGDeviceRemote ) {
        //             return sailsOGDeviceRemote.getAll();
        //         }
        //     }
        // } )
        //
        // .state( 'admin.devicedetail', {
        //     url:         '/device/:id',
        //     templateUrl: '/ui2app/app/components/admin/devicedetail.partial.html',
        //     controller:  'adminDeviceDetailController',
        //     resolve:     {
        //         device: function ( sailsOGDeviceRemote, $stateParams ) {
        //             return sailsOGDeviceRemote.get( $stateParams.id );
        //         }
        //     }
        // } )
        //



        // Refactored routes

        // Any state that starts with 'manager' is protected to be sure there is anyManager privilege
        .state( 'manager', {
            abstract: true,
            url:      '/mgr',
            views:    buildCompleteView( { template: '<ui-view></ui-view>', } )
        } )

        .state( 'manager.dashboard', {
            url:       '/dash',
            component: 'managerDashboard',
            sideMenu: [
                         { label: "My Devices", sref: "manager.devices", icon: "television" },
                         { label: "My Patrons", sref: "manager.patrons", icon: "users" }
                         ],
            resolve: {
                myVenues: function(sailsVenues){
                    return sailsVenues.getMyVenues();
                }

            }
        })

        .state( 'manager.patrons', {
            url:       '/patrons',
            component: 'managerPatrons',
            sideMenu:  [
                { label: "Home", sref: "manager.dashboard", icon: "home" },
                { label: "My Devices", sref: "manager.devices", icon: "television" }
            ],
            resolve:   {
                myVenues: function ( sailsVenues ) {
                    return sailsVenues.getMyVenues();
                },
                header: function() { return "Patron List" }

            }
        } )

        // Any state that starts with 'owner' is protected to be sure there is owner privilege

        .state( 'owner', {
            abstract: true,
            url:      '/owner',
            views:    buildCompleteView( { template: '<ui-view></ui-view>', } )
        } )


        // Not sure patron will ever be used...but here's the stub for a dashboard
        .state( 'patron', {
            abstract: true,
            url:      '/patron',
            views:    buildCompleteView( { template: '<ui-view></ui-view>', } ),
        } )

        .state( 'patron.dashboard', {
            url:         '/dash',
            component: 'patronDashboard'
        } )


        // Any state that starts with 'admin' is protected to be sure there is admin privilege

        .state( 'admin', {
            abstract: true,
            url:      '/admin',
            views:    buildCompleteView( { template: '<ui-view></ui-view>', } )
        } )

        .state( 'admin.dashboard', {
            url:       '/dash',
            component: 'adminDashboard',
            sideMenu:  [
                { label: "Users", sref: "admin.userlist", icon: "users" },
                { label: "Venues", sref: "admin.venuelist", icon: "globe" },
                { label: "Ads", sref: "admin.adlist", icon: "bullhorn" },
                { label: "Devices", sref: "admin.devicelist", icon: "television" },
                { label: "Maintenance", sref: "admin.maint", icon: "gears" }
            ],
            resolve:   {
                userinfo:  function ( sailsUsers ) {
                    return sailsUsers.analyze();
                },
                venueinfo: function ( $http ) {
                    return $http.get( '/venue/count' ).then( function ( d ) { return d.data; } );
                },
                ads:       function ( sailsAds ) {
                    return sailsAds.getForReview();
                }
            }
        } )

        .state( 'admin.userlist', {
            url:       '/userlist',
            component: 'userList',
            sideMenu:  [
                { label: 'Home', sref: "welcome", icon: "home" },
                { label: "Add User", sref: "admin.edituser({id: 'new'})", icon: "user" }
            ],
            resolve:   {
                users:   function ( sailsUsers ) {
                    return sailsUsers.getAll();
                },
                heading: function () { return "All Users" }
            }
        } )

        .state( 'admin.venuelist', {
            url:       '/venuelist',
            component: 'venueList',
            sideMenu:  [
                { label: 'Home', sref: "welcome", icon: "home" },
                { label: 'Venue Map', sref: 'venue.map', icon: "globe"},
                { label: "Add Venue", sref: "admin.editvenue({id: 'new'})", icon: "building-o" }
            ],
            resolve:   {
                venues: function ( sailsVenues ) {
                    return sailsVenues.getAll();
                },
                header: function () { return 'All Venues'; }
            }
        } )

        // Left as non-component for now
        .state( 'admin.edituser', {
            url:         '/edituser/:id',
            templateUrl: '/ui2app/app/components/admin/edituser.partial.html',
            controller:  'adminUserEditController',
            sideMenu:    [
                { label: 'Home', sref: "welcome", icon: "home" },
                { label: "All Users", sref: "admin.userlist", icon: "users" },
                { label: "Add User", sref: "admin.edituser({id: 'new'})", icon: "user" }
            ],
            resolve:     {
                user2edit: function ( sailsUsers, $stateParams ) {
                    return sailsUsers.get( $stateParams.id );
                },
                allVenues: function ( sailsVenues ) {
                    return sailsVenues.getAll();
                }
            }

        } )

        .state( 'admin.editvenue', {
            url:         '/editvenue/:id',
            templateUrl: '/ui2app/app/components/admin/editvenue.partial.html',
            controller:  'adminVenueEditController',
            sideMenu: [
                { label: 'Home', sref: "welcome", icon: "home" },
                { label: "All Venues", sref: "admin.venuelist", icon: "globe" },
                { label: "Add Venue", sref: "admin.editvenue({id: 'new'})", icon: "building-o" }
            ],
            resolve:     {
                venue: function ( sailsVenues, $stateParams ) {
                    return sailsVenues.get( $stateParams.id );
                },
                ads:   function ( sailsAds ) {
                    return sailsAds.getAll();
                },
                users: function ( sailsUsers ) {
                    return sailsUsers.getAll();
                }
            }
        } )

        .state( 'admin.adlist', {
            url:         '/adlist',
            templateUrl: '/ui2app/app/components/admin/adlist.partial.html',
            controller:  'adminAdListController',
            sideMenu: [
                { label: 'Home', sref: "welcome", icon: "home" },
                { label: "New Sponsorship", sref: "admin.editad({id: 'new'})", icon: "paint-brush" }
            ],
            resolve:     {
                ads: function ( sailsAds ) {
                    return sailsAds.getAll();
                }
            }
        } )

        .state( 'admin.editad', {
            url:         '/edit/:id',
            templateUrl: '/ui2app/app/components/admin/adedit.partial.html',
            controller:  'adminAdEditController',
            sideMenu: [
                { label: 'Home', sref: "welcome", icon: "home" },
                { label: "All Sponsorships", sref: "admin.adlist", icon: "bullhorn" },
                { label: "New Sponsorship", sref: "admin.editad({id: 'new'})", icon: "paint-brush" }
            ],
            resolve:     {
                ad: function ( sailsAds, $stateParams ) {
                    return sailsAds.get( $stateParams.id );
                }
            }
        } )

        // VENUES

        .state( 'venue', {
            abstract: true,
            url:      '/venue',
            views:    buildCompleteView( { template: '<ui-view></ui-view>', } )
        } )

        .state( 'venue.view', {
            url:         '/view/:id',
            component: 'venueView',
            sideMenu:    [
                { label: 'Home', sref: "welcome", icon: "home" },
            ],
            resolve:     {
                venue: function ( sailsVenues, $stateParams ) {
                    return sailsVenues.get( $stateParams.id );
                }
            }
        } )

        .state( 'venue.map', {
            url:       '/map',
            component: 'venueMap',
            sideMenu:  [
                { label: 'Home', sref: "welcome", icon: "home" },
            ],
            resolve:   {
                venues: function ( sailsVenues ) {
                    return sailsVenues.getAll();
                }
            }
        } )



} );
