/**
 * Created by mkahn on 10/19/16.
 */


app.factory( "sailsAds", function ( sailsApi, sailsCoreModel ) {


    var getAll = function ( queryString ) {
        return sailsApi.getModels( 'ad', queryString )
            .then( function ( users ) {
                return users.map( newAd );
            } )
    }

    var CoreModel = sailsCoreModel.CoreModel;

    function ModelAdObject( json ) {

        CoreModel.call( this );

        this.modelType = 'ad'

        this.parseInbound = function ( json ) {
            this.name = json && json.name || '';
            this.description = json && json.description || '';
            this.createrId = json && json.creater;
            this.advert = json && json.advert || {};
            this.paused = json && json.paused;
            this.reviewState = json && json.reviewState;
            this.deleted = json && json.deleted;
            this.metaData = json && json.metaData;

            // Clean up missing entries in advert.text (HACK)
            if (this.advert && this.advert.text){
                this.advert.text = _.compact(this.advert.text);
            }

            this.parseCore( json );
        };

        this.getPostObj = function () {
            var fields = [ 'name', 'description', '@id:createrId', 'advert', 'paused', 'reviewState', 'deleted', 'metaData' ];
            return this.cloneUsingFields( fields );
        };

        this.nextLegalReviewStates = function(){

            switch (this.reviewState){
                case 'Not Submitted':
                    return ['Waiting for Review']; // Submit

                case 'Waiting for Review':
                    return ['Not Submitted']; // decide to cancel review

                case 'Rejected':
                case 'Accepted':
                    return ['Not Submitted', 'Waiting for Review'];
            }

        };

        this.parseInbound( json );

    }

    ModelAdObject.prototype = Object.create( CoreModel.prototype );
    ModelAdObject.prototype.constructor = ModelAdObject;

    var legalReviewStates = [ 'Not Submitted', 'Waiting for Review', 'Rejected', 'Accepted' ];

    var newAd = function ( params ) {
        return new ModelAdObject( params );
    }

    var getAd = function ( id ) {

        if ( id == 'new' ) {
            return newAd( { name: 'New Ad' } ); // empty user
        }

        return sailsApi.getModel( 'ad', id )
            .then( newAd );
    }

    var getUnreviewed = function(){
        return sailsApi.apiGet('/ad/forReview');
    }



    return {
        getAll:        getAll,
        new:           newAd,
        get:           getAd,
        getForReview:  getUnreviewed,
        legalReviewStates: legalReviewStates,

        }

} );