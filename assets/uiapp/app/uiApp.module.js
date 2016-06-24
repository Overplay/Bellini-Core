/**
 * Created by mkahn on 4/6/16.
 */

var app = angular.module('uiApp', [ 'nucleus.service', 'ngAnimate',  'ui.router', 'ui.bootstrap', 'toastr' ]);

app.config( function ( toastrConfig ) {
    angular.extend( toastrConfig, {
        positionClass:         'toast-bottom-center'
    } );
} );

app.run( function ( $log, $rootScope ) {

    $log.info( "Asahi is pouring!" );

    $rootScope.$on( '$stateChangeError',
        function ( event, toState, toParams, fromState, fromParams, error ) {
            $log.error( "State change fail!" );
        } )

} );