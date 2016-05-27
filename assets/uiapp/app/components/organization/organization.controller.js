/**
 * Created by cgrigsby on 5/23/16.
 */


app.controller("editOrganizationController", function ($scope, $log, user, $http, toastr) {

    $log.debug("editOrganizationController Starting")

    $scope.states = ["AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA",
        "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD",
        "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ",
        "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC",
        "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY"];
    $scope.regex = "\\d{5}([\\-]\\d{4})?";
    
    $http.get("api/v1/organization/" + user.organization) //user only has access to their own org
        .then(function (data) {
            $scope.organization = data.data;
            $scope.organizationUpdate = JSON.parse(JSON.stringify(data.data)); //clone for form
        })


    $scope.update = function () {
        $http.put("api/v1/organization/" + $scope.organization.id, $scope.organizationUpdate)
            .then(function (data) {
                $scope.organization = data.data;
                $scope.organizationUpdate = JSON.parse(JSON.stringify(data.data));
                toastr.success("Organization info updated", "Success!");
            })
            .catch(function (err) {
                toastr.error("Something went wrong", "Damn!");
            });
    }


});


//currently not even used 
//only if using seperate view and edit page which may not happen as i work along this 
app.controller("viewOrganizationController", function ($scope, $log, user, $http) {

    $log.log("editOrganizationController Starting")

    $http.get("api/v1/organization/" + user.organization)
        .then(function (data) {
            $scope.organization = data.data;
        })


})