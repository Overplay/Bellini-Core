angular.module('templates').run(['$templateCache', function($templateCache) {$templateCache.put('confirmmodal.template.html','<div class="modal-header">\n    <h3 class="modal-title">{{ modalUi.title }}</h3>\n</div>\n<div class="modal-body">\n    {{ modalUi.body }}\n</div>\n<div class="modal-footer">\n    <button class="btn btn-primary" type="button" ng-click="ok()">OK</button>\n    <button class="btn btn-warning" type="button" ng-click="cancel()">Cancel</button>\n</div>');
$templateCache.put('curtain.template.html','<style>\n\n    .curtain {\n\n        position: absolute;\n        top: 0;\n        bottom: 0;\n        left: 0;\n        width: 100%;\n        background: rgba(0, 0, 0, 0.7);\n\n        display: flex;\n        align-items: center;\n        justify-content: center;\n        flex-direction: column;\n\n    }\n\n    .spinner-holder {\n        width: 80px;\n        height: 80px;\n        background-color: #00A000;\n        padding: 5px;\n        border-radius: 5px;\n        display: flex;\n        align-items: center;\n        justify-content: center;\n    }\n\n    .spinner {\n        width: 40px;\n        height: 40px;\n        /*position: relative;*/\n        text-align: center;\n        margin-bottom: 8px;\n\n        -webkit-animation: sk-rotate 2.0s infinite linear;\n        animation: sk-rotate 2.0s infinite linear;\n    }\n\n    .dot1, .dot2 {\n        width: 60%;\n        height: 60%;\n        display: inline-block;\n        position: absolute;\n        top: 0;\n        background-color: #ffffff;\n        border-radius: 100%;\n\n        -webkit-animation: sk-bounce 2.0s infinite ease-in-out;\n        animation: sk-bounce 2.0s infinite ease-in-out;\n    }\n\n    .dot2 {\n        top: auto;\n        bottom: 0;\n        -webkit-animation-delay: -1.0s;\n        animation-delay: -1.0s;\n    }\n\n    @-webkit-keyframes sk-rotate {\n        100% {\n            -webkit-transform: rotate(360deg)\n        }\n    }\n\n    @keyframes sk-rotate {\n        100% {\n            transform: rotate(360deg);\n            -webkit-transform: rotate(360deg)\n        }\n    }\n\n    @-webkit-keyframes sk-bounce {\n        0%, 100% {\n            -webkit-transform: scale(0.0)\n        }\n        50% {\n            -webkit-transform: scale(1.0)\n        }\n    }\n\n    @keyframes sk-bounce {\n        0%, 100% {\n            transform: scale(0.0);\n            -webkit-transform: scale(0.0);\n        }\n        50% {\n            transform: scale(1.0);\n            -webkit-transform: scale(1.0);\n        }\n    }\n</style>\n<div class="curtain">\n    <div class="spinner-holder">\n        <div class="spinner">\n            <div class="dot1"></div>\n            <div class="dot2"></div>\n        </div>\n    </div>\n    <h3>$$message$$</h3>\n\n</div>\n\n');
$templateCache.put('datemodal.template.html','<div class="modal-header">\n    <h3 class="modal-title">{{ modalUi.title }}</h3>\n</div>\n<div class="modal-body">\n    {{ modalUi.body }}\n    <!--\n    <uib-datepicker ng-model="modalUi.date" class="well well-sm" datepicker-options="options"></uib-datepicker>\n    -->\n    <p class="input-group">\n        <input type="text" class="form-control" uib-datepicker-popup="MMMM-dd-yyyy" ng-model="modalUi.date"\n               is-open="modalUi.dateOpened"\n               datepicker-options="modalUi.datePickerOptions" ng-required="true" close-text="Close"/>\n          <span class="input-group-btn">\n            <button type="button" class="btn btn-default" ng-click="modalUi.dateOpened = !modalUi.dateOpened"><i\n                    class="glyphicon glyphicon-calendar"></i></button>\n          </span>\n    </p>\n    <uib-timepicker ng-model="modalUi.time" hour-step="1" minute-step="15"\n                    show-meridian="true"></uib-timepicker>\n</div>\n<div class="modal-footer">\n    <button class="btn btn-primary" type="button" ng-click="ok()">OK</button>\n    <button class="btn btn-warning" type="button" ng-click="cancel()">Cancel</button>\n</div>');
$templateCache.put('dry-toast.template.html','<style>\n\n    .toast-holder {\n        position: absolute;\n        bottom: 2vh;\n        color: white;\n        width: 100vw;\n    }\n\n    .toast {\n        width: 90%;\n        padding: 10px;\n        border-radius: 5px;\n        background: rgba(47, 37, 41, 0.7);\n        margin: 0 auto 0 auto;\n        font-size: 1.5rem;\n        font-weight: bold;\n        font-family: Arial, SansSerif;\n        -webkit-box-shadow: 3px 3px 5px 0px rgba(0, 0, 0, 0.75);\n        -moz-box-shadow: 3px 3px 5px 0px rgba(0, 0, 0, 0.75);\n        box-shadow: 3px 3px 5px 0px rgba(0, 0, 0, 0.75);\n    }\n\n\n</style>\n\n<div class="toast-holder">\n    <div class="toast">\n        <p style="text-align: center">$$message$$</p>\n    </div>\n</div>\n\n\n\n');
$templateCache.put('headsupmodal.template.html','<div class="modal-header">\n    <h3 class="modal-title">{{ modalUi.title }}</h3>\n</div>\n<div class="modal-body">\n    {{ modalUi.body }}\n</div>\n<div class="modal-footer">\n    <button class="btn btn-primary" type="button" ng-click="ok()">OK</button>\n</div>');
$templateCache.put('inputboxesmodal.template.html','<style>\n    .red-border {\n        border: 2px solid red !important;\n    }\n</style>\n<div class="modal-header">\n    <h3 class="modal-title">{{ modalUi.title }}</h3>\n</div>\n<div class="modal-body">\n    <p>{{ modalUi.body }}</p>\n    <div class="form-group" ng-repeat="f in modalUi.fieldsArray track by $index" >\n        <label for="{{ \'f\'+$index }}">{{ f.label }}</label>\n        <input type="{{ f.type }}" placeholder="{{ f.placeholder }}"\n               class="form-control" id="{{ \'f\'+$index }}"\n               ng-model="f.value" ng-class="(!f.value && f.required)?\'red-border\':\'\'">\n    </div>\n</div>\n\n<div class="modal-footer">\n    <button class="btn btn-primary" type="button" ng-click="ok()" ng-disabled="missingRequired()">OK</button>\n    <button class="btn btn-warning" type="button" ng-click="cancel()">Cancel</button>\n</div>');
$templateCache.put('selectlistmodal.template.html','<style>\n    .slm-pick-item {\n        color: teal;\n        padding: 10px 0 10px 5px;\n        margin-left: 0;\n    }\n\n    .slm-picked {\n        background: #696969;\n        color: white;\n        transition: all 0.5s;\n    }\n\n    .slm-no-num {\n        list-style-type: none;\n        padding: 10px;\n    }\n</style>\n\n<div class="modal-header">\n    <h3 class="modal-title">{{ modalUi.title }}</h3>\n</div>\n<div class="modal-body" ng-show="showChoice">\n    {{ modalUi.choices[modalUi.currentChoice] }}\n</div>\n<div class="modal-body" ng-hide="showChoice">\n    {{ modalUi.body }}\n</div>\n<div class="input-group">\n    <span class="input-group-addon" id="search-icon"></span>\n    <input type="text" class="form-control" placeholder="Search" ng-model="searchTerm">\n</div>\n<ol class="slm-no-num" style="margin: 10px; border: 1px solid #cacaca;">\n    <li ng-repeat="choice in modalUi.choices track by $index | searchTerm" class="slm-pick-item"\n        ng-class="{ \'slm-picked\': modalUi.currentChoice==$index}"\n        ng-click="modalUi.currentChoice = $index">{{ choice }}</li>\n</ol>\n\n\n<div class="modal-footer">\n    <button class="btn btn-primary" type="button" ng-click="ok()">OK</button>\n    <button class="btn btn-warning" type="button" ng-click="cancel()">Cancel</button>\n</div>');
$templateCache.put('stringeditmodal.template.html','<div class="modal-header">\n    <h3 class="modal-title">{{ modalUi.title }}</h3>\n</div>\n<div class="modal-body">\n    <p>{{ modalUi.body }}</p>\n    <input class="form-control input-lg" type="text" ng-model="modalUi.editString" placeholder="{{ modalUi.placeholder }}">\n    </div>\n\n<div class="modal-footer">\n    <button class="btn btn-primary" type="button" ng-click="ok()">OK</button>\n    <button class="btn btn-warning" type="button" ng-click="cancel()">Cancel</button>\n</div>');}]);