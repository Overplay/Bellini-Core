/**
 * Created by mkahn on 4/6/16.
 */

var app = angular.module('uiApp', [ 'nucleus.service', 'ngAnimate',  'ui.router', 'ui.bootstrap', 'toastr', 'uiGmapgoogle-maps' ]);

app.config( function ( toastrConfig ) {
    angular.extend( toastrConfig, {
        positionClass:         'toast-bottom-center'
    } );
} );

app.config( function ( uiGmapGoogleMapApiProvider) {
    uiGmapGoogleMapApiProvider.configure({
        key: 'AIzaSyCrbE5uwJxaBdT7bXTGpes3F3VmQ5K9nXE'
    })
})

app.run( function ( $log, $rootScope ) {

    $log.info( "Asahi is pouring!" );


    $rootScope.$on( '$stateChangeError',
        function ( event, toState, toParams, fromState, fromParams, error ) {
            $log.error( "State change fail!" );
        } )




} );

app.filter('capitalize', function() {
    return function(input, scope) {
        if (input!=null)
            input = input.toLowerCase();
        return input.substring(0,1).toUpperCase()+input.substring(1);
    }
});