sap.ui.define(["Transener/Operaciones/NovedadesServicio/utils/AppManagementHelper"], function (AppManagementHelper) {
	"use strict";
	return {
		oDialog: null,

		setPercentValues: function (iValue, sValue) {
			AppManagementHelper.getModel("ProgressBarJsonModel").setProperty("/PercentValue", iValue);
			AppManagementHelper.getModel("ProgressBarJsonModel").setProperty("/DisplayValue", sValue);
		},

		getDialog: function () {
			var oDialog = new sap.m.Dialog({
				title: "Cargando",
				content: [
					new sap.m.ProgressIndicator({
						percentValue: "{ProgressBarJsonModel>/PercentValue}",
						displayValue: "{ProgressBarJsonModel>/DisplayValue}",
						state: sap.ui.core.ValueState.Success
					})
				]
			}).addStyleClass("dialogProgress");
			this.oDialog = oDialog;
			return oDialog;
		},

		openDialog: function () {
			this.oDialog.open();
		},

		closeDialog: function () {
			this.oDialog.close();
		}
	};

});