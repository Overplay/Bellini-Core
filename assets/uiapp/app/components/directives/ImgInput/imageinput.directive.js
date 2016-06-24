/**
 * Created by mkahn on 6/20/16.
 */

app.directive('imgInput', function($log, $timeout){
    return {
        restrict: 'E',
        scope: {
            dirty: '=?',
            srcField: '=?',
            prompt: '@'
        },
        link: function ( scope, elem, attrs ){

            var w = attrs.width || '128';
            var h = attrs.height || '128';

            var placeholder = "http://placehold.it/" + w + 'x' + h;

            scope.warning = '';
            scope.img = {
                widthPx: w+'px',
                heightPx: h+'px',
                style: { width: w + 'px', height: h + 'px' },
                mediaSrc: scope.srcField ? '/media/download/'+scope.srcField : placeholder
            }

            scope.filesDropped = function(files){

                $log.debug("Files dropped!");
                var fr = new FileReader();
                fr.onload = function () {

                    // Must force digest since onload event is outside of angular
                    scope.$apply( function(){
                        //TODO Ryan, validate correct image size and file type here.
                        scope.img.mediaSrc = fr.result;
                        scope.dirty = files[0]; // it's truthy and the file we want the Controller to upload


                    })
                };
                // TODO Ryan, check file mimetype here and reject anything not JPG, PNG
                fr.readAsDataURL( files[0] );

                // For testing only.
                showWarning( files[ 0 ].name );


            }

            // TODO Ryan, make this hide/show animated using ng-animate

            // This would be used to signal bad files, bad sizes.
            function showWarning(message){
                scope.warning = message;
                $timeout( function(){ scope.warning="" }, 2000);
            }
        
        },
        templateUrl: '/uiapp/app/components/directives/ImgInput/imageinput.template.html'
    }

})

// lets you give a dbid as source
app.directive('nMedia', function(){

    return {
        restrict: 'A',
        link:     function ( scope, elem, attrs ) {

            attrs.$set( 'src', '/media/download/' + attrs.nSrc );

        }
    }

})