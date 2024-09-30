sap.ui.define([
	//helpers
	"sap/ui/core/format/NumberFormat",
	"sap/ui/core/format/DateFormat",
	"Transener/Operaciones/NovedadesServicio/utils/i18nTranslationHelper"
], function(NumberFormat, DateFormat, i18nTranslationHelper) {
	"use strict";

	return {
		
		errors: [],
		
		_oModel: null,
		
		make: function(model, rules){
			this._oModel = model;
			var data = this._oModel.getData();
			this._clearErrors();
			for(var property in data){
				var value = data[property];
				var stop = false;
				for(var index in rules[property]){
					var rule = rules[property][index];
					var isNotValid, error;
					if(!stop){
						switch(rule){
							case 'required':
								isNotValid = this._required(value); 
								if(isNotValid){
									error = {};
									error[property] = rule;
									this.errors.push(error);
									stop = true;
								}
							break;
							case 'numeric':
								if(value!=null && value!=""){
									isNotValid = (value==null || value=="") ? false : this._type('number', (isNaN(parseInt(value)))?"":parseInt(value));
									if(isNotValid){  
										error = {};
										error[property] = rule;
										this.errors.push(error);
										stop = true;
									}
								}
							break;
							case 'date':
								isNotValid = (value==null || value=="") ? false : this._type('date', value);
								if(isNotValid){
									error = {};
									error[property] = rule;
									this.errors.push(error);
									stop = true;
								}
							break;
							default:
								var r = rule.split(':');
								switch(r[0]){
									case 'min':
										isNotValid = (value==null || value=="") ? false :  this._min(value, parseInt(r[1])); 
										if(isNotValid){
											error = {};
											error[property] = r[0];
											this.errors.push(error);
											stop = true;
										}
									break;
									case 'max':
										isNotValid = (value==null || value=="") ? false : this._max(value, parseInt(r[1])); 
										if(isNotValid){
											error = {};
											error[property] = r[0];
											this.errors.push(error);
											stop = true;
										}
									break;
									case 'maxDate':
										isNotValid = (value==null || value=="") ? false : this._dateMax(value, data[r[1]]); 
										if(isNotValid){
											error = {};
											error[property] = r[0];
											this.errors.push(error);
											stop = true;
										}
									break;
									case 'minDate':
										isNotValid = (value==null || value=="") ? false : this._dateMin(value, data[r[1]]); 
										if(isNotValid){
											error = {};
											error[property] = r[0];
											this.errors.push(error);
											stop = true;
										}
									break;
								}
							break;
						}
					}
				}
			}
			this._attachErrors();
			return (this.errors.length > 0);
		},
		
		_required: function(value){
			return (value === "" || value === null);
		},
		
		_min: function(value, length){
			return (value.length < length);
		},
		
		_max: function(value, length){
			return (value.length > length);
		},
		
		_dateMax: function(date, dateMax){
			return (date > dateMax);
		},
		
		_dateMin: function(date, dateMin){
			return (date < dateMin);
		},
		
		_type: function(expected, value) {
			var type = ({}).toString.call(value).match(/\s([a-z|A-Z]+)/)[1].toLowerCase();
			return (type != expected);
		},
		
		_clearErrors: function(){
			this.errors.length = 0;	
		},
		
		_attachErrors: function(){
			for(var index in this.errors){
				for(var property in this.errors[index]){
					this._oModel.getData()[property+"State"] = "Error";
				}
			}
			this._oModel.updateBindings(true);
		},
		
		resetErrors: function(){
			for(var index in this.errors){
				for(var property in this.errors[index]){
					this._oModel.getData()[property+"State"] = "None";
				}
			}
		}
	};
});