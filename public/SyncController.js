function SyncController ($scope, $http, $timeout, $log, $window) {
	$scope.state = 'Sync Client: offline';
	$scope.documentName = null;
	$scope.client = null;

	$scope.$on('InitializeSync', function (event, data) {
		$log.log('InitializeSync event received, %o', data);

		$scope.documentName = data.documentName;

		try {
			$scope.client = new Twilio.Sync.Client(data.token);
		} catch (error) {
			$log.error(error);
			$scope.state = 'Error';
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

	});

	$scope.syncPresenceList = function () {
		$log.log('Sync Document: ' + $scope.documentName);

		$scope.client.document($scope.documentName)
			.then(function (document) {
				$scope.users = document.value.users;
				$scope.$apply();

				document.on('updatedRemotely',function (data) {
					$log.log('update remotely ... %o', data);
					$scope.users = data.users;
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