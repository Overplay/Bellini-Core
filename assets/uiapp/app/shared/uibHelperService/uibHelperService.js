/**
 * Created by mkahn on 4/10/16.
 */

/**
 *
 * Wraps some of the more labor intensive bits of UI-Bootstrap such as:
 * - Modals
 *
 *
 */


app.factory( 'uibHelper', function ( $log, $uibModal ) {
    "use strict";

    var service = {};

    /**
     *
     * Provides a very basic UIB confirm modal with almost no options. Returns the result promise.
     *
     * Usage:  uibHelper.confirmModal("My Title", "Body Text", true)
     *          .then( function(confirmed){
     *              // do something with confirmation
     *          });
     *
     * @param title
     * @param body
     * @param confirmValue
     * @returns {*}
     */
    service.confirmModal = function( title, body, confirmValue ){

        var modalInstance = $uibModal.open( {
            templateUrl: '/uiapp/app/shared/uibHelperService/confirmmodal.template.html',
            controller:  function( $scope, $uibModalInstance, params ){

                $scope.modalUi = { title: params.title, body: params.body };

                $scope.ok = function(){
                    $uibModalInstance.close( params.confirmValue );
                }

                $scope.cancel = function(){
                    $uibModalInstance.dismiss( 'cancel' );
                }

            },
            resolve:     {
                params: function () {
                    return { title: title, body: body, confirmValue: confirmValue };
                }
            }
        } );

        return modalInstance.result;


    }

    return service;

});
