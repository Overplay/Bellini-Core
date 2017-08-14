
app.component("venueAds", {

    bindings: {
        venue: '=',
        ads: '<'
    },
    controller: function ( uibHelper, dialogService, $log, toastr ) {
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
                                toastr.success("Sponsorship added to venue");
                            })
                            .catch( function () {
                                toastr.error("Error adding sponsorship");
                            })
                    }

                })
        }

        ctrl.remove = function (ad) {
            uibHelper.confirmModal("Remove sponsorship?", "Are you sure you want to remove this sponsorship?")
                .then( function () {
                    ctrl.venue.sponsorships = _.filter(ctrl.venue.sponsorships, function (o) { return o !== ad.id;});
                    ctrl.venueAds = _.filter(ctrl.venueAds, function (o) { return o.id !== ad.id; });
                    ctrl.venue.save()
                        .then( function() {
                            toastr.success("Sponsorship removed from venue");
                        })
                        .catch( function () {
                            toastr.error("Error removing sponsorship");
                        })
                })
        }
    },
    template: `
    <div style="padding-top: 20px;">
        <h3 ng-hide="$ctrl.venue.sponsorships.length">This venue has no sponsorships yet</h3>
        <button class="btn btn-sm btn-success" ng-click="$ctrl.add()" style="margin-bottom: 20px;">Add Sponsorship</button>
        <uib-accordion ng-show="$ctrl.venue.sponsorships.length" class="top30" close-others="false">
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
                    <div ng-if="s.advert.media.widget" class="col-sm-4" style="text-align: center">
                        <b>Widget</b><br>
                        <a target="_blank">
                            <img
                                style="width:100%"
                                class="media-prev"
                                ng-src="{{s.advert.media.widget.url || '/media/download/' + s.advert.media.widget.id}}"/>
                        </a>
                    </div>
                    <div ng-if="s.advert.media.crawler" class="col-sm-4" style="text-align: center">
                        <b>Crawler</b><br>
                        <a target="_blank">
                            <img
                                style="width:100%"
                                class="media-prev"
                                ng-src="{{s.advert.media.crawler.url || '/media/download/' + s.advert.media.crawler.id}}"/>
                        </a>
                    </div>
                    <div class="col-xs-12 top15">
                        <button class="btn btn-danger" ng-click="$ctrl.remove(s)">Remove from venue</button>
                    </div>
                </div>
            </div>
        </uib-accordion>
    </div>
    `
})