

function makeFullUrl(path){

    return sails.config.uservice.deviceManager.url + path;
}


module.exports = {

    OGDevice: {

        findByUDID: function(udid){

            return ProxyService.get(makeFullUrl('/ogdevice/findByUUID'), { deviceUDID: udid })
                .then( function(resp){
                    return resp.body;
                });
        },

        findAll: function(){

            return ProxyService.get(makeFullUrl('ogdevice/all'), { virtual: false })
                .then( function(resp){
                    return resp.body;
                });

        }

    }



}