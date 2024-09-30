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
	"Transener/Operaciones/NovedadesServicio/services/ComentariosService",
	"Transener/Operaciones/NovedadesServicio/utils/ProgressDialogHelper",
	"Transener/Operaciones/NovedadesServicio/services/RefreshService"
], function (FioriHelper, FioriComponentHelper, FormatHelper, i18nTranslationHelper, MessageBoxHelper, oDataService, BusyDialogHelper,
	AppManagementHelper, BatchOperationsHelper, OperationErrorsHelper, ComentariosService, ProgressDialogHelper, RefreshService) {
	"use strict";

	return {

		cleanCammesaForm: function () {
			var sPath = FioriHelper.getAppPath();
			AppManagementHelper.getModel("CammesaFormJsonModel").loadData(sPath + "model/CammesaFormJsonModel.json", "", false);
		},

		CammesaPOST: function (oInformeCammesa) {
			return new Promise((resolve, reject) => {
				oInformeCammesa.Id = AppManagementHelper.getModel("SelectedNovedadJsonModel").getProperty("/novedadId");
				oInformeCammesa.Empresa = AppManagementHelper.getModel("UtilsJsonModel").getProperty("/Empresa");
				var entity = "/InformeCammesaSet";
				oDataService.getModel("TransenerOperaciones").create(entity, oInformeCammesa, {
					success: $.proxy(this.successPOST, this),
					error: $.proxy(this.errorPOST, this)
				});
			});
		},

		POSTPromiseCammesa: function (oInformeCammesa) {
			oInformeCammesa.Autoriza = oInformeCammesa.Autoriza ? "S" : "N";
			oInformeCammesa.InformaCammesa = oInformeCammesa.InformaCammesa ? "S" : "N";
			return new Promise((resolve, reject) => {
				var entity = "/InformeCammesaSet";
				oDataService.getModel("TransenerOperaciones").create(entity, oInformeCammesa, {
					success: resolve,
					error: reject
				});
			});
		},

		POST: function () {
			var oInformeCammesa = AppManagementHelper.getModel("CammesaFormJsonModel").getData();
			oInformeCammesa.Autoriza = oInformeCammesa.Autoriza ? "S" : "N";
			oInformeCammesa.InformaCammesa = oInformeCammesa.InformaCammesa ? "S" : "N";

			this.CammesaPOST(oInformeCammesa).then($.proxy(this.successPOST, this)).catch($.proxy(this.errorPOST, this));
		},

		successPOST: function (data) {
			this.cleanCammesaForm();
			ProgressDialogHelper.setPercentValues(100, "100%");
			OperationErrorsHelper.addMessage("Se ha creado el informe cammesa de manera correcta", "Informe Cammesa: ");
			ComentariosService.POST();
		},

		errorPOST: function (error) {
			OperationErrorsHelper.addMessage("Se ha producido un error al agregar informe cammesa", "Informe Cammesa: ");
			ComentariosService.POST();
		},

		PUTCammesaPromise: function () {
			return new Promise((resolve, reject) => {
				let oCammesa = $.extend({}, AppManagementHelper.getModel("CammesaFormJsonModel").getData());
				oCammesa.Autoriza = oCammesa.Autoriza ? "S" : "N";
				oCammesa.InformaCammesa = oCammesa.InformaCammesa ? "S" : "N";
				oCammesa.Empresa = AppManagementHelper.getModel("UtilsJsonModel").getProperty("/Empresa");
				oCammesa.Id = AppManagementHelper.getModel("UtilsJsonModel").getProperty("/IdNovedad");
				var sId = oCammesa.Id;
				// delete oCammesa.Id;
				delete oCammesa.NovedadesServicio;
				AppManagementHelper.deleteNavigationProperties(oCammesa);
				// let entity = "/InformeCammesaSet('" + sId + "')";
				let entity = "/InformeCammesaSet";
				oDataService.getModel("TransenerOperaciones").create(entity, oCammesa, {
					success: function (data) {
						resolve(sId);
					},
					error: function (error) {
						reject(error);
					}
				});
			});
		},

		PUT: function () {
			this.PUTCammesaPromise().then($.proxy(this.successPUT, this)).catch($.proxy(this.errorPUT, this))
		},

		successPUT: function (sId) {
			MessageBoxHelper.showAlert("Alerta", "Se ha editado el informe cammesa de manera exitosa", $.proxy(RefreshService.refreshNovedad,
				RefreshService, sId));
		},

		errorPUT: function (error) {
			MessageBoxHelper.showAlert("Alerta", "Se ha producido un error al editar el informe cammesa");
		}

	};
});