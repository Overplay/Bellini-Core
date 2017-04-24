/**
 * Created by mkahn on 4/19/17.
 */


app.factory( "sailsApi", function ( $http ) {

    service = {};

    var _apiPath = '/api/v1';


    // This little chunk of code is used all the time, just different endpoints
    service.apiGet = function ( endPoint ) {

        function stripData( data ) { return data.data };

        return $http.get( endPoint )
            .then( stripData );

    }

    service.apiPut = function ( endPoint, params ) {

        return $http.put( endPoint, params )
            .then( stripData );

    }

    service.apiPost = function ( endPoint, params ) {

        return $http.post( endPoint, params )
            .then( stripData );

    }

    service.apiDelete = function ( endPoint ) {

        return $http.delete( endPoint )
            .then( stripData );

    }

    service.buildEp = function ( model, query ) {

        return _apiPath + '/' + model + ( query ? '?' + query : '' );
    }

    service.putCleanse = function ( modelObj ) {

        delete modelObj.createdAt;
        delete modelObj.updatedAt;
        delete modelObj.id;
        return modelObj;

    }

    // Convenience getter
    service.getModels = function ( model, query ) {
        var ep = this.buildEp( model, query );
        return this.apiGet( ep );
    }

    service.getModel = function ( model, id ) {
        var ep = this.buildEp( model ) + "/" + id;
        return this.apiGet( ep );
    }

    service.deleteModel = function ( model, id ) {
        var ep = this.buildEp( model ) + "/" + id;
        return this.apiDelete( ep );
    }

    service.updateModel = function ( model, id, params ) {
        var ep = this.buildEp( model ) + "/" + id;
        return this.apiPut( ep, params );
    }

    service.createModel = function ( model, params ) {
        var ep = this.buildEp( model );
        return this.apiPost( ep, params );
    }

    // Helper
    service.idFromIdOrObj = function ( source ) {
        if ( _.isString( source ) )
            return source;
        return source && source.id;
    }


    return service;

} );