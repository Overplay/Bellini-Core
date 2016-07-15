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

   /* $rootScope.$on('$stateChangeStart',
        function(event, toState, toParams, fromState, fromParams, options){
            //TODO test user and toState and reroute if necessary
                // maybe write service and inject into app.run above then call it here
                //http://stackoverflow.com/questions/22537311/angular-ui-router-login-authentication
                // prevent default if the user is not allowed to access a page
                // worries - speed
                // define somewhere? use existing navbar array links to define what users can access?
                // issue example - Organization view/edit is one controller/route
                    // there exists a view only though! - just gotta make sure routing is correct
            // or http://stackoverflow.com/questions/28518181/angular-ui-router-how-to-prevent-access-to-a-state

            $log.log("event " , event);
            $log.log("toState " , toState);
            $log.log("toParams " , toParams);
            $log.log("fromState " , fromState);
            $log.log("fromParams " , fromParams);

            $log.log("options " , options);
            //event.preventDefault(); to keep from changing to the new state
        })*/

} );

app.filter('capitalize', function() {
    return function(input, scope) {
        if (input!=null)
            input = input.toLowerCase();
        return input.substring(0,1).toUpperCase()+input.substring(1);
    }
});