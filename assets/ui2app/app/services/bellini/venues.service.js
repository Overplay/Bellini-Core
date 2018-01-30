/**
 * Created by mkahn on 10/19/16.
 */


app.factory( "sailsVenues", function ( sailsApi, sailsCoreModel, sailsOGDeviceRemote, sailsUserInteractions ) {


    var getAll = function ( queryString ) {
        // using non blueprint getter for security
        return sailsApi.apiGet( '/venue/all', queryString )
            .then( function ( venues ) {
                return venues.map( newVenue );
            } )
    }

    var CoreModel = sailsCoreModel.CoreModel;

    function ModelVenueObject( json ) {

        CoreModel.call( this );

        this.modelType = 'venue'

        this.parseInbound = function ( json ) {
            this.name = json && json.name || '';
            this.yelpId = json && json.yelpId || '';
            this.googlePlaceId = json && json.googlePlaceId || '';
            this.uuid = json && json.uuid;
            this.address = json && json.address;
            this.logo = json && json.logo;
            this.geolocation = json && json.geolocation || {};
            this.showInMobileApp = json && json.showInMobileApp || true;
            this.venueOwners = json && json.venueOwners;
            this.venueManagers = json && json.venueManagers;
            this.organization = json && json.organization;
            this.sponsorships = json && json.sponsorships;
            this.virtual = json && json.virtual || false;
            this.devices = [];
            this.visibleToPublic = json && json.visibleToPublic;

            this.parseCore( json );
        };


        this.parseInbound( json );

        // TODO will need to determine how to handle the relation fields as we work on the UI
        this.getPostObj = function () {
            var fields = [ 'name', 'yelpId', 'address', 'geolocation', 'showInMobileApp',
                'virtual', '@id:logo', 'googlePlaceId', 'sponsorships', 'visibleToPublic' ];
            return this.cloneUsingFields( fields );

        };

        this.populateDevices = function () {

            var _this = this;
            return sailsOGDeviceRemote.getAll( 'forVenueUUID=' + this.uuid )
                .then( function ( devices ) {
                    _this.devices = devices;
                    return _this;
                } )

        };

        this.addUserAs = function ( user, asType ) {
            if ( !_.includes( [ 'manager', 'owner' ], asType ) ) {
                throw new Error( 'Type must be owner or manager' );
            }

            var ep = (asType == 'owner') ? '/venue/addOwner' : '/venue/addManager';

            var userId = sailsApi.idFromIdOrObj( user );

            var vid = this.id;

            return sailsApi.apiPost( ep, { userId: userId, id: this.id } )
                .then( function ( data ) {
                    return getVenue( vid );
                } );
        }

        this.removeUserAs = function ( user, asType ) {
            if (!_.includes( ['manager', 'owner' ], asType ) ) {
                throw new Error( 'Type must be owner or manager');
            }

            var ep = (asType === 'owner') ? '/venue/removeOwner' : '/venue/removeManager';

            var userId = sailsApi.idFromIdOrObj( user );

            var vid = this.id;

            return sailsApi.apiPost( ep, { userId: userId, id: this.id })
                .then( function (data) {
                    return getVenue(vid);
                })
        }

        this.addressString = function () {
            if ( this.address ) {
                var addr = this.address;

                return addr.street + " " +
                    (addr.street2 ? addr.street2 + " " : "") +
                    addr.city + ", " +
                    addr.state + " " +
                    addr.zip;
            }
        }

        this.attachLogo = function ( file ) {

            var _this = this;

            return sailsApi.uploadMedia( file )
                .then( function ( mediaJson ) {
                    _this.logo = mediaJson.id;
                    return _this;
                } ); // TODO left off here with Ryan
        }

        this.getUniquePatrons = function(){
            return sailsUserInteractions.getUniquePatronsForVenue(this.uuid);
        }

    }

    ModelVenueObject.prototype = Object.create( CoreModel.prototype );
    ModelVenueObject.prototype.constructor = ModelVenueObject;

    var newVenue = function ( params ) {
        return new ModelVenueObject( params );
    }

    var getVenue = function ( id ) {
        if (id === 'new')
            return newVenue({ name: 'New Venue' });

        return sailsApi.getModel( 'venue', id )
            .then( newVenue );
    }

    var getByUUID = function ( uuid ) {
        return sailsApi.apiGet( '/venue/findbyuuid/' + uuid )
            .then( newVenue );
    }

    var geocode = function ( address ) {
        return sailsApi.apiGet( '/venue/geocode/', { params: { address: address } } );
    }

    var yelpSearch = function ( params, timeout ) {
        return sailsApi.apiGet( '/venue/yelpSearch/', { params: params } )
            .then( function ( data ) {
                return data.businesses;
            } );
    }

    var getMyVenues = function () {
        return sailsApi.apiGet( '/venue/myvenues' )
            .then( function ( vjson ) {
                return {
                    managed: vjson.managed.map( newVenue ),
                    owned:   vjson.owned.map( newVenue )
                }
            } )
    }

    var addressToString = function (addr) {
        if (!addr)
            return null;

        return addr.street + " " +
            (addr.street2 ? addr.street2 + " " : "") +
            addr.city + ", " +
            addr.state + " " +
            addr.zip;
    }

    // Exports...new pattern to prevent this/that crap
    return {
        getAll:      getAll,
        new:         newVenue,
        get:         getVenue,
        getByUUID:   getByUUID,
        getMyVenues: getMyVenues,
        geocode:     geocode,
        yelp:        yelpSearch,
        addressStr:  addressToString,
    }

} )