sap.ui.define([
	//utils
	"Transener/Operaciones/NovedadesServicio/utils/FioriComponentHelper"
], function(FioriComponentHelper) {
	"use strict";

	return {

		getModel: function() {
			//gets component
	    	var component = FioriComponentHelper.getComponent();
			//gets model
			var jsonModel = component.byId("App").getModel("NovedadServicio");
			//checks if model exists
			if (!jsonModel) {
				jsonModel = new sap.ui.model.json.JSONModel();
				jsonModel.setSizeLimit(999999);
				//sets model
				component.byId("App").setModel(jsonModel, "NovedadServicio");
			}
			return jsonModel;
		},

		initializeModel: function() {
			var filterData = {};
			var model = this.getModel();
			model.setData(filterData);
		}

	};
});