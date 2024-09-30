sap.ui.define([
	//helpers
	"Transener/Operaciones/NovedadesServicio/utils/FioriHelper",
	"Transener/Operaciones/NovedadesServicio/utils/FioriComponentHelper",
	"Transener/Operaciones/NovedadesServicio/utils/FormatHelper",
	"Transener/Operaciones/NovedadesServicio/services/oDataService",
	"Transener/Operaciones/NovedadesServicio/utils/BusyDialogHelper",
	"Transener/Operaciones/NovedadesServicio/utils/AppManagementHelper",
	"Transener/Operaciones/NovedadesServicio/utils/BatchOperationsHelper",
	"Transener/Operaciones/NovedadesServicio/utils/OperationErrorsHelper",
	"Transener/Operaciones/NovedadesServicio/utils/ProgressDialogHelper",
	"Transener/Operaciones/NovedadesServicio/services/RefreshService"
], function (FioriHelper, FioriComponentHelper, FormatHelper, oDataService, BusyDialogHelper,
	AppManagementHelper, BatchOperationsHelper, CammesaService, ComentariosService, OperationErrorsHelper, ProgressDialogHelper,
	RefreshService) {
	"use strict";

	return {
		saveLicence: function (data, onSuccessCallback, onErrorCallback) {
			var odataModel = oDataService.getModel("TransenerOperaciones");
			var IdNovedad = AppManagementHelper.getModel("SelectedNovedadJsonModel").getProperty("/novedadId") || AppManagementHelper.getModel("UtilsJsonModel").getProperty("/IdNovedad");
			data.IdNovedad = IdNovedad;
			odataModel.create("/NSLicenciasRelSet", data, {		
				success: onSuccessCallback,
				error: onErrorCallback
			});
		},

		saveMultipleLicences: function (arrLT) {
			var promises = [];
			for (var i = 0; i < arrLT.length; i++) {
				promises.push(this.saveLicence(arrLT[i]));
			}
			//TODO agregar reflection para hacerlas todas aunque una falle
			return Promise.all(promises).then(()=> {
				AppManagementHelper.getModel("LicencesListJsonModel").getData().Licences = [];
				var now = new Date();
				AppManagementHelper.getModel("NovedadesFormJsonModel").setProperty("/Anio", now.getFullYear().toString());
				AppManagementHelper.getModel("LTFormJsonModel").setProperty("/IdLicencia","");
				AppManagementHelper.getModel("LicencesListJsonModel").updateBindings(true);
				AppManagementHelper.getModel("NovedadesFormJsonModel").updateBindings(true);
			});
		},

		loadList: function (empresa, idNovedad) {
			let entity = "/NSLicenciasRelSet";
			oDataService.getModel("TransenerOperaciones").read(entity, {
				filters: [
					new sap.ui.model.Filter({
						path: "Empresa",
						operator: sap.ui.model.FilterOperator.EQ,
						value1: empresa
					}),
					new sap.ui.model.Filter({
						path: "IdNovedad",
						operator: sap.ui.model.FilterOperator.EQ,
						value1: idNovedad
					})
				],
				success: function (res) {
					AppManagementHelper.getModel("LicencesListJsonModel").setData({
						Licences: res.results
					})
				},
				error: function () {
					//TODO
				}
			});
		},
		
		onDeleteLicence : function(licencia ,onSuccessCallback,onErrorCallback){
			var odataModel = oDataService.getModel("TransenerOperaciones");
			var url = this.getPathURL(licencia);
			odataModel.remove(url, {		
				success: onSuccessCallback,
				error: onErrorCallback
			});
		},
		getPathURL : function(licencia){
			return "/NSLicenciasRelSet(Empresa='"+licencia.Empresa+"',IdNovedad='"+licencia.IdNovedad+"',IdLicencia='"+licencia.IdLicencia+"',Anio='"+licencia.Anio+"')";
		}
	};
});