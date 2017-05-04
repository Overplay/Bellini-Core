/**
 * Created by mkahn on 4/6/16.
 */

app.config( function ( $stateProvider, $urlRouterProvider ) {

    console.debug( "Loading routes" );

    var navViews = {
        "navtop":  {
            templateUrl: '/ui2app/app/components/navtop/navtop.partial.html',
            controller:  'navTopController',
            resolve:     {
                user: function ( userAuthService ) {
                    return userAuthService.getCurrentUser();
                }
            }
        },
        "navside": {
            templateUrl: '/ui2app/app/components/navside/navside.partial.html',
            controller:  'navSideController'
        }
    };

    function buildCompleteView( withView ) {
        return _.extend( navViews, { "appbody": withView } );
    }

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
            url:     '/myaccount',
            views:   buildCompleteView( {
                templateUrl: '/ui2app/app/components/account/myaccount.partial.html',
                controller:  'myAccountController'
            } ),
            resolve: {
                me: function ( sailsUsers ) {
                    return sailsUsers.getMe();
                },
                sm: function ( navService ) {
                    navService.sideMenu.change( 'accountMenu' );
                }
            }

        } )

        // ADMIN ROUTES

        .state( 'admin', {
            abstract: true,
            url:      '/admin',
            views:    buildCompleteView( { template: '<ui-view></ui-view>', } ),
            // This little hack sets the side menu for each major state
            resolve:  {
                sm: function ( navService ) {
                    navService.sideMenu.change( 'adminMenu' );
                }
            }
        } )

        .state( 'admin.dashboard', {
            url:         '/dashboard',
            templateUrl: '/ui2app/app/components/admin/admindash.partial.html',
            controller:  'adminDashController',
            resolve:     {
                userinfo:  function ( sailsUsers ) {
                    return sailsUsers.analyze();
                },
                venueinfo: function ( $http ) {
                    return $http.get( '/venue/count' ).then( function ( d ) { return d.data; } );
                },
                ads:       function ( sailsAds ) {
                    return sailsAds.getForReview();
                },
            }
        } )

        .state( 'admin.userlist', {
            url:         '/userlist',
            templateUrl: '/ui2app/app/components/admin/userlist.partial.html',
            controller:  'adminUserListController',
            resolve:     {
                users: function ( sailsUsers ) {
                    return sailsUsers.getAll();
                }
            }
        } )

        .state( 'admin.edituser', {
            url:         '/edituser/:id',
            templateUrl: '/ui2app/app/components/admin/edituser.partial.html',
            controller:  'adminUserEditController',
            resolve:     {
                user:      function ( sailsUsers, $stateParams ) {
                    return sailsUsers.get( $stateParams.id );
                },
                allVenues: function ( sailsVenues ) {
                    return sailsVenues.getAll();
                }
            }

        } )


        .state( 'admin.venuelist', {
            url:         '/venuelist',
            templateUrl: '/ui2app/app/components/admin/venuelist.partial.html',
            controller:  'adminVenueListController',
            resolve:     {
                venues: function ( sailsVenues ) {
                    return sailsVenues.getAll();
                }
            }
        } )

        .state( 'admin.devicelist', {
            url:         '/devicelist',
            templateUrl: '/ui2app/app/components/admin/devicelist.partial.html',
            controller:  'adminDeviceListController',
            resolve:     {
                venues:  function ( sailsVenues ) {
                    return sailsVenues.getAll();
                },
                devices: function ( sailsOGDeviceRemote ) {
                    return sailsOGDeviceRemote.getAll();
                }
            }
        } )

        .state( 'admin.devicedetail', {
            url:         '/device/:id',
            templateUrl: '/ui2app/app/components/admin/devicedetail.partial.html',
            controller:  'adminDeviceDetailController',
            resolve:     {
                device: function ( sailsOGDeviceRemote, $stateParams ) {
                    return sailsOGDeviceRemote.get( $stateParams.id );
                }
            }
        } )

        .state( 'admin.adlist', {
            url:         '/adlist',
            templateUrl: '/ui2app/app/components/admin/adlist.partial.html',
            controller:  'adminAdListController',
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
            resolve:     {
                ad: function ( sailsAds, $stateParams ) {
                    return sailsAds.get( $stateParams.id );
                }
            }
        } )

        .state( 'admin.editvenue', {
            url:         '/editvenue/:id',
            templateUrl: '/ui2app/app/components/admin/editvenue.partial.html',
            controller:  'adminVenueEditController',
            resolve:     {
                venue: function ( sailsVenues, $stateParams ) {
                    return sailsVenues.get( $stateParams.id );
                }
            }
        } )

        .state( 'admin.addvenue', {
            url:         '/addvenue',
            templateUrl: '/ui2app/app/components/admin/addvenue.partial.html',
            controller:  'adminVenueAddController',
            resolve:     {
                venue: function ( sailsVenues ) {
                    return sailsVenues.new();
                }
            }
        } )

        // Proprietor Owner Links

        .state( 'owner', {
            abstract: true,
            url:      '/owner',
            views:    buildCompleteView( { template: '<ui-view></ui-view>', } ),
            // This little hack sets the side menu for each major state
            resolve:  {
                sm: function ( navService ) {
                    navService.sideMenu.change( 'ownerMenu' );
                }
            }
        } )

        .state( 'owner.dashboard', {
            url:         '/dashboard',
            templateUrl: '/ui2app/app/components/roles/owner/ownerdash.partial.html',
            controller:  'ownerDashController',
            resolve:     {
                myVenues: function ( sailsVenues ) {
                    return sailsVenues.getMyVenues();
                }
            }

        } )

        // User routes


        .state( 'user', {
            abstract: true,
            url:      '/user',
            views:    buildCompleteView( { template: '<ui-view></ui-view>', } ),
            // This little hack sets the side menu for each major state
            resolve:  {
                sm: function ( navService ) {
                    navService.sideMenu.change( 'patronMenu' );
                }
            }
        } )

        .state( 'user.dashboard', {
            url:         '/dashboard',
            templateUrl: '/ui2app/app/components/roles/patron/patrondash.partial.html'
        } )

        .state( 'user.edit', {
            url:         '/edit/:id',
            templateUrl: '/ui2app/app/components/user/edituser.partial.html',
            controller:  'userEditController',
            resolve:     {
                user: function ( sailsUsers, $stateParams ) {
                    return sailsUsers.get( $stateParams.id );
                }
            }

        } )


} );
