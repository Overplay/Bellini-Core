

function makeFullUrl(path){

    return sails.config.uservice.deviceManager.url + path;
}


module.exports = {

    OGDevice: {

        findByUDID: function(udid){

            return ProxyService.get(makeFullUrl('/ogdevice/findByUDID'), { deviceUDID: udid })
                .then( function(resp){
                    return resp.body;
                });
        },

        findAll: function(query){

            return ProxyService.get(makeFullUrl('/ogdevice/all'), query)
                .then( function(resp){
                    return resp.body;
                });

        },

        update: function( id, params ){

            var fullUrl = makeFullUrl('/ogdevice/'+id);
            return ProxyService.post( fullUrl, params )
                .then( function ( resp ) {
                    return resp.body;
                } );
        }

    }



}