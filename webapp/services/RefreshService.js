sap.ui.define([
	//helpers
	"Transener/Operaciones/NovedadesServicio/services/oDataService",
	"Transener/Operaciones/NovedadesServicio/utils/AppManagementHelper",
	"Transener/Operaciones/NovedadesServicio/utils/NovedadDialogHelper",
	"Transener/Operaciones/NovedadesServicio/utils/FormatHelper",
	"Transener/Operaciones/NovedadesServicio/services/MotivosService",
	"Transener/Operaciones/NovedadesServicio/services/EquiposService",
	"Transener/Operaciones/NovedadesServicio/services/CausasService"
], function (oDataService, AppManagementHelper, NovedadDialogHelper, FormatHelper, MotivosService, EquiposService, CausasService) {
	"use strict";

	return {
		_expandProperties: "ConsecuentesSet,InformeCammesaSet,ComentariosSet,ENSRegXNS_NAV,SenialXNS_nav,PruebasXNS_nav",

		refreshPruebas: function (id) {
			var that = this;
			this.refreshNovedadPromise(id).then(function (res) {
				var oData = FormatHelper.removeResults(res);
				//NovedadDialogHelper.setNavigationPropertiesData(oData);
				AppManagementHelper.getModel("PruebasListJsonModel").setData({
					Pruebas: oData.PruebasXNS_nav
				});
			}).catch(this.errorRefresh, this);
		},

		refreshNovedad: function (sId) {
			this.refreshNovedadPromise(sId).then($.proxy(this.successRefresh, this)).catch(this.errorRefresh, this);
		},

		refreshNovedadPromise: function (sId) {
			var empresa = AppManagementHelper.getModel("UtilsJsonModel").getProperty("/Empresa");
			return new Promise((resolve, reject) => {
				let entity = "/NovedadesServicioSet(IdNovedad='" + sId + "',Empresa='" + empresa + "')";
				oDataService.getModel("TransenerOperaciones").read(entity, {
					urlParameters: {
						"$expand": this._expandProperties
					},
					success: function (data) {
						resolve(data);
					},
					error: function (error) {
						reject(error);
					}

				});
			});
		},

		successRefresh: function (data) {
			var oData = FormatHelper.removeResults(data);
			var oUtilsJsonModel = AppManagementHelper.getModel("UtilsJsonModel");
			var oSelectedNovedad = oData;
			oUtilsJsonModel.setProperty("/IdNovedad", oSelectedNovedad.IdNovedad);
			NovedadDialogHelper.setNavigationPropertiesData(oSelectedNovedad);
			MotivosService.loadModel(oSelectedNovedad.CodNovedad, oSelectedNovedad.Empresa);
			CausasService.loadModel(oSelectedNovedad.CodNovedad, oSelectedNovedad.CodMotivo, oSelectedNovedad.Empresa);
			EquiposService.loadEquipos(oSelectedNovedad.CodTipo, oSelectedNovedad.Estacion, oSelectedNovedad.Empresa);
			oUtilsJsonModel.setProperty("/editable", false);
			oUtilsJsonModel.setProperty("/editableMode", true);
			oUtilsJsonModel.setProperty("/editableDate", true);
			oUtilsJsonModel.setProperty("/Referencia", oSelectedNovedad.IdNovedad);
			NovedadDialogHelper.checkRadioEnabled();
		},

		errorRefresh: function (error) {
			console.log(error);
		},

	};
});