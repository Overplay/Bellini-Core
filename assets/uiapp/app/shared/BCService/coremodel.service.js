/**
 * Created by mkahn on 10/19/16.
 */


app.factory( "sailsCoreModel", function ( sailsApi ) {


    function CoreModel() {

        this.modelType = 'core';
        
        this.parseCore = function(json){
            this.createdAt = json && json.createdAt;
            this.updatedAt = json && json.updatedAt;
            this.id = json && json.id;
        }
    }

    CoreModel.prototype.update = function ( params ) {
        return sailsApi.apiPut( sailsApi.buildEp( this.modelType ) + '/' + this.id, params || this.getPostObj() );

    }

    CoreModel.prototype.create = function () {
        var _this = this;
        return sailsApi.apiPost( sailsApi.buildEp( this.modelType ), this.getPostObj() )
            .then( function ( pdat ) {
                _this.parseInbound( pdat );
                return pdat;
            } );
    }

    CoreModel.prototype.delete = function () {
        return sailsApi.apiDelete( sailsApi.buildEp( this.modelType ) + '/' + this.id );
    }

    CoreModel.prototype.save = function () {
        if ( this.id ) return this.update();
        return this.create();
    }

    CoreModel.prototype.refresh = function () {
        var _this = this;
        return sailsApi.apiGet( sailsApi.buildEp( this.modelType ) + '/' + this.id )
            .then( function ( json ) {
                _this.parseInbound( json );
                return _this;
            } )
    }


    return {
        CoreModel: CoreModel
    }


});