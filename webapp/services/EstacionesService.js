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
		//_entitySet: "/EstacionesSet",
		_entitySet: "/NSUbicacionesSet",

		loadEstaciones: function (empresa) {
			var aFilter = [new sap.ui.model.Filter("Empresa", sap.ui.model.FilterOperator.EQ, empresa)];
			this.getEstacionesPromise(aFilter).then($.proxy(this.successGetEstaciones, this))
				.catch($.proxy(this.errorGetEstaciones, this));
		},

		getEstacionesPromise: function (aFilter) {
			var that = this;
			return new Promise((resolve, reject) => {
				let entity = that._entitySet;
				oDataService.getModel("TransenerOperaciones").read(entity, {
					filters: aFilter,
					success: function (data) {
						resolve(data);
					},
					error: function (error) {
						reject(error);
					}
				});
			});
		},

		successGetEstaciones: function (data) {
			var aData = FormatHelper.removeResults(data);
			AppManagementHelper.getModel("EstacionesJsonModel").setData({
				Estaciones: aData
			});

		},

		errorGetEstaciones: function (error) {
			console.log("Error al cargar Estaciones");
		}

	};
});