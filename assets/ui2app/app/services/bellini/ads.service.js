/**
 * Created by mkahn on 10/19/16.
 */


app.factory( "sailsAds", function ( sailsApi, sailsCoreModel, userAuthService ) {


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
            this.creator = json && json.creator; // This is a straight ID
            this.advert = json && json.advert || { text: [], media:[], type: "2g3t" };
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
            var fields = [ 'name', 'description', 'creator', 'advert', 'paused', 'reviewState', 'deleted', 'metaData' ];
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

        this.create = function(){

            // Override the create method to add a creator, if none exists
            if (!this.creator){
                var _this = this;
                return userAuthService.getCurrentUser()
                    .then( function ( u ) {
                        _this.creator = u.id;
                        return CoreModel.prototype.create.call(_this);
                    } )
            } else {
                // This is unlikely to ever be called, but here you go.
                return CoreModel.prototype.create.call(_this);
            }

        }

    }

    ModelAdObject.prototype = Object.create( CoreModel.prototype );
    ModelAdObject.prototype.constructor = ModelAdObject;

    var legalReviewStates = [ 'Not Submitted', 'Waiting for Review', 'Rejected', 'Accepted' ];

    var newAd = function ( params ) {
        return new ModelAdObject( params );
    }

    var getAd = function ( id ) {

        if ( id == 'new' ) {
            return newAd( { name: 'New Ad' } ); // empty ad
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