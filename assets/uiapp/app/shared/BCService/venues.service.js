/**
 * Created by mkahn on 10/19/16.
 */


app.factory( "sailsVenues", function ( sailsApi, sailsCoreModel ) {


    var getAll = function ( queryString ) {
        return sailsApi.getModels( 'venue', queryString )
    }

    var CoreModel = sailsCoreModel.CoreModel;

    function ModelVenueObject( json ) {

        CoreModel.call( this );

        this.modelType = 'venue'

        this.parseInbound = function ( json ) {
            this.name = json && json.name || '';
            this.yelpId = json && json.yelpId || '';
            this.uuid = json && json.uuid;
            this.address = json && json.address;
            this.logo = json && json.logo;
            this.geolocation = json && json.geolocation;
            this.showInMobileApp = json && json.showInMobileApp || true;
            this.venueOwners = json && json.venueOwners;
            this.venueManagers = json && json.venueManagers;
            this.organization = json && json.organization;
            this.sponsorships = json && json.sponsorships;
            this.virtual = json && json.virtual || false;

            this.parseCore(json);
        };
        

        this.parseInbound( json );

    }

    ModelVenueObject.prototype = Object.create( CoreModel.prototype );
    ModelVenueObject.prototype.constructor = ModelVenueObject;

    var newVenue = function ( params ) {
        return new ModelVenueObject( params );
    }

    var getVenue = function ( id ) {
        return sailsApi.getModel( 'venue', id )
            .then( newVenue );
    }
    
    // TODO Brittle?
    var getByUUID = function( uuid ){
        return sailsApi.getModels( 'venue', "uuid="+uuid)
            .then(function(varr){
                return newVenue(varr[0]);
            });
    }


    // Exports...new pattern to prevent this/that crap
    return {
        getAll: getAll,
        new:    newVenue,
        get:    getVenue,
        getByUUID: getByUUID
    }

} )