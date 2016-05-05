/**
 * Created by cgrigsby on 5/4/16.
 */


app.directive("genNavigationBar", function ($log) {
        return {
            restrict: 'E',
            scope: {
                mode: '=',
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
                 items: [ {label: "Manage Users",  'link': {type: 'ui-sref', addr: 'user.editUser' } },
                 {label: "Logout",  'link': {type: 'href', addr: '/logout'} }
                 ]
                 ]
                 ]








                 }



                 */

            },
            templateUrl: "/uiapp/app/components/directives/navbar/gennavbar.template.html",
            link: function (scope, element, attrs) {
                scope.menusList = {

                    admin: {
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
                            items: [{label: "Manage Users", 'link': {type: 'ui-sref', addr: 'user.editUser'}},
                                {label: "Logout", 'link': {type: 'href', addr: '/logout'}}
                            ]
                        }
                        ]
                    }
                };



                scope.menus = scope.menusList['admin'];



                scope.dropdown = function (menu) {
                    return menu.items.length > 1;
                }


                scope.hrefLink = function (option) {
                    return option.link == "href";
                }

                $log.log(scope.menus.right)

                
                element.menus = scope.menus;

            }

        }

    }
);

/*

app.directive("navTabs", function($log){
    return {
        restrict: 'E',
        scope: {
            menus: '='
        },
        templateUrl: "/uiapp/app/components/directives/navbar/gennavbartabs.template.html",
        link: function(scope, element, attrs){
            $log.log(scope.menus)
        }
    }
    
    
});
    */