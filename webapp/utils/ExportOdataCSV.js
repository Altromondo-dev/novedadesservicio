sap.ui.define([
	"sap/ui/model/FilterProcessor"
], function (FilterProcessor) {
	"use strict";

	return {

		/*
		 * unique parameter options with subparameters:
		 *	serverFilters: filters to do to the oData call directly
		 *	clientFilters: filters to do in the client side of the data
		 *	successCallback: self explaining
		 *	errorCallback: do i have to tell you?
		 *	headers: headers of the csv
		 *	properties: array of properties in order to headers
		 *		text: the name of the property to put in the csv
		 *		object: special case property
		 *			path: name of the property to take from the oData
		 *			extraParams: extra parameters to call the formatter with
		 *			formatter: function to call the property with, the value will be used first and then the extra params
		 *	oDataModel: oDataModel to load the set from
		 *	entitySet: entity set to load the data from
		 *	fileName: name to the exported file
		 *FilterProcessor is sap.ui.model.FilterProcessor,  you have to import it
		 */
		exportOdataToCSV: function (options) {
			var fd = FilterProcessor;
			//serverFilters, clientFilters, successCallback, errorCallback
			var serverFilters = options.serverFilters;
			var clientFilters = options.clientFilters;
			var successCallback = options.successCallback;
			var errorCallback = options.errorCallback;
			var headers = options.headers;
			var properties = options.properties; //array of properties in order to headers
			var csv = [];
			csv.push(headers.join(";"));

			function evaluateMultiFilter(multiFilter, obj) {
				var isAnd = !!multiFilter.bAnd;
				var filters = multiFilter.aFilters;
				var result = isAnd;
				for (var i = 0; i < filters.length; i++) {
					var childFilter = filters[i];
					// eslint-disable-next-line no-use-before-define
					var match = evaluateFilter(childFilter, obj);
					if (isAnd) {
						// if operator is AND, first non matching filter breaks
						if (!match) {
							result = false;
							break;
						}
					} else {
						// if operator is OR, first matching filter breaks
						if (match) {
							result = true;
							break;
						}
					}
				}
				return result;
			}

			function evaluateFilter(filter, obj) {
				if (filter.aFilters) {
					return evaluateMultiFilter(filter, obj);
				}
				var fnTest = fd.getFilterFunction(filter);
				var value = obj[filter.sPath];
				if (!filter.fnCompare || filter.bCaseSensitive !== undefined) {
					value = fd.normalizeFilterValue(value, filter.bCaseSensitive);
				}
				return value !== undefined && fnTest(value);
			}

			function groupFilters(aFilters) {
				var sCurPath, mSamePath = {},
					aResult = [];

				function getFilter(aFilters, bAnd) {
					if (aFilters.length === 1) {
						return aFilters[0];
					}
					if (aFilters.length > 1) {
						return new sap.ui.model.Filter(aFilters, bAnd);
					}
					return undefined;
				}

				if (!aFilters || aFilters.length === 0) {
					return undefined;
				}
				// No need for grouping if only a single filter is contained
				if (aFilters.length === 1) {
					return aFilters[0];
				}
				// Collect filters on same path, make sure to keep order as before for compatibility with tests
				aFilters.forEach(function (oFilter) {
					if (oFilter.aFilters || oFilter.sVariable) { // multi/lambda filter
						sCurPath = "__multiFilter";
					} else {
						sCurPath = oFilter.sPath;
					}
					if (!mSamePath[sCurPath]) {
						mSamePath[sCurPath] = [];
					}
					mSamePath[sCurPath].push(oFilter);
				});
				// Create ORed multifilters for all filter groups
				for (var sPath in mSamePath) {
					aResult.push(getFilter(mSamePath[sPath], sPath === "__multiFilter")); // multi filters are ANDed
				}

				return getFilter(aResult, true); //AND
			}

			var clientFilter = clientFilters && groupFilters(clientFilters);
			var oDataModel = options.oDataModel;

			oDataModel.read(options.entitySet, {
				filters: serverFilters || [],
				success: function (data) {
					var arr = data.results;
					if (clientFilter) {
						arr = arr.filter(function (obj) {
							return evaluateFilter(clientFilter, obj);
						});
					}
					for (var i = 0; i < arr.length; i++) {
						var obj = arr[i];
						var row = [];
						for (var propertyIndex in properties) {
							var property = properties[propertyIndex];
							if (typeof property === 'object') {
								var value = obj[property.path];
								//this only accepts values, except the property name
								//the property name is the first value sent to the formatter
								if (property.formatter) {
									if (property.extraParams) {
										var args = [value].concat(property.extraParams);
										value = property.formatter.apply(this, args);
									} else {
										value = property.formatter(value);
									}
								}
								row.push("\"" + value + "\"");
							} else {
								row.push("\"" + obj[property] + "\"");
							}
						}
						csv.push(row.join(";"));
					}

					var string = csv.join('\n');

					var blob = new Blob(['\ufeff' + string], {
						type: 'text/csv;charset=utf-8;'
					});
					if (navigator.msSaveBlob) { // IE 10+
						navigator.msSaveBlob(blob, options.fileName);
					} else {
						var link = document.createElement("a");
						var url = URL.createObjectURL(blob);
						var isSafari = navigator.userAgent.indexOf('Safari') != -1 && navigator.userAgent.indexOf('Chrome') == -1;
						if (isSafari) //if Safari open in new window to save file with random filename.
							link.setAttribute("target", "_blank");
						link.setAttribute("href", url);
						link.setAttribute("download", options.fileName);
						link.style = "visibility:hidden";
						document.body.appendChild(link);
						link.click();
						document.body.removeChild(link);
					}
					if (successCallback) successCallback(1);

				},
				error: function (err) {
					if (errorCallback) errorCallback(err);
				}
			});
		},

	};
});