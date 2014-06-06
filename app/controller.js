angular.module('app')
.controller('mainCtrl', ['$scope', function($scope){
	$scope.estimatedTax = function(){
		var amount = 0;
		amount += info.income*.3 - info.standardDeduction;
		return amount;
	}

	// Private Variables
	var settings = {
		subjectToSelfEmployment: 0.9235,
		selfEmploymentTaxBreak: .5,
		socialSecurityWageBase: 113700,
		FICATaxRate: .153,
		medicareTaxRate: .029,
		maxSocialSecurityTaxAmount: 14098.8,
		medicalExpenseMinPercent: .1,
		exemptionAmount: 3950,
		taxBrackets: [
			{
				percent: .1,
				single: 9075,
				mfj: 18150,
				hoh: 12950
			},
			{
				percent: .15,
				single: 36900,
				mfj: 73800,
				hoh: 49400
			},
			{
				percent: .25,
				single: 89350,
				mfj: 148850,
				hoh: 127550				
			},
			{
				percent: .28,
				single: 186350,
				mfj: 226850,
				hoh: 206600				
			},
			{
				percent: .33,
				single: 405100,
				mfj: 405100,
				hoh: 405100				
			},	
			{
				percent: .35,
				single: 406750,
				mfj: 457600,
				hoh: 432200				
			},	
			{
				percent: .396,
				single: 406751,
				mfj: 457601,
				hoh: 432201				
			},				
		]
	};

	// Private Methods
	var calculations = $scope.calculations = {
		businessIncome: function(){
			return info.income - info.totals.expenses();
		},
		selfEmploymentTax: function(){
			var selfEmploymentTax = 0;
			var selfEmploymentIncome = calculations.businessIncome() * settings.subjectToSelfEmployment;
			if(selfEmploymentIncome > 0){
				if(selfEmploymentIncome <= settings.socialSecurityWageBase) {
					selfEmploymentTax = selfEmploymentIncome * settings.FICATaxRate;
				}else{
					selfEmploymentTax = selfEmploymentIncome * settings.medicareTaxRate + maxSocialSecurityTaxAmount;
				}
			}else{
				selfEmploymentTax = 0;
			}
			return selfEmploymentTax;
		},
		selfEmploymentDeduction: function(){
			return calculations.selfEmploymentTax() * settings.selfEmploymentTaxBreak;
		},
		AGI: function(){
			return calculations.businessIncome() - calculations.selfEmploymentDeduction();
		},
		medicalDeductions: function(){
			var minimumMedicalDeduction = calculations.AGI()*settings.medicalExpenseMinPercent;
			if(info.totals.medical() > info.standardDeduction){
				return info.totals.medical();
			}else{
				return 0;
			}
		},	
		itemizedDeduction: function(){
			console.log('itemize1');

			var itemize = calculations.medicalDeductions() + info.totals.Aexpenses();
			console.log('itemize2');
			
			return itemize;
		},
		itemizeOrStandard: function(){
			var deduction = 0;
			console.log('standard')
			if(calculations.itemizedDeduction() > info.standardDeduction){
				deduction = calculations.itemizedDeduction();
			}else{
				deduction = info.standardDeduction;
			}
			return deduction;
		},
		exemptions: function() {
			var exemption = (info.dependants + 1) * settings.exemptionAmount;
			return exemption;			
		},
		incomeTax: function(){
			var incomeTax = 0;
			console.log('income');
			var incomeTaxable = calculations.AGI() - calculations.itemizeOrStandard() - calculations.exemptions();
			var maritalStatusName = info.maritalStatus.name.toLowerCase();
			angular.forEach(settings.taxBrackets, function(taxBracket, index){
				var min = index == 0 ? 0 : settings.taxBrackets[index-1][maritalStatusName];
				var max = taxBracket[maritalStatusName];
				var percent = taxBracket.percent;

				if(incomeTaxable < min) return;

				var bracketTaxableAmount = incomeTaxable > max ? max-min : incomeTaxable-min; 
				var tax = bracketTaxableAmount*percent;
				incomeTax+=tax;
			});

			// var taxBracketIndex = 0;
			// var taxBracket = settings.taxBrackets[taxBracketIndex];
			// while(taxBracket != null || taxBracket[maritalStatusName] > incomeTaxable){
			// 	var min = index == 0 ? 0 : settings.taxBrackets[index-1][maritalStatusName];
			// 	var max = taxBracket[maritalStatusName];
			// 	var percent = taxBracket.percent;

			// 	var bracketTaxableAmount = incomeTaxable > max ? max-min : incomeTaxable-min; 
			// 	var tax = bracketTaxableAmount*percent;
			// 	incomeTax+=tax;

			// 	taxBracketIndex++;
			// 	taxBracket = settings.taxBrackets[taxBracketIndex];
			// }
			return incomeTax;
		}

	};
	
	var init = function(){
		info.maritalStatus = $scope.maritalStatuses[2];
	};

	// Public Variable
	$scope.maritalStatuses = [
		{name:'HOH', amount: 9100},
		{name:'MFJ', amount: 12400},
		{name:'Single', amount: 6200}
	]

	var info = $scope.info = {
		income: 0,
		expenses: {
			home: 0,
			internet: 0,
			utilities: 0,
			phone: 0,
			supplies: 0,
			equipment: 0,
			health: 0,
			tax: 0,
			dues: 0,
			other: 0
		},
		totals: {
			expenses: function(){
				var total = 0;
				angular.forEach(info.expenses, function(expense){
					if(isNaN(expense)) return;
					total+=expense;
				});
				return total;
			},
			medical: function(){
				var total =0;
				console.log(info.medical);
				angular.forEach(info.medical, function(expense){
					if(typeof expense == 'function'){
						expense = expense();
					};
					console.log(expense);
					if(isNaN(expense)) return;
					total+=expense;
				});
				return total;
			},
			Aexpenses: function(){
				var total =0;
				angular.forEach(info.Aexpenses, function(expense){
					//if(isNaN(expense)) return;
					total+=expense;
				});
				return total;
			}
		},
		medical: {
			doctor: 0,
			hospital: 0,
			prescription: 0,
			miles: 0,
			milesExpense: function(){
				return info.medical.miles * .235;
			}
		},
		Aexpenses: {
			taxes: 0,
			mortgage: 0,
			charitable: 0,
		},
		maritalStatus: null,
		standardDeduction: 0,
		dependants: 0,
		totalTax: function(){
			//console.log('test');
			//console.log(calculations.incomeTax());
			var TaxDue = calculations.incomeTax() + calculations.selfEmploymentTax();
			return Math.round(TaxDue);
		}
	};

	// Public Methods

	// Watchers
	$scope.$watch('info.maritalStatus', function(maritalStatus){
		if(maritalStatus == null) return;
		info.standardDeduction = maritalStatus.amount;
	})
	init();
}]);