/**
 * Created by mkahn on 4/22/17.
 */

app.factory( 'sideMenu', function ( $rootScope ) {

    var currentKey = '';

    var menuGroups = {
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

    return {

        change: function ( group ) {
            currentKey = group;
        },

        getMenu: function () {
            if ( currentKey )
                return menuGroups[ currentKey ];

            return [];
        }

    }

} );


app.controller( 'redirectController', [ 'userAuthService', '$state', function ( userAuthService, $state ) {
    // TODO think about removing the individual dashbaords and just add tiles to one unified dash
    userAuthService.getCurrentUser()
        .then( function ( user ) {

            if ( _.includes( user.roleTypes, 'admin' ) ) {
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