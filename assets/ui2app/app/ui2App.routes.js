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

    var apiPath = 'api/v1';

    $urlRouterProvider.otherwise( '/' );

    $stateProvider

        .state( 'welcome', {
            url:   '/',
            views: buildCompleteView( {
                templateUrl: '/ui2app/app/components/layouttest/layouttest.partial.html'
            } )

        } )

        // ADMIN ROUTES

        .state( 'admin', {
            abstract: true,
            url:      '/admin',
            views:    buildCompleteView( {
                template: '<ui-view></ui-view>',
            } ),
            // This little hack sets the side menu for each major state
            resolve:  {
                sm: function ( sideMenu ) {
                    sideMenu.change( 'adminMenu' );
                }
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
                user:  function ( sailsUsers, $stateParams ) {
                    return sailsUsers.get( $stateParams.id );
                },
                roles: function ( userAuthService ) {
                    return userAuthService.getRoles();
                },
                allVenues: function( sailsVenues ){
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
        })

        .state( 'admin.editvenue', {
            url:         '/editvenue/:id',
            templateUrl: '/ui2app/app/components/admin/editvenue.partial.html',
            controller:  'adminVenueEditController',
            resolve: {
                venue: function ( sailsVenues, $stateParams ) {
                    return sailsVenues.get( $stateParams.id );
                }
            }
        })


} );
