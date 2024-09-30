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
		_entitySet: "/FixedValuesSet",
		_filters: [
			new sap.ui.model.Filter({
				path: "Tabname",
				operator: sap.ui.model.FilterOperator.EQ,
				value1: "ZTAP_OP_NS_GRAL"
			}),
			new sap.ui.model.Filter({
				path: "Fieldname",
				operator: sap.ui.model.FilterOperator.EQ,
				value1: "COD_WEATHER"
			})
		],
		loadModel: function () {
			oDataService.getModel("TransenerOperaciones").read(this._entitySet, {
				filters: this._filters,
				success: function (data) {
					var model = AppManagementHelper.getModel("EstadoTiempoJsonModel");
					model.setData(data.results);
				},
				error: function (error) {
					console.log(error);
				}
			});
		}

	};
});