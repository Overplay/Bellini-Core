/**
 * Created by cgrigsby on 7/18/16.
 */


var app = angular.module('signupApp', ['ui.bootstrap', 'ngAnimate', 'nucleus.service']);


app.controller('signupController', function ($scope, $log, nucleus) {

    $scope.auth = {email: "", password: ""}
    $scope.user = {firstName: '', lastName: '', roles: [RoleCacheService.roleByName("user", '')]}
    $scope.ui = {errorMessage: "", error: false}

    $scope.signup = function () {
        $log.debug("Signup clicked for: " + $scope.user.email + " and password: " + $scope.user.password);


        nucleus.addUser($scope.auth.email, $scope.auth.password, $scope.user)
            .then(function (data) {
                $log.log(data)
                //todo redirect to ui app if successful 
            })
            .catch(function (err) {
                $log.log(err)
            })
    }


});