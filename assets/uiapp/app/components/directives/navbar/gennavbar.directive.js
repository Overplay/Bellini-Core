/**
 * Created by cgrigsby on 5/4/16.
 */


app.directive("genNavigationBar", function ($log) {
        return {
            restrict: 'E',
            scope: {
                //mode: '=',
                //menusList: '='

                /*
                 {

                 admin: [ left: [ { label: 'Users',
                 items: [ {label: "Manage Users", 'link': {type: 'ui-sref', addr: 'admin.manageUsers'} },
                 {label: "Add User", 'link': {type: 'ui-sref', addr:'admin.addUser'} }
                 ]
                 },
                 { label: "Devices", //might need to be modified
                 items: [ {label: "Devices",  'link': {type: 'ui-sref', addr: 'admin.manageDevices'}  }]
                 }
                 ],
                 right: [ {label: 'Account' ,
                 items: [ {label: "Edit My Account",  'link': {type: 'ui-sref', addr: 'user.editUser' } },
                 {label: "Logout",  'link': {type: 'href', addr: '/logout'} }
                 ]
                 ]
                 user: [ left: [ { label: 'Link1',
                 items: [ {label: 'Link1', 'link':{type: 'href', addr: '#'}
                 },
                 { label: 'Link2',
                 items: [ {label: 'Link2', 'link':{type: 'href', addr: '#'}
                 }],
                 right: [ {label: 'Account' ,
                 items: [ {label: "Edit My Account",  'link': {type: 'ui-sref', addr: 'user.editUser' } },
                 {label: "Logout",  'link': {type: 'href', addr: '/logout'} }



                 ]

                 ]








                 }



                 */

            },
            templateUrl: "/uiapp/app/components/directives/navbar/gennavbar.template.html",
            link: function (scope, element, attrs) {


                var menuLists = {

                    'admin': {
                        left: [{
                            label: 'Users',
                            items: [{label: "Manage Users", 'link': {type: 'ui-sref', addr: 'admin.manageUsers'}},
                                {label: "Add User", 'link': {type: 'ui-sref', addr: 'admin.addUser'}}
                            ]
                        },
                            {
                                label: "Devices", //might need to be modified
                                items: [{label: "Devices", 'link': {type: 'ui-sref', addr: 'admin.manageDevices'}}]
                            }
                        ],
                        right: [{
                            label: 'Account',
                            items: [{label: "Edit My Account", 'link': {type: 'ui-sref', addr: 'user.editUser'}},
                                {label: "Logout", 'link': {type: 'href', addr: '/logout'}}
                            ]
                        }
                        ]
                    },
                    'user': {
                        left: [
                            {
                                label: 'Link1',
                                items: [{
                                    label: 'Link1', 'link': {type: 'href', addr: '#'}
                                }
                                ]
                            },
                            {
                                label: 'Link2',
                                items: [{
                                    label: 'Link2', 'link': {type: 'href', addr: '#'}
                                }]
                            }],
                        right: [{
                            label: 'Account',
                            items: [{
                                label: "Edit My Account",
                                'link': {type: 'ui-sref', addr: 'user.editUser'}
                            },
                                {
                                    label: "Logout", 'link': {type: 'href', addr: '/logout'}
                                }
                            ]
                        }]
                    }
                };

                //init so that it can be merged with
                scope.menus = {};

                //helper method to combine arrays within the object
                function mergeHelper(objValue, srcValue) {
                    if (_.isArray(objValue)) {
                        //concat but prevent duplicate tab items (like Account)
                        return _.unionWith(objValue, srcValue, _.isEqual);
                    }
                }

                /*
                 //step through all the roles and append them to the nav bar 
                 _.forEach(nucleus.roles, function(val){
                 _.mergeWith(scope.menus, menuLists[val], mergeHelper);

                 });
                 */


                scope.menus = _.mergeWith(scope.menus, menuLists['admin'], mergeHelper);

                scope.menus = _.mergeWith(scope.menus, menuLists['user'], mergeHelper);


                $log.log(scope.menus)
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
    