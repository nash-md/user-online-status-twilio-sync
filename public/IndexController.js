function IndexController ($scope, $http, $log) {
	$scope.name = '';
	$scope.identity = null;
	$scope.endpoint = null;

	$scope.getDeviceId = function () {
		return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
			let r = Math.random()*16|0, v = c === 'x' ? r : (r&0x3|0x8);
			return v.toString(16);
		});

	};

	$scope.start = function () {
		$scope.identity = $scope.name;

		const payload = { identity: $scope.identity, endpoint: $scope.getDeviceId() };

		$http.post('/api/phone/token', payload)
			.then(function onSuccess (response) {

				/* initialize Twilio Client */
				$scope.$broadcast('InitializePhone', {
					token: response.data.token,
					identity: $scope.identity
				});

				/* initialize Twilio Sync */
				$scope.$broadcast('InitializeSync', {
					token: response.data.token,
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