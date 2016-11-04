/**
 * Created by ryanhartzell on 11/3/16.
 */

app.controller('bestPositionListController', function ($scope, $state, nucleus, $log, links, models, $anchorScroll, $location) {
    $log.debug("bestPositionListController");
    $scope.$parent.ui.pageTitle = "Best Position Models";
    $scope.$parent.ui.panelHeading = "";
    $scope.$parent.links = links;

    $scope.models = models;
    $scope.pageSize = 50;
    $scope.currentPage = 1;

    $scope.goToTableTop = function () {
        $location.hash('top');
        $anchorScroll();
    }
})