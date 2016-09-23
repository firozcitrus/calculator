angular.module('calculator', ['ionic', 'ngProgress', 'ui.bootstrap'])

        .run(function ($ionicPlatform) {
            $ionicPlatform.ready(function () {
                // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
                // for form inputs)
                if (window.cordova && window.cordova.plugins.Keyboard) {
                    cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
                }
                if (window.StatusBar) {
                    // org.apache.cordova.statusbar required
                    StatusBar.styleDefault();
                }
            });
        })

        .config(function ($stateProvider, $urlRouterProvider, $locationProvider) {

            $locationProvider.html5Mode(true);

            // Ionic uses AngularUI Router which uses the concept of states
            // Learn more here: https://github.com/angular-ui/ui-router
            // Set up the various states which the app can be in.
            // Each state's controller can be found in controllers.js
            $stateProvider
                    .state('set-home', {
                        url: '/home',
                        templateUrl: 'app/template/calc.html',
                        controller: 'CalculatorController',
                        title: 'Home',
                        showHeader: true
                    });

            // if none of the above states are matched, use this as the fallback
            $urlRouterProvider.otherwise('/home');

        })
        .service('MathService', function () {
            this.add = function (a, b) {
                return parseInt(a) + parseInt(b)
            };

            this.subtract = function (a, b) {
                return parseInt(a) - parseInt(b)
            };

            this.multiply = function (a, b) {
                return parseInt(a) * parseInt(b)
            };

            this.divide = function (a, b) {
                return parseInt(a) / parseInt(b)
            };
        })
        .controller('CalculatorController', function ($scope, MathService) {
            $scope.operate = "";
            $scope.numbe = "";
            $scope.operator = function (opt) {
                if ($scope.numberone != "" || $scope.numbertwo != "")
                {
                    switch (opt) {
                        case('add'):
                            $scope.operate = '+';
                            break;
                        case('sub'):
                            $scope.operate = '-';
                            break;
                        case('multi'):
                            $scope.operate = '*';
                            break;
                        case('div'):
                            $scope.operate = '/';
                            break;
                    }
                }
            }
            $scope.addnumber = function (numb) {
                if ($scope.operate === "") {
                    $scope.numberone = $scope.numbe + numb;
                    $scope.numbe = $scope.numberone;
                } else if ($scope.operate != "" && $scope.numberone != "") {
                    if ($scope.numbertwo === "")
                        $scope.numbe = "";
                    $scope.numbertwo = $scope.numbe + numb;
                    $scope.numbe = $scope.numbertwo;
                }
            }

            $scope.calculate = function () {
                if ($scope.operate != "" && $scope.numberone != "" && $scope.numbertwo != "") {
                    switch ($scope.operate) {
                        case('+'):
                            $scope.answer = MathService.add($scope.numberone, $scope.numbertwo);
                            break;
                        case('-'):
                            $scope.answer = MathService.subtract($scope.numberone, $scope.numbertwo);
                            break;
                        case('*'):
                            $scope.answer = MathService.multiply($scope.numberone, $scope.numbertwo);
                            break;
                        case('/'):
                            $scope.answer = MathService.divide($scope.numberone, $scope.numbertwo);
                            break;
                    }

                } else {
                    $scope.errormsg = "Empty fields";
                }
            }
        });