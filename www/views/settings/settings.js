angular.module( 'app.settings', [
    ])
    .controller( 'SettingsCtrl', function ($scope, $http) {
        $http.get('/settings').then(
            function(response){
                $scope.srvConfig = response.data;
                console.log($scope.srvConfig);
            }, function(err){
                console.log(err);
            });

        $scope.saveSettings = function(){
            $http.post('/settings', $scope.srvConfig).then(
                function(response){
                    console.log(response);
                }, function(err){
                    console.log(err);
                });
        }
    });