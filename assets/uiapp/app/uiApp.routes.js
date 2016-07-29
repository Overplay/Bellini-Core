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


        .state('user.adminList', {
            url: '/admin-list',
            data:        { subTitle: "Manage Users" },
            controller: 'listUserController',
            templateUrl: '/uiapp/app/components/user/userlist.partial.html',
            resolve:     {
                users: function (nucleus) {
                    return nucleus.getAuth()
                },
                admin: function () {
                    return true;
                },
                links: function () {
                    return [
                        {text: "All Users", link: "user.adminList"},
                        {text: "Add User", link: "user.addUser"}
                    ]
                }
            }

        } )

        .state('user.addUser', {
            url:         '/add-user',
            data:        { subTitle: "Add User" },
            controller:  "addUserController",
            templateUrl: '/uiapp/app/components/user/add-user-admin.partial.html',
            resolve: {
                links: function () {
                    return [
                        {text: "All Users", link: "user.adminList"},
                        {text: "Add User", link: "user.addUser"}
                    ]
                }
            }

        })

        .state( 'user', {
            url:         '/user',
            templateUrl: '/uiapp/app/components/user/user-sidemenu.partial.html',
            controller:  function ( $scope ) { $scope.panelHeading = { text: "", color: "#0000FF" }},
            abstract:    true
        })
        
        .state( 'user.managerList', {
            url:         '/managers',
            controller:  'listUserController',
            templateUrl: 'uiapp/app/components/user/userlist.partial.html',
            resolve: {
                users: function ($http, $q, nucleus) {
                    var managers = [];

                    return $http.get('/user/getVenues')
                        .then(function (data) {
                            return data.data;
                        })
                        .then(function (venues) {
                            var all = [];
                            angular.forEach(venues, function (venue) {
                                all.push($http.get('/venue/getVenueManagers', {params: {id: venue.id}})
                                    .then(function (data) {
                                        angular.forEach(data.data, function (manager) {
                                            var i;
                                            if ((i = _.findIndex(managers, function(o) { return o.id === manager.id })) === -1) {
                                                manager.managedVenues = [venue];
                                                managers.push(manager);
                                            }
                                            else
                                                managers[i].managedVenues.push(venue);

                                        })
                                    }));
                            });

                            return $q.all(all);
                        })
                        .then(function() {
                            var all = [];
                            angular.forEach(managers, function(manager) {
                                all.push(nucleus.getAuth(manager.auth)
                                    .then(function (data) {
                                        manager.auth = data;
                                    }))
                            });
                            return $q.all(all);
                        })
                        .then(function() {
                            return managers;
                        })
                },
                links: function() {
                    return [
                        {text: "Managers", link: "user.managerList"}
                    ]
                },
                admin: function () {
                    return false;
                }
            }
            
        })

        .state( 'user.editUser', {
            url:         '/edit-user/:id',
            data:        { subTitle: "Edit User" },
            controller:  'editUserController',
            templateUrl: '/uiapp/app/components/user/edit-user.partial.html',
            resolve:     {
                user: function (nucleus) { //TODO this is broken
                    return nucleus.getMe()
                },
                links: function () {
                    return [
                        {text: "Back to Dash", link: "dash"}
                    ]
                }
            }
        })

        .state( 'user.editUserOwner', {
            url:         '/edit-user-owner/:id',
            controller:  'editUserOwnerController',
            templateUrl: '/uiapp/app/components/user/edit-user-admin.partial.html',
            resolve:     {
                user: function ( nucleus, $stateParams ) {
                    return nucleus.getAuth( $stateParams.id )
                        .then( function (auth) {
                            return nucleus.getUser( auth.user.id )
                                .then( function (user) {
                                    auth.user = user;
                                    return auth;
                                })
                        })
                        .then( function (auth) {
                            return nucleus.getMe()
                                .then( function (me) {
                                    return nucleus.getUser(me.id);
                                })
                                .then( function (user) {
                                    auth.user.managedVenues = _.intersectionWith(user.ownedVenues, auth.user.managedVenues,
                                                                                 function (v1, v2) { return v1.id === v2.id; })
                                    return auth;
                                })
                        })
                },
                owned: function ( nucleus ) {
                    return nucleus.getMe()
                        .then( function (me) {
                            return nucleus.getUser(me.id)
                                .then( function (user) {
                                    return user.ownedVenues;
                                })
                        })
                },
                links: function() {
                    return [
                        {text: "Managers", link: "user.managerList"}
                    ]
                }
            }
        })

        .state( 'user.editUserAdmin', {
            url:         '/edit-user-admin/:id',
            data:        { subTitle: "Edit User (Admin)" },
            controller:  'editUserAdminController',
            templateUrl: '/uiapp/app/components/user/edit-user-admin.partial.html',
            resolve:     {
                user:  function ( nucleus, $stateParams ) {
                    return nucleus.getAuth( $stateParams.id )
                        .then(function (auth) {
                            return nucleus.getUser(auth.user.id)
                                .then(function (user) {
                                    auth.user = user;
                                    return auth;
                                })
                        })
                },
                roles: function ( nucleus ) {
                    return nucleus.getRole()
                },
                links: function () {
                    return [
                        {text: "All Users", link: "user.adminList"},
                        {text: "Add User", link: "user.addUser"}
                    ]
                }
            }
        } )

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
                venue: function ( $http, $stateParams) {
                    return $http.get( apiPath+"/venue/" +$stateParams.id)
                        .then( function (data) {
                            return data.data;
                        })
                        .catch(function(err){
                            return err;
                        })
                },
                user: function(nucleus) {
                    return nucleus.getMe()
                },
                links: function () {
                    return [
                        {text: "My Venues", link: "venue.list"},
                        {text: "Add Venue", link: "venue.add"}
                    ]
                },
                admin: function () { return false; }
            },
            templateUrl: '/uiapp/app/components/venue/viewvenue.partial.html',
            controller:  'viewVenueController'
        } )

        .state( 'venue.adminView', {
            url:         '/admin-view/:id',
            resolve:     {
                venue: function ( $http, $stateParams) {
                    return $http.get( apiPath+"/venue/" +$stateParams.id)
                        .then( function (data) {
                            return data.data;
                        })
                        .catch(function(err){
                            return err;
                        })
                },
                user: function(nucleus) {
                    return nucleus.getMe()
                },
                links: function () {
                    return [
                        {text: "All Venues", link: "venue.adminList"},
                        {text: "Add Venue", link: "venue.adminAdd"}
                    ]
                },
                admin: function () { return true; }
            },
            templateUrl: '/uiapp/app/components/venue/viewvenue.partial.html',
            controller:  'viewVenueController'
        } )

        .state( 'venue.edit', {
            url:         '/edit/:id',
            resolve:     {

                venue: function ( $http, $stateParams) {
                    return $http.get( apiPath+"/venue/" +$stateParams.id)
                        .then( function (data) {
                            return data.data;
                        })
                        .catch(function(err){
                            return err;
                        })
                },
                edit: function () {
                    return true;
                },
                links: function () {
                    return [
                        {text: "My Venues", link: "venue.list"},
                        {text: "Add Venue", link: "venue.add"}
                    ]
                },
                admin: function () { return false; }
            },
            templateUrl: '/uiapp/app/components/venue/addeditvenue.partial.html',
            controller:  'addEditVenueController'
        } )

        .state( 'venue.adminEdit', {
            url:         '/admin-edit/:id',
            resolve:     {

                venue: function ( $http, $stateParams) {
                    return $http.get( apiPath+"/venue/" +$stateParams.id)
                        .then( function (data) {
                            return data.data;
                        })
                        .catch(function(err){
                            return err;
                        })
                },
                edit: function () {
                    return true;
                },
                links: function () {
                    return [
                        {text: "All Venues", link: "venue.adminList"},
                        {text: "Add Venue", link: "venue.adminAdd"}
                    ]
                },
                admin: function () { return true; }
            },
            templateUrl: '/uiapp/app/components/venue/addeditvenue.partial.html',
            controller:  'addEditVenueController'
        } )



        .state( 'venue.list', {
            url:         '/list',
            controller:  'listVenueController',
            templateUrl: '/uiapp/app/components/venue/venuelist.partial.html',
            resolve:     {
                venues: function ( $http ) {
                        return $http.get( '/user/getVenues')
                            .then( function (data) {
                                return data.data;
                            })
                },
                links: function () {
                    return [
                        {text: "My Venues", link: "venue.list"},
                        {text: "Add Venue", link: "venue.add"}
                    ]
                },
                admin: function () { return false; }
            }
        })

        .state( 'venue.adminList', {
            url:         '/admin-list',
            controller:  'listVenueController',
            templateUrl: '/uiapp/app/components/venue/venuelist.partial.html',
            resolve:     {
                venues: function ( $http ) {
                    return $http.get( apiPath+'/venue')
                        .then( function (data) {
                            return data.data;
                        })
                },
                links: function () {
                    return [
                        {text: "All Venues", link: "venue.adminList"},
                        {text: "Add Venue", link: "venue.adminAdd"}
                    ]
                },
                admin: function () { return true; }
            }
        })

        .state( 'venue.add', {
            url: '/add',
            templateUrl: '/uiapp/app/components/venue/addeditvenue.partial.html',
            controller: 'addEditVenueController',
            resolve: {
                edit: function() { return false; },
                venue: function () {
                    return null;
                },
                links: function () {
                    return [
                        {text: "My Venues", link: "venue.list"},
                        {text: "Add Venue", link: "venue.add"}
                    ]
                },
                admin: function () { return false; }
            }
        })

        .state( 'venue.adminAdd', {
            url: '/admin-add',
            templateUrl: '/uiapp/app/components/venue/addeditvenue.partial.html',
            controller: 'addEditVenueController',
            resolve: {
                edit: function() { return false; },
                venue: function () {
                    return null;
                },
                links: function () {
                    return [
                        {text: "All Venues", link: "venue.adminList"},
                        {text: "Add Venue", link: "venue.adminAdd"}
                    ]
                },
                admin: function () { return true; }
            }
        })

        .state( 'venue.userAdd', {
            url: '/user-add',
            templateUrl: '/uiapp/app/components/venue/addeditvenue.partial.html',
            controller: 'addEditVenueController',
            resolve: {
                edit: function() { return false; },
                venue: function () {
                    return null;
                },
                links: function () {
                    return [
                        {text: "Back to Dash", link: "dash"}
                    ]
                },
                admin: function () { return false; }
            }
        })

        .state( 'device', {
            url:         '/device',
            templateUrl: '/uiapp/app/components/device/device-sidemenu.partial.html',
            controller:  function ( $scope ) { $scope.panelHeading = { text: "", color: "#0000FF" }},
            abstract:    true
        } )

        .state( 'device.list', {
            url:         '/list',
            controller:  'listDeviceController',
            templateUrl: '/uiapp/app/components/device/devicelist.partial.html',
            resolve:     {
                devices: function ( $http ) {
                    return $http.get( '/user/getDevices')
                        .then(function (data) {
                            return data.data;
                        })
                },
                admin: function () {
                    return false;
                },
                links: function () {
                    return [
                        {link: 'device.list', text: "My Devices"},
                        {link: 'device.add', text: 'Add Device'}
                    ]
                }
            }
        })

        .state( 'device.managerList', {
            url:         '/manager-list',
            controller:  'listDeviceController',
            templateUrl: '/uiapp/app/components/device/devicelist.partial.html',
            resolve:     {
                devices: function ( $http ) {
                    return $http.get( '/user/getManagedDevices')
                        .then(function (data) {
                            return data.data;
                        })
                },
                admin: function () {
                    return false;
                },
                links: function () {
                    return [
                        {link: 'device.managerList', text: "Managed Devices"},
                        // {link: 'device.add', text: 'Add Device'}
                    ]
                }
            }
        })

        .state( 'device.adminList', {
            url:        '/admin-list',
            controller:  'listDeviceController',
            templateUrl: '/uiapp/app/components/device/devicelist.partial.html',
            resolve:     {
                devices: function ( $http ) {
                    return $http.get(apiPath + '/device')
                        .then(function (data) {
                            return data.data;
                        })
                },
                admin: function () {
                    return true;
                },
                links: function () {
                    return [
                        {link: 'device.adminList', text: 'All Devices'},
                        {link: 'device.adminAdd', text: 'Add Device'}
                    ]
                }
            }
        })

        .state( 'device.userAdd', {
            url:         '/user-activate',
            data:        { subTitle: "Add a Device" },
            controller:  'addDeviceController',
            templateUrl: '/uiapp/app/components/device/add-device.partial.html',
            resolve:     {
                links: function () {
                    return [
                        { link: 'dash', text: 'Back to Dash' }
                    ]
                },
                user: function ( nucleus ) {
                    return nucleus.getMe()
                        // .then( function (me) {
                        //     return nucleus.getUser(me.id);
                        // });
                }
            }

        })

        .state( 'device.add', {
            url:         '/activate',
            data:        { subTitle: "Add a Device" },
            controller:  "addDeviceController",
            templateUrl: '/uiapp/app/components/device/add-device.partial.html',
            resolve:     {
                user: function ( nucleus ) {
                    return nucleus.getMe()
                },
                links: function () {
                    return [
                        {link: 'device.list', text: 'My Devices'},
                        {link: 'device.add', text: 'Add Device'}
                    ]
                }
            }
        } )

        .state('device.adminAdd', {
            url: '/activate-admin',
            data: {subTitle: "Add a Device"},
            controller: "addDeviceAdminController",
            templateUrl: '/uiapp/app/components/device/add-device.partial.html',
            resolve: {
                venues: function ($http) {
                    return $http.get(apiPath + '/venue')
                        .then(function (data) {
                            return data.data;
                        });
                },
                links: function () {
                    return [
                        {link: 'device.adminList', text: 'All Devices'},
                        {link: 'device.adminAdd', text: 'Add Device'}
                    ]
                }
            }
        })

        .state( 'device.register', {
            url:         '/register',
            data:        { subTitle: "Register a Device" },
            // controller:  "registerDeviceController",
            templateUrl: '/uiapp/app/components/device/register-device.partial.html'
        } )

        .state('device.adminManage', {
            url: '/admin-manage/:id',
            data:        { subTitle: "Manage Device" },
            controller:  'editDeviceAdminController',
            templateUrl: '/uiapp/app/components/device/manage-device.partial.html',
            resolve:     {
                device: function ( $http, $stateParams) {
                    return $http.get( apiPath+"/device/" +$stateParams.id)
                        .then( function (data) {
                            return data.data;
                        })
                },
                venues: function ($http) {
                    return $http.get(apiPath + '/venue')
                        .then(function (data) {
                            return data.data;
                        })
                },
                links: function () {
                    return [
                        {link: 'device.adminList', text: 'All Devices'},
                        {link: 'device.adminAdd', text: 'Add Device'}
                    ]
                }
            }
        })

        .state('device.ownerManage', {
            url: '/owner-manage/:id',
            data: {subTitle: "Manage Device"},
            controller: 'editDeviceOwnerController',
            templateUrl: '/uiapp/app/components/device/manage-device.partial.html',
            resolve: {
                device: function ($http, $stateParams) {
                    return $http.get(apiPath + "/device/" + $stateParams.id)
                        .then(function (data) {
                            return data.data;
                        })
                        .catch(function(err){
                            return err;
                        })
                },
                user: function ( nucleus ) {
                    return nucleus.getMe()
                },
                links: function () {
                    return [
                        {link: 'device.list', text: 'My Devices'},
                        {link: 'device.add', text: 'Add Device'}
                    ]
                }
            }
        } )

        .state('device.managerManage', {
            url: '/manager-manage/:id',
            data: {subTitle: "Manage Device"},
            controller: 'editDeviceOwnerController',
            templateUrl: '/uiapp/app/components/device/manage-device.partial.html',
            resolve: {
                device: function ($http, $stateParams) {
                    return $http.get(apiPath + "/device/" + $stateParams.id)
                        .then(function (data) {
                            return data.data;
                        })
                        .catch(function(err){
                            return err;
                        })
                },
                user: function ( nucleus ) {
                    return nucleus.getMe()
                },
                links: function () {
                    return [
                        {link: 'device.managerList', text: 'Managed Devices'},
                        // {link: 'device.add', text: 'Add Device'}
                    ]
                }
            }
        } )

        .state( 'organization', {
            url:         '/organization',
            templateUrl: '/uiapp/app/components/organization/organization-sidemenu.partial.html',
            abstract:    true,
            resolve:     {
                user: function ( nucleus ) {
                    return nucleus.getMe()
                }
            }
        } )

        .state( 'organization.edit', {
            url:         '/edit',
            resolve:     {},
            templateUrl: '/uiapp/app/components/organization/edit-organization.partial.html',
            controller:  'editOrganizationController'
        } )

        .state( 'organization.manage', {
            url:         '/manage',
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

        .state( 'organization.view', {
            url:         '/view',
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
            templateUrl: '/uiapp/app/components/device/device-sidemenu.partial.html',
            controller:  function ( $scope ) { $scope.panelHeading = { text: "", color: "#0000FF" }},
            abstract:    true,
            resolve: {
                user: function (nucleus) {
                    return nucleus.getMe();
                },
                links: function(){

                    return [
                        {text: 'My Advertisements', link: 'advertisement.list'},
                        {text: 'Create an Advertisement', link: 'advertisement.add'}
                    ]
                }
            }
        })

        .state( 'advertisement.add', {
            url:         '/add',
            templateUrl: '/uiapp/app/components/trevda/add-trevda.partial.html',
            data:        { subTitle: "Add Advertisement" },
            controller:  'addAdvertisementController'
        } )

        .state( 'advertisement.list', {
            url:         '/manage',
            templateUrl: '/uiapp/app/components/trevda/trevdalist.partial.html',
            data:        { subTitle: "Manage Advertisements" },
            controller:  'manageAdvertisementController',
            resolve: {
                ads: function($http) {
                    return $http.get("/user/getAlist").then(function (ads) {
                        return ads.data;
                    })
                },
                admin: function () {
                    return false;
                }


            }
        } )

        .state('advertisement.adminList', {
            url: '/admin-list',
            templateUrl: '/uiapp/app/components/trevda/trevdalist.partial.html',
            data: {subTitle: "Manage Advertisements"},
            controller: 'manageAdvertisementController',
            resolve: {
                ads: function ($http) {
                    return $http.get(apiPath + "/ad").then(function (ads) {
                        return ads.data;
                    })
                },
                admin: function () {
                    return true
                },
                links: function () {

                    return [
                        {text: 'All Advertisements', link: 'advertisement.adminList'},
                        //                      {text: 'Create an Advertisement', link: 'advertisement.add'}
                    ]
                }


            }
        })
        .state('advertisement.adminReview', {
            url: '/admin-review/:id',
            templateUrl: '/uiapp/app/components/trevda/trevdareview.partial.html',
            data: {subTitle: "Review Advertisement"},
            controller: 'reviewAdvertisementController',
            resolve: {
                ad: function ($http, $stateParams) {
                    return $http.get(apiPath + "/ad/" + $stateParams.id).then(function (ad) {
                        return ad.data;
                    })
                },
                admin: function () {
                    return true
                },
                links: function () {

                    return [
                        {text: 'All Advertisements', link: 'advertisement.adminList'},
                        //{text: 'Create an Advertisement', link: 'advertisement.add'}
                    ]
                }


            }
        })

        .state( 'advertisement.edit', {
            url:         '/edit/:id',
            templateUrl: '/uiapp/app/components/trevda/edit-trevda.partial.html',
            data:        { subTitle: "Edit Advertisement" },
            controller:  'editAdvertisementController',
            resolve: {
                advertisement: function ($stateParams, $http) {
                    return $http.get("api/v1/ad/" + $stateParams.id)
                        .then(function (data) {
                            return data.data;
                        })
                },
                mediaMeta: function ($stateParams, $http) {
                    return $http.get("ad/getMedia/" + $stateParams.id)
                        .then(function (data) {
                            return data.data;

                        })
                }
            }

        } )
        // =========== DASHBOARD

        .state( 'dash', {
            url:         '/dash',
            templateUrl: '/uiapp/app/components/dash/dash.partial.html',
            controller: 'dashController',
            resolve: {
                user: function (nucleus) {
                    return nucleus.getMe();
                }
            }
        } )

        .state('dash.proprietorowner', {
            templateUrl: '/uiapp/app/components/dash/po-dash.partial.html',
            controller: 'poDashController',
            resolve: {
                venues: function ( $http ) {
                    return $http.get( '/user/getVenues')
                        .then( function (data) {
                            return data.data;
                        })
                }
            }
        })

        .state('dash.proprietormanager', {
            templateUrl: '/uiapp/app/components/dash/pm-dash.partial.html',
            controller: 'pmDashController',
        })
        .state('dash.user', {
            templateUrl: '/uiapp/app/components/dash/user-dash.partial.html',
            controller: 'userDashController',
            resolve: {
                user: function (nucleus) {
                    return nucleus.getMe();
                }
            }
        })
        .state('dash.admin', {
        templateUrl: '/uiapp/app/components/dash/admin-dash.partial.html',
        controller: 'adminDashController',
        })
        .state('dash.advertiser', {
            templateUrl: '/uiapp/app/components/dash/ad-dash.partial.html',
            controller: 'adDashController',
            resolve: {
                ads: function ($http) {
                    return $http.get("/user/getAlist").then(function (ads) {
                        return ads.data;
                    })
                }
            }
        })


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
