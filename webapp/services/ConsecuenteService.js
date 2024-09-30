sap.ui.define([
	//helpers
	"Transener/Operaciones/NovedadesServicio/utils/FioriHelper",
	"Transener/Operaciones/NovedadesServicio/utils/FioriComponentHelper",
	"Transener/Operaciones/NovedadesServicio/utils/FormatHelper",
	"Transener/Operaciones/NovedadesServicio/utils/i18nTranslationHelper",
	"Transener/Operaciones/NovedadesServicio/utils/MessageBoxHelper",
	"Transener/Operaciones/NovedadesServicio/services/oDataService",
	"Transener/Operaciones/NovedadesServicio/utils/BusyDialogHelper",
	"Transener/Operaciones/NovedadesServicio/utils/AppManagementHelper",
	"Transener/Operaciones/NovedadesServicio/utils/BatchOperationsHelper",
	"Transener/Operaciones/NovedadesServicio/services/CammesaService",
	"Transener/Operaciones/NovedadesServicio/services/ComentariosService",
	"Transener/Operaciones/NovedadesServicio/utils/OperationErrorsHelper",
	"Transener/Operaciones/NovedadesServicio/utils/ProgressDialogHelper",
	"Transener/Operaciones/NovedadesServicio/services/RefreshService"
], function (FioriHelper, FioriComponentHelper, FormatHelper, i18nTranslationHelper, MessageBoxHelper, oDataService, BusyDialogHelper,
	AppManagementHelper, BatchOperationsHelper, CammesaService, ComentariosService, OperationErrorsHelper, ProgressDialogHelper,
	RefreshService) {
	"use strict";

	return {

		buildPromises: function (aConsequents) {
			var aOperation = [];
			for (var i = 0; i < aConsequents.length; i++) {
				//var sPosicion = i + 1;
				aConsequents[i].Consecuente = AppManagementHelper.getModel("SelectedNovedadJsonModel").getProperty("/novedadId");
				aConsequents[i].CodNovedad = AppManagementHelper.getModel("SelectedNovedadJsonModel").getProperty("/CodNovedad");
				aConsequents[i].Empresa = AppManagementHelper.getModel("UtilsJsonModel").getProperty("/Empresa");
				//aConsequents[i].Posicion = sPosicion.toString();

				var informeCammesa = {
					FechaHora: aConsequents[i].FechaHora,
					Autoriza: aConsequents[i].Autoriza,
					InformaCammesa: aConsequents[i].InformaCammesa,
					Texto: aConsequents[i].Texto,
					Empresa: AppManagementHelper.getModel("UtilsJsonModel").getProperty("/Empresa")
				};

				var comentarios = {
					Comentario: aConsequents[i].Comentario,
					Empresa: AppManagementHelper.getModel("UtilsJsonModel").getProperty("/Empresa")
				};

				//TODO revisar
				//en principio lo mando sin estos, ya que son dentro de los expands del consecuente(paja, pero mejor)
				delete aConsequents[i].FechaHora;
				delete aConsequents[i].Autoriza;
				delete aConsequents[i].AutorizaState;
				delete aConsequents[i].AutorizaStateMessage;
				delete aConsequents[i].InformaCammesa;
				delete aConsequents[i].InformaCammesaState;
				delete aConsequents[i].InformaCammesaStateMessage;
				delete aConsequents[i].Comentario;
				delete aConsequents[i].Texto;

				//TODO revisar

				delete aConsequents[i].DescTipo;
				delete aConsequents[i].DescUbication;
				delete aConsequents[i].DescEquipment;
				delete aConsequents[i].DescDispActuante;
				var oObject = {
					data: aConsequents[i],
					informeCammesa: informeCammesa,
					comentarios: comentarios
				};
				aOperation.push(oObject);
			}
			return aOperation;
		},

		POSTPromiseConsecuente: function (oConsequent) {
			oConsequent.CodNovedad = oConsequent.CodNovedad || AppManagementHelper.getModel("NovedadesFormJsonModel").getProperty("/CodNovedad");
			return new Promise((resolve, reject) => {
				let entity = "/NovedadesServicioSet";
				oDataService.getModel("TransenerOperaciones").create(entity, oConsequent, {
					success: function (data) {
						resolve({
							consecuente: oConsequent,
							data: data
						});
					},
					error: function (error) {
						reject(error);
					}
				});
			});
		},

		IndividualPOSTEdition: function (oConsequent) {
			var that = this;
			oConsequent.Consecuente = AppManagementHelper.getModel("UtilsJsonModel").getProperty("/IdNovedad");
			oConsequent.Empresa = AppManagementHelper.getModel("UtilsJsonModel").getProperty("/Empresa");
			//oConsequent.Autoriza = oConsequent.Autoriza === "S";
			//oConsequent.InformaCammesa = oConsequent.InformaCammesa === "S";

			var informeCammesa = {
				FechaHora: oConsequent.FechaHora,
				Autoriza: oConsequent.Autoriza,
				InformaCammesa: oConsequent.InformaCammesa,
				Texto: oConsequent.Texto,
				Empresa: AppManagementHelper.getModel("UtilsJsonModel").getProperty("/Empresa")
			};

			var comentarios = {
				Comentario: oConsequent.Comentario,
				Empresa: AppManagementHelper.getModel("UtilsJsonModel").getProperty("/Empresa")
			};

			//TODO revisar
			//en principio lo mando sin estos, ya que son dentro de los expands del consecuente(paja, pero mejor)
			delete oConsequent.FechaHora;
			delete oConsequent.Autoriza;
			delete oConsequent.AutorizaState;
			delete oConsequent.AutorizaStateMessage;
			delete oConsequent.InformaCammesa;
			delete oConsequent.InformaCammesaState;
			delete oConsequent.InformaCammesaStateMessage;
			delete oConsequent.Comentario;
			delete oConsequent.Texto;

			//TODO revisar

			delete oConsequent.DescTipo;
			delete oConsequent.DescUbication;
			delete oConsequent.DescEquipment;
			delete oConsequent.DescDispActuante;
			this.POSTPromiseConsecuente(oConsequent).then(function (res) {
				var newConsequent = res.data;
				informeCammesa.Id = newConsequent.IdNovedad;
				comentarios.IdNovedad = newConsequent.IdNovedad;
				var promises = [CammesaService.POSTPromiseCammesa(informeCammesa),
					ComentariosService.POSTPromiseComentario(comentarios)
				];
				Promise.all(promises).then(function (tes) {
					$.proxy(that.successIndividualPOST, that, res.data.Consecuente)();
				});
			}).catch($.proxy(this.errorIndividualPOST, this));
		},

		successIndividualPOST: function (sId) {
			MessageBoxHelper.showAlert("Alerta", "Se ha agregado el consecuente de manera exitosa", $.proxy(RefreshService.refreshNovedad,
				RefreshService, sId));
			var sPath = FioriHelper.getAppPath();
			AppManagementHelper.getModel("ConsecuentesFormJsonModel").loadData(sPath + "model/ConsecuentesFormJsonModel.json", "", false);
		},

		errorIndividualPOST: function () {
			MessageBoxHelper.showAlert("Alerta", "Se ha producido un error al agregar el consecuente");
		},

		POST: function () {
			var that = this;
			//TODO no puedo hacer el batch, hacer todos con promises
			var aConsequents = $.extend([], AppManagementHelper.getModel("ConsequentListJsonModel").getData().Consequents);
			if (aConsequents.length > 0) {
				var aOperation = this.buildPromises(aConsequents);
				var premises = [];
				for (var i = 0; i < aOperation.length; i++) {
					premises.push(this.POSTPromiseConsecuente(aOperation[i].data));
				}
				Promise.all(premises).then(function (res) {
					var informeAndComentariosPremises = [];
					for (var j = 0; j < res.length; j++) {
						var operation = aOperation[j];
						var informe = operation.informeCammesa;
						var comentarios = operation.comentarios;

						informe.Id = res[j].data.IdNovedad;
						comentarios.IdNovedad = res[j].data.IdNovedad;

						informeAndComentariosPremises.push(CammesaService.POSTPromiseCammesa(informe));
						informeAndComentariosPremises.push(ComentariosService.POSTPromiseComentario(comentarios));

						//premises.push(this.POSTPromiseConsecuente(aOperation[i].data));
					}
					Promise.all(informeAndComentariosPremises).then(function (responses) {
						that.successBatchConsecuentes({
							data: "batchOK"
						});
					}, function (err) {
						that.successBatchConsecuentes({
							data: "batchNotOk"
						});
					});

				});

			} else {
				this.cleanConsecuenteForm();
				ProgressDialogHelper.setPercentValues(50, "50%");
				CammesaService.POST();
			}
		},

		cleanConsecuenteForm: function () {
			var sPath = FioriHelper.getAppPath();
			AppManagementHelper.getModel("ConsecuentesFormJsonModel").loadData(sPath + "model/ConsecuentesFormJsonModel.json", "", false);
			AppManagementHelper.getModel("ConsequentListJsonModel").loadData(sPath + "model/ConsequentListJsonModel.json", "", false);
		},

		successBatchConsecuentes: function (data) {
			if (data.data === "batchNotOk") {
				ProgressDialogHelper.setPercentValues(15, "15%");
				OperationErrorsHelper.addMessage("Se ha producido un error al crear los consecuentes", "Consecuentes: ");
			} else {
				this.cleanConsecuenteForm();
				ProgressDialogHelper.setPercentValues(15, "15%");
				OperationErrorsHelper.addMessage("Se han creado los consecuentes de manera exitosa", "Consecuentes: ");
			}
			CammesaService.POST();
		},

		// TODO REVISAR SI EN UN CASO PARTICULAR SE PUEDE HACER UN CALLBACK HANDLER DE ERROR PARA EL BOHELPER
		errorPOST: function (error) {
			BusyDialogHelper.close();
			var sError = FormatHelper.parseJsonError(error);
			MessageBoxHelper.showAlert("Alert", sError);
		},

		updateConsecuente: function (consecuente) {
			consecuente.CodNovedad = consecuente.CodNovedad || AppManagementHelper.getModel("NovedadesFormJsonModel").getProperty("/CodNovedad");
			var informeCammesa = {
				FechaHora: consecuente.FechaHora,
				Autoriza: consecuente.Autoriza,
				InformaCammesa: consecuente.InformaCammesa,
				Texto: consecuente.Texto,
				Empresa: AppManagementHelper.getModel("UtilsJsonModel").getProperty("/Empresa"),
				Id: consecuente.IdNovedad
			};

			var comentarios = {
				Comentario: consecuente.Comentario,
				Empresa: AppManagementHelper.getModel("UtilsJsonModel").getProperty("/Empresa"),
				IdNovedad: consecuente.IdNovedad
			};
		
			delete consecuente.Id;
			delete consecuente.NovedadesServicio;
			delete consecuente.__metadata;
			delete consecuente.FechaHora;
			delete consecuente.Autoriza;
			delete consecuente.AutorizaState;
			delete consecuente.AutorizaStateMessage;
			delete consecuente.InformaCammesa;
			delete consecuente.InformaCammesaState;
			delete consecuente.InformaCammesaStateMessage;
			delete consecuente.Comentario;
			delete consecuente.Texto;
			delete consecuente.DescTipo;
			delete consecuente.DescUbication;
			delete consecuente.DescEquipment;
			delete consecuente.DescDispActuante;
			delete consecuente.editMode;
			delete consecuente.NovedadPos;
			delete consecuente.HoraFin;
			delete consecuente.HoraIni;
			
			consecuente.Ens = false;
			consecuente.Borrado = false;
			
			var novedadPromise = new Promise((resolve, reject) => {
				let novedad = consecuente;
				novedad.Empresa = AppManagementHelper.getModel("UtilsJsonModel").getProperty("/Empresa");
				novedad.Cantidadtorrescaidas = novedad.Cantidadtorrescaidas || 0;
				let entity = "/NovedadesServicioSet(IdNovedad='" + novedad.IdNovedad + "',Empresa='" + novedad.Empresa + "')";
				oDataService.getModel("TransenerOperaciones").update(entity, novedad, {
					success: function (data) {
						resolve(novedad.IdNovedad);
					},
					error: function (error) {
						reject(error)
					}
				});
			});
			var comentarioPromise = new Promise((resolve, reject) => {
				let oComentario = comentarios;
				oComentario.Empresa = AppManagementHelper.getModel("UtilsJsonModel").getProperty("/Empresa");
				let entity = "/ComentariosSet";
				oDataService.getModel("TransenerOperaciones").create(entity, oComentario, {
					success: function (data) {
						resolve(oComentario.IdNovedad);
					},
					error: function (error) {
						reject(error)
					}
				});
			});
			var cammesaPromise = new Promise((resolve, reject) => {
				let oCammesa = informeCammesa;
				oCammesa.Empresa = AppManagementHelper.getModel("UtilsJsonModel").getProperty("/Empresa");
				var sId = oCammesa.Id;
				oCammesa.Autoriza = oCammesa.Autoriza ? "S" : "N";
				oCammesa.InformaCammesa = oCammesa.InformaCammesa ? "S" : "N";
				delete oCammesa.NovedadesServicio;
				AppManagementHelper.deleteNavigationProperties(oCammesa);
				let entity = "/InformeCammesaSet";
				oDataService.getModel("TransenerOperaciones").create(entity, oCammesa, {
					success: function (data) {
						resolve(sId);
					},
					error: function (error) {
						reject(error);
					}
				});
			});
			Promise.all([novedadPromise, comentarioPromise, cammesaPromise]).then(function (){
				var idNovedad = AppManagementHelper.getModel("UtilsJsonModel").getProperty("/IdNovedad");
				MessageBoxHelper.showAlert("Alerta", "Se ha modificado el consecuente de manera exitosa", $.proxy(RefreshService.refreshNovedad,
				RefreshService, idNovedad));
			});
		}
	};
});