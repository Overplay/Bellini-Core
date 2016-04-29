/**
 * Created by mkahn on 4/6/16.
 */

var app = angular.module('uiApp', [ 'nucleus.service', 'ngAnimate',  'ui.router', 'ui.bootstrap', 'toastr' ]);

app.config( function ( toastrConfig ) {
    angular.extend( toastrConfig, {
        positionClass:         'toast-bottom-center'
    } );
} );