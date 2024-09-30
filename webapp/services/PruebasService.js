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
	"Transener/Operaciones/NovedadesServicio/utils/OperationErrorsHelper",
	"Transener/Operaciones/NovedadesServicio/utils/ProgressDialogHelper",
	"Transener/Operaciones/NovedadesServicio/services/ParametrosSistemaService",
	"Transener/Operaciones/NovedadesServicio/services/RefreshService"

], function (FioriHelper, FioriComponentHelper, FormatHelper, i18nTranslationHelper, MessageBoxHelper, oDataService, BusyDialogHelper,
	AppManagementHelper, BatchOperationsHelper, OperationErrorsHelper, ProgressDialogHelper, ParametrosSistemaService, RefreshService) {
	"use strict";

	return {

		IndividualPOSTEdition: function (oPrueba) {
			oPrueba.IdNovedad = AppManagementHelper.getModel("UtilsJsonModel").getProperty("/IdNovedad");
			oPrueba.Empresa = AppManagementHelper.getModel("UtilsJsonModel").getProperty("/Empresa");
			delete(oPrueba.__metadata);
			this.POSTPromisePrueba(oPrueba).then($.proxy(this.successIndividualPOST, this)).catch($.proxy(this.errorIndividualPOST, this));
		},

		POSTPromisePrueba: function (oPrueba) {
			var that = this;
			return new Promise((resolve, reject) => {
				let entity = "/PruebasSet"
				oDataService.getModel("TransenerOperaciones").create(entity, oPrueba, {
					success: function (data) {
						that.cleanForm();
						resolve(oPrueba.IdNovedad);
					},
					error: function (error) {
						reject(error)
					}
				});
			});
		},

		successIndividualPOST: function (sId) {
			MessageBoxHelper.showAlert("Alerta", "Se ha agregado la prueba de manera exitosa", $.proxy(RefreshService.refreshPruebas,
				RefreshService, sId));
		},

		errorIndividualPOST: function () {
			MessageBoxHelper.showAlert("Alerta", "Se ha producido un error al agregar la prueba");
		},

		cleanPruebas: function () {
			var sPath = FioriHelper.getAppPath();
			AppManagementHelper.getModel("PruebasFormJsonModel").loadData(sPath + "model/PruebasFormJsonModel.json", "", false);
			AppManagementHelper.getModel("PruebasListJsonModel").loadData(sPath + "model/PruebasListJsonModel.json", "", false);
		},
		
		cleanForm: function() {
			var sPath = FioriHelper.getAppPath();
			AppManagementHelper.getModel("PruebasFormJsonModel").loadData(sPath + "model/PruebasFormJsonModel.json", "", false);
		},
		
		remove: function(prueba) {
			var that = this;
			return new Promise(function(resolve, reject) {
				let entity = "/PruebasSet(Empresa='" + prueba.Empresa +
				"',Posicion='" + prueba.Posicion + "',IdNovedad='" + prueba.IdNovedad + "')";
				oDataService.getModel("TransenerOperaciones").remove(entity, {
					success: function (data) {
						resolve(prueba.IdNovedad);
					},
					error: function (error) {
						reject(error);
					}
				});
			});
		},

		buildBatchArray: function (aPruebas) {
			var aOperation = [];
			for (var i = 0; i < aPruebas.length; i++) {
				aPruebas[i].IdNovedad = AppManagementHelper.getModel("SelectedNovedadJsonModel").getProperty("/novedadId");
				aPruebas[i].Empresa = AppManagementHelper.getModel("UtilsJsonModel").getProperty("/Empresa");
				aPruebas[i].Posicion = aPruebas[i].Posicion.toString();
				var oObject = {
					entity: "/PruebasSet",
					data: aPruebas[i]
				};
				aOperation.push(oObject);
			}
			return aOperation;
		},

		POST: function () {
			var aPruebas = $.extend([], AppManagementHelper.getModel("PruebasListJsonModel").getData().Pruebas);
			if (aPruebas.length > 0) {
				// FormatHelper.formatPruebaTimes(aPruebas);
				var aOperation = this.buildBatchArray(aPruebas);
				var oOptions = {
					service: "TransenerOperaciones",
					operations: aOperation,
					callback: $.proxy(this.successBatchPruebas, this)
				};
				BatchOperationsHelper.setOptions("POST", oOptions);
				BatchOperationsHelper.POST();
			} else {
				this.cleanPruebas();
				ProgressDialogHelper.setPercentValues(90, "90%");
				ParametrosSistemaService.POST();
				// ProgressDialogHelper.closeDialog();
				// var oContent = OperationErrorsHelper.generateMessageContent();
				// MessageBoxHelper.showCustomDialog("Alerta", oContent);
			}
		},

		successBatchPruebas: function (data) {
			if (data.data === "batchNotOk") {
				ProgressDialogHelper.setPercentValues(100, "100%");
				OperationErrorsHelper.addMessage("Se ha producido un error al agregar las pruebas",
					"Pruebas: ");
			} else {
				this.cleanPruebas();
				OperationErrorsHelper.addMessage("Se han creado las pruebas de manera exitosa",
					"Pruebas: ");
			}
			ParametrosSistemaService.POST();

		},

		errorPOST: function (error) {
			var sError = FormatHelper.parseJsonError(error);
			MessageBoxHelper.showAlert("Alert", sError);
		}

	};
});