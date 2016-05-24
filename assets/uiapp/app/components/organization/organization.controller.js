/**
 * Created by cgrigsby on 5/23/16.
 */


app.controller("editOrganizationController", function ($scope, $log, user, $http) {

    $log.log("editOrganizationController Starting")


    $http.get("api/v1/organization/" + user.organization)
        .then(function (data) {
            $scope.organization = data.data;
        })

    $scope.update = function () {
        $http.put("api/v1/organization/" + $scope.organization.id, $scope.organization)
            .then(function (data) {

            })
    }


});


//only if using seperate view and edit page which may not happen as i work along this 
app.controller("viewOrganizationController", function ($scope, $log, user, $http) {

    $log.log("editOrganizationController Starting")

    $http.get("api/v1/organization/" + user.organization)
        .then(function (data) {
            $scope.organization = data.data;
        })


})