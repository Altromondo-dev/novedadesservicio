sap.ui.define([
	//helpers
	"Transener/Operaciones/NovedadesServicio/utils/FioriHelper",
	"Transener/Operaciones/NovedadesServicio/utils/FioriComponentHelper",
	"Transener/Operaciones/NovedadesServicio/utils/FormatHelper",
	"Transener/Operaciones/NovedadesServicio/utils/i18nTranslationHelper",
	"Transener/Operaciones/NovedadesServicio/utils/MessageBoxHelper",
	"Transener/Operaciones/NovedadesServicio/services/oDataService",
	"Transener/Operaciones/NovedadesServicio/utils/AppManagementHelper"
], function (FioriHelper, FioriComponentHelper, FormatHelper, i18nTranslationHelper, MessageBoxHelper, oDataService, AppManagementHelper) {
	"use strict";

	return {
		getSubindice: function (CodNovedad, Tplnr, Equnr, EntIndis) {
			EntIndis.setSeconds(0,0);
			var formatEntIndis = sap.ui.model.odata.ODataUtils.formatValue(EntIndis, "Edm.DateTime")
			var entity = "/CalculoSubindiceSet(CodNovedad='" + CodNovedad + "',Tplnr='" + (Tplnr || "") + "',Equnr='" + Equnr + "',EntIndis=" + formatEntIndis +
				")";
			oDataService.getModel("TransenerOperaciones").read(entity, {
				success: function(data) {
					AppManagementHelper.getModel("NovedadesFormJsonModel").setProperty("/Subindice", parseInt(data.Subindice));
					if(parseInt(data.Subindice) > 0) {
						MessageBoxHelper.showAlert("", "Ya existe una novedad con estos datos");
					}
				},
				error: function(err) {
					//TODO
				}
			});
		},

	};
});