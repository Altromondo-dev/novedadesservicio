sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"Transener/Operaciones/NovedadesServicio/utils/AppManagementHelper",
	"Transener/Operaciones/NovedadesServicio/model/models",
	"Transener/Operaciones/NovedadesServicio/services/oDataService",
	"Transener/Operaciones/NovedadesServicio/utils/FioriHelper"
], function (Controller, AppManagementHelper, models, oDataService, FioriHelper) {
	"use strict";

	return Controller.extend("Transener/Operaciones/NovedadesServicio/", {
		setApp: function (oApp) {
			AppManagementHelper.setApp(oApp);
			this.setApplicationModels();
		},
		//cone
		setApplicationModels: function () {
			oDataService.getModel("TransenerOperaciones");

			var sPath = FioriHelper.getAppPath(); 
			AppManagementHelper.getModel("ProgressBarJsonModel").setData({
				PercentValue: "",
				DisplayValue: ""
			});

			AppManagementHelper.getModel("DateFilterSelectionJsonModel").setData({
				"InicioNove": null,
				"FechaFinNove": null
			});
			var now = new Date();
			AppManagementHelper.getModel("PerturbationJsonModel").loadData(sPath + "model/PerturbationJsonModel.json", "", false);
			AppManagementHelper.getModel("NovedadesFormJsonModel").loadData(sPath + "model/NovedadesFormJsonModel.json", "", false);
			AppManagementHelper.getModel("ConsecuentesFormJsonModel").loadData(sPath + "model/ConsecuentesFormJsonModel.json", "", false);
			AppManagementHelper.getModel("NovedadesFormJsonModel").setProperty("/Anio", now.getFullYear().toString());
			AppManagementHelper.getModel("LTFormJsonModel").loadData(sPath + "model/LTFormJsonModel.json", "", false);
			AppManagementHelper.getModel("LicencesListJsonModel").loadData(sPath + "model/LicencesListJsonModel.json", "", false);
			AppManagementHelper.getModel("ConsequentListJsonModel").loadData(sPath + "model/ConsequentListJsonModel.json", "", false);
			AppManagementHelper.getModel("CammesaFormJsonModel").loadData(sPath + "model/CammesaFormJsonModel.json", "", false);
			AppManagementHelper.getModel("CommentsFormJsonModel").loadData(sPath + "model/CommentsFormJsonModel.json", "", false);
			AppManagementHelper.getModel("SignalsFormJsonModel").loadData(sPath + "model/SignalsFormJsonModel.json", "", false);
			AppManagementHelper.getModel("SignalsListJsonModel").loadData(sPath + "model/SignalsListJsonModel.json", "", false);
			AppManagementHelper.getModel("PruebasFormJsonModel").loadData(sPath + "model/PruebasFormJsonModel.json", "", false);
			AppManagementHelper.getModel("PruebasListJsonModel").loadData(sPath + "model/PruebasListJsonModel.json", "", false);
			AppManagementHelper.getModel("SelectedNovedadJsonModel").loadData(sPath + "model/SelectedNovedadJsonModel.json", "", false);
			AppManagementHelper.getModel("UtilsJsonModel").loadData(sPath + "model/UtilsJsonModel.json", "", false);
			AppManagementHelper.getModel("ParametrosSistemaJsonModel").loadData(sPath + "model/ParametrosSistemaJsonModel.json", "", false);
			AppManagementHelper.getModel("ENSListJsonModel").loadData(sPath + "model/ENSListJsonModel.json", "", false);

		}
	});

});