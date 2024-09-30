sap.ui.define([
	"sap/ui/Device",
	//utils
	"Transener/Operaciones/NovedadesServicio/utils/FioriComponentHelper"
], function(Device, FioriComponentHelper) {
	"use strict";
	
	return {
	
	    loadModel: function ()
	    {
	    	//gets component
	    	var component = FioriComponentHelper.getComponent();
			// set device model
			var jsonModel = new sap.ui.model.json.JSONModel(Device);
			jsonModel.setDefaultBindingMode("OneWay");
			component.byId("App").setModel(jsonModel, "Device");
	    }
	    
	};
});