/**
 * Created by mkahn on 6/22/17.
 */

app.component( 'imageInput', {

    bindings:   {
        heading:  '@',
        imageId:  '<',
        onUpdate: '&',  // requires on-update="myupdateFunc(file)" then called as shown below.
        width:    '@',
        height:   '@',
        constraint: '@',
        tag: '@'

    },
    controller: function ( $log, $rootScope, $timeout ) {

        var ctrl = this;

        this.$onChanges = function(){

            if (ctrl.imageId){
                ctrl.imageSrc = '/media/download/'+ctrl.imageId;
            } else {
                var psize = { width: ctrl.width, height: ctrl.height }
                if (ctrl.constraint == 'aspect'){
                    psize.width = psize.width * 20;
                    psize.height = psize.height * 20;

                }
                ctrl.imageSrc = "http://placehold.it/" + psize.width + 'x' + psize.height;
            }

        };

        function checkExact(img){
            return (img.width==ctrl.width) && (img.height==ctrl.height);
        }

        function checkAspect( img ) {
            var targetAspect = ctrl.width / ctrl.height;
            var currentAspect = img.width / img.height;
            var deltaPct = Math.abs(targetAspect-currentAspect)/targetAspect*100;
            return deltaPct < 1.0;
        }


        this.filesDropped = function ( files ) {

            $log.debug( "Files dropped!" );
            var fr = new FileReader();
            var acceptedTypes = [ "image/png", "image/jpeg", "image/gif" ];
            var img = new Image();

            img.onload = function () {
                $log.debug( "Loaded file into image" );

                if (ctrl.constraint){

                    switch(ctrl.constraint){

                        case 'exact':
                            if (!checkExact(img)){
                                $log.info("New image is wrong dims.");
                                return showWarning("Image is wrong dimensions. Image must be "+ctrl.width+
                                    " by "+ctrl.height+" pixels.");
                            }
                            break;

                        case 'aspect':
                            $log.info( "New image is wrong aspect." );
                            if ( !checkAspect( img ) ) {
                                return showWarning( "Image is wrong aspect ratio. Image must be " + ctrl.width +
                                    " : " + ctrl.height + " ratio." );
                            }
                            break;

                    }

                }

                $rootScope.$apply( function(){
                    ctrl.imageSrc = fr.result;
                    files[0].tag = ctrl.tag || 'notag';
                    ctrl.onUpdate({ file: files[0] });
                })
            };

            fr.onload = function () {
                $log.debug("Loaded file");
                img.src = window.URL.createObjectURL( files[ 0 ] );
                $rootScope.$broadcast( 'FILE_DROPPED', { tag: ctrl.tag || 'imgInput', file: files[ 0 ] } );

            };

            if ( acceptedTypes.indexOf( files[ 0 ].type ) <= -1 ) {
                showWarning( "Error: invalid file type" );
            }
            else {
                fr.readAsDataURL( files[ 0 ] );
            }

        }


        // This would be used to signal bad files, bad sizes.
        function showWarning( message ) {
            $rootScope.$apply( function () {

                ctrl.warning = message;
                $timeout( function () { ctrl.warning = "" }, 3500 );

            })
        }

    },
    template:   `

<style>
.img-input-holder {
    /*border: 1px solid #ff0074;*/
    border-radius: 3px;
    -webkit-box-shadow: 1px 1px 1px 0px rgba(168, 168, 168, 1);
    -moz-box-shadow: 1px 1px 1px 0px rgba(168, 168, 168, 1);
    box-shadow: 1px 1px 1px 0px rgba(168, 168, 168, 1);  
}       
.warning-popup {
    position: absolute;
    width: 90%;
    background-color: red;
    padding: 10px;
    color: white;
    top: 40%;
    text-align: center;
    border-radius: 5px;
    margin: 0 auto;
}

.dropout{
    background-color: #272e34;
     -webkit-transition: all 0.35s;
    -moz-transition: all 0.35s;
    -ms-transition: all 0.35s;
    -o-transition: all 0.35s;
    transition: all 0.35s;
}
.faded {
    opacity: 0.5;
     -webkit-transition: all 0.35s;
    -moz-transition: all 0.35s;
    -ms-transition: all 0.35s;
    -o-transition: all 0.35s;
    transition: all 0.35s;
}
</style>

        <div class="img-input-holder">
        <div class="panel panel-default">
            <div class="panel-heading">
                <h3 class="panel-title">{{ $ctrl.heading }}
                    <span ng-if="$ctrl.width && $ctrl.height"> ( {{ $ctrl.width }} x {{ $ctrl.height }} {{ $ctrl.constraint }})</span>
                </h3>
            </div>
            <div ng-class="{'dropout': $ctrl.warning}" class="panel-body" style="position: relative;" drag-and-drop on-drop="$ctrl.filesDropped">
                <img ng-class="{'faded': $ctrl.warning}" ng-src="{{ $ctrl.imageSrc }}"
                    uib-tooltip="Drag and drop image here"
                    style="display: block; margin: 0 auto; max-width: 100%; max-height: 300px;"/>
                <div class="warning-popup" ng-show="$ctrl.warning">{{ $ctrl.warning }}</div>
            </div>
            <div class="panel-footer">
                <p>Drag and drop a JPG or PNG file anywhere in this panel to add or replace the image.
                   </p>
            </div>
    
        </div>
    </div>
        
    
    
    `
} );