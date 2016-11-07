/**
 * Created by ryanhartzell on 11/3/16.
 */

app.controller('bestPositionListController', function ($scope, $state, nucleus, $log, links, $anchorScroll, $location, $http) {
    $log.debug("bestPositionListController");
    $scope.$parent.ui.pageTitle = "Best Position Models";
    $scope.$parent.ui.panelHeading = "";
    $scope.$parent.links = links;
    $scope.pageSize = 50;
    $scope.currentPage = 1;


    $http.get('http://localhost:1338/BestPosition/findAll')
        .then( function (data) {
            $scope.fetching = false;
            $scope.models = data.data;
        })
        .catch( function (err) {

        });


    $scope.goToTableTop = function () {
        $location.hash('top');
        $anchorScroll();
    }
})