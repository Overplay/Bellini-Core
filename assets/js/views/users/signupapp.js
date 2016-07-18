/**
 * Created by cgrigsby on 7/18/16.
 */


var app = angular.module('signupApp', ['ui.bootstrap', 'ngAnimate', 'nucleus.service']);


app.controller('signupController', function ($scope, $log, nucleus, $timeout, $window) {

    $scope.auth = {email: "", password: "", passwordConfirm: ""};
    $scope.user = {firstName: '', lastName: '', roleNames: [{ role: 'user', sub: ''}], roles: [], address: {}};
    $scope.ui = {errorMessage: "", error: false};
    $scope.phoneRegex = "^(?:(?:\\+?1\\s*(?:[.-]\\s*)?)?(?:\\(\\s*([2-9]1[02-9]|[2-9][02-8]1|[2-9][02-8][02-9])\\s*\\)|([2-9]1[02-9]|[2-9][02-8]1|[2-9][02-8][02-9]))\\s*(?:[.-]\\s*)?)?([2-9]1[02-9]|[2-9][02-9]1|[2-9][02-9]{2})\\s*(?:[.-]\\s*)?([0-9]{4})(?:\\s*(?:#|x\\.?|ext\\.?|extension)\\s*(\\d+))?$";

    $scope.signup = function () {
        $log.debug("Signup clicked for: " + $scope.auth.email + " and password: " + $scope.auth.password);


        nucleus.addUser($scope.auth.email, $scope.auth.password, $scope.user)
            .then(function (data) {
                $log.log(data);
                //todo redirect to ui app if successful
                //$window.location.href = '/ui';

            })
            .catch(function (err) {
                $log.error("Could not create account");
                $scope.ui.errorMessage = "Account creation failed: " + err.data.message;
                $scope.ui.error = true;
                $scope.auth.email = '';
                $timeout(function () {
                    $scope.ui.error = false;
                }, 5000)
                    .then(function () {
                        $timeout(function () {
                            $scope.ui.errorMessage = "";
                        }, 1000);
                    });
            })
    }
    
    $scope.pwCheck = function () {
        return $scope.auth.password && $scope.auth.passwordConfirm &&
               $scope.auth.password.length > 7 && $scope.auth.passwordConfirm.length > 7 &&
               $scope.auth.password === $scope.auth.passwordConfirm;
    }


});