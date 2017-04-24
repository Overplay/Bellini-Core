/**
 * Created by mkahn on 4/22/17.
 */

app.factory('sideMenu', function($rootScope){

    var currentKey = '';

    var menuGroups = {
        adminMenu: [
            { label: "All Users", sref: "admin.userlist", icon: "users" },
            { label: "Add User", sref: "admin.edituser({id: 'new'})", icon: "user" },
            { label: "All Venues", sref: "admin.venuelist", icon: "globe" },
            { label: "Add Venue", sref: "admin.addvenue({id: 'new'})", icon: "building-o" },
            { label: "Maintenance", sref: "admin.maint", icon: "gears" }
        ]
    };

    return {

        change: function(group){
            currentKey = group;
        },
        
        getMenu: function(){
            if (currentKey)
                return menuGroups[currentKey];
                
            return [];
        }

    }




});