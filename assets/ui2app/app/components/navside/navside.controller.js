/**
 * Created by mkahn on 4/21/17.
 */

app.controller("navSideController", function($scope, $log, navService, $timeout){

    $log.debug("Loading navSideController");

    // Not using the sliding menu for now
    $scope.menuVisible = true;

    var links = navService.sideMenu.getMenu();
    var delay = 0;
    var idx = 0;

    function addNextLink(){
        $scope.sidelinks.push(links[idx]);
        idx++;
        if (idx<links.length)
            $timeout(addNextLink, 100);
    }

    $scope.sidelinks = [];
    addNextLink();
    
    $scope.$on('TOGGLE_SIDEMENU', function(ev){
        $scope.menuVisible = !$scope.menuVisible;
    });


});