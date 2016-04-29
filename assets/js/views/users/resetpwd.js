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


    $scope.user = { password2: "", password: "" }
    $scope.ui = { errorMessage: "" }

    var resetToken = getParameterByName('token');
    var email = getParameterByName( 'email' );

    $scope.passwordOK = function () {

        $scope.ui.errorMessage = '';

        var lenOK = $scope.user.password.length > 7;
        var match = $scope.user.password == $scope.user.password2;

        if ( !lenOK )
            $scope.ui.errorMessage = "Password too short";

        if ( !match )
            $scope.ui.errorMessage = $scope.ui.errorMessage + "Passwords don't match";

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