
app.component("venueAds", {

    bindings: {
        venue: '=',
        ads: '<'
    },
    controller: function ( dialogService, $log, toastr ) {
        var ctrl = this;

        ctrl.$onInit = function () {
            ctrl.venueAds = _.intersectionBy(ctrl.ads, ctrl.venue.sponsorships, function (o) {
                return o.id || o;
            });
        }

        ctrl.add = function () {
            dialogService.adSelect(_.differenceBy(ctrl.ads, ctrl.venue.sponsorships, function (o) { return o.id || o }))
                .then(function (ad) {
                    if (ad) {
                        ctrl.venue.sponsorships.push(ad.id);
                        ctrl.venueAds.push(ad);
                        ctrl.venue.save()
                            .then( function () {
                                toastr.success("Ad added to venue");
                            })
                            .catch( function () {
                                toastr.error("Error adding ad");
                            })
                    }

                })
        }
    },
    template: `
    <h3 ng-hide="$ctrl.venue.sponsorships.length">This venue has no sponsorships yet</h3>
    <button class="btn btn-sm btn-success pull-right" style="display: inline-block" ng-click="$ctrl.add()">Add Sponsorship</button>
    <uib-accordion ng-show="$ctrl.venue.sponsorships.length" class="top30">
        <div uib-accordion-group class="panel-default" is-open="status.isOpen" ng-repeat="s in $ctrl.venueAds | orderBy:'name'">
            <uib-accordion-heading>
                {{ s.name }} - <span style="font-size:14px">{{ s.description }}</span>
                <i class="pull-right glyphicon" ng-class="{'glyphicon-chevron-up': status.isOpen, 'glyphicon-chevron-down': !status.isOpen }"></i>
            </uib-accordion-heading>
            <div>
                <div class="col-sm-4" style="text-align:center">
                    <span style="font-weight:bold">Crawler Text</span>
                    <p ng-hide="s.advert.text[0] + s.advert.text[1] + s.advert.text[2]">None</p>
                    <ul class="list-group" style="text-align:left">
                        <li class="list-group-item" ng-repeat="t in s.advert.text track by $index" ng-show="t">{{ t }}</li>
                    </ul>
                </div>
                <div ng-repeat="size in mediaSizes" ng-if="s.advert.media[size]" class="col-sm-4" style="text-align: center">
                    <b>{{size | capitalize}}</b><br>
                    <a ng-href="media/download/{{s.advert.media[size]}}" target="_blank"><img
                            style="width:100%"
                            class="media-prev"
                            ng-src="media/download/{{s.advert.media[size]}}"/></a>
                </div>
                <div class="col-xs-12 top15">
                    <button class="btn btn-danger" ng-click="remove(s)">Remove from venue</button>
                </div>
            </div>
        </div>
    </uib-accordion>
    `
})