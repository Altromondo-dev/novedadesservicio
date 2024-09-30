sap.ui.define([], function () {
	"use strict";
	return {
		// globales
		_oApp: null,
		isPhone: null,
		_expandProperties: "ConsecuentesSet,InformeCammesaSet,ComentariosSet,ENSRegXNS_NAV,SenialXNS_nav,PruebasXNS_nav",

		setApp: function (oApp) {
			this._oApp = oApp;
		},

		getModel: function (sModelName) {
			var jsonModel = this.getApp().getModel(sModelName);
			if (!jsonModel) {
				jsonModel = new sap.ui.model.json.JSONModel();
				jsonModel.setSizeLimit(999999);
				this.getApp().setModel(jsonModel, sModelName);
			}
			return jsonModel;
		},

		getApp: function () {
			return this._oApp;
		},

		deleteNavigationProperties: function (oObject) {
			delete oObject.ConsecuentesSet;
			delete oObject.InformeCammesaSet;
			delete oObject.ComentariosSet;
			delete oObject.ENSRegXNS_NAV;
			delete oObject.SenialXNS_nav;
			delete oObject.PruebasXNS_nav;
		},

	};
});