/**
 * UIController
 *
 * @description :: Just a place to chain in a policy for the ui (authenticated) pages
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */


// MAK: For now, this is here just to test authorization

module.exports = {


    uiApp: function ( req, res ) {

        res.notFound({error:"deprecated"});
        //return res.view("ui/uiapp", {layout: 'ui/uilayout'});
    },

    ui2App: function ( req, res ) {

        return res.view( "ui/ui2AppBody", { layout: 'ui/ui2template' } );
    },

    handleLogin: function(req, res){

    }

};
