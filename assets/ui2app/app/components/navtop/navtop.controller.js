/**
 * Created by mkahn on 4/21/17.
 */

app.controller( "navTopController", function ( $scope, $log, user, $rootScope ) {

    $log.debug( "Loading navTopController" );

    $scope.showBurgerMenu = false;

    $scope.links = [];

    if (!user){
        $window.location = '/';
    } else {


        var managerLinks = [
            { label: "venues", sref: "venues", icon: "building" },
            { label: "devices", sref: "devices", icon: "television" }
        ];

        var ownerLinks = [
            { label: "managers", sref: "managers", icon: "users" }
        ];

        var advertiserLinks = [
            { label: "ads", sref: "sponsorships", icon: "bullhorn" }
        ];

        var adminLinks = [
            { label: "admin dashboard", sref: "adminroot", icon: "cube" }
        ];

        if ( _.includes( user.roleTypes, 'proprietor.manager' ) ) {
            $scope.links = $scope.links.concat( managerLinks );
        }

        if ( _.includes( user.roleTypes, 'proprietor.owner' ) ) {
            $scope.links = $scope.links.concat( ownerLinks );
        }

        if ( _.includes( user.roleTypes, 'advertiser' ) ) {
            $scope.links = $scope.links.concat( advertiserLinks );
        }

        if ( _.includes( user.roleTypes, 'admin' ) ) {
            $scope.links = $scope.links.concat( adminLinks );
        }


    }




    
    $scope.toggleSideMenu = function(){
        $rootScope.$broadcast("TOGGLE_SIDEMENU");
    }

} );