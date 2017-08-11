/**
 * Created by mkahn on 8/11/17.
 */


module.exports = function badRequest( error ) {

    // Get access to Sails `res` object
    var res = this.res;

    if (error.res){
        return error.res({ error: error.message });
    } else {
        return res.serverError(error);
    }

}