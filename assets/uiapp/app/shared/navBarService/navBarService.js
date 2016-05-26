/**
 * Created by cgrigsby on 5/9/16.
 */
app.factory('navBarService', function ($log) {
    "use strict";

    var service = {};
    var _navBarMenus = {

        'admin': {
            left: [{
                label: 'Users',
                id: 'users',
                items: [{label: "Manage Users", link: {type: 'ui-sref', addr: 'admin.manageUsers'}},
                    {label: "Add User", link: {type: 'ui-sref', addr: 'admin.addUser'}}
                ]
            }, {
                label: "Devices", //might need to be modified
                id: "devices",
                items: [{label: "Manage Devices", link: {type: 'ui-sref', addr: 'admin.manageDevices'}},
                    {label: "Add Device", link: {type: 'ui-sref', addr: 'device.addDevice'}},
                ]
            },
                {
                    label: "Organization",
                    id: "organization",
                    items: [{label: "organization", link: {type: 'ui-sref', addr: 'organization.manageOrganization'}}]
                }
            ],
            right: [{
                label: 'Account',
                id: 'account',
                items: [{label: "Edit My Account", link: {type: 'ui-sref', addr: 'user.editUser'}},
                    {label: "Logout", link: {type: 'href', addr: '/logout'}}
                ]
            }
            ]
        },
        'proprietor.owner': {
            left: [{
                label: 'Users',
                id: 'users',
                items: [{label: "Manage Users", link: {type: 'ui-sref', addr: 'admin.manageUsers'}},
                    {label: "Add User", link: {type: 'ui-sref', addr: 'admin.addUser'}}
                ]
            }, {
                label: "Devices", //might need to be modified
                id: "devices",
                items: [{label: "Manage Devices", link: {type: 'ui-sref', addr: 'admin.manageDevices'}},
                    {label: "Add Device", link: {type: 'ui-sref', addr: 'device.addDevice'}},
                ]
            },
                {
                    label: "Organization",
                    id: "organization",
                    items: [{label: "organization", link: {type: 'ui-sref', addr: 'organization.manageOrganization'}}]
                }
            ],
            right: [{
                label: 'Account',
                id: 'account',
                items: [{label: "Edit My Account", link: {type: 'ui-sref', addr: 'user.editUser'}},
                    {label: "Logout", link: {type: 'href', addr: '/logout'}}
                ]
            }
            ]
        },
        'proprietor.manager': {
            left: [{
                label: 'Users',
                id: 'users',
                items: [{label: "Manage Users", link: {type: 'ui-sref', addr: 'admin.manageUsers'}},
                    {label: "Add User", link: {type: 'ui-sref', addr: 'admin.addUser'}}
                ]
            }, {
                label: "Devices", //might need to be modified
                id: "devices",
                items: [{label: "Manage Devices", link: {type: 'ui-sref', addr: 'admin.manageDevices'}},
                    {label: "Add Device", link: {type: 'ui-sref', addr: 'device.addDevice'}},
                ]
            },
                {
                    label: "Organization",
                    id: "organization",
                    items: [{label: "organization", link: {type: 'ui-sref', addr: 'organization.manageOrganization'}}]
                }
            ],
            right: [{
                label: 'Account',
                id: 'account',
                items: [{label: "Edit My Account", link: {type: 'ui-sref', addr: 'user.editUser'}},
                    {label: "Logout", link: {type: 'href', addr: '/logout'}}
                ]
            }
            ]
        },
        'user': {
            left: [
                {
                    label: 'Me',
                    id: "user",
                    items: [{
                        label: 'me', link: {type: 'ui-sref', addr: 'user.editUser'}
                    }
                    ]
                },
                {
                    label: 'Link2',
                    id: "link2",
                    items: [{
                        label: 'Link2', link: {type: 'href', addr: '#'}
                    }]
                }],
            right: [{
                label: 'Account',
                id: 'account3',
                items: [{
                    label: "Edit My Account",
                    link: {type: 'ui-sref', addr: 'user.editUser'}
                },
                    {
                        label: "Logout", link: {type: 'href', addr: '/logout'}
                    }
                ]
            }]
        },
        'example': { //examples for types of tabs
            left: [
                {
                    label: 'Link1', //duplicate single link
                    id: "link1",
                    items: [{
                        label: 'Link1', link: {type: 'href', addr: '#'}
                    }
                    ]
                },

                {
                    label: 'Single Link',
                    id: 'singleLink', //must have a one word id for bootstrap purposes
                    items: [ //list the single item in the list
                        {
                            label: 'ignored key, not required', link: {type: 'href', addr: "#"}
                        }
                    ]
                }, {
                    label: 'Dropdown', //a dropdown with multiple links
                    id: "dropdown",
                    items: [
                        {
                            label: "Manage Users",
                            link: {type: 'ui-sref', addr: 'admin.manageUsers'}
                        },
                        {
                            label: "Add User",
                            link: {type: 'ui-sref', addr: 'admin.addUser'}
                        }
                    ]
                }
            ],
            right: [{
                label: 'Account', //similar to above, shows no repeats and dropdown combinations
                id: "account4", //duplicate dropdown
                items: [{
                    label: "Edit My Account",
                    link: {type: 'ui-sref', addr: 'user.editUser'}
                },
                    {
                        label: "Logout", link: {type: 'href', addr: '/logout'}
                    },
                    { //for testing purposes :)
                        label: "log me out", link: {type: 'href', addr: '/logout'}
                    }
                ]
            }]
        }
    };


    service.getMenuForRoles = function () {
        //init menus so that it can be merged with
        var menus = {};

        //helper method to combine arrays within the object
        //basically it prevents duplicate tabs and combines sub links
        function mergeHelper(objValue, srcValue) {

            //combine any dropdowns with the same label
            _.forEach(objValue, function (val) {
                var match;

                if (match = _.find(srcValue, {label: val.label})) { //could add id to find but that seems counterintuitive
                    val.items = match.items = _.unionWith(val.items, match.items, _.isEqual);
                    val.id = match.id = val.id; //fix not matched IDs
                }
            });


            if (_.isArray(objValue)) {
                //concat but prevent duplicate tab items (like Account)
                return _.unionWith(objValue, srcValue, _.isEqual);
            }
        }

        //step through all the roles and append them to the nav bar
        // order of tabs for multiple roles??

        nucleus.roles.forEach(function (val) {
            menus = _.mergeWith(menus, _navBarMenus[val], mergeHelper);

        });

        return menus;
    };


    return service;
});
