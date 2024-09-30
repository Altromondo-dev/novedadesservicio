sap.ui.jsview("Transener.Operaciones.NovedadesServicio.view.App", {

	getControllerName: function () {
		return "Transener.Operaciones.NovedadesServicio.view.App";
	},

	createContent: function (oController) {

		this.setDisplayBlock(true);

		var app = new sap.m.App({
			id: "app",
			pages: [
				sap.ui.xmlview(this.createId("Main"), "Transener.Operaciones.NovedadesServicio.view.Main")
			]
		});
		oController.setApp(app);
		return app;
	}
});