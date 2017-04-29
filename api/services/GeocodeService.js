/**
 * Created by mkahn on 4/7/16.
 * Common Admin tasks for Waterlock
 *
 */

var _ = require('lodash');
var Promise = require('bluebird');

var GOOGLE_API_KEY = "AIzaSyCw8dpRIiMusiUIVqoTE9j-kSuGIt0mn8s";
var googleMapsClient = require( '@google/maps' ).createClient( {
    key: GOOGLE_API_KEY
} );

module.exports = {

    geocode: function(addressString){

        return new Promise( function(resolve, reject){

            // Geocode an address.
            googleMapsClient.geocode( {
                address: addressString
            }, function ( err, response ) {
                if ( !err ) {
                    resolve( response.json.results );
                }
                reject(err);
            } );

        });

    }


}