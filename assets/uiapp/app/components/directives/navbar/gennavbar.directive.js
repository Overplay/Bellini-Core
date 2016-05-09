/**
 * Created by cgrigsby on 5/4/16.
 */


app.directive("genNavigationBar", function ($log) {
        return {
            restrict: 'E',
            scope: {},
            templateUrl: "/uiapp/app/components/directives/navbar/gennavbar.template.html",
            link: function (scope, element, attrs) {


                var menuLists = {

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
                            items: [{label: "Devices", link: {type: 'ui-sref', addr: 'admin.manageDevices'}}]
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
                                label: 'Link1',
                                id: "link1",
                                items: [{
                                    label: 'Link1', link: {type: 'href', addr: '#'}
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
                            id: 'account',
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
                            id: "account", //duplicate dropdown
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
                /*
                 Menu Rules 
                 each menu must have a unique ID for bootstrap reasons. These unique ids must be the same as 
                 other dropdowns with the same label that are intended to match up and be combined
                 links can be href or ui-sref, the nav tab directive handles that 
                 */


                //init menus so that it can be merged with
                scope.menus = {};

                //helper method to combine arrays within the object
                //basically it prevents duplicate tabs and combines sub links
                function mergeHelper(objValue, srcValue) {

                    //combine any dropdowns with the same label
                    _.forEach(objValue, function (val) {
                        var match;
                        if (match = _.find(srcValue, {label: val.label})) {
                            val.items = match.items = _.unionWith(val.items, match.items, _.isEqual)
                        }
                    });


                    if (_.isArray(objValue)) {
                        //concat but prevent duplicate tab items (like Account)
                        return _.unionWith(objValue, srcValue, _.isEqual);
                    }
                }


                 //step through all the roles and append them to the nav bar
                //TODO order of tabs? 

                nucleus.roles.forEach(function (val) {
                    //["admin", "user", "example"].forEach(function (val) {
                    scope.menus = _.mergeWith(scope.menus, menuLists[val], mergeHelper);

                });

                $log.log(nucleus)
            }

        }

    }
)
;


app.directive("navTabs", function ($log) {
    return {
        restrict: 'A',
        scope: {
            menus: '=',
            ui: '='
        },
        templateUrl: "/uiapp/app/components/directives/navbar/gennavbartabs.template.html",
        link: function (scope, element, attrs) {
            scope.dropdown = function (menu) {
                return menu.items.length > 1;
            };


            scope.hrefLink = function (option) {
                return option.link.type == "href";
            };

            scope.close = function () {
                scope.ui.navCollapsed = true;
            }

        }
    }


});
    