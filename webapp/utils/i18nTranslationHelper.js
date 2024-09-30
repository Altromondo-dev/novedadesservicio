sap.ui.define([
	//utils
	"Transener/Operaciones/NovedadesServicio/utils/FioriComponentHelper"
], function(FioriComponentHelper) {
	"use strict";

	return {
		getTranslation: function(i18nMessage, parameterArray) {
			//gets component
			var component = FioriComponentHelper.getComponent();
			//model
			var i18nModel = component.byId("App").getModel("i18n");
			var translation = i18nModel.getResourceBundle().getText(i18nMessage, parameterArray);
			if (translation) {
				return translation;
			}
			return i18nMessage;
		}

	};
});