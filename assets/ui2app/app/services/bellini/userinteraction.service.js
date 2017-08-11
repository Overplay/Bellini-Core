/**
 * Created by mkahn on 10/19/16.
 */


app.factory( "sailsUserInteractions", function ( sailsApi, sailsCoreModel ) {


    var getAll = function ( queryString ) {
        return sailsApi.apiGet( '/userinteraction', queryString )
            .then( function ( ui ) {
                return ui.map( newUserInteraction );
            } )
    }

    var CoreModel = sailsCoreModel.CoreModel;

    function ModelUserInteractionObject( json ) {

        CoreModel.call( this );

        this.modelType = 'userinteration'

        this.parseInbound = function ( json ) {

            this.interaction = json && json.interaction;
            this.meta = json && json.meta;
            this.deviceUDID = json && json.deviceUDID;
            this.venueUUID = json && json.venueUUID;


            this.parseCore( json );
        };

        // Should never be posting
        this.getPostObj = function () {
            throw new Error( 'Should not be modifying User Interactions' )
        };

        this.parseInbound( json );


    }

    ModelUserInteractionObject.prototype = Object.create( CoreModel.prototype );
    ModelUserInteractionObject.prototype.constructor = ModelUserInteractionObject;

    var newUserInteraction = function ( params ) {
        return new ModelUserInteractionObject( params );
    }

    var getUserInteraction = function ( id ) {

        return sailsApi.getModel( 'userinteration', id )
            .then( newUserInteraction );
    }

    var getUniquePatronsForVenue = function ( venueUUID ) {
        return sailsApi.apiGet( '/userinteraction/patronsforvenue?venueUUID=' + venueUUID );
    }

    // Exports...new pattern to prevent this/that crap
    return {
        getAll:                   getAll,
        get:                      getUserInteraction,
        getUniquePatronsForVenue: getUniquePatronsForVenue
    }

} );