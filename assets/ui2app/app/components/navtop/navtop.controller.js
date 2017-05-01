/**
 * Created by mkahn on 4/21/17.
 */

app.controller( "navTopController", function ( $scope, $log, user, $rootScope, navService, userAuthService ) {

    $log.debug( "Loading navTopController" );

    $scope.showBurgerMenu = false;

    if (!user){
        $window.location = '/';
    } else {
        $scope.links = navService.topMenu.buildForUser(user);
    }

    $scope.logout = function(){
        userAuthService.logout();
    }

    $scope.toggleSideMenu = function(){
        $rootScope.$broadcast("TOGGLE_SIDEMENU");
    }

} );