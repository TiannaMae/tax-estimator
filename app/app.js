angular.module('app',['ngRoute'])
.config(['$routeProvider',function($routeProvider){
	$routeProvider
	.when('/section/getStarted',{
		templateUrl: 'views/get_started.html',
		caseInsensitiveMatch: true
	})
	.when('/section/income', {
		templateUrl: 'views/income.html',
		caseInsensitiveMatch: true
	})
	.when('/section/BusinessExpense', {
		templateUrl: 'views/expense.html',
		caseInsensitiveMatch: true
	})
	.when('/section/itemize', {
		templateUrl: 'views/itemize.html',
		caseInsensitiveMatch: true
	})
	.when('/section/general', {
		templateUrl: 'views/general.html',
		caseInsensitiveMatch: true
	})
	.when('/section/finish', {
		templateUrl: 'views/estimate.html',
		caseInsensitiveMatch: true
	})
	.when('/section/result', {
		templateUrl: 'views/result.html',
		caseInsensitiveMatch: true
	})
	.otherwise({
		redirectTo: '/section/getStarted'
	});
}])