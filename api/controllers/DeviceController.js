/**
 * DeviceController
 *
 * @description :: Server-side logic for managing devices
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {

    /*
        given an activation code, registerDevice searches for a device with this code
        if it exists, it removes the code, and updates the device information so that it is active
        if it does not exist, the code was incorrect / a user never started the registration proc for it
     */
    registerDevice: function (req, res) {
        //get code
        var params = req.allParams();
        /*req certain params? CEG

         wifi mac address -tbd 
         code 
         */
        if ((params.regCode === undefined)) //test other stuff too
            return res.badRequest({error: "No registration code specified"});


        var deviceObj = {};

        /*use if the user is logged in on the box when registering??
         deviceObj.deviceOwner = req.session.user.id;
         */

        deviceObj.regCode = params.regCode;

        //sails.log.debug(deviceObj, "searching ");

        return Device.findOne(deviceObj)
            .then(function (device) {

                //check if device exists
                if (device) {
                    var ca = device["createdAt"];
                    if (Date.now() < Date.parse(ca) + sails.config.device.regCodeTimeout) {
                        sails.log.debug(device, "being updated");
                        params.regCode = ''; //clear registration code 

                        //TODO JSONWebToken into apiToken field
                        params.apiToken = APITokenService.createToken(device.id);
                        
                        //TODO MAC Address -- done on android device :) - will act as UUID 
                        params.wifiMacAddress = 'FETCH FROM ANDROID'; //in req? 

                        return Device.update({id: device.id}, params);
                    }
                }

            }).then(function (devices) {
                if (devices.length != 1) { //should never find and update more than one device
                    sails.log.debug("NOT GOOD UPDATE :(");
                    return res.serverError({error: "Too many or too few devices updated"})
                }
                sails.log.debug(devices, "updated/registered");
                return res.ok(devices[0]);

            })
            .catch(function (err) {
                return res.serverError({error: err});
            });
    },

    //TODO remove once production
    //creates a test device for demo purposes 
    testDevice: function(req, res) {
        //sails.log.debug(req.allParams());
        return Device.create(req.allParams())
            .then(function(dev){
                //sails.log.debug(dev)
                return res.ok(dev)
            })
            .catch(function(err){
                sails.log.debug({error: err})
            })
    },

    // backup: function (req, res) {
    //
    //     var params = req.allParams();
    //
    //     if (!params || !params.id || !params.backup)
    //         return res.badRequest("Missing params");
    //
    //     Device.findOne({ id: params.id })
    //         .then( function (device) {
    //             if (!device) {
    //                 return res.badRequest("Device not found");
    //             }
    //             device.deviceBackup = params.backup;
    //
    //             return Device.update({ id: device.id }, device)
    //
    //         })
    //
    // },

    getUserRolesForDevice: function(req, res) {

        var userId = '';

        var token = waterlock._utils.getAccessToken(req) //token is already validated by policy
        token = waterlock.jwt.decode(token, waterlock.config.jsonWebTokens.secret);
        waterlock.validator.findUserFromToken(token, function(err, user){
            if(err){
                return res.badRequest({error: err});
            }
            sails.log.debug(user)
            if (!user)
                return res.badRequest({error: "User not found from token"})
            userId = user.id
        });


        var params = req.allParams();

        if (!params.id)
            return res.badRequest({error: "No device ID provided"})

        var deviceId = params.id;


        var roles = []
        Device.findOne(deviceId)
            .then(function(d){
                if (!d)
                    return res.notFound({error: "Invalid Device ID"})
                else {
                    return User.findOne(userId)
                        .populate('managedVenues')
                        .populate('ownedVenues')
                        .then(function(user){
                            if (!user)
                                return res.notFound({error: "User ID not found"})
                            else {
                                //check for admin, owner, manager, user is universal
                                if (_.findIndex(user.managedVenues, {id: d.venue}) > -1) //Assuming user has roles
                                    roles.push({name: 'proprietor.manager', id: RoleCacheService.roleByName('proprietor.manager')})
                                if (_.findIndex(user.ownedVenues, {id: d.venue}) > -1)
                                    roles.push({name: 'proprietor.owner', id: RoleCacheService.roleByName('proprietor.owner')})
                                if (RoleCacheService.hasAdminRole(user.roles))
                                    roles.push({name: 'admin', id: RoleCacheService.roleByName('admin')})
                                return res.ok({roles: roles})
                            }
                        })
                }
            })
            .catch(function(err){
                return res.serverError({error: err})
            })



    },
    
    verifyRequest: function(req, res){

        
        var token = req.allParams().token; //haha hopefully 
        
        APITokenService.validateToken(token, function(err, decoded){
            if (err){
                return res.badRequest(err)
            }
            else {
                //check the device id? 
                return res.ok({token: decoded})
            }
        })
        //send the token to Validate token 
        //validate the token thats sent with the request and tell AJPGS its cool 
        
        //return the device json so that the api can use it 
        return res.ok();
        
        
    }




};

