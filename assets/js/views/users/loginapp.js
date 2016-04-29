/**
 * Created by mkahn on 4/5/16.
 */

var app = angular.module( 'loginApp', [ 'ui.bootstrap', 'ngAnimate', 'nucleus.service' ] );

app.controller( "loginController", function ( $scope, $log, $http, $window, $timeout, nucleus ) {


    $scope.user = { email: "", password: "" }
    $scope.ui = { errorMessage: "" }

    $scope.login = function(){

        $log.debug( "Login clicked for: " + $scope.user.email + " and password: " + $scope.user.password );
        nucleus.authorize( $scope.user.email, $scope.user.password  )
            .then( function ( res ) {
                $log.info( "Logged in" );
                $window.location.href = '/ui';
            } )
            .catch( function ( err ) {
                $log.error( "Could not log in" );
                $scope.ui.errorMessage = "Login failed";
                $timeout( function () { $scope.ui.errorMessage = ""; }, 5000 );
            } );

    }

    $scope.forgot = function() {

        if (!$scope.user.email){
            $scope.ui.errorMessage = "Please enter your email";
            $timeout( function () { $scope.ui.errorMessage = ""; }, 5000 );
        } else {
            nucleus.reqNewPwd($scope.user.email)
                .then( function(){
                    $scope.ui.errorMessage = "Check your email for a reset link!";
                    $timeout( function () {
                        $scope.ui.errorMessage = "";
                        window.location.href = '/';}, 5000 );
                })
                .catch( function () {
                    $scope.ui.errorMessage = "There was a problem resetting your password.";
                    $timeout( function () { $scope.ui.errorMessage = ""; }, 5000 );
                } )
        }


    }
});