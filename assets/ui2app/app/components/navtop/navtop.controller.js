/**
 * Created by mkahn on 4/21/17.
 */

app.controller( "navTopController", function ( $scope, $log, user, $rootScope, userAuthService ) {

    $log.debug( "Loading navTopController" );

    $scope.showBurgerMenu = false;

    $scope.links = [];

    if (!user){
        $window.location = '/';
    } else {


        var managerLinks = [
            { label: "venues", sref: "manager.venues", icon: "building" },
            { label: "devices", sref: "manager.devices", icon: "television" }
        ];

        var ownerLinks = [
            { label: "venues", sref: "owner.venues", icon: "building" },
            { label: "devices", sref: "owner.devices", icon: "television" },
            { label: "managers", sref: "owner.managers", icon: "users" }
        ];

        var advertiserLinks = [
            { label: "ads", sref: "sponsor.dashboard", icon: "bullhorn" }
        ];

        var adminLinks = [
            { label: "admin dashboard", sref: "admin.dashboard", icon: "cube" }
        ];

        if ( _.includes( user.roleTypes, 'proprietor.manager' ) ) {
            $scope.links =  managerLinks ;
        }

        // Don't want dupes, just the more powerful links
        if ( _.includes( user.roleTypes, 'proprietor.owner' ) ) {
            $scope.links = ownerLinks;
        }

        if ( _.includes( user.roleTypes, 'advertiser' ) ) {
            $scope.links = $scope.links.concat( advertiserLinks );
        }

        if ( _.includes( user.roleTypes, 'admin' ) ) {
            $scope.links = $scope.links.concat( adminLinks );
        }


    }

    $scope.logout = function(){
        userAuthService.logout();
    }


    
    $scope.toggleSideMenu = function(){
        $rootScope.$broadcast("TOGGLE_SIDEMENU");
    }

} );