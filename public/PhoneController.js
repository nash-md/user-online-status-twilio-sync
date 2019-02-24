function PhoneController ($scope, $http, $timeout, $log, $window) {
	$scope.identity = null;
	$scope.state = 'unknown';
	$scope.connection = null;
	$scope.phoneNumber = '';

	$scope.call = function () {
		$scope.phoneNumber = this.phoneNumber;

		console.log('Initiate Call to ' + $scope.phoneNumber);

		$scope.connection = Twilio.Device.connect({
			phoneNumber: $scope.phoneNumber
		});

		$scope.state = 'busy';
	};

	$scope.accept = function () {
		$scope.connection.accept();
	};

	$scope.disconnect = function () {
		$scope.connection.disconnect();
	};

	$scope.$on('InitializePhone', function (event, data) {
		$log.log('InitializePhone event received, %o', data);

		$scope.identity = data.identity;

		try {
			Twilio.Device.setup(data.token, { debug: true });
		} catch (error) {
			$scope.state = 'error';
			$log.error(error);
		}

		Twilio.Device.on('ready', function (device) {
			$scope.state = 'idle';
			$scope.$apply();
		});

		Twilio.Device.on('cancel', function (device) {
			$scope.state = 'idle';

			$timeout(function () {
				$scope.$apply();
			});
		});

		Twilio.Device.on('connect', function (device) {
			$scope.state = 'busy';
			$scope.$apply();
		});

		Twilio.Device.on('offline', function (device) {
			$scope.state = 'offline';
			$scope.$apply();
		});

		Twilio.Device.on('incoming', function (connection) {
			$scope.state = 'incoming';

			$scope.connection = connection;

			$timeout(function () {
				$scope.$apply();
			});
		});

		Twilio.Device.on('disconnect', function (connection) {
			$scope.state = 'idle';

			$timeout(function () {
				$scope.$apply();
			});
		});

		Twilio.Device.on('error', function (error) {
			$scope.state = 'error';
			$log.error(error);
			$scope.$apply();
		});

	});

}

angular
	.module('statusApplication')
	.controller('PhoneController', PhoneController);