angular.module( 'sample', [
        'ngRoute',
        'ui.router',
        'json-tree',
        'app.settings', // Configuraciones servidor
        'app.pielements'
    ])
    .config(['$stateProvider', '$urlRouterProvider', function ($stateProvider, $urlRouterProvider) {
        $urlRouterProvider
            .otherwise('/');

        $stateProvider
            .state("home", {
                url: "/",
                templateUrl: 'views/home/home.html',
                data: {pageTitle: 'Xompass PI WebAPI Interface'}
            })
            .state("pielements" , {
                url: '/pielements',
                controller: 'PielementsCtrl',
                templateUrl: 'views/pielements/pielements.html',
                data: {pageTitle: 'Readings'}
            })
            .state("settings", {
                url: '/settings',
                controller: 'SettingsCtrl',
                templateUrl: 'views/settings/settings.html',
                data: {pageTitle: 'Settings'}
            });
    }])
    .controller( 'AppCtrl', function AppCtrl ($rootScope, $state) {
        $rootScope.$state = $state
    });