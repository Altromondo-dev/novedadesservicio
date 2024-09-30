sap.ui.define([
	//helpers
	"sap/ui/core/format/NumberFormat",
	"sap/ui/core/format/DateFormat"
], function(NumberFormat, DateFormat) {
	"use strict";

	return {

		/******************************************FLOAT************************************************/
		_getFormatInstance: function(decimals, withThousands) {
			if (decimals === undefined || decimals === null) {
				decimals = 2;
			}
			return NumberFormat.getFloatInstance({
				minFractionDigits: decimals,
				maxFractionDigits: decimals,
				// decimalSeparator: ",",
				// groupingSeparator: ".",
				groupingEnabled: withThousands
			});
		},
		xmlToJson: function(xml) {

			// Create the return object
			var obj = {};
			if (xml.nodeType === 1) { // element
				// do attributes
				if (xml.attributes.length > 0) {
					obj["@attributes"] = {};
					for (var j = 0; j < xml.attributes.length; j++) {
						var attribute = xml.attributes.item(j);
						obj["@attributes"][attribute.nodeName] = attribute.nodeValue;
					}
				}
			} else if (xml.nodeType === 3) { // text
				obj = xml.nodeValue;
			}

			// do children
			if (xml.hasChildNodes()) {
				for (var i = 0; i < xml.childNodes.length; i++) {
					var item = xml.childNodes.item(i);
					var nodeName = item.nodeName;
					if (typeof(obj[nodeName]) === "undefined") {
						obj[nodeName] = this.xmlToJson(item);
					} else {
						if (typeof(obj[nodeName].push) === "undefined") {
							var old = obj[nodeName];
							obj[nodeName] = [];
							obj[nodeName].push(old);
						}
						obj[nodeName].push(this.xmlToJson(item));
					}
				}
			}
			return obj;
		},
		formatStrToDec: function(number, decimals) {
			var withThousands = false;
			return this._getFormatInstance(decimals).format(number, withThousands);
		},

		formatDecimalWithThousands: function(number, decimals) {
			var withThousands = true;
			return this._getFormatInstance(decimals).format(number, withThousands);
		},

		parseStrToDec: function(s, decimals) {
			return (s) ? this._getFormatInstance(decimals).parse(s) : NaN;
		},

		/******************************************FLOAT para Currency************************************************/
		_specialCurrencies: [{
			CurrencyKey: "COP",
			Decimals: 0
		}, {
			CurrencyKey: "CLP",
			Decimals: 0
		}],

		getCurrencyDecimals: function(currencyKey) {
			//default decimal places
			var decimals = 2;
			//finds currency
			var results = jQuery.grep(this._specialCurrencies, function(currency) {
				return currency.CurrencyKey === currencyKey;
			});
			if (results.length > 0) {
				decimals = results[0].Decimals;
			}
			return decimals;
		},

		formatCurrency: function(amount, currencyKey) {
			var decimals = this.getCurrencyDecimals(currencyKey);
			var withThousands = true;
			return this._getFormatInstance(decimals).format(amount, withThousands);
		},

		/******************************************FLOAT para Gateway************************************************/
		_getFormatNumberGatewayInstance: function(decimals) {
			if (decimals === undefined || decimals === null) {
				decimals = 2;
			}
			return NumberFormat.getFloatInstance({
				minFractionDigits: decimals,
				maxFractionDigits: decimals,
				// decimalSeparator: ".",
				// groupingSeparator: ",",
				groupingEnabled: false
			});
		},

		formatDecimalForGatewayService: function(number, decimals) {
			//parsea valor
			var numberDec = this.parseStrToDec(number, decimals);
			//formatea para gateway
			return this._getFormatNumberGatewayInstance(decimals).format(numberDec);
		},

		/******************************************NUMERIC************************************************/
		_numberFormatter: NumberFormat.getFloatInstance({
			maxFractionDigits: 0
				//decimalSeparator: "."
		}),

		formatIntThousands: function(n) {
			if (n) {
				n = parseInt(n);
				if (!isNaN(n)) {
					return this._numberFormatter.format(n);
				}
			}
		},

		/******************************************DATE************************************************/
		_dateFormatter: DateFormat.getDateTimeInstance({
			pattern: "dd/MM/yyyy"
		}),

		parseDate: function(s) {
			if (s) {
				return this._dateFormatter.parse(s);
			}
		},

		formatDate: function(d) {
			if (d) {
				return this._dateFormatter.format(d);
			}
		},

		formatJsonDate: function(d) {
			if (d) {
				var date = d;
				if (typeof d === "string") {
					var ticks = d.replace("/Date(", "");
					ticks = ticks.replace(")/", "");
					ticks = parseInt(ticks);
					date = new Date(ticks);
				}
				//fixes GMT offset
				date = new Date(date.getTime() + date.getTimezoneOffset() * 60 * 1000);
				return date;
			}
		},

		formatStringToDate: function(d) {
			if (this._getType(d) === 'string') {
				d = new Date(parseInt(d.replace("/Date(", "").replace(")/")));
			}
			return this.formatDate(d);
		},

		formatDateShortDesc: function(d) {
			if (d) {
				//formatting
				var f = DateFormat.getDateTimeInstance({
						pattern: "MMMM dd"
					},
					new sap.ui.core.Locale("en-US")
				);
				var r = f.format(d);
				return r;
			}
		},

		formatDateWeekDayDesc: function(d) {
			if (d) {
				//formatting
				var f = DateFormat.getDateTimeInstance({
						pattern: "EEEE MMMM dd"
					},
					new sap.ui.core.Locale("en-US")
				);
				var r = f.format(d);
				return r;
			}
		},

		formatWeekDayDesc: function(d) {
			if (d) {
				//formatting
				var f = DateFormat.getDateTimeInstance({
						pattern: "EEEE"
					},
					new sap.ui.core.Locale("en-US")
				);
				var r = f.format(d);
				return r;
			}
		},

		formatDateMonthYear: function(year, month) {
			if (year && month) {
				//shifts month to index 0
				month -= 1;
				//creates date
				var d = new Date(year, month, 1);
				//formatting
				var f = DateFormat.getDateTimeInstance({
						pattern: "yyyy MMMM"
					},
					new sap.ui.core.Locale("en-US")
				);
				var r = f.format(d);
				//r = r.toUpperCase();
				return r;
			}
		},

		_getType: function(obj) {
			return ({}).toString.call(obj).match(/\s([a-z|A-Z]+)/)[1].toLowerCase();
		}
	};
});