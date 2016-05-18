/**
 * Created by mkahn on 4/5/16.
 */

var app = angular.module( 'resetApp', [ 'ui.bootstrap', 'ngAnimate', 'nucleus.service' ] );

app.controller( "resetController", function ( $scope, $log, nucleus, $location ) {

    // Using this method instead of $location.search() because search() is broken with # routes
    function getParameterByName( name, url ) {
        if ( !url ) url = window.location.href;
        name = name.replace( /[\[\]]/g, "\\$&" );
        var regex = new RegExp( "[?&]" + name + "(=([^&#]*)|&|#|$)", "i" ),
            results = regex.exec( url );
        if ( !results ) return null;
        if ( !results[ 2 ] ) return '';
        return decodeURIComponent( results[ 2 ].replace( /\+/g, " " ) );
    }


    $scope.user = {password2: "", password: ""};
    $scope.validate = {length: true, match: true};

    var resetToken = getParameterByName('token');
    var email = getParameterByName( 'email' );

    $scope.lengthOK = function () {
        var element = document.getElementById("password-main"), i;
        $scope.validate.length = true;

        if (!$scope.user.password) {
            i = element.className.indexOf(" has");
            if (i !== -1)
                element.className = element.className.slice(0, i);
        }
        else if ($scope.user.password.length <= 7) {
            element.className += " has-error";
            $scope.validate.length = false;
        }

        else {
            i = element.className.indexOf(" has-error");
            if (i !== -1)
                element.className = element.className.slice(0, i);
            element.className += " has-success";
        }
    }

    $scope.matchOK = function () {
        var element = document.getElementById("password-repeat"), i;
        $scope.validate.match = true;

        if (!$scope.user.password2) {
            i = element.className.indexOf(" has");
            if (i !== -1)
                element.className = element.className.slice(0, i);
        }
        else if ($scope.user.password != $scope.user.password2) {
            $scope.validate.match = false;
            element.className += " has-error";
        }
        else {
            i = element.className.indexOf(" has-error");
            if (i !== -1)
                element.className = element.className.slice(0, i);
            element.className += " has-success";
        }
    }
    
    $scope.passwordOK = function () {

        var lenOK = $scope.user.password.length > 7;
        var match = $scope.user.password == $scope.user.password2;

        return match && lenOK;
    }

    $scope.reset = function () {

        // TODO: do something useful and throw up toasts
        nucleus.changePassword({ email: email, newpass: $scope.user.password, resetToken: resetToken })
            .then( function(){
                $location.path('/login');
            })
            .catch( function(){
                $log.error("Change fail, do something useful!");
            })
    }

} );