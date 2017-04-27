/**
 * Created by mkahn on 10/19/16.
 */


app.factory( "sailsOGDevice", function ( sailsApi, sailsCoreModel ) {


    var getAll = function ( queryString ) {
        // using non blueprint getter for security
        return sailsApi.apiGet( '/devicemanager/alldevices', queryString )
            .then( function ( ogdevices ) {
                return ogdevices.map( newOGDevice );
            } )
    }

    var CoreModel = sailsCoreModel.CoreModel;

    function ModelOGDeviceObject( json ) {

        CoreModel.call( this );

        this.modelType = 'ogdevice'

        this.parseInbound = function ( json ) {
            this.deviceUDID = json && json.deviceUDID;
            this.atVenueUUID = json && json.atVenueUUID;
            this.name = json && json.name;
            this.runningApps = json && json.runningApps;
            this.logs = json && json.logs;
            this.hardware = json && json.hardware;
            this.software = json && json.software || true;
            this.data = json && json.data;
            this.lastContact = json && json.lastContact;
            this.pairedTo = json && json.pairedTo;
            this.currentProgram = json && json.currentProgram;
            this.timeZoneOffset = json && json.timeZoneOffset;
            this.favoriteChannels = json && json.favoriteChannels;
            this.hideChannels = json && json.hideChannels;
            this.tempRegCode = json && json.tempRegCode;


            this.parseCore( json );
        };


        this.parseInbound( json );

        // TODO will need to determine how to handle the relation fields as we work on the UI
        this.getPostObj = function () {
            var fields = [ 'atVenueUUID', 'name', 'favoriteChannels', 'hideChannels' ];
            return this.cloneUsingFields( fields );

        }

    }

    ModelOGDeviceObject.prototype = Object.create( CoreModel.prototype );
    ModelOGDeviceObject.prototype.constructor = ModelOGDeviceObject;

    var newOGDevice = function ( params ) {
        return new ModelOGDeviceObject( params );
    }

    var getOGDevice = function ( udid ) {
        return sailsApi.apiGet( '/devicemanager/findByUDID?deviceUDID='+udid )
            .then( newOGDevice );
    }


    // Exports...new pattern to prevent this/that crap
    return {
        getAll:    getAll,
        new:       newOGDevice,
        get:       getOGDevice
    }

} )