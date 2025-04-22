sap.ui.define([
    // helpers
    "Transener/Operaciones/NovedadesServicio/utils/FioriHelper",
    "Transener/Operaciones/NovedadesServicio/utils/FioriComponentHelper",
    "Transener/Operaciones/NovedadesServicio/utils/FormatHelper",
    "Transener/Operaciones/NovedadesServicio/utils/i18nTranslationHelper",
    "Transener/Operaciones/NovedadesServicio/utils/MessageBoxHelper",
    "Transener/Operaciones/NovedadesServicio/services/oDataService",
    "Transener/Operaciones/NovedadesServicio/utils/AppManagementHelper"
], function(
    FioriHelper,
    FioriComponentHelper,
    FormatHelper,
    i18nTranslationHelper,
    MessageBoxHelper,
    oDataService,
    AppManagementHelper
) {
    "use strict";

    return {
        _entitySet: "/MotivosSet",

        _getMotivos: function() {
            var component = FioriComponentHelper.getComponent();
            var jsonModel = component.getModel("MotivosJsonModel");

            if (!jsonModel) {
                jsonModel = new sap.ui.model.json.JSONModel();
                jsonModel.setSizeLimit(999999);
                jsonModel.setDefaultBindingMode(sap.ui.model.BindingMode.TwoWay);
                component.setModel(jsonModel, "MotivosJsonModel");

                jsonModel.setData({
                    Busy: false,
                    Motivos: []
                });
            }
            return jsonModel;
        },

        _readODataOnSuccess: function(data) {
            var aData = FormatHelper.removeResults(data);
            AppManagementHelper.getModel("MotivosJsonModel").setData({
                Motivos: aData
            });
        },

        _readODataOnError: function(error) {
            var jsonModel = this._getMotivos();
            jsonModel.setProperty("/Busy", false);

            var sessionTimeoutResponseCode = 503;
            if (error.response.statusCode === sessionTimeoutResponseCode) {
                FioriHelper.showSessionTimeoutMessageBox();
                return;
            }

            var errorText = error.response.body;
            var contentType = error.response.headers["Content-Type"];
            if (contentType.indexOf("text/html") >= 0) {
                errorText = $(error.response.body).text();
            } else if (contentType.indexOf("application/json") >= 0) {
                try {
                    var oError = JSON.parse(errorText);
                    errorText = oError.error.message.value;
                } catch (ex) {
                    errorText = error.response.body;
                }
            }

            errorText = i18nTranslationHelper.getTranslation("ErrorLoadingInstruccionesOperativas") + ". \n\n" + errorText;
            MessageBoxHelper.showAlert("Error", errorText);
        },

        loadModel: function(codNovedad, empresa) {
            return new Promise((resolve, reject) => {
                var filters = [
                    new sap.ui.model.Filter("CodigoNovedad", sap.ui.model.FilterOperator.EQ, codNovedad),
                    new sap.ui.model.Filter("Empresa", sap.ui.model.FilterOperator.EQ, empresa)
                ];

                oDataService.getModel("TransenerOperaciones").read("/MotivosSet", {
                    filters: filters,
                    success: (data) => {
                        this._readODataOnSuccess(data);
                        resolve(data);
                    },
                    error: (error) => {
                        this._readODataOnError(error);
                        reject(error);
                    }
                });
            });
        }
    };
});
