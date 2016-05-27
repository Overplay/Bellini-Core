//no longer in use


app.directive('navigationBar', function ($log) {

    return {
        restrict: "E",
        templateUrl: "/uiapp/app/components/directives/navbar/navbar.template.html",
        scope: {
            info: '='
        },
        link: function (scope, element, attrs) {

            scope.ui = {
                adminOpen: false,
                showAdmin: attrs.adminMode != undefined,
                usersOpen: false
            };

        }
    }
});


