/**
 * Created by mkahn on 4/24/17.
 */

// 1=admin, 2=device, 3=user, 4=advertiser

app.component( 'adEdit', {

    bindings:   {
        advert: '=',
        ring:   '<'
    },
    controller: function ( uibHelper, toastr, $log, $rootScope, sailsMedia, sailsAds, $state, userAuthService ) {

        var ctrl = this;

        function replicate( toRep, toRec) {
            toRec.createdAt = toRep.createdAt;
            toRec.creator = toRep.creator;
            toRec.deleted = toRep.deleted;
            toRec.id = toRep.id;
            toRec.metaData = toRep.metaData;
            toRec.paused = toRep.paused;
            toRec.reviewState = toRep.reviewState;
            toRec.updatedAt = toRep.updatedAt;
        }

        // { object:, field:, heading:, subhead:, successMsg:, errMsg: }
        function editField( params ) {
            uibHelper.stringEditModal( params.heading, params.subhead, params.object[ params.field ] )
                .then( function ( nval ) {
                    params.object[ params.field ] = nval;
                    params.object.save()
                        .then( function ( d ) {
                            replicate(d, ctrl.advert);
                            toastr.success( params.successMsg );
                        } )
                        .catch( function ( err ) {
                            toastr.success( params.errMsg );
                        } )
                } )
        }

        this.changeName = function () {
            $log.debug( 'Changing name...' );
            editField( {
                object:     ctrl.advert,
                field:      'name',
                heading:    'Change Ad Name',
                subhead:    'Enter a new name for the ad below.',
                successMsg: 'Name changed',
                errMsg:     'There was a problem changing the ad name'
            } );
        };

        this.changeDesc = function () {
            $log.debug( 'Changing desc...' );
            editField( {
                object:     ctrl.advert,
                field:      'description',
                heading:    'Change Ad Description',
                subhead:    'Enter a new description for the ad below.',
                successMsg: 'Description changed',
                errMsg:     'There was a problem changing the ad description'
            } );

        }

        function saveAdModel() {

            if ( !ctrl.advert.creator ) {
                return userAuthService.getCurrentUser()
                    .then( function ( user ) {
                        ctrl.advert.creator = user.id;
                        return ctrl.advert.save();
                    } )
            } else {
                return ctrl.advert.save();
            }

        }

        function fieldToggleSuccess() {
            toastr.success( "Field changed" );
        }

        function fieldToggleFail() {
            toastr.success( "Field could not be changed" );
        }

        this.toggleField = function ( booleanFieldName ) {
            ctrl.advert[ booleanFieldName ] = !ctrl.advert[ booleanFieldName ];
            ctrl.advert.save()
                .then( fieldToggleSuccess )
                .catch( fieldToggleFail );
        }

        this.editCrawlerText = function () {

            $log.debug( 'Changing crawler test...' );

            var fields = [
                {
                    label:       "Text Advert One",
                    placeholder: "say something magical",
                    type:        'text',
                    field:       'text0',
                    value:       ctrl.advert.advert.text[ 0 ] || ''
                },
                {
                    label:       "Text Advert Two",
                    placeholder: "say something else magical",
                    type:        'text',
                    field:       'text1',
                    value:       ctrl.advert.advert.text[ 1 ] || ''
                },
                {
                    label:       "Text Advert Three",
                    placeholder: "say something even more magical",
                    type:        'text',
                    field:       'text2',
                    value:       ctrl.advert.advert.text[ 2 ] || ''
                }

            ];

            uibHelper.inputBoxesModal( "Text Adverts", "", fields )
                .then( function ( fields ) {
                    $log.debug( fields );
                    ctrl.advert.advert.text = _.compact( _.flatMap( fields ) );
                    ctrl.advert.save()
                        .then( function () {
                            toastr.success( "Text ads changed" );
                        } )
                        .catch( function () {
                            toastr.error( "Problem changing text ads!" );
                        } );
                } );


        };

        ctrl.mediaDirty = {
            widget:  null,
            crawler: null
        };

//        var dropper = $rootScope.$on( 'FILE_DROPPED', function ( ev, data ) {
//            var imgdest = data.tag;
//            $log.debug( "image dropped for: " + imgdest + ". " + data.file.name );
//            sailsMedia.newWithFile( data.file )
//                .then( function ( media ) {
//                    ctrl.advert.advert.media[ imgdest ] = media;
//                    return ctrl.advert.save()
//                } )
//                .then( function ( advert ) {
//                    toastr.success( "Image updated" );
//                } )
//                .catch( function ( err ) {
//                    toastr.error( "Image update failed Reason: ", err.message );
//                } );
//
//        } );

//        this.$onDestroy = function(){
//            dropper(); //unreg
//        }

        this.changeAdState = function () {

            var availableStates = [];

            switch ( ctrl.ring ) {

                case 1:
                    // can go anywhere
                    availableStates = sailsAds.legalReviewStates;
                    break;

                case 4:
                    availableStates = ctrl.advert.nextLegalReviewStates();
                    break;

                default:
                    availableStates = [ 'broken' ];
            }

            uibHelper.selectListModal( "Choose New Review State", "Choose from the list below.", availableStates, 0 )
                .then( function ( idx ) {
                    ctrl.advert.reviewState = availableStates[ idx ];
                    ctrl.advert.save()
                        .then( function () {
                            toastr.success( 'State Changed' );
                        } )
                        .catch( function ( err ) {
                            toastr.error( 'State Could not be changed.' );
                        } )
                } )

        }

        this.deleteAd = function () {

            var confirmValue = '';

            uibHelper.stringEditModal( "Confirm", "To confirm deletion, type the ad name below and then click OK.", confirmValue )
                .then( function ( rval ) {
                    if ( !rval || rval == ctrl.advert.name ) {
                        ctrl.advert.delete()
                            .then( function () {
                                toastr.success( "Ad Deleted" );
                                $state.go( ctrl.ring == 1 ? 'admin.adlist' : 'sponsor.adlist' );
                            } )
                    }
                } )
        }

        this.fileUpdate = function (file) {
            var imgdest = file.tag;
            $log.debug( "image dropped for: " + imgdest + ". " + file.name );
            sailsMedia.newWithFile( file )
                .then( function ( media ) {
                    ctrl.advert.advert.media[ imgdest ] = media;
                    return ctrl.advert.save()
                } )
                .then( function ( advert ) {
                    replicate(advert, ctrl.advert);
                    toastr.success( "Image updated" );
                } )
                .catch( function ( err ) {
                    toastr.error( "Image update failed Reason: ", err.message );
                } );
        }

    },

    template: `
         <table class="table top15">
        <tbody>
        <tr>
            <td>Running/Paused</td>
            <td><i class="fa" ng-class="$ctrl.advert.paused ? 'fa-hand-paper-o' : 'fa-thumbs-o-up'" aria-hidden="true"></i>&nbsp;{{ $ctrl.advert.paused ? "Ad is paused" : "Ad is running" }}</td>
            <td>
                <button style="width:100%" class="btn btn-thin" ng-class="!$ctrl.advert.paused ? 'btn-danger' : 'btn-success'" ng-click="$ctrl.toggleField('paused')">
                <span class="glyphicon" ng-class="{'glyphicon-play': $ctrl.advert.paused, 'glyphicon-pause': !$ctrl.advert.paused}"></span>
                </button>
            </td>
        </tr>


        <tr>
            <td>Review State</td>
            <td>{{ $ctrl.advert.reviewState }}</td>
            <td><button style="width:100%" class="btn btn-thin btn-primary" ng-click="$ctrl.changeAdState()">Change State</button> </td>
        </tr>
        </tbody>
    </table>
     <table class="table table-striped top15">
        <tbody>
        <tr>
            <td>Name</td>
            <td>{{$ctrl.advert.name}}</td>
            <td><i class="fa fa-pencil-square-o ibut pull-right" aria-hidden="true" ng-click="$ctrl.changeName()"></i></td>
        </tr>
        <tr>
            <td>Description</td>
            <td>{{$ctrl.advert.description}}</td>
            <td><i class="fa fa-pencil-square-o ibut pull-right" aria-hidden="true" ng-click="$ctrl.changeDesc()"></i></td>

        </tr>
         <tr>
            <td>Crawler Text</td>
            <td>
                <ul ng-if="$ctrl.advert.advert.text.length"><li ng-repeat="t in $ctrl.advert.advert.text">{{ t }}</li></ul>
                <span class="text-warning" ng-if="!$ctrl.advert.advert.text.length">No crawler text</span>
            </td>
            <td>
                <i class="fa fa-pencil-square-o ibut pull-right" aria-hidden="true" ng-click="$ctrl.editCrawlerText()"></i>
            </td>
        </tr>
        </tbody>
        </table>
        
        <div>
            <h4>Media</h4>
                    <!--<img-input prompt="Widget" width="256" height="256" dirty="$ctrl.mediaDirty.widget"-->
                               <!--src-field="$ctrl.advert.advert.media.widget" exact tag="widget"></img-input>-->
                    <!--<img-input prompt="Crawler" width="440" height="100" dirty="$ctrl.mediaDirty.crawler"-->
                               <!--src-field="$ctrl.advert.advert.media.crawler" exact tag="crawler"></img-input>-->
                    <image-input width="256" height="256" heading="Widget" constraint="exact" tag="widget"
                                 image-id="$ctrl.advert.advert.media.widget.id" on-update="$ctrl.fileUpdate(file)"></image-input>
                    <image-input width="440" height="100" heading="Crawler" constraint="exact" tag="crawler"
                                 image-id="$ctrl.advert.advert.media.crawler.id" on-update="$ctrl.fileUpdate(file)"></image-input>
        </div>    
        
        <button class="btn btn-danger" style="width: 100%" ng-click="$ctrl.deleteAd()">DELETE AD</button>
    
    `


} );