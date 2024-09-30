sap.ui.define([
	"EscuelasVerdes/services/ODataService",
	// Helpers
	"EscuelasVerdes/utils/AppManagementHelper",
	"EscuelasVerdes/utils/FormatHelper",
	"EscuelasVerdes/utils/MessageBoxHelper"
], function(ODataService, AppManagementHelper, FormatHelper, MessageBoxHelper) {
	"use strict";

	return {

		_oOptions: {
			POST: {
				service: "EVODataModel",
				entity: "Escuela",
				payload: null,
				parameters: [{
					key: "$format",
					value: "json"
				}],
				success: {
					title: "Listo",
					message: "algun mensaje",
					callback: "callback"
				},
				error: {
					title: "Error",
					message: "algun mensaje",
					callback: "callback"
				}
			},
			DELETE: {
				service: "EVODataModel",
				entity: "Escuela",
				success: {
					title: "Listo",
					message: "algun mensaje",
					callback: "callback"
				},
				error: {
					title: "Error",
					message: "algun mensaje",
					callback: "callback"
				}
			}
		},

		_oDialogOptions: {
			icon: "sap-icon://alert",
			text: null
		},

		executeRequest: function(sMethod, oOptions) {
			this._oOptions[sMethod] = oOptions;
			switch (sMethod) {
				case "DELETE":
					this.DELETE();
					break;
				case "POST":
					this.POST();
					break;
				case "GET":
					this.GET();
					break;
				case "PUT":
					this.PUT();
					break;
				default:
					console.log("El método a ejecutar en el ODataRequestsHelper no existe");
					break;
			}
		},
		_getModel: function(sModelName) {
			var jsonModel = AppManagementHelper.getApp().getModel(sModelName);
			if (!jsonModel) {
				jsonModel = new sap.ui.model.json.JSONModel();
				jsonModel.setSizeLimit(999999);
				AppManagementHelper.getApp().setModel(jsonModel, sModelName);
			}
			return jsonModel;
		},

		POST: function() {
			var oOptions = this._oOptions["POST"];
			var oParameters = {};

			for (var i in oOptions.parameters) {
				var oParameter = oOptions.parameters[i];
				oParameters[oParameter.key] = oParameter.value;
			}

			var oDataModel = ODataService.getService(oOptions.service);
			oDataModel.setUseBatch(false);
			oDataModel.create("/" + oOptions.entity, oOptions.payload, {
				success: $.proxy(this._successPOST, this, oOptions),
				error: $.proxy(this._errorPOST, this, oOptions),
				urlParameters: oParameters,
				async: true
			});
		},
		_successPOST: function(oOptions, data) {
			var oSuccess = oOptions.success;
			if (oSuccess.showAlert) {
				ODataService.getService(oOptions.service).setUseBatch(true);
				this._oDialogOptions.text = oSuccess.message;
				this._oDialogOptions.icon = oSuccess.icon;
				this._oDialogOptions.buttons = [{
					"text": oSuccess.textButton || "Cerrar",
					"callback": oSuccess.callback,
					"classes": ["button-mate", "icon-medium"],
					"customDatas": {
						"closeDialog": true
					}
				}];
				MessageBoxHelper.showGreenSchoolsCustomDialog(this._oDialogOptions);
				FormatHelper.removeResults(data);
			}
			if (oSuccess.callback && !oSuccess.showAlert) {
				oSuccess.callback(data);
			}
		},
		_errorPOST: function(oOptions, error) {
			var oError = oOptions.error;
			if (oError.showAlert) {
				ODataService.getService(oOptions.service).setUseBatch(true);
				if (error.responseText) {
					var oMessage = JSON.parse(error.responseText);
					this._oDialogOptions.text = oMessage.error.message.value;
				} else {
					this._oDialogOptions.text = oError.message;
				}
				this._oDialogOptions.buttons = [{
					"text": oError.textButton || "Cerrar",
					"callback": oError.callback,
					"classes": ["button-mate", "icon-medium"],
					"customDatas": {
						"closeDialog": true
					}
				}];
				MessageBoxHelper.showGreenSchoolsCustomDialog(this._oDialogOptions);
			}
			if (oError.callback && !oError.showAlert) {
				oError.callback(error);
			}
		},

		GET: function() {
			var oOptions = this._oOptions["GET"];
			var oParameters = {};
			for (var i in oOptions.parameters) {
				var oParameter = oOptions.parameters[i];
				oParameters[oParameter.key] = oParameter.value;
			}
			var oDataModel = ODataService.getService(oOptions.service);
			oDataModel.setUseBatch(false);
			oDataModel.read("/" + oOptions.entity, {
				success: $.proxy(this._successGET, this, oOptions),
				error: $.proxy(this._errorGET, this, oOptions),
				urlParameters: oParameters,
				filters: oOptions.filters,
				async: true
			});
		},
		_successGET: function(oOptions, data) {
			var oSuccess = oOptions.success || {};
			ODataService.getService(oOptions.service).setUseBatch(true);
			if (oSuccess.callback) {
				oSuccess.callback(data);
			}
		},
		_errorGET: function(oOptions, error) {
			var oError = oOptions.error || {};
			if (oError.showAlert) {
				ODataService.getService(oOptions.service).setUseBatch(true);
				if (error.responseText) {
					var oMessage = JSON.parse(error.responseText);
					this._oDialogOptions.text = oMessage.error.message.value;
				} else {
					this._oDialogOptions.text = oError.message;
				}
				this._oDialogOptions.buttons = [{
					"text": oError.textButton || "Cerrar",
					"callback": oError.callback,
					"classes": ["button-mate", "icon-medium"],
					"customDatas": {
						"closeDialog": true
					}
				}];
				MessageBoxHelper.showGreenSchoolsCustomDialog(this._oDialogOptions);
			}
			if (oError.callback && !oError.showAlert) {
				oError.callback(error);
			}
		},

		PUT: function() {
			var oOptions = this._oOptions["PUT"];
			var oParameters = {};
			for (var i in oOptions.parameters) {
				var oParameter = oOptions.parameters[i];
				oParameters[oParameter.key] = oParameter.value;
			}
			var oDataModel = ODataService.getService(oOptions.service);
			oDataModel.setUseBatch(false);
			oDataModel.update("/" + oOptions.entity, oOptions.payload, {
				success: $.proxy(this._successPUT, this, oOptions),
				error: $.proxy(this._errorPUT, this, oOptions),
				urlParameters: oParameters,
				async: true
			});
		},
		_successPUT: function(oOptions, data) {
			var oSuccess = oOptions.success;
			if (oSuccess.showAlert) {
				ODataService.getService(oOptions.service).setUseBatch(true);
				this._oDialogOptions.text = oSuccess.message;
				this._oDialogOptions.icon = oSuccess.icon;
				this._oDialogOptions.buttons = [{
					"text": oSuccess.textButton || "Cerrar",
					"callback": oSuccess.callback,
					"classes": ["button-mate", "icon-medium"],
					"customDatas": {
						"closeDialog": true
					}
				}];
				MessageBoxHelper.showGreenSchoolsCustomDialog(this._oDialogOptions);
			}
			if (oSuccess.callback && !oSuccess.showAlert) {
				oSuccess.callback(data);
			}
		},
		_errorPUT: function(oOptions, error) {
			var oError = oOptions.error;
			if (oError.showAlert) {
				ODataService.getService(oOptions.service).setUseBatch(true);
				if (error.responseText) {
					var oMessage = JSON.parse(error.responseText);
					this._oDialogOptions.text = oMessage.error.message.value;
				} else {
					this._oDialogOptions.text = oError.message;
				}
				this._oDialogOptions.buttons = [{
					"text": oError.textButton || "Cerrar",
					"callback": oError.callback,
					"classes": ["button-mate", "icon-medium"],
					"customDatas": {
						"closeDialog": true
					}
				}];
				MessageBoxHelper.showGreenSchoolsCustomDialog(this._oDialogOptions);
			}
			if (oError.callback && !oError.showAlert) {
				oError.callback(error);
			}
		},

		//----REVISAR----//
		DELETE: function() {
			var oOptions = this._oOptions["DELETE"];
			var oParameters = {};
			var oDataModel = ODataService.getService(oOptions.service);
			oDataModel.setUseBatch(false);
			oDataModel.remove("/" + oOptions.entity, {
				success: $.proxy(this._successDELETE, this, oOptions),
				error: $.proxy(this._errorDELETE, this, oOptions),
				urlParameters: oParameters,
				async: true
			});
		},
		_successDELETE: function(oOptions, data) {
			var oSuccess = oOptions.success;
			if (oSuccess.showAlert) {
				ODataService.getService(oOptions.service).setUseBatch(true);
				this._oDialogOptions.text = oSuccess.message;
				this._oDialogOptions.icon = oSuccess.icon;
				this._oDialogOptions.buttons = [{
					"text": oSuccess.textButton || "Cerrar",
					"callback": oSuccess.callback,
					"customDatas": {
						"closeDialog": true
					}
				}];
				MessageBoxHelper.showGreenSchoolsCustomDialog(this._oDialogOptions);
			}
			if (oSuccess.callback && !oSuccess.showAlert) {
				oSuccess.callback(data);
			}
		},
		
		_errorDELETE: function(oOptions, error) {
			var oError = oOptions.error;
			ODataService.getService(oOptions.service).setUseBatch(true);
			if (error.responseText) {
				var oMessage = JSON.parse(error.responseText);
				this._oDialogOptions.text = oMessage.error.message.value;
			} else {
				this._oDialogOptions.text = oError.message;
			}
			this._oDialogOptions.buttons = [{
				"text": oError.textButton || "Cerrar",
				"callback": oError.callback,
				"customDatas": {
					"closeDialog": true
				}
			}];
			MessageBoxHelper.showGreenSchoolsCustomDialog(this._oDialogOptions);
			if (oError.callback) {
				oError.callback(error);
			}
		}

	};
});