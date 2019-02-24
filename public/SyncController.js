function SyncController ($scope, $http, $timeout, $log, $window) {
	$scope.state = 'unknown';
	$scope.documentName = null;
	$scope.client = null;

	$scope.$on('InitializeSync', function (event, data) {
		$log.log('InitializeSync event received, %o', data);

		$scope.documentName = data.documentName;

		try {
			$scope.client = new Twilio.Sync.Client(data.token, { logLevel: 'debug' });
		} catch (error) {
			$log.error(error);
			$scope.state = 'error';
		}

		$scope.state = 'Sync Client: connecting...';

		$scope.client.on('connectionStateChanged', function (state) {
			$log.log('Sync Client: ' + state);

			$scope.state = state;
			$scope.$apply();

			if (state === 'connected') {
				$scope.syncPresenceList();
			}

		});

		$scope.client.on('tokenExpired', function() {
			$log.log('Sync Client: token expired')
			$scope.state = 'offline';
			$scope.users = null;
			$scope.client = null;

			$scope.$apply();
		}); 

	});

	$scope.syncPresenceList = function () {
		$log.log('Sync Document: ' + $scope.documentName);

		$scope.client.document($scope.documentName)
			.then(function (document) {
				$scope.users = document.value.users;
				$scope.$apply();

				document.on('updated',function (data) {
					$log.log('remote update ... %o', data);
					$scope.users = data.value.users;
					$scope.$apply();
				});
			}).catch(function (error) {
				$log.error(error);
			});

	};

}

angular
	.module('statusApplication')
	.controller('SyncController', SyncController);