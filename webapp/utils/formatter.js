// formatter.js
sap.ui.define([], function() {
    "use strict";
    return {
        isUbicacionEditable: function (formularioEditable, tipoEquipo, viewEquipo) {
			console.log(tipoEquipo)
			if (!formularioEditable && !viewEquipo) return false;
			var isEditable = !this.lineas.includes(tipoEquipo);
			if (!isEditable) {
				AppManagementHelper.getModel("NovedadesFormJsonModel").setProperty("/Tplnr", "");
			}
			return isEditable;
		},
    };
});
