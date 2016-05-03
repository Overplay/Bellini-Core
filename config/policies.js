/**
 * Policy Mappings
 * (sails.config.policies)
 *
 * Policies are simple functions which run **before** your controllers.
 * You can apply one or more policies to a given controller, or protect
 * its actions individually.
 *
 * Any policy file (e.g. `api/policies/authenticated.js`) can be accessed
 * below by its filename, minus the extension, (e.g. "authenticated")
 *
 * For more information on how policies work, see:
 * http://sailsjs.org/#!/documentation/concepts/Policies
 *
 * For more information on configuring policies, check out:
 * http://sailsjs.org/#!/documentation/reference/sails.config/sails.config.policies.html
 */


module.exports.policies = {

    // Everything open by default, but with some template vars set so we know what up

    // Normally set to false
    '*': true,

    LandingController: {
        landing: [ 'authDecorator', 'authRedirect' ]
    },

    // Let's tighten down a bit on blog posts
    BlogPostController: {
        restricted: [ 'sessionAuth' ],
        open:       true,
        admin:      [ 'isAdmin' ]
    },

    EJSExampleController: {
        restricted: [ 'authDecorator', 'sessionAuth' ],
        open:       true,
        admin:      [ 'authDecorator', 'isAdmin' ]
    },

    /**
     *
     *  The login page is open to all, as it should be.
     *  POSTs to auth/login are also open, though we may want to consider locking this down with some
     *  2 step process: get a token, do a login.
     *
     */
    AuthController: {
        '*':       true,
        'find':    [ 'sessionAuth', 'isAdmin' ],
        'findOne': [ 'sessionAuth', 'isMeOrAdmin' ],
        'update':  [ 'sessionAuth', 'isAdmin' ],
        'destroy': [ 'sessionAuth', 'isAdmin' ],
        status:    [ 'sessionAuth' ],
        loginPage: true,
        login:     true,
        register:  [ 'sessionAuth', 'isAdmin' ],
        addUser:   [ 'sessionAuth', 'isAdmin' ],
        resetPwd:  [ 'passwordReset' ],
        changePwd: [ 'passwordReset' ],
    },

    UserController: {
        '*':       true,
        'find':    [ 'sessionAuth', 'isAdmin' ],
        'findOne': [ 'sessionAuth', 'isMeOrAdmin' ],
        'update':  [ 'sessionAuth', 'isMeOrAdmin' ],
        'destroy': [ 'sessionAuth', 'isAdmin' ]

    },

    RoleController: {
        '*':       true,
        'find':    [ 'sessionAuth', 'isAdmin' ],
        'findOne': [ 'sessionAuth', 'isAdmin' ],
        'update':  [ 'sessionAuth', 'isAdmin' ],
        'destroy': [ 'sessionAuth', 'isAdmin' ]

    },

    //AuthController: [ 'sessionAuth', 'meOrAdmin' ],

    UIController: {
        uiApp: [ 'authDecorator', 'sessionAuth' ]
    },

    // Override this in local.js for testing
    wideOpen: false

};