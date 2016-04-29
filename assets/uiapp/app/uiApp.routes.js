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
                userAuths: function ( nucleus ) {
                    return nucleus.getAuth();
                }
            }

        } )


        .state( 'admin.manageUsers', {
            url:         '/manage-users',
            data:        { subTitle: "Manage Users" },
            controller:  'adminManageUsersController',
            templateUrl: '/uiapp/app/components/admin/admin-manage-users.partial.html'


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
                user: function ( nucleus, $stateParams ) {
                    return nucleus.getAuth( $stateParams.id )
                },
                roles: function ( nucleus) {
                    return nucleus.getRole() 
                }
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


