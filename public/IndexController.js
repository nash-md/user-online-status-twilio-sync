function IndexController ($scope, $http, $timeout, $log, $window, $rootScope) {
	$scope.identity = null;
	$scope.endpoint = null;
	$scope.name = null;

	$scope.getDeviceId = function () {
		return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
			let r = Math.random()*16|0, v = c === 'x' ? r : (r&0x3|0x8);
			return v.toString(16);
		});

	};

	$scope.start = function () {
		$scope.name = $scope.identity;

		const payload = { identity: $scope.name, endpoint: $scope.getDeviceId() };

		$http.post('/api/phone/token', payload)
			.then(function onSuccess (response) {
				/* initialize Twilio Client */
				$scope.$broadcast('InitializePhone', {
					token: response.data.tokens.phone
				});

				/* initialize Twilio Sync */
				$scope.$broadcast('InitializeSync', {
					token: response.data.tokens.sync,
					documentName: response.data.documentName
				});

			}, function onError (response) {
				$log.error(response);
				$scope.state = 'Sync Token Error: ' + response.status + ' (' + response.statusText + ')';
			});
	};

}

angular
	.module('statusApplication', [])
	.controller('IndexController', IndexController);