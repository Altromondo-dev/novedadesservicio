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
	"Transener/Operaciones/NovedadesServicio/utils/ProgressDialogHelper"
], function (FioriHelper, FioriComponentHelper, FormatHelper, i18nTranslationHelper, MessageBoxHelper, oDataService, BusyDialogHelper,
	AppManagementHelper, BatchOperationsHelper, OperationErrorsHelper, ProgressDialogHelper) {
	"use strict";

	return {

		cleanParametrosSistemaForm: function () {
			var sPath = FioriHelper.getAppPath();
			AppManagementHelper.getModel("ENSListJsonModel").loadData(sPath + "model/ENSListJsonModel.json", "", false);
		},

		buildBatchArray: function (aENSParameters) {
			var aOperation = [];
			for (var i = 0; i < aENSParameters.length; i++) {
				aENSParameters[i].IdNovedad = AppManagementHelper.getModel("SelectedNovedadJsonModel").getProperty("/novedadId");
				aENSParameters[i].Empresa = AppManagementHelper.getModel("UtilsJsonModel").getProperty("/Empresa");
				var oObject = {
					entity: "/ENSRegisterSet",
					data: aENSParameters[i]
				};
				delete aENSParameters[i].ENSRow
					//TODO demian arreglar
				aOperation.push(oObject);
			}
			return aOperation;
		},

		POST: function () {
			var aENSParameters = $.extend([], AppManagementHelper.getModel("ENSListJsonModel").getData().ENSRegisters);
			if (aENSParameters.length > 0) {
				var aOperation = this.buildBatchArray(aENSParameters);
				var oOptions = {
					service: "TransenerOperaciones",
					operations: aOperation,
					callback: $.proxy(this.successBatchParametros, this)
				};
				BatchOperationsHelper.setOptions("POST", oOptions);
				BatchOperationsHelper.POST();
			} else {
				this.cleanParametrosSistemaForm();
				ProgressDialogHelper.setPercentValues(100, "100%");
				ProgressDialogHelper.closeDialog();
				var oContent = OperationErrorsHelper.generateMessageContent();
				MessageBoxHelper.showCustomDialog("Alerta", oContent);
				AppManagementHelper.getModel("UtilsJsonModel").setProperty("/SelectedKeyTab", "1");
			}
		},

		successBatchParametros: function (data) {
			if (data.data === "batchNotOk") {
				ProgressDialogHelper.setPercentValues(100, "100%");
				OperationErrorsHelper.addMessage("Se ha producido un error al crear los parametros del sistema", "Parametros del sistema: ");
			} else {
				this.cleanParametrosSistemaForm();
				ProgressDialogHelper.setPercentValues(100, "100%");
				OperationErrorsHelper.addMessage("Se han creado los parametros del sistema de manera exitosa", "Parametros del sistema: ");
			}
			ProgressDialogHelper.closeDialog();
			var oContent = OperationErrorsHelper.generateMessageContent();
			MessageBoxHelper.showCustomDialog("Alerta", oContent);
			AppManagementHelper.getModel("UtilsJsonModel").setProperty("/SelectedKeyTab", "1");
		},

		POSTParameterPromise: function (oParametroSistema) {
			var empresa = AppManagementHelper.getModel("UtilsJsonModel").getProperty("/Empresa");
			oParametroSistema.Empresa = empresa;
			return new Promise((resolve, reject) => {
				let oNovedad = AppManagementHelper.getModel("NovedadesFormJsonModel").getData();
				let entity = "/PropiedadesSistemaSet";
				oDataService.getModel("TransenerOperaciones").create(entity, oParametroSistema, {
					success: function (data) {
						resolve(data);
					},
					error: function (error) {
						reject(error)
					}
				});
			})
		},

		successPOSTParameter: function () {
			OperationErrorsHelper.addMessage("Se han creado los parametros de sistema de manera exitosa", "Parametros del sistema: ");
			ProgressDialogHelper.closeDialog();
			var oContent = OperationErrorsHelper.generateMessageContent();
			MessageBoxHelper.showCustomDialog("Alerta", oContent);
		},

		errorPOSTParameter: function () {
			OperationErrorsHelper.addMessage("Se ha producido un error al crear parametros del sistema", "Parametros del sistema: ");
			ProgressDialogHelper.closeDialog();
			var oContent = OperationErrorsHelper.generateMessageContent();
			MessageBoxHelper.showCustomDialog("Alerta", oContent);
		},

		PUTPromise: function () {
			return new Promise((resolve, reject) => {
				let ensList = AppManagementHelper.getModel("ENSListJsonModel").getData().ENSRegisters;
				let promises = [];
				let empresa = AppManagementHelper.getModel("UtilsJsonModel").getProperty("/Empresa");
				if (!ensList.length) {
					resolve({
						resolved: true,
						data: null
					});
				}
				ensList.forEach((ens) => {
					ens.Empresa = empresa;
					if (ens.Modif) {
						promises.push(this.updatePromise(ens));
					} else {
						promises.push(this.createPromise(ens));
					}
				});
				Promise.all(promises.map(this.reflect)).then(function (results) {
					console.log(results);
					var isCorrect = true;
					results.forEach(function (res) {
						if (!res.resolved) isCorrect = false;
					});
					if (isCorrect) {
						resolve(results);
					} else {
						reject(results);
					}
				});
			});
		},

		createPromise: function (toCreate) {
			let newEns = $.extend({}, toCreate);
			delete newEns.ENSRow;
			return new Promise((resolve, reject) => {
				oDataService.getModel("TransenerOperaciones").create("/ENSRegisterSet", newEns, {
					success: function (data) {
						resolve(data);
					},
					error: function (error) {
						reject(error);
					}
				});
			});
		},
		updatePromise: function (toUpdate) {
			let updateEns = $.extend({}, toUpdate);
			delete updateEns.ENSRow;
			return new Promise((resolve, reject) => {
				let stringEntity = "/ENSRegisterSet(IdNovedad='" + updateEns.IdNovedad +
					"',Modif='" + toUpdate.Modif + "',Empresa='" + toUpdate.Empresa + "')";
				oDataService.getModel("TransenerOperaciones").update(stringEntity, updateEns, {
					success: function (data) {
						resolve(data);
					},
					error: function (error) {
						reject(error);
					}
				});
			});
		},

		delete: function (ens) {
			return new Promise((resolve, reject) => {
				let entity = "/ENSRegisterSet(IdNovedad='" + ens.IdNovedad +
					"',Modif='" + ens.Modif + "',Empresa='" + ens.Empresa + "')";
				oDataService.getModel("TransenerOperaciones").remove(entity, {
					success: resolve,
					error: reject
				});
			});
		},

		reflect: function (promise) {
			return promise.then(data => ({
				resolved: true,
				data: data
			}), err => ({
				resolved: false,
				err: err
			}));
		}

	};
});