/**
 * Created by mkahn on 4/24/17.
 */

app.component( 'adEdit', {

    bindings:   {
        advert: '='
    },
    controller: function ( uibHelper, toastr, $log ) {

        var ctrl = this;

        // { object:, field:, heading:, subhead:, successMsg:, errMsg: }
        function editField( params ) {
            uibHelper.stringEditModal( params.heading, params.subhead, params.object[ params.field ] )
                .then( function ( nval ) {
                    params.object[ params.field ] = nval;
                    params.object.save()
                        .then( function ( d ) {
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

        function fieldToggleSuccess() {
            toastr.success( "Field changed" );
        }

        function fieldToggleFail() {
            toastr.success( "Field coould not be changed" );
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
                    ctrl.advert.advert.text = _.compact(_.flatMap(fields));
                    ctrl.user.save()
                        .then( function () {
                            toastr.success( "Text ads changed" );
                        } )
                        .catch( function () {
                            toastr.error( "Problem changing text ads!" );
                        } );
                } );


        }

    },

    template: `
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
         <tr ng-if="$ctrl.advert.advert.media">
            <td>Media</td>
            <td colspan="2"><fieldset class="form-group">
                                    <h2>Images</h2>
                                    <img-input prompt="Widget" width="256" height="256" dirty="media.widget"
                                               src-field="advertisementUpdate.advert.media.widget" exact></img-input>
                                    <img-input prompt="Crawler" width="440" height="100" dirty="media.crawler"
                                               src-field="advertisementUpdate.advert.media.crawler" exact></img-input>
                                </fieldset></td>
       

        </tr>
        <!--TODO small medium and large-->
        <tr ng-repeat="size in mediaSizes" ng-if="$ctrl.advert.advert.media[size]">
            <td></td>
            <td>{{size | capitalize}}</td>
            <td><a href="media/download/{{$ctrl.advert.advert.media[size]}}"><img
                    class="media-prev"
                    ng-src="media/download/{{$ctrl.advert.advert.media[size]}}"/></a>
            </td>
        </tr>
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
            <td><button style="width:100%" class="btn btn-thin" ng-click="reviewStateButtonClicked()">Change State</button> </td>
        </tr>


       
       
       
        </tbody>
    </table>
    
    
    `


} );