/**
 * Created by mkahn on 4/6/16.
 */


app.config( function ( $stateProvider, $urlRouterProvider ) {

    console.debug( "Loading routes" );

    var apiPath = 'api/v1';

    $urlRouterProvider.otherwise( '/dash' );

    $stateProvider


        .state( 'admin', {
            url:         '/admin',
            templateUrl: '/uiapp/app/components/admin/admin.partial.html',
            abstract:    true,
            resolve:     {
                user: function ( nucleus ) {
                    return nucleus.getMe();
                }
            }


        } )


        .state( 'admin.manageUsers', {
            url:         '/manage-users',
            data:        { subTitle: "Manage Users" },
            controller:  'adminManageUsersController',
            templateUrl: '/uiapp/app/components/admin/admin-manage-users.partial.html',
            resolve:     {
                userAuths: function ( nucleus ) {
                    return nucleus.getAuth();
                }
            }


        } )
        .state( 'admin.manageDevices', {
                url:         '/manage-devices',
                data:        { subTitle: "Manage Devices" },
                controller:  "adminManageDevicesController",
                templateUrl: '/uiapp/app/components/admin/admin-manage-devices.partial.html'
            }
        )

        .state( 'admin.manageVenues', {
            url:         '/manage-venues',
            data:        { subTitle: "Manage Venues" },
            controller:  "adminManageVenuesController",
            templateUrl: '/uiapp/app/components/admin/admin-manage-venues.partial.html'
        } )

        .state( 'admin.addUser', {
            url:         '/add-user',
            data:        { subTitle: "Add User" },
            controller:  "addUserController",
            templateUrl: '/uiapp/app/components/user/add-user-admin.partial.html',

        } )

        .state( 'user', {
            url:         '/user',
            templateUrl: '/uiapp/app/components/user/user.partial.html',
            abstract:    true

        } )

        .state( 'user.editUser', {
            url:         '/edit-user/:id',
            data:        { subTitle: "Edit User" },
            controller:  'editUserController',
            templateUrl: '/uiapp/app/components/user/edit-user.partial.html',
            resolve:     {
                user: function ( nucleus ) {
                    return nucleus.getMe()
                }
            }
        } )

        .state( 'user.editUserAdmin', {
            url:         '/edit-user-admin/:id',
            data:        { subTitle: "Edit User (Admin)" },
            controller:  'editUserAdminController',
            templateUrl: '/uiapp/app/components/user/edit-user-admin.partial.html',
            resolve:     {
                user:  function ( nucleus, $stateParams ) {
                    return nucleus.getAuth( $stateParams.id )
                },
                roles: function ( nucleus ) {
                    return nucleus.getRole()
                }
            }
        } )

        // // Original Venue Routesd
        // // TODO: Whack these once sidemenu done
        //
        // .state('venuex', {
        //     url: '/venuex',
        //     templateUrl: '/uiapp/app/components/venue/venue.partial.html',
        //     abstract: true
        // })
        //
        // .state('venuex.addVenue', {
        //     url: '/add-venue',
        //     templateUrl: '/uiapp/app/components/venue/add-venue.partial.html',
        //     controller: 'addVenueController',
        //     data: {subTitle: "Add Venue"}
        // })
        //
        // .state('venuex.manageVenue', {
        //     url: '/manage-venue/:id',
        //     data: {subTitle: "Manage Venue"},
        //     controller: 'editVenueAdminController',
        //     templateUrl: '/uiapp/app/components/venue/manage-venue.partial.html',
        //     resolve: {
        //         venue: function (nucleus, $stateParams) {
        //             return nucleus.getVenue($stateParams.id)
        //         }
        //     }
        // })

        // New Venue Routes

        .state( 'venue', {
            url:         '/venue',
            templateUrl: '/uiapp/app/components/venue/venue-sidemenu.partial.html',
            controller:  function ( $scope ) { $scope.panelHeading = { text: "", color: "#0000FF" }},
            abstract:    true
        } )

        .state( 'venue.view', {
            url:         '/view/:id',
            resolve:     {
                venue: function ( nucleus, $stateParams ) {
                    return nucleus.getVenue( $stateParams.id )
                }
            },
            templateUrl: '/uiapp/app/components/venue/viewvenue.partial.html',
            controller:  'viewVenueController'
        } )

        .state( 'venue.edit', {
            url:         '/edit/:id',
            resolve:     {
                venue: function ( nucleus, $stateParams ) {
                    return nucleus.getVenue( $stateParams.id )
                }
            },
            templateUrl: '/uiapp/app/components/venue/editvenue.partial.html',
            controller:  'editVenueController'
        } )

        .state( 'venue.list', {
            url:         '/list',
            controller:  'listVenueController',
            templateUrl: '/uiapp/app/components/venue/venuelist.partial.html',
            resolve:     {
                venues: function ( nucleus, $stateParams ) {
                    return nucleus.getVenue()
                }
            }
        } )

        .state( 'venue.new', {
            url: '/new',
            templateUrl: '/uiapp/app/components/venue/add-venue.partial.html',
            controller: 'addVenueController'
            })

        .state( 'device', {
            url:         '/device',
            templateUrl: '/uiapp/app/components/device/device.partial.html',
            abstract:    true

        } )


        .state( 'device.addDevice', {
            url:         '/activate',
            data:        { subTitle: "Add a Device" },
            controller:  "addDeviceController",
            templateUrl: '/uiapp/app/components/device/add-device.partial.html',
            resolve:     {
                user: function ( nucleus ) {
                    return nucleus.getMe()
                }
            }
        } )


        .state( 'device.regDevice', {
            url:         '/register',
            data:        { subTitle: "Register a Device" },
            controller:  "registerDeviceController",
            templateUrl: '/uiapp/app/components/device/register-device.partial.html',
        } )

        .state( 'device.manageDevice', {
            url:         '/manage-device/:id',
            data:        { subTitle: "Manage Device" },
            controller:  'editDeviceAdminController',
            templateUrl: '/uiapp/app/components/device/manage-device.partial.html',
            resolve:     {
                device: function ( nucleus, $stateParams ) {
                    return nucleus.getDevice( $stateParams.id )
                }
            }
        } )

        .state( 'organization', {
            url:         '/organization',
            templateUrl: '/uiapp/app/components/organization/organization.partial.html',
            abstract:    true,
            resolve:     {
                user: function ( nucleus ) {
                    return nucleus.getMe()
                }

            }

        } )

        .state( 'organization.manageOrganization', {
            url:         '/manage-organization',
            data:        { subTitle: "Manage Organization" },
            controller:  'editOrganizationController',
            templateUrl: '/uiapp/app/components/organization/manage-organization.partial.html',
            /*resolve: { not really necesary unless someone has control of multiple organizations?
             organization: function($http, $stateParams){

             $http.get("api/v1/organization/" + $stateParams.id)
             .then(function (data) {
             return data.data;
             })
             }
             }*/
        } )

        .state( 'organization.viewOrganization', {
            url:         '/view-organization/:id',
            data:        { subTitle: "View Organization" },
            controller:  'viewOrganizationController',
            templateUrl: '/uiapp/app/components/organization/view-organization.partial.html',
            resolve:     {
                organization: function ( $http, $stateParams ) {

                    $http.get( "api/v1/organization/" + $stateParams.id )
                        .then( function ( data ) {
                            return data.data;
                        } )
                }
            }
        } )


        .state( 'advertisement', {
            url:         '/advertisement',
            templateUrl: '/uiapp/app/components/trevda/trevda.partial.html',
            abstract:    true
        } )

        .state( 'advertisement.addAdvertisement', {
            url:         '/add-advertisement',
            templateUrl: '/uiapp/app/components/trevda/add-trevda.partial.html',
            data:        { subTitle: "Add Advertisement" },
            controller:  'addAdvertisementController'
        } )

        .state( 'advertisement.manageAdvertisements', {
            url:         '/manage-advertisements',
            templateUrl: '/uiapp/app/components/trevda/manage-trevda.partial.html',
            data:        { subTitle: "Manage Advertisements" },
            controller:  'manageAdvertisementController'
        } )

        .state( 'advertisement.editAdvertisement', {
            url:         '/edit-advertisement/:id',
            templateUrl: '/uiapp/app/components/trevda/edit-trevda.partial.html',
            data:        { subTitle: "Edit Advertisement" },
            controller:  'editAdvertisementController',
            resolve:     {
                //TODO
            }
        } )
        // =========== DASHBOARD

        .state( 'dash', {
            url:         '/dash',
            templateUrl: '/uiapp/app/components/dash/dash.partial.html'
        } )


        // Examples pages!
        // HOME STATES AND NESTED VIEWS ========================================
        .state( 'example1', {
            url:         '/example1',
            templateUrl: '/uiapp/app/components/example1/landingPage.partial.html'
        } )

        // nested list with custom controller
        .state( 'example1.list', {
            url:         '/list',
            templateUrl: '/uiapp/app/components/example1/partial-home-list.html',
            controller:  function ( $scope ) {
                $scope.dogs = [ 'Bernese', 'Husky', 'Goldendoodle' ];
            }
        } )

        // nested list with just some random string data
        .state( 'example1.paragraph', {
            url:      '/paragraph',
            template: 'I could sure use a drink right now.'
        } )

        // ABOUT PAGE AND MULTIPLE NAMED VIEWS =================================
        .state( 'example2', {
            url:   '/example2',
            views: {

                // the main template will be placed here (relatively named)
                '': { templateUrl: '/uiapp/app/components/example2/aboutpage.partial.html' },

                // the child views will be defined here (absolutely named)
                'columnOne@about': { template: 'Look I am a column!' },

                // for column two, we'll define a separate controller
                'columnTwo@about': {
                    templateUrl: '/uiapp/app/components/example2/table-data.html',
                    controller:  'scotchController'
                }
            }
        } );

} );


