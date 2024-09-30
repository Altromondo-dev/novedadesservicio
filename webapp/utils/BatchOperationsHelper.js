// creado por ing hector zea y joel joeverlt 19/04/2018, formateo de datos para el mensaje batch
// este batch operation es una version mejorada del oDataModelV1, este va con la logica del deferred groups y el group id por peticion
// la nueva logistica del batch consiste en realizar 1..n peticiones referentes al (CRUD) por medio de un group id unico
// todas estas peticiones se realizan enviando un array de operaciones batch, definiendo una entidad y su respectivo objeto
// inicialmente para realizar una peticion de batch se tiene que considerar:
// PASO 1
// array de operaciones batch, creando un objeto por cada iteracion  1..n de for
// var aBatchOperations = [] 
// var oOperation = {
// 					entity: "/Registro",
// 					data: oUserData
// 				};
//aBatchOperations.push(oOperation)
// PASO 2 ---> crear peticion 
// var oOptions = {
// 				service: "EVODataModel",
// 				operations: aOperations,
// 				callback: $.proxy(this._successPOST, this)
// 			};
// 			BatchOperationsHelper.setOptions("POST", oOptions);
// 			BatchOperationsHelper.POST();
//NOTA: en el caso de que se quieren manejar callbacks separados por peticiones distintas se tiene que proceder 
// a usar group id distintos por cada uno de los objetos pusheados al array de operaciones batch
sap.ui.define([
	"Transener/Operaciones/NovedadesServicio/services/oDataService",
	"Transener/Operaciones/NovedadesServicio/utils/FormatHelper",
	"Transener/Operaciones/NovedadesServicio/utils/MessageBoxHelper"
], function(oDataService, FormatHelper, MessageBoxHelper) {
	"use strict";
	return {

		_oOptions: {
			// POST: {
			// 	service: "EVODataModel",
			// 	operations: [{
			// 		entity: null,
			// 		data: null,
			// 		group: null
			// 	}],
			// 	callback: undefined
			// }
		},

		_oDialogOptions: {
			icon: "sap-icon://alert",
			text: null,
			buttons: [{
				icon: "sap-icon://accept",
				text: "Aceptar",
				classes: ["button-info"],
				customDatas: {
					closeDialog: true
				}
			}]
		},

		setOptions: function(sMethod, oOptions) {
			this._oOptions[sMethod] = oOptions;
		},

		DELETE: function() {
			var oOptions = this._oOptions["DELETE"];
			var oDataModel = oDataService.getService(oOptions.service);
			oDataModel.setUseBatch(true);
			for (var i in oOptions.operations) {
				var oOperations = oOptions.operations[i];
				oDataModel.remove(oOperations.entity, {
					groupId: oOperations.group || "1"
				});
			}

			var aDeferredGroups = oDataModel.getDeferredGroups();
			aDeferredGroups = aDeferredGroups.concat(["1"]);
			oDataModel.setDeferredGroups(aDeferredGroups);

			oDataModel.submitChanges({
				groupId: "1",
				success: $.proxy(this._completedBatchDelete, this, oOptions),
				error: $.proxy(this._batchError, this, oOptions)
			});
		},

		PUT: function() {
			var oOptions = this._oOptions["PUT"];
			var oDataModel = oDataService.getModel(oOptions.service);
			oDataModel.setUseBatch(true);
			for (var i in oOptions.operations) {
				var oOperations = oOptions.operations[i];
				oDataModel.update(oOperations.entity, oOperations.data, {
					groupId: oOperations.group || "1"
				});
			}

			var aDeferredGroups = oDataModel.getDeferredGroups();
			aDeferredGroups = aDeferredGroups.concat(["1"]);
			oDataModel.setDeferredGroups(aDeferredGroups);

			oDataModel.submitChanges({
				groupId: "1",
				success: $.proxy(this._completedBatch, this, oOptions),
				error: $.proxy(this._batchError, this, oOptions)
			});
		},

		POST: function() {
			var oOptions = this._oOptions["POST"];
			var oDataModel = oDataService.getModel(oOptions.service);
			oDataModel.setUseBatch(true);
			for (var i in oOptions.operations) {
				var oOperations = oOptions.operations[i];
				oDataModel.create(oOperations.entity, oOperations.data, {
					groupId: oOperations.group || "1"
				});
			}

			var aDeferredGroups = oDataModel.getDeferredGroups();
			aDeferredGroups = aDeferredGroups.concat(["1"]);
			oDataModel.setDeferredGroups(aDeferredGroups);

			oDataModel.submitChanges({
				groupId: "1",
				success: $.proxy(this._completedBatch, this, oOptions),
				error: $.proxy(this._batchError, this, oOptions)
			});
		},

		_completedBatch: function(options, data) {
			var oBatchResponse = this.formatMessage(data);
			var oDialogOptions = $.extend(true, {}, this._oDialogOptions);
			oDialogOptions.text = oBatchResponse.message;
			if (oDialogOptions.showAlert) {
				if (oBatchResponse.status === "batchOk") {
					oDialogOptions.buttons[0].callback = options.callback;
				}
				MessageBoxHelper.showGreenSchoolsCustomDialog(oDialogOptions);
			} else {
				options.callback(oBatchResponse);
			}

		},

		_completedBatchDelete: function(options, data) {
			var oBatchResponse = this.formatMessageDelete(data);
			var oDialogOptions = $.extend(true, {}, this._oDialogOptions);
			oDialogOptions.text = oBatchResponse.message;
			if (oDialogOptions.showAlert) {
				if (oBatchResponse.status === "batchOk") {
					oDialogOptions.buttons[0].callback = options.callback;
				}
				MessageBoxHelper.showGreenSchoolsCustomDialog(oDialogOptions);
			} else {
				options.callback(oBatchResponse);
			}
		},

		_batchError: function(options, error) {
			var oDialogOptions = $.extend(true, {}, this._oDialogOptions);
			oDialogOptions.text = "Error interno, intente mas tarde.";
			MessageBoxHelper.showAlert("Alert", "Se ha producido un error en el batch");
		},

		formatMessage: function(data) {
            var bBatchCompletedWithoutError = data.__batchResponses === undefined || data.__batchResponses[0].__changeResponses !== undefined;
			if (bBatchCompletedWithoutError) {
				return {
					message: "Creacion exitosa",
					status: "batchOk"
				};
			} else {
				var oError = JSON.parse(data.__batchResponses[0].response.body);
				var sErrorText = oError.error.message.value;
				return {
					message: sErrorText,
					data: "batchNotOk"
				};

			}
		},

		formatMessageDelete: function(data) {
			var bBatchCompletedWithoutError = data.__batchResponses[0].__changeResponses !== undefined;
			if (bBatchCompletedWithoutError) {
				return {
					message: "Eliminado correctamente",
					status: "batchOk"
				};
			} else {
				var oError = FormatHelper.xmlToJson((new window.DOMParser()).parseFromString(data.__batchResponses[0].response.body, "text/xml"));
				var sErrorText = oError.error.message["#text"];
				return {
					message: sErrorText,
					data: "batchNotOk"
				};

			}
		}

	};
});