/**
 * Created by mkahn on 4/22/17.
 */

app.controller( 'adminUserListController', function ( $scope, users, $log, uibHelper, toastr, $state ) {

    $log.debug( "Loading adminUserListController" );
    $scope.users = users;

    $scope.delUser = function ( user ) {

        var mustMatch = "";

        uibHelper.stringEditModal( "Confirm User Delete",
            "Please type the user's email ( " + user.email + " ) in the box below, then click OK, to delete.",
            mustMatch, "enter email here" )
            .then( function ( res ) {

                if ( res == user.email || res == '4321' ) {
                    toastr.success( "User " + user.email + " deleted." );
                    user.delete()
                        .then( function () {
                            $state.reload();
                        } );
                }

            } );

    }
} );

// USER EDIT FOR ADMIN

app.controller( 'adminUserEditController', function ( $scope, user, $log, uibHelper, toastr,
                                                      $state, userAuthService, allVenues ) {

    $log.debug( "Loading adminUserEditController" );
    $scope.user = user;
    $scope.venues = allVenues; // gets passed to venue component
    var _newUser;


    function makeNameFields( user ) {
        return [
            {
                label:       "First Name",
                placeholder: "first name",
                type:        'text',
                field:       'firstName',
                value:       user && user.firstName || '',
                required:    true
            }
            ,
            {
                label:       "Last Name",
                placeholder: "last name",
                type:        'text',
                field:       'lastName',
                value:       user && user.lastName || '',
                required:    true
            }
        ];
    }


    function makeEmailField( user ) {
        return [ {
            label:       "Email",
            placeholder: "email",
            type:        'text',
            field:       'email',
            value:       user && user.email || '',
            required:    true
        } ];
    }

    function makeTempPasswordField() {
        return [ {
            label:       "Temporary Password",
            placeholder: "password",
            type:        'text',
            field:       'password',
            value:       userAuthService.genRandomPassword(),
            required:    true
        } ];
    }

    function createBrandNewUser( preload ) {


        var allFields = makeNameFields( preload ).concat( makeEmailField() ).concat( makeTempPasswordField() );

        uibHelper.inputBoxesModal( "New User", "All fields are required.", allFields )
            .then( function ( fields ) {

                userAuthService.addUser( fields.email, fields.password, fields )
                    .then( function ( wha ) {
                        // redirect-ish
                        $state.go( 'admin.edituser', { id: wha.id } );
                    } )
                    .catch( function ( err ) {
                        if ( (err && err.data && err.data.badEmail) ) {
                            toastr.error( "Unacceptable email address, pal!" );
                            createBrandNewUser( fields );
                        } else {
                            toastr.error( "Hmm, weird error creating user." );
                        }
                        $state.go( 'admin.userlist' );
                    } )

            } )
            .catch( function ( err ) {
                $state.go( 'admin.userlist' );
            } );

    }

    if ( !user.email ) {
        createBrandNewUser();
    }


} );

app.controller( 'adminVenueListController', function ( $scope, venues, $log, uibHelper, $state, toastr ) {

    $log.debug( 'Loading adminVenueListController' );
    $scope.venues = venues;

    //TODO Ryan: Add delete method. See above for example.
    $scope.delVenue = function ( venue ) {

        let mustMatch = "";

        uibHelper.stringEditModal( "Confirm Venue Delete",
            "Please type the venue's name ( " + venue.name + " ) in the box below, then click OK, to delete.",
            mustMatch, "enter venue name here" )
            .then( function ( res ) {

                if ( res === venue.name || res === '4321' ) {
                    toastr.success( "Venue " + venue.name + " deleted." );
                    venue.delete()
                        .then( function () {
                            $state.reload();
                        } );
                }

            } );

    }
} );

app.controller( 'adminVenueEditController', function ( $scope, venue, $log, $state, toastr, dialogService, ads, users ) {
    $log.debug( "Loading adminVenueEditController" );
    $scope.venue = venue;
    $scope.ads = ads;
    $scope.users = users;

    function createBrandNewVenue() {

        dialogService.addressDialog("", {}, true, 1, true)
            .then( function ( locData ) {
                $scope.venue.name = locData.name;
                $scope.venue.address = locData.address;
                $scope.venue.geolocation = locData.geolocation;

                $scope.venue.save()
                    .then( function ( wha ) {
                        // redirect-ish
                        $state.go( 'admin.editvenue', { id: wha.id } );
                    } )
                    .catch( function ( err ) {
                        toastr.error( "Hmm, weird error creating user." );
                        $state.go( 'admin.venuelist' );
                    } )

            } )
            .catch( function ( err ) {
                $state.go( 'admin.venuelist' );
            } );

    }

    if (!venue.id) {
        createBrandNewVenue();
    }
} );

app.controller( 'adminVenueAddController', function ( $scope, $log, venue, $state, toastr, geocode, ring, sailsVenues ) {
    $log.debug( "Loading adminVenueAddController" );
    $scope.zipRegex = "\\d{5}([\\-]\\d{4})?";
    $scope.venue = venue;
    $scope.validForm = false;
    $scope.parameters = { limit: 10, location: "" };
    $scope.ring = ring;

    $scope.setForm = function ( form ) {
        $scope.form = form;
    };

    $scope.initializeLocation = function () {
        $scope.parameters.location = "Locating...";
        geocode.locate()
            .then( geocode.revGeocode )
            .then( function ( loc ) {
                $scope.parameters.location = loc.city + ", " + loc.state;
                toastr.success( "", "Located successfully!" );
            } )
            .catch( function ( err ) {
                $log.error( err );
                $scope.parameters.location = "";
            } )
    };

    $scope.geoCheck = function () {
        if ( $scope.form.$valid ) {
            toastr.success( "", "Geocoding..." );
            sailsVenues.geocode( $scope.venue.addressString() )
                .then( function ( res ) {
                    toastr.success( res[ 0 ].formatted_address, "Geocoded successfully" );
                    $scope.venue.geolocation.longitude = res[ 0 ].geometry.location.lng;
                    $scope.venue.geolocation.latitude = res[ 0 ].geometry.location.lat;
                    $scope.venue.googlePlaceId = res[ 0 ].place_id;
                } )
                .catch( function ( err ) {
                    toastr.error( err.toString(), "Error geocoding" );
                } )
        }
    }

    $scope.create = function () {
        $scope.venue.save()
            .then( function ( res ) {
                toastr.success( res.name + " created!", "Success" );
                $state.go( 'admin.editvenue', { id: res.id } );
            } )
            .catch( function ( err ) {
                $log.debug( err );
                toastr.error( "Venue could not be created", "Error" );
            } )
    }

    $scope.yelpSearch = function () {
        return sailsVenues.yelp( $scope.parameters )
            .catch( function ( err ) {
                $log.error( err );
            } );
    }

    $scope.yelpCopy = function ( $item, $model ) {
        $scope.venue.name = $model.name;
        $scope.venue.address = {
            street:  $model.location.address1,
            street2: $model.location.address2,
            city:    $model.location.city,
            state:   $model.location.state,
            zip:     $model.location.zip_code
        };

        $scope.venue.geolocation = {
            latitude:  $model.coordinates.latitude,
            longitude: $model.coordinates.longitude
        };
        $scope.venue.yelpId = $model.id;
    };

} );

app.controller( 'adminDeviceListController', function ( $scope, venues, devices, $log, $state ) {

    $log.debug( 'Loading adminDeviceListController' );
    $scope.venues = venues;
    $scope.devices = devices;

    $scope.goDetail = function ( d ) {
        $state.go( 'admin.devicedetail', { id: d.deviceUDID } );
    }


} );

app.controller( 'adminDeviceDetailController', function ( $scope, device, $log, $state ) {

    $log.debug( 'Loading adminDeviceDetailController' );
    $scope.ogdevice = device;
    $scope.ogdevice.populateVenue();

} );


app.controller( 'adminDashController', [ '$scope', '$log', 'userinfo', 'venueinfo', 'ads', 'toastr',
    function ( $scope, $log, userinfo, venueinfo, ads, toastr ) {

        $scope.userinfo = userinfo;
        $scope.venueinfo = venueinfo;
        $scope.adsToReview = ads;

        $scope.userChartObj = {};

        $scope.userChartObj.type = "PieChart";

        $scope.onions = [
            { v: "Onions" },
            { v: 3 },
        ];

        $scope.userChartObj.data = {
            "cols":    [
                { id: "p", label: "Permission", type: "string" },
                { id: "c", label: "Count", type: "number" }
            ], "rows": [
                {
                    c: [
                        { v: "Admin" },
                        { v: userinfo.admin },
                    ]
                },
                {
                    c: [
                        { v: "Sponsor" },
                        { v: userinfo.sponsor }
                    ]
                },
                {
                    c: [
                        { v: "Owner" },
                        { v: userinfo.po },
                    ]
                },
                {
                    c: [
                        { v: "Manager" },
                        { v: userinfo.pm },
                    ]
                },
                {
                    c: [
                        { v: "Patron" },
                        { v: userinfo.u },
                    ]
                }
            ]
        };

        $scope.userChartObj.options = {
            'title': 'User Breakdown by Highest Permission'
        };


    } ] );


app.controller( 'adminAdListController', [ '$scope', 'ads', '$log', 'toastr', function ( $scope, ads, $log, toastr ) {

    $log.debug( 'adminAdListController loading' );
    $scope.advertisements = ads;

    $scope.togglePause = function ( ad ) {

        ad.paused = !ad.paused;
        ad.save()
            .then( function () {
                toastr.success( "Pause state changed" )
            } )
            .catch( function ( err ) {
                toastr.error( "Problem changing pause state" );
            } )
    }

} ] );

app.controller( 'adminAdEditController', [ '$scope', '$log', 'ad', 'toastr',
    function ( $scope, $log, ad, toastr ) {

        $scope.advertisement = ad;


    } ] );

