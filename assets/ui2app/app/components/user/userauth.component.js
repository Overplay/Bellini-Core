/**
 * Created by mkahn on 4/24/17.
 */

app.component( 'userAuth', {

    bindings:   {
        user: '=',
        ring: '<'
    },
    controller: function ( uibHelper, toastr, $log, userAuthService, dialogService ) {

        var ctrl = this;



        ctrl.blockedChange = function () {
            ctrl.user.updateBlocked()
                .then( function () {
                    toastr.success( "Block state updated" );
                } )
                .catch( function ( err ) {
                    toastr.failure( "Could not change block state. " + err.message );
                } )
        }

        function changePassword( newPass ) {
            return userAuthService.changePassword( { email: ctrl.user.email, password: newPass } )
                .then( function () {
                    toastr.success( "Don't forget it!", "Password Changed" );
                } );

        }

        ctrl.changePassword = function () {

            dialogService.passwordDialog()
                .then(changePassword)
                .catch( function(err){
                    toastr.error(err.message, 'Problem Changing Password!');
                })
        }

        ctrl.tempPassword = function () {

            var tempPwd = userAuthService.genRandomPassword();

            uibHelper.confirmModal( "Set Temporary Password?", 'Are you sure you want to set the user\'s password to: "' + tempPwd + '"', tempPwd )
                .then( changePassword )
                .catch( function ( err ) {
                    toastr.error( err.message, 'Problem Changing Password!' );
                } )
        }

        ctrl.changeRing = function () {

            uibHelper.selectListModal( "Change Ring", "Select a new security ring below.", [ 'Admin', 'Device',
                'User', 'Advertiser', 'Other (unused)' ], ctrl.user.ring - 1 )
                .then( function ( choice ) {
                    return ctrl.user.setRing( choice + 1 );
                } )
                .then( function ( newUser ) {
                    toastr.success( "User's ring level was changed" );
                } )
                .catch( function ( err ) {
                    toastr.error( err.message );
                } )

        }

        ctrl.devChange = function() {

            ctrl.user.save()
                .then( function ( newUser ) {
                    $log.debug(newUser.isDev ? "is dev":"is NOT dev");
                    const msg = newUser.isDev ? "Developer mode on!" : "NOT a Developer!";
                    toastr.success( msg );
                } )
                .catch( function ( err ) {
                    toastr.error( err.message );
                } )
        }

        // TODO: Super repetitive from the above...
        ctrl.ogChange = function () {

            ctrl.user.save()
                .then( function ( newUser ) {
                    $log.debug( newUser.isOG ? "is OG" : "is NOT OG" );
                    const msg = newUser.isOG ? "OG mode on!" : "OG mode off";
                    toastr.success( msg );
                } )
                .catch( function ( err ) {
                    toastr.error( err.message );
                } )
        }


    },

    template: `
            <div ng-if="$ctrl.ring==1">
                <!-- Change Ring controls. Not needed if auth level is too low -->
                <h5 class="subhead">Ring Level</h5>
                <p><ring-badge ring="$ctrl.user.ring"></ring-badge></p>
                 <button ng-click="$ctrl.changeRing()" class="btn btn-sm btn-warning">CHANGE RING</button>
                 </p>
                 <hr>
            </div>
            <h5 class="subhead">Password</h5>
            <button class="btn btn-sm btn-primary" ng-click="$ctrl.changePassword()">CHANGE PASSWORD</button>
            <button ng-if="$ctrl.ring==1" class="btn btn-sm btn-primary" ng-click="$ctrl.tempPassword()">GENERATE TEMP PASSWORD</button>
            <hr>
            <div ng-if="$ctrl.ring==1">
                 <!-- Change block controls. Not needed if auth level is too low -->
                <h5 class="subhead">Account Blocking</h5>
                <p>User is currently <span ng-class="$ctrl.user.blocked ? 'text-danger' : 'text-success'">
                 <b>{{ $ctrl.user.blocked?"BLOCKED":"ENABLED" }}</b>
                 </span></p>
                 <input type="checkbox" ng-model="$ctrl.user.blocked" ng-click="$ctrl.blockedChange()"/>&nbsp;Block User
                 <!-- Turn on developer -->
                  <h5 class="subhead">Developer Permissions</h5>
                <!--<p>User is currently a developer: <span ng-class="$ctrl.user.isDev ? 'text-danger' : 'text-success'">-->
                 <!--<b>{{ $ctrl.user.isDev?"YES":"NO" }}</b>-->
                 <!--</span></p>-->
                 <input type="checkbox" ng-model="$ctrl.user.isDev" ng-click="$ctrl.devChange()"/>&nbsp;User is developer
                 <!-- Turn on OG mode for employees -->
                  <h5 class="subhead">OG Permissions</h5>
                <!--<p>User is currently an OG: <span ng-class="$ctrl.user.isOG ? 'text-danger' : 'text-success'">-->
                 <!--<b>{{ $ctrl.user.isOG?"YES":"NO" }}</b>-->
                 <!--</span></p>-->
                 <input type="checkbox" ng-model="$ctrl.user.isOG" ng-click="$ctrl.ogChange()"/>&nbsp;User is OG
             </div>
    
    `


} );