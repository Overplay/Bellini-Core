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
            { label: "Add Venue", sref: "admin.addvenue({id: 'new'})", icon: "building-o" },
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


app.controller( 'redirectController', [ 'userAuthService', '$state', function ( userAuthService, $state ) {
    // TODO think about removing the individual dashbaords and just add tiles to one unified dash
    userAuthService.getCurrentUser()
        .then( function ( user ) {

            if ( user.isAdmin ) {
                $state.go( 'admin.dashboard' );
            }

            else if ( _.includes( user.roleTypes, 'advertiser' ) ) {
                $state.go( 'sponsor.dashboard' );
            }

            else if ( _.includes( user.roleTypes, 'proprietor.owner' ) ) {
                $state.go( 'owner.dashboard' );
            }

            else if ( _.includes( user.roleTypes, 'proprietor.manager' ) ) {
                $state.go( 'manager.dashboard' );
            }

            else {
                $state.go( 'user.dashboard' );
            }

        } )

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