(function() {
  var app;

  app = angular.module("ngOnboarding", []);

  app.provider("ngOnboardingDefaults", function() {
    return {
      options: {
        overlay: true,
        overlayOpacity: 0.6,
        overlayClass: 'onboarding-overlay',
        popoverClass: 'onboarding-popover',
        titleClass: 'onboarding-popover-title',
        contentClass: 'onboarding-popover-content',
        arrowClass: 'onboarding-arrow',
        buttonContainerClass: 'onboarding-button-container',
        buttonClass: "onboarding-button",
        showButtons: true,
        nextButtonText: 'Next &rarr;',
        previousButtonText: '&larr; Previous',
        showDoneButton: true,
        doneButtonText: 'Done',
        closeButtonClass: 'onboarding-close-button',
        closeButtonText: 'X',
        stepClass: 'onboarding-step-info',
        actualStepText: 'Step',
        totalStepText: 'of',
        showStepInfo: true
      },
      $get: function() {
        return this.options;
      },
      set: function(keyOrHash, value) {
        var k, v, _results;
        if (typeof keyOrHash === 'object') {
          _results = [];
          for (k in keyOrHash) {
            v = keyOrHash[k];
            _results.push(this.options[k] = v);
          }
          return _results;
        } else {
          return this.options[keyOrHash] = value;
        }
      }
    };
  });

  app.directive('onboardingPopover', [
    'ngOnboardingDefaults', '$sce', '$timeout', function(ngOnboardingDefaults, $sce, $timeout) {
      return {
        restrict: 'E',
        scope: {
          enabled: '=',
          steps: '=',
          onFinishCallback: '=',
          // index: '=stepIndex'
        },
        replace: true,
        link: function(scope, element, attrs) {
          var attributesToClear, curStep, setupOverlay, setupPositioning, elClone;
          curStep = null;
          attributesToClear = ['title', 'top', 'right', 'bottom', 'left', 'width', 'height', 'position'];
          scope.next = function() {
            var newIndex = scope.index + 1;
            if(newIndex > scope.steps.length-1){
              newIndex = 0;
            }
            return scope.index = newIndex;
          };
          scope.previous = function() {
            var newIndex = scope.index - 1;
            if(newIndex < 0){
              newIndex = scope.steps.length-1;
            }
            return scope.index = newIndex;
          };
          scope.close = function() {
            hideOverlay();
            setupOverlay(false);
            if (scope.onFinishCallback) {
              return scope.onFinishCallback();
            }
          };
          var hideOverlay = function(){
            scope.enabled = false;
            // if(curStep && curStep['attachTo']){
            //   $(curStep['attachTo']).removeClass('onboarding-focus');
            // }
            if(elClone){
              $('.onboarding-focus').remove();
              delete elClone;
            }
          };
          var updateView = function(){
            var attr, k, v, _i, _len;
            curStep = scope.steps[scope.index];
            if(!curStep){
              return;
            }
            if(curStep && curStep['attachTo'] && !$(curStep['attachTo']).length){
              scope.steps.splice(scope.index, 1);
              console.log(scope.steps)
              return updateView();
            }
            scope.lastStep = scope.index + 1 === scope.steps.length;
            scope.showNextButton = scope.index + 1 < scope.steps.length;
            scope.showPreviousButton = scope.index > 0;
            scope.stepCount = scope.steps.length;
            for (_i = 0, _len = attributesToClear.length; _i < _len; _i++) {
              attr = attributesToClear[_i];
              scope[attr] = null;
            }
            for (k in ngOnboardingDefaults) {
              v = ngOnboardingDefaults[k];
              if (curStep[k] === void 0) {
                scope[k] = v;
              }
            }
            for (k in curStep) {
              v = curStep[k];
              scope[k] = v;
            }
            scope.description = $sce.trustAsHtml(scope.description);
            scope.nextButtonText = $sce.trustAsHtml(scope.nextButtonText);
            scope.previousButtonText = $sce.trustAsHtml(scope.previousButtonText);
            scope.doneButtonText = $sce.trustAsHtml(scope.doneButtonText);
            scope.closeButtonText = $sce.trustAsHtml(scope.closeButtonText);
            scope.actualStepText = $sce.trustAsHtml(scope.actualStepText);
            scope.totalStepText = $sce.trustAsHtml(scope.totalStepText);
            if(scope.enabled){
              setupOverlay(true);
            }
            return setupPositioning();
          };
          scope.$watch('enabled', function(newVal, oldVal){
            if(newVal !== oldVal && newVal)
              updateView();
          });
          scope.$watch('index', function(newVal, oldVal) {
            if (typeof newVal === 'undefined') {
              hideOverlay();
              setupOverlay(false);
              return;
            }
            if(scope.enabled){
              updateView();
            }
          });
          setupOverlay = function(showOverlay) {
            // $('.onboarding-focus').removeClass('onboarding-focus');
            if (showOverlay) {
              if (curStep['attachTo'] && scope.overlay) {

                // console.log('ere', element)
                if(elClone){
                  $('.onboarding-focus').remove();
                  delete elClone;
                }
                // $timeout(function(){
                  elClone = $(curStep['attachTo']).clone();
                  elClone.addClass('onboarding-focus')
                  var position = $(curStep['attachTo']).offset();
                  // console.log()
                  elClone.css({
                    width: $(curStep['attachTo']).outerWidth(),
                    height: $(curStep['attachTo']).outerHeight(),
                    top: position.top,
                    left: position.left
                  })
                  $(curStep['attachTo']).parent().append(elClone)
                // }, 100)
                // return $(curStep['attachTo']).addClass('onboarding-focus');
              }
            }
          };
          setupPositioning = function() {
            var attachTo, bottom, left, right, top, xMargin, yMargin;
            attachTo = curStep['attachTo'];
            scope.position = curStep['position'];
            xMargin = 15;
            yMargin = 15;
            if (attachTo) {
              if (!(scope.left || scope.right)) {
                left = null;
                right = null;
                if (scope.position === 'right') {
                  left = $(attachTo).offset().left + $(attachTo).outerWidth() + xMargin;
                } else if (scope.position === 'left') {
                  right = $(window).width() - $(attachTo).offset().left + xMargin;
                } else if (scope.position === 'top' || scope.position === 'bottom') {
                  left = $(attachTo).offset().left;
                }
                if (curStep['xOffset']) {
                  if (left !== null) {
                    left = left + curStep['xOffset'];
                  }
                  if (right !== null) {
                    right = right - curStep['xOffset'];
                  }
                }
                scope.left = left;
                scope.right = right;
              }
              if (!(scope.top || scope.bottom)) {
                top = null;
                bottom = null;
                if (scope.position === 'left' || scope.position === 'right') {
                  top = $(attachTo).offset().top;
                } else if (scope.position === 'bottom') {
                  top = $(attachTo).offset().top + $(attachTo).outerHeight() + yMargin;
                } else if (scope.position === 'top') {
                  bottom = $(window).height() - $(attachTo).offset().top + yMargin;
                }
                if (curStep['yOffset']) {
                  if (top !== null) {
                    top = top + curStep['yOffset'];
                  }
                  if (bottom !== null) {
                    bottom = bottom - curStep['yOffset'];
                  }
                }
                scope.top = top;
                scope.bottom = bottom;
              }
            }
            if (scope.position && scope.position.length) {
              // return scope.positionClass = "onboarding-" + scope.position;
            } else {
              return scope.positionClass = null;
            }
          };
          scope.$watch('steps', function(){
            if (scope.steps.length && !scope.index) {
              scope.index = 0;
            }
          });

        },
        template: "<div class='onboarding-container' ng-show='enabled'>\n  <div class='{{overlayClass}}' ng-style='{opacity: overlayOpacity}', ng-show='overlay'></div>\n  <div class='{{popoverClass}} {{positionClass}}' ng-style=\"{width: width, height: height, left: left, top: top, right: right, bottom: bottom}\">\n    <div class='{{arrowClass}}'></div>\n    <h3 class='{{titleClass}}' ng-show='title' ng-bind='title'></h3>\n    <a href='' ng-click='close()' class='{{closeButtonClass}}' ng-bind-html='closeButtonText'></a>\n    <div class='{{contentClass}}'>\n      <p ng-bind-html='description'></p>\n    </div>\n    <div class='{{buttonContainerClass}}' ng-show='showButtons'>\n      <span ng-show='showStepInfo' class='{{stepClass}}'>{{actualStepText}} {{index + 1}} {{totalStepText}} {{stepCount}}</span>\n      <a href='' ng-click='previous()' ng-show='showPreviousButton' class='{{buttonClass}}' ng-bind-html='previousButtonText'></a>\n      <a href='' ng-click='next()' ng-show='showNextButton' class='{{buttonClass}}' ng-bind-html='nextButtonText'></a>\n      <a href='' ng-click='close()' ng-show='showDoneButton && lastStep' class='{{buttonClass}}' ng-bind-html='doneButtonText'></a>\n    </div>\n  </div>\n</div>"
      };
    }
  ]);

}).call(this);