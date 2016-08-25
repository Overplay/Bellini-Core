/**
 * OGLog.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {

    attributes: {

        logType: {
            type: "string",
            enum: ['impression', 'heartbeat', 'alert', 'channel', 'placement', 'other']
        },

        message: {
            type: "json"
        },

        deviceUniqueId: {
            type: "string"
        },

        loggedAt: {
            type: "datetime"
        }
    }
};

