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
	"Transener/Operaciones/NovedadesServicio/services/SignalsService",
	"Transener/Operaciones/NovedadesServicio/utils/OperationErrorsHelper",
	"Transener/Operaciones/NovedadesServicio/utils/ProgressDialogHelper",
	"Transener/Operaciones/NovedadesServicio/services/RefreshService"
], function (FioriHelper, FioriComponentHelper, FormatHelper, i18nTranslationHelper, MessageBoxHelper, oDataService, BusyDialogHelper,
	AppManagementHelper, BatchOperationsHelper, SignalsService, OperationErrorsHelper, ProgressDialogHelper, RefreshService) {
	"use strict";

	return {

		cleanComentariosForm: function () {
			var sPath = FioriHelper.getAppPath();
			AppManagementHelper.getModel("CommentsFormJsonModel").loadData(sPath + "model/CommentsFormJsonModel.json", "", false);
		},

		POST: function () {
			var oComentario = AppManagementHelper.getModel("CommentsFormJsonModel").getData();
			if (oComentario.Comentario !== "") {
				oComentario.IdNovedad = AppManagementHelper.getModel("SelectedNovedadJsonModel").getProperty("/novedadId");
				oComentario.Empresa = AppManagementHelper.getModel("UtilsJsonModel").getProperty("/Empresa");
				var entity = "/ComentariosSet";
				oDataService.getModel("TransenerOperaciones").create(entity, oComentario, {
					success: $.proxy(this.successPOST, this),
					error: $.proxy(this.errorPOST, this)
				});
			} else {
				this.cleanComentariosForm();
				SignalsService.POST();
			}
		},

		successPOST: function (data) {
			this.cleanComentariosForm();
			ProgressDialogHelper.setPercentValues(60, "60%");
			OperationErrorsHelper.addMessage("Se ha creado el comentario de manera exitosa", "Comentarios: ");
			SignalsService.POST();
		},

		errorPOST: function (error) {
			OperationErrorsHelper.addMessage("Se ha producido un error al crear el comentario", "Comentarios: ");
			SignalsService.POST();
		},
		
		POSTPromiseComentario: function (comentarios) {
			return new Promise((resolve, reject) => {
				var entity = "/ComentariosSet";
				oDataService.getModel("TransenerOperaciones").create(entity, comentarios, {
					success: resolve,
					error: reject
				});
			});
		},

		PUTCommentsPromise: function () {
			return new Promise((resolve, reject) => {
				let oComentario = $.extend({}, AppManagementHelper.getModel("CommentsFormJsonModel").getData());
				oComentario.IdNovedad = AppManagementHelper.getModel("UtilsJsonModel").getProperty("/IdNovedad");
				oComentario.Empresa = AppManagementHelper.getModel("UtilsJsonModel").getProperty("/Empresa");
				let entity = "/ComentariosSet";
				oDataService.getModel("TransenerOperaciones").create(entity, oComentario, {
					success: function (data) {
						resolve(oComentario.IdNovedad);
					},
					error: function (error) {
						reject(error)
					}
				});
			})
		},

		PUT: function () {
			this.PUTCommentsPromise().then($.proxy(this.successPUT, this)).catch($.proxy(this.errorPUT, this))
		},

		successPUT: function (sId) {
			MessageBoxHelper.showAlert("Alerta", "Se ha modificado el comentario de manera exitosa", $.proxy(RefreshService.refreshNovedad,
				RefreshService, sId));
		},

		errorPUT: function (error) {
			console.log(error);
		}
	};
});