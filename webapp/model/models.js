sap.ui.define([
	"sap/ui/model/json/JSONModel",
	"sap/ui/Device",
	"Transener/Operaciones/NovedadesServicio/utils/AppManagementHelper",
	"Transener/Operaciones/NovedadesServicio/utils/FioriHelper"
], function (JSONModel, Device, AppManagementHelper, FioriHelper) {
	"use strict";

	return {
		createDeviceModel: function () {
			var oModel = new JSONModel(Device);
			oModel.setDefaultBindingMode("OneWay");
			return oModel;
		}
	};
});