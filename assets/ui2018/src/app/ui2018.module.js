/**
 *  Control2
 *  ES6 Update of the original OG Control App
 *
 * */

require( './assets/styles/ui2018.scss' );

import angular from 'angular';
import ngAnimate from 'angular-animate';
import ngTouch from 'angular-touch';
import uirouter from '@uirouter/angularjs';
import ngtoastr from 'angular-toastr';



import routing from './ui2018.routes';


// Define ngApp module
const ngModule = angular.module( 'ngApp', [ ngAnimate, ngTouch, uirouter.ngtoastr ] );

// Create an Angular service from the OgNet class imported above.



// Configure stateProvider
ngModule.config( [ '$stateProvider', function ( $stateProvider ) {

    // Parent is the ORIGINAL UNDECORATED builder that returns the `data` property on a state object
    $stateProvider.decorator( 'data', function ( state, parent ) {
        // We don't actually modify the data, just return it down below.
        // This is hack just to tack on the user resolve
        const stateData = parent( state );
        // Add a resolve to the state
        state.resolve = state.resolve || {};
        state.resolve.user = [ 'userAuthService', function ( userAuthService ) {
            return userAuthService.getCurrentUser();
        } ];
        return stateData;

    } );

} ] );

// Configure routing. THIS MUST COME AFTER THE $stateProvider call above!!!
ngModule.config( routing );

ngModule.config([ 'toastrConfig', function ( toastrConfig ) {
    angular.extend( toastrConfig, {
        positionClass: 'toast-bottom-center'
    } );
}] );


ngModule.config(['uiGmapGoogleMapApiProvider', function ( uiGmapGoogleMapApiProvider ) {
    uiGmapGoogleMapApiProvider.configure( {
        key: 'AIzaSyCrbE5uwJxaBdT7bXTGpes3F3VmQ5K9nXE'
    } )
}] );


ngModule.run( [ '$log', '$transitions',
    function ( $log, $transitions ) {

        $log.debug( 'Control2 starting...' );

        // Log out transition errors for debug
        $transitions.onError( {}, function ( transError ) {
            $log.debug( transError );
        } );

    } ] );


// Could have auto bootstrapped through HTML, but I prefer the manual in case we need to
// tweak the flow.
angular.bootstrap( document, [ 'ngApp' ] );
