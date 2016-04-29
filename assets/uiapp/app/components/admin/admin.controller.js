/**
 * Created by mkahn on 4/8/16.
 */

app.controller("adminManageUsersController", function($scope, userAuths, $state, $log){

    $log.debug("adminManageUsersController starting");
    $scope.subTitle = $state.current.data.subTitle;
    $scope.users = userAuths;

});

app.controller( "adminEditUserController", function ( $scope, userAuths, $state ) {

    $scope.subTitle = $state.current.data.subTitle;
    $scope.users = userAuths;

} );