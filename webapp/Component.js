sap.ui.define([
	"sap/ui/core/UIComponent",
	"sap/ui/Device",
	"Transener/Operaciones/NovedadesServicio/model/models",
	"Transener/Operaciones/NovedadesServicio/utils/FioriComponentHelper",
	"Transener/Operaciones/NovedadesServicio/plugins/lodash",
	"Transener/Operaciones/NovedadesServicio/components/isComboBox"
], function (UIComponent, Device, models, FioriComponentHelper, lodash, isComboBox) {
	"use strict";

	return UIComponent.extend("Transener.Operaciones.NovedadesServicio.Component", {

		metadata: {
			manifest: "json"
		},

		/**
		 * The component is initialized by UI5 automatically during the startup of the app and calls the init method once.
		 * @public
		 * @override
		 */
		init: function () {
			// call the base component's init function
			UIComponent.prototype.init.apply(this, arguments);

			// enable routing
			this.getRouter().initialize();

			// set the device model
			this.setModel(models.createDeviceModel(), "device");
		},
		createContent: function () {
			//sets component
			FioriComponentHelper.setComponent(this);
			// create root view
			var view = sap.ui.view({
				id: this.createId("App"),
				viewName: "Transener.Operaciones.NovedadesServicio.view.App",
				type: "JS",
				viewData: {
					component: this
				}
			});

			return view;
		}
	});
});