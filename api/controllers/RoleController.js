/**
 * RoleController
 *
 * @description :: Server-side logic for managing Roles
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {

	getRoles: function(req, res){

	    return res.ok(sails.config.roles.coreRoles);

	}

};

