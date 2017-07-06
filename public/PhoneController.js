function PhoneController ($scope, $http, $timeout, $log, $window) {
	$scope.state = 'Twilio Client: offline';

	$scope.$on('InitializePhone', function (event, data) {
		$log.log('InitializePhone event received, %o', data);

		try {
			Twilio.Device.setup(data.token, { debug: true });
		} catch (error) {
			$scope.state = 'Error';
			$log.error(error);
		}

		Twilio.Device.ready(function (device) {
			$scope.state = 'Ready';
			$scope.$apply();
		});

		Twilio.Device.cancel(function (device) {
			$scope.state = 'Ready';
			$scope.$apply();
		});

		Twilio.Device.offline(function (device) {
			$scope.state = 'Offline';
			$scope.$apply();
		});

		Twilio.Device.incoming(function (connection) {
			$scope.state = 'Incoming Call';
			$scope.$apply();
		});

		Twilio.Device.error(function (error) {
			$scope.state = 'Error';
			$log.error(error);
			$scope.$apply();
		});

	});

}

angular
  .module('statusApplication')
  .controller('PhoneController', PhoneController);