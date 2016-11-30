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

         var regCode = params.regCode;

        if (( !regCode || regCode.length!=6 )) //test other stuff too
            return res.badRequest({error: "No registration code specified, or incorrect format."});


        var deviceObj = {};

        /*use if the user is logged in on the box when registering??
         deviceObj.deviceOwner = req.session.user.id;
         */

        deviceObj.regCode = regCode;

        //sails.log.debug(deviceObj, "searching ");

        Device.findOne(deviceObj)
            .then(function (device) {

                //check if device exists
                if (device) {
                    var ca = device.createdAt;
                    // TODO I doubt this logic is right. It's adding millesecods to a date object using the + operator
                    if (Date.now() <  ( Date.parse(ca) + sails.config.ogsettings.regCodeTimeout) ) {

                        sails.log.silly(device, "being updated");

                        var updatedFields = {};

                        updatedFields.regCode = ''; //clear registration code

                        //TODO JSONWebToken into apiToken field
                        updatedFields.apiToken = APITokenService.createToken(device.id);

                        //TODO MAC Address -- done on android device :) - will act as UUID 
                        updatedFields.wifiMacAddress = 'FETCH FROM ANDROID'; //in req?

                        Device.update({id: device.id}, updatedFields)
                            .then( function(updatedDevice){
                                if (updatedDevice.length==1){
                                    sails.log.debug( updatedDevice, "updated/registered" );
                                    return res.ok( updatedDevice[ 0 ] );
                                } else {
                                    sails.log.debug( "NOT GOOD UPDATE :(" );
                                    return res.serverError( { error: "Too many or too few devices updated" } );
                                }
                            })
                            .catch( function(err){
                                sails.log.debug( "NOT GOOD UPDATE :( (catch error)" );
                                return res.serverError( { error: err.message } );
                            })

                    } else {
                        return res.badRequest( { error: "Code expired." } );
                    }
                } else {
                    return res.badRequest( { error: "No device for that code." } );
                }

            })
            .catch( function(err){
                sails.log.debug( "Error searching devices, this is bad." );
                return res.serverError( { error: err.message } );
            })
    },

    //TODO remove once production
    //creates a test device for demo purposes 
    testDevice: function (req, res) {
        //sails.log.debug(req.allParams());
        var params = req.allParams()
        return Device.create(params)
            .then(function (dev) {
                //sails.log.debug(dev)
                dev.apiToken = APITokenService.createToken(dev.id);

                sails.log.debug(dev.apiToken)

                return Device.update(dev.id, dev)
                    .then(function (dev) {
                        return res.ok(dev)

                    })


            })
            .catch(function (err) {
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

    getUserRolesForDevice: function (req, res) {

        var userId = '';

        var token = waterlock._utils.getAccessToken(req) //token is already validated by policy
        token = waterlock.jwt.decode(token, waterlock.config.jsonWebTokens.secret);
        waterlock.validator.findUserFromToken(token, function (err, user) {
            if (err) {
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
            .then(function (d) {
                if (!d)
                    return res.notFound({error: "Invalid Device ID"})
                else {
                    return User.findOne(userId)
                        .populate('managedVenues')
                        .populate('ownedVenues')
                        .then(function (user) {
                            if (!user)
                                return res.notFound({error: "User ID not found"})
                            else {
                                //check for admin, owner, manager, user is universal
                                if (_.findIndex(user.managedVenues, {id: d.venue}) > -1) //Assuming user has roles
                                    roles.push({
                                        name: 'proprietor.manager',
                                        id: RoleCacheService.roleByName('proprietor.manager')
                                    })
                                if (_.findIndex(user.ownedVenues, {id: d.venue}) > -1)
                                    roles.push({
                                        name: 'proprietor.owner',
                                        id: RoleCacheService.roleByName('proprietor.owner')
                                    })
                                if (RoleCacheService.hasAdminRole(user.roles))
                                    roles.push({name: 'admin', id: RoleCacheService.roleByName('admin')})
                                return res.ok({roles: roles})
                            }
                        })
                }
            })
            .catch(function (err) {
                return res.serverError({error: err})
            })


    },

    verifyRequest: function (req, res) {


        var token = req.allParams().token;

        if (!token) {
            return res.badRequest({error: "No Token provided"})
        }

        sails.log.debug(token)
        APITokenService.validateToken(token, function (err, decoded) {
            if (err) {
                return res.badRequest({error: err})
            }
            else {
                //check the device id? 
                return res.ok({token: decoded})
            }
        });


    }


};

