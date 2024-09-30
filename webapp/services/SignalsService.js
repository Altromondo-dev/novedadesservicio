sap.ui.define([
	//helpers
	"Transener/Operaciones/NovedadesServicio/utils/FioriHelper",
	"Transener/Operaciones/NovedadesServicio/utils/FioriComponentHelper",
	"Transener/Operaciones/NovedadesServicio/utils/FormatHelper",
	"Transener/Operaciones/NovedadesServicio/utils/i18nTranslationHelper",
	"Transener/Operaciones/NovedadesServicio/utils/MessageBoxHelper",
	"Transener/Operaciones/NovedadesServicio/services/oDataService",
	"Transener/Operaciones/NovedadesServicio/utils/BusyDialogHelper",
	"Transener/Operaciones/NovedadesServicio/utils/AppManagementHelper",
	"Transener/Operaciones/NovedadesServicio/utils/BatchOperationsHelper",
	"Transener/Operaciones/NovedadesServicio/services/PruebasService",
	"Transener/Operaciones/NovedadesServicio/utils/OperationErrorsHelper",
	"Transener/Operaciones/NovedadesServicio/utils/ProgressDialogHelper",
	"Transener/Operaciones/NovedadesServicio/services/RefreshService"
], function (FioriHelper, FioriComponentHelper, FormatHelper, i18nTranslationHelper, MessageBoxHelper, oDataService, BusyDialogHelper,
	AppManagementHelper, BatchOperationsHelper, PruebasService, OperationErrorsHelper, ProgressDialogHelper, RefreshService) {
	"use strict";

	return {

		IndividualPOSTEdition: function (oSignal) {
			oSignal.Id = AppManagementHelper.getModel("UtilsJsonModel").getProperty("/IdNovedad");
			oSignal.Empresa = AppManagementHelper.getModel("UtilsJsonModel").getProperty("/Empresa");
			this.POSTPromiseSignal(oSignal).then($.proxy(this.successIndividualPOST, this)).catch($.proxy(this.errorIndividualPOST, this));
		},

		POSTPromiseSignal: function (oSignal) {
			var that = this;
			return new Promise((resolve, reject) => {
				let entity = "/SenializacionesSet"
				oDataService.getModel("TransenerOperaciones").create(entity, oSignal, {
					success: function (data) {
						that.cleanForm();
						resolve(oSignal.Id);
					},
					error: function (error) {
						reject(error)
					}
				});
			});
		},

		successIndividualPOST: function (sId) {
			MessageBoxHelper.showAlert("Alerta", "Se ha agregado la señalizacion de manera exitosa", $.proxy(RefreshService.refreshNovedad,
				RefreshService, sId))
		},

		errorIndividualPOST: function () {
			MessageBoxHelper.showAlert("Alerta", "Se ha producido un error al agregar la señalizacion")
		},

		cleanSignalsForm: function () {
			var sPath = FioriHelper.getAppPath();
			AppManagementHelper.getModel("SignalsFormJsonModel").loadData(sPath + "model/SignalsFormJsonModel.json", "", false);
			AppManagementHelper.getModel("PerturbationJsonModel").loadData(sPath + "model/PerturbationJsonModel.json", "", false);
			AppManagementHelper.getModel("SignalsListJsonModel").loadData(sPath + "model/SignalsListJsonModel.json", "", false);
		},
		
		cleanForm: function() {
			var sPath = FioriHelper.getAppPath();
			AppManagementHelper.getModel("SignalsFormJsonModel").loadData(sPath + "model/SignalsFormJsonModel.json", "", false);
			AppManagementHelper.getModel("PerturbationJsonModel").loadData(sPath + "model/PerturbationJsonModel.json", "", false);
		},
		
		remove: function(signal) {
			var that = this;
			return new Promise(function(resolve, reject) {
				let entity = "/SenializacionesSet(Empresa='" + signal.Empresa +
				"',Posicion='" + signal.Posicion + "',Id='" + signal.Id + "')";
				oDataService.getModel("TransenerOperaciones").remove(entity, {
					success: function (data) {
						resolve(signal.Id);
					},
					error: function (error) {
						reject(error);
					}
				});
			});
		},

		buildBatchArray: function (aSignals) {
			var aOperation = [];
			for (var i = 0; i < aSignals.length; i++) {
				aSignals[i].Posicion = aSignals[i].Posicion.toString();
				aSignals[i].Id = AppManagementHelper.getModel("SelectedNovedadJsonModel").getProperty("/novedadId");
				aSignals[i].Empresa = AppManagementHelper.getModel("UtilsJsonModel").getProperty("/Empresa");
				var oObject = {
					entity: "/SenializacionesSet",
					data: aSignals[i]
				};
				aOperation.push(oObject);
			}
			return aOperation;
		},

		POST: function () {
			var aSignals = $.extend([], AppManagementHelper.getModel("SignalsListJsonModel").getData().Signals);
			if (aSignals.length > 0) {
				var aOperation = this.buildBatchArray(aSignals);
				var oOptions = {
					service: "TransenerOperaciones",
					operations: aOperation,
					callback: $.proxy(this.successBatchSignals, this)
				};
				BatchOperationsHelper.setOptions("POST", oOptions);
				BatchOperationsHelper.POST();
			} else {
				this.cleanSignalsForm();
				PruebasService.POST();
			}
		},

		successBatchSignals: function (data) {
			if (data.data === "batchNotOk") {
				ProgressDialogHelper.setPercentValues(60, "60%");
				OperationErrorsHelper.addMessage("Se ha producido un error al agregar las señales",
					"Señales: ");
			} else {
				this.cleanSignalsForm();
				OperationErrorsHelper.addMessage("Se han creado las señales de manera exitosa",
					"Señales: ");
			}
			PruebasService.POST();
		},

		errorPOST: function (error) {
			BusyDialogHelper.close();
			var sError = FormatHelper.parseJsonError(error);
			MessageBoxHelper.showAlert("Alert", sError);
		}

	};
});