/**
 * Created by mkahn on 4/6/16.
 */

var app = angular.module( 'uiApp', [ 'ui.router', 'ui.bootstrap', 'toastr', 'ui.og', 'googlechart', 'ngAnimate', 'uiGmapgoogle-maps' ] );

app.config( function ( toastrConfig ) {
    angular.extend( toastrConfig, {
        positionClass: 'toast-bottom-center'
    } );
} );

app.config( function ( uiGmapGoogleMapApiProvider ) {
    uiGmapGoogleMapApiProvider.configure( {
        key: 'AIzaSyCrbE5uwJxaBdT7bXTGpes3F3VmQ5K9nXE'
    } )
} );


// This adds a current user resolve to every single state
app.config( function ( $stateProvider ) {

    // Parent is the ORIGINAL UNDECORATED builder that returns the `data` property on a state object
    $stateProvider.decorator( 'data', function ( state, parent ) {
        // We don't actually modify the data, just return it down below.
        // This is hack just to tack on the user resolve
        var stateData = parent( state );
        // Add a resolve to the state
        state.resolve = state.resolve || {};
        state.resolve.user = [ 'userAuthService', function ( userAuthService ) {
            return userAuthService.getCurrentUser();
        } ];
        return stateData;

    } );

} );

//
// app.config(['ChartJsProvider', function (ChartJsProvider) {
//     // Configure all charts
//     ChartJsProvider.setOptions({
//         chartColors: ['#3FAD49', '#39A8FF'],
//     });
// }])


app.run( function ( $log, $rootScope, toastr, $state, $trace, $transitions, userAuthService, navService, sideMenuService ) {

    $log.info( "Bellini is pouring!" );

    const SHOW_STATE_ERRORS = false;

    $trace.enable( 'TRANSITION' );

    function authMsg( isAuthorized ) {
        if ( isAuthorized ) {
            return true;
        } else {
            toastr.error( "We're gonna need you to stop doing that.", "Not Authorized" );
            return false;
        }
    }

    // userAuthService.getCurrentUserRing()
    //     .then( function ( r ) {
    //         $rootScope.authring = r;
    //         $log.debug( 'R: ' + r );
    //     } );

    $transitions.onStart( {}, function ( trans ) {
        // var SpinnerService = trans.injector().get( 'SpinnerService' );
        // SpinnerService.transitionStart();
        // trans.promise.finally( SpinnerService.transitionEnd );
        $log.debug( trans );
    } );


    // Menu hook

    $transitions.onSuccess( {}, function ( trans ) {
        $log.debug( "Successfully transitioned to state: " + trans.to().name );
        sideMenuService.setMenu(trans.to().sideMenu);
        //navService.sideMenu.setSideMenuForState( trans.to().name );
    } );


    // Security hooks

    $transitions.onBefore( { to: 'admin.**' }, function () {
        $log.debug( 'Running hook for transition to admin state' );
        return userAuthService.getCurrentUserRing()
            .then( function ( ring ) {
                return authMsg( ring === 1 );
            } )
    } );

    $transitions.onBefore( { to: 'manager.**' }, function () {
        $log.debug( 'Running hook for transition to manager state' );
        return userAuthService.getCurrentUser()
            .then( function ( user ) {
                return authMsg( user.isAnyManager );
            } )
    } );

    $transitions.onBefore( { to: 'owner.**' }, function () {
        $log.debug( 'Running hook for transition to owner state' );
        return userAuthService.getCurrentUser()
            .then( function ( user ) {
                return authMsg( user.isOwner );
            } )
    } );


    $transitions.onError( {}, function ( transError ) {
        $log.debug( transError );
        if ( SHOW_STATE_ERRORS )
            toastr.warning( "State Change Fail" );
    } );


} );

app.filter( 'capitalize', function () {
    return function ( input, scope ) {
        if ( input != null )
            input = input.toLowerCase();
        return input.substring( 0, 1 ).toUpperCase() + input.substring( 1 );
    }
} );

app.filter( 'startFrom', function () {
    return function ( input, start ) {
        //        start = parseInt(start);
        if ( input )
            return input.slice( start );
        return null;
    }
} );

app.filter( 'addressify', function () {
    return function ( addressJson ) {
        var newAddr = addressJson.street + ' ';
        newAddr += addressJson.city + ', ';
        newAddr += addressJson.state + ' ';
        newAddr += addressJson.zip;
        return newAddr;
    }
} );

app.filter( 'ringToHuman', function () {
    return function ( ring ) {
        var rings = [ 'Admin', 'Device', 'User', 'Advertiser', 'Other (unused)' ];
        return rings[ ring - 1 ];
    }
} );

function stripHttpData( data ) { return data.data };
