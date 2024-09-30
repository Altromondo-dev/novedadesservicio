sap.ui.define([
	//helpers
	"Transener/Operaciones/NovedadesServicio/utils/FioriHelper",
	"Transener/Operaciones/NovedadesServicio/utils/FioriComponentHelper",
	"Transener/Operaciones/NovedadesServicio/utils/FormatHelper",
	"Transener/Operaciones/NovedadesServicio/utils/i18nTranslationHelper",
	"Transener/Operaciones/NovedadesServicio/utils/MessageBoxHelper",
	"Transener/Operaciones/NovedadesServicio/services/oDataService"
], function(FioriHelper, FioriComponentHelper, FormatHelper, i18nTranslationHelper, MessageBoxHelper, oDataService) {
	"use strict";

	return {
		_entitySet: "/NovedadesServicioSet",	

		_getNovedades: function() {
			//gets component
			var component = FioriComponentHelper.getComponent();
			//gets model
			var jsonModel = component.byId("App").getModel("NovedadesServicio");
			//checks if the model exists
			if (!jsonModel) {
				jsonModel = new sap.ui.model.json.JSONModel();
				jsonModel.setSizeLimit(9999);
				 component.byId("App").setModel(jsonModel, "NovedadesServicio");
				//initilializing
				jsonModel.setData({
					Busy: false,
					NovedadesServicio: []
				});
			}
			return jsonModel;
		},

		_readODataOnSuccess: function(data) {
			//toma modelo
			var jsonModel = this._getNovedades();
			//setea busy
			jsonModel.setProperty("/Busy", false);
			//setea datos
			jsonModel.setProperty("/NovedadesServicio", data.results);
			//updates model
			jsonModel.updateBindings(true);
		},

		_readODataOnError: function(error) {
			//gets model
			var jsonModel = this._getUsuario();
			//sets busy
			jsonModel.setProperty("/Busy", false);
			//verifies if session is still active
			var sessionTimeoutResponseCode = 503;
			if (error.response.statusCode === sessionTimeoutResponseCode) {
				//session timeout
				FioriHelper.showSessionTimeoutMessageBox();
				return;
			}

			//gets error
			var errorText = error.response.body;
			//parses error
			var contentType = error.response.headers["Content-Type"];
			if (contentType.indexOf("text/html") >= 0) {
				//HTML
				errorText = $(error.response.body).text();
			} else if (contentType.indexOf("application/json") >= 0) {
				//JSON
				try {
					var oError = JSON.parse(errorText);
					errorText = oError.error.message.value;
				} catch (ex) {
					//error in parsing
					errorText = error.response.body;
				}
			}

			//error
			errorText = i18nTranslationHelper.getTranslation("ErrorLoadingInstruccionesOperativas") + ". \n\n" + errorText;
			MessageBoxHelper.showAlert("Error", errorText);
		},

		loadModel: function(filter) {
			//busy
			var filters = [];
			if (filter) {
				filters = this.prepareFilters(filter);
			}
			var model = this._getNovedades();
			model.setProperty("/Busy", true);
			model.setProperty("/NovedadesServicio", []);
			//gets master Firmantes
			var odataModel = oDataService.getModel();
			odataModel.setUseBatch(false);
			odataModel.read(this._entitySet, {
				filters: filters,
				success: jQuery.proxy(this._readODataOnSuccess, this),
				error: jQuery.proxy(this._readODataOnError, this)
			});
		},
		createNovedad: function(novedad) {
			var model = this._getNovedades();
			model.setProperty("/Busy", true);
			model.setProperty("/NovedadesServicio", []);
			//gets master Firmantes
			var odataModel = oDataService.getModel();
			odataModel.setUseBatch(false);
			odataModel.read(this._entitySet, novedad,{
				success: jQuery.proxy(this._readODataOnSuccess, this),
				error: jQuery.proxy(this._readODataOnError, this)
			});
		}

	};
});