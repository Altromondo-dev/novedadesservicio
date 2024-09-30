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
		_entitySet: "/TipoEquipoSet",

		loadTipoEquipo: function (empresa, model) {
			var aFilter = [new sap.ui.model.Filter("Empresa", sap.ui.model.FilterOperator.EQ, empresa)];
			this.getTiposPromise(aFilter, model).then($.proxy(this.successGetTipos, this)).catch($.proxy(this.errorGetTipos, this));
		},

		getTiposPromise: function (aFilter, model) {
			var that = this;
			return new Promise((resolve, reject) => {
				let entity = that._entitySet;
				oDataService.getModel("TransenerOperaciones").read(entity, {
					filters: aFilter,
					success: function (data) {
						data.model = model;
						resolve(data);
					},
					error: function (error) {
						reject(error);
					}
				});
			});
		},

		successGetTipos: function (data) {
			var aData = FormatHelper.removeResults(data);
			var model = data.model;
			if (model) {
				model.setData({
					TipoEquipo: aData
				});
			} else {
				AppManagementHelper.getModel("TipoEquipoJsonModel").setData({
					TipoEquipo: aData
				});
			}

		},

		errorGetTipos: function (error) {
			//console.log("Error al cargar Equipos");
		}

	};
});