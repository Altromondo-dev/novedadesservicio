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
		_entitySet: "/NSEquiposSet",
		lineas: ["L1", "L2", "L3", "L4", "L5", "L6", "L9"],

		loadEquipos: function (tipo, estacion,codigo, empresa, model) {
			var aFilter = [new sap.ui.model.Filter("IEmpresa", sap.ui.model.FilterOperator.EQ, empresa),
			new sap.ui.model.Filter("IEqart", sap.ui.model.FilterOperator.EQ, tipo)];
			if (this.lineas.includes(tipo)) {
				estacion = null;
				codigo = null;
			}
			if(estacion) {
				aFilter.push(new sap.ui.model.Filter("Estacion", sap.ui.model.FilterOperator.EQ, estacion));
			}
			if(codigo) {
				aFilter.push(new sap.ui.model.Filter("Codigo", sap.ui.model.FilterOperator.EQ, codigo));
			}
			this.getEquiposPromise(aFilter, model).then($.proxy(this.successGetEquipos, this)).catch($.proxy(this.errorGetEquipos, this));
		},

		getEquiposPromise: function (aFilter, model) {
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

		successGetEquipos: function (data) {
			var aData = FormatHelper.removeResults(data);
			var model = data.model;
			if (model) {
				model.setData({
					Equipos: aData
				});
			} else {
				AppManagementHelper.getModel("EquiposJsonModel").setData({
					Equipos: aData
				});
			}

		},

		errorGetEquipos: function (error) {
			console.log("Error al cargar Equipos");
		}

	};
});