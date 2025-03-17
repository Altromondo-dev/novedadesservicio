/* eslint-disable no-param-reassign */
jQuery.sap.require("Transener/Operaciones/NovedadesServicio/libs/xlsx");
jQuery.sap.require("Transener/Operaciones/NovedadesServicio/libs/jszip");
sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"Transener/Operaciones/NovedadesServicio/services/TipoEquipoService",
	"Transener/Operaciones/NovedadesServicio/services/NovedadesService",
	"Transener/Operaciones/NovedadesServicio/services/EquiposService",
	"Transener/Operaciones/NovedadesServicio/services/EstacionesService",
	"Transener/Operaciones/NovedadesServicio/services/UbicacionesService",
	"Transener/Operaciones/NovedadesServicio/services/MotivosService",
	"Transener/Operaciones/NovedadesServicio/services/ClimasService",
	"Transener/Operaciones/NovedadesServicio/services/DispActuantesService",
	"Transener/Operaciones/NovedadesServicio/services/EstadoTiempoService",
	"Transener/Operaciones/NovedadesServicio/services/AreasResponsablesService",
	"Transener/Operaciones/NovedadesServicio/services/CausasService",
	"Transener/Operaciones/NovedadesServicio/services/ConsecuenteService",
	"Transener/Operaciones/NovedadesServicio/services/LicenciaService",
	"Transener/Operaciones/NovedadesServicio/services/TipificacionesFallasService",
	"Transener/Operaciones/NovedadesServicio/services/UbicacionesFallasService",
	"Transener/Operaciones/NovedadesServicio/model/GeneralModel",
	"Transener/Operaciones/NovedadesServicio/model/models",
	"Transener/Operaciones/NovedadesServicio/utils/AppManagementHelper",
	"Transener/Operaciones/NovedadesServicio/services/CammesaService",
	"Transener/Operaciones/NovedadesServicio/services/ComentariosService",
	"Transener/Operaciones/NovedadesServicio/services/PruebasService",
	"Transener/Operaciones/NovedadesServicio/services/oDataService",
	"Transener/Operaciones/NovedadesServicio/services/SignalsService",
	"Transener/Operaciones/NovedadesServicio/utils/MessageBoxHelper",
	"Transener/Operaciones/NovedadesServicio/utils/FioriHelper",
	"Transener/Operaciones/NovedadesServicio/utils/ValidateHelper",
	"Transener/Operaciones/NovedadesServicio/utils/NovedadDialogHelper",
	"Transener/Operaciones/NovedadesServicio/utils/FormatHelper",
	"Transener/Operaciones/NovedadesServicio/utils/BusyDialogHelper",
	"Transener/Operaciones/NovedadesServicio/utils/ExportOdataCSV",
	"Transener/Operaciones/NovedadesServicio/services/ParametrosSistemaService",
	"Transener/Operaciones/NovedadesServicio/services/ReportesService",
	"Transener/Operaciones/NovedadesServicio/services/SubindiceService",
	"Transener/Operaciones/NovedadesServicio/services/RefreshService",
	"Transener/Operaciones/NovedadesServicio/utils/formatter",
	//dejar abajo de todo, librerias sin nombre

], function (Controller, TipoEquipoService, NovedadesService, EquiposService, EstacionesService, UbicacionesService, MotivosService,
	ClimasService,
	DispActuantesService, EstadoTiempoService, AreasResponsablesService, CausasService,
	ConsecuenteService, LicenciaService, TipificacionesFallasService, UbicacionesFallasService,
	GeneralModel,
	models, AppManagementHelper, CammesaService, ComentariosService, PruebasService, oDataService, SignalsService, MessageBoxHelper,
	FioriHelper,
	ValidateHelper, NovedadDialogHelper, FormatHelper, BusyDialogHelper, Export, ParametrosSistemaService,
	ReportesService, SubindiceService, RefreshService, formatter
) {
	"use strict";

	return Controller.extend("Transener.Operaciones.NovedadesServicio.controller.Main", {
		_selectedTab: "GENERAL",
		_dialogNovedad: null,
		lineas: ["L1", "L2", "L3", "L4", "L5", "L6", "L9"],
		addConsecuente: true,
		addSignal: true,
		addPrueba: true,
		formatter: formatter,

		goToEquipment: function () {
			location.hash = "PropiedadesEquipos-Display?Empresa=" + this.society;
		},

		handleTabs: function (oEvent) {
			var sKey = oEvent.getParameter("selectedItem").data().id;
			this._selectedTab = sKey;
		},

		handleTabsConsecuentes: function (oEvent) {
			var sKey = oEvent.getParameter("selectedItem").data().id;
			this._selectedConsecuentesTab = sKey;
		},
		getBaseURL: function () {



			var appId = this.getOwnerComponent().getManifestEntry("/sap.app/id");

			//var appId = this.getManifestEntry("/sap.app/id");
			var appPath = appId.replaceAll(".", "/");
			var appModulePath = jQuery.sap.getModulePath(appPath);

			var jsonModel = sap.ui.getCore().getModel("appCurrentInfo");
			//checks if the model exists
			if (!jsonModel) {
				jsonModel = new sap.ui.model.json.JSONModel();
				jsonModel.setSizeLimit(9999);
				jsonModel.appUrl = appModulePath;
				sap.ui.getCore().setModel(jsonModel, "appCurrentInfo");
				//initilializing = appModulePath; 
				jsonModel.setData({});
			}
			return appModulePath;

		},

		onInit: function () {

			var cUrl = this.getBaseURL();
			this.loadUserDataModel();
			this.globalBusyDialog = new sap.m.BusyDialog();
			window.onbeforeunload = function () {
				var bIsEdit = AppManagementHelper.getModel("UtilsJsonModel").getProperty("/editableMode");
				if (bIsEdit) {
					var novedad = AppManagementHelper.getModel("NovedadesFormJsonModel").getData();
					NovedadesService.unblockNovedad(novedad.IdNovedad);
					return null;
				}
			}
		},
		//	loadUserDataModel: function () {
		//		var Url = "/services/userapi/attributes?multiValuesAsArrays=true";
		//		jQuery.ajax(Url, {
		//			method: "GET",
		//			success: jQuery.proxy(this.onSuccessUserApi, this),
		//		});
		//	},


		loadUserDataModel: function (callback) {

			var UserDataService = this;
			this.callback = callback;
			//reads user api
			/* var path = this._servicePathPrefix + this._servicePath;
			jQuery.ajax(path + "?multiValuesAsArrays=true", {
				method: "GET",
				success: jQuery.proxy(UserDataService.onReadUserApiSuccess, UserDataService),
				error: jQuery.proxy(UserDataService.onReadUserApiError, UserDataService)
			});
			*/
			const url = sap.ui.getCore().getModel("appCurrentInfo").appUrl + "/user-api/currentUser";
			var oModel = new sap.ui.model.json.JSONModel();
			var mock = {
				firstname: "Dummy",
				lastname: "User",
				email: "dummy.user@com",
				name: "dummy.user@com",
				displayName: "Dummy User (dummy.user@com)",
				groups: ["Mantenimiento_GerRegional",
					"Examinadores_PT15",
					"Selector_evaluadores_PT15",
					"seguridadH_PT15",
					"Rep_Direccion_PT15",
					"MedicinaLaboral_PT15",
					"Gestion_Calidad_PT152",
					"Direccion_TecnicaPT15",
					"Auditor_Externo",
					"Gestion_habilitaciones",
					"Solicitante_PT15",
					"Mantenimiento_Secretaria",
					"Director_Tecnico",
					"Ger_Operaciones",
					"Aprobacion_Habilitaciones"
				]
			};

			oModel.loadData(url);
			var that = this;
			oModel.dataLoaded()
				.then(() => {
					//check if data has been loaded
					//for local testing, set mock data
					if (oModel.getData().name) {

						var cUrl = sap.ui.getCore().getModel("appCurrentInfo").appUrl + '/IAS/service/scim/Users?filter=userName eq "' + oModel.getData().name + '"'

						// var cUrl = sap.ui.getCore().getModel("appCurrentInfo").appUrl + '/IAS/service/scim/Users?filter=userName eq "GGGQ"'
						//Llamar a API del IAS
						$.ajax({

							type: "GET",
							contentType: "application/scim+json",
							url: cUrl,
							xhrFields: { withCredentials: false },
							dataType: "json",
							async: false,

							success: function (data, textStatus, jqXHR) {

								//window.alert("success");

								var oModelUser = new sap.ui.model.json.JSONModel();
								oModelUser.setData(data.Resources);


								var aDatosUsuario = that.armarDatos(data.Resources);

								oModel.setData(aDatosUsuario);
								that.onSuccessUserApi(aDatosUsuario)
							},
							error: function (data, xhr, textStatus) {
								console.log(data);
								console.log(xhr);
								console.log(textStatus);

								window.alert("error");
							}
						});
						// Fin llamar a API del IAS
					}
					else {
						oModel.setData(mock);
					}
					// this.setModel(oModel, "userInfo");
				})
				.catch(() => {
					oModel.setData(mock);
				});
		},

		armarDatos: function (datos) {



			var aGroupsTemporal = datos[0].corporateGroups ? datos[0].corporateGroups : datos[0].groups;

			var aGroups = aGroupsTemporal.map(function (fila) {
				return fila.value;
			});

			var aUserData = {
				firstname: datos[0].displayName,
				lastname: datos[0].displayName,
				email: datos[0].emails[0].value,
				name: datos[0].emails[0].value,
				displayName: datos[0].displayName,
				groups: aGroups


			};
			return aUserData;
		},

		/*onReadUserApiSuccess: function (data) {
			var UserEmail = data.email;
			var Url = "/destinations/Examinadores_PT15/Users?filter=emails eq '" + UserEmail + "'";
			jQuery.ajax(Url, {
				method: "GET",
				success: jQuery.proxy(this.onSuccessUserApi, this),
				error: jQuery.proxy(this.onErrorUserApi, this)
			});

		},*/
		onSuccessUserApi: function (data) {
			var UserDataModel = data;
			UserDataModel.oVisualizador = this.ValidateVisualizador(UserDataModel.groups);
			UserDataModel.viewEquipos = this.validateViewEquipos(UserDataModel.groups);
			UserDataModel.DateNow = new Date();
			var oModel = new sap.ui.model.json.JSONModel();
			oModel.setData(UserDataModel);
			this.getView().setModel(oModel, "UserDataModel");
			setInterval(function () {
				oModel.setProperty("/DateNow", new Date());
			}, 60 * 1000); // 60 * 1000 milsec
		},
		onErrorUserApi: function () { },
		ValidateVisualizador: function (Groups) {

			if (typeof Groups === "string") {
				Groups = [Groups];
			}

			return !Groups.some(group => group === "ope_visualizador" || group === "Visualizador");
			return !Groups.some(group => group === "ope_visualizador_tr_tb" || group === "Visualizador");
		},
		validateViewEquipos: function (groups) {

			const roles = [
				"Programacion_COTDT", "Programacion_COT", "Jefe_COTDT", "Jefe_COT",
				"ope_programacion_cotdt", "ope_programacion_cot", "ope_jefe_cotdt", "ope_jefe_cot"
			];


			if (typeof groups === "string") {
				groups = [groups];
			}


			return groups.some(group => roles.includes(group));
		},
		onAfterRendering: function () {
			this.loadSociety();

			DispActuantesService.loadModel();
			EstadoTiempoService.loadModel();
			TipificacionesFallasService.loadModel();
		},

		loadNSEmpresas: function (empresa, reporte) {
			var that = this;
			var filters = [new sap.ui.model.Filter({
				path: "Empresa",
				operator: sap.ui.model.FilterOperator.EQ,
				value1: empresa
			})];
			if (reporte) {
				filters.push(new sap.ui.model.Filter("Reporte", sap.ui.model.FilterOperator.EQ, reporte));
			}
			var oModeld = oDataService.getModel("TransenerOperaciones");
			oModeld.read("/NSEmpresasSet", {
				/*urlParameters: {
					$expand: "TurnoUsuarioSet"
				},*/
				filters: filters,
				success: function (data) {
					var empresas = data.results;
					AppManagementHelper.getModel("NSEmpresasSet").setData({
						Empresas: empresas
					});
				},
				error: function (err) {
					//do something;
				}
			});
		},

		loadSociety: function () {
			var that = this;
			var oModeld = oDataService.getModel("TransenerOperaciones");
			oModeld.read("/EmpresaUsuarioSet", {
				/*urlParameters: {
					$expand: "TurnoUsuarioSet"
				},*/
				//filters: filters,
				success: function (data) {
					var empresa = data.results[0].Empresa;
					if (empresa == 999) {
						that.InitSociety();
					} else {
						that.society = empresa;
						AppManagementHelper.getModel("UtilsJsonModel").setProperty("/Empresa", empresa);
						that.afterEmpresa();
						/*if(oBinding)*/
					}
				},
				error: function (err) {
					//do something;
				}
			});
		},
		InitSociety: function () {
			this.dialogSociety = new sap.m.Dialog({
				type: sap.m.DialogType.Message,
				title: "Selección de Empresa",
				escapeHandler: function (oPromise) {
					oPromise.reject();
				},
				content: [
					new sap.m.VBox({
						items: [
							new sap.m.Label({
								text: "Debe seleccionar la empresa:"
							}),
							new sap.m.Select({
								change: [this.ValidateCombo, this],
								selectedKey: "{Society>/Code}",
								items: [
									new sap.ui.core.Item({
										key: "",
										text: "Elija Uno"
									}),
									new sap.ui.core.Item({
										key: "100",
										text: "TRANSENER S.A."
									}),
									new sap.ui.core.Item({
										key: "300",
										text: "TRANSBA S.A."
									})
								]
							})
						]
					})

				],
				buttons: [
					new sap.m.Button({
						icon: "sap-icon://save",
						type: sap.m.ButtonType.Emphasized,
						text: "Guardar",
						press: [this.onSelectedSociety, this]
					})
				]
			});
			var oModel = new sap.ui.model.json.JSONModel();
			this.dialogSociety.setModel(oModel, "Society");
			this.dialogSociety.open();
		},
		onSelectedSociety: function () {
			var society = this.dialogSociety.getModel("Society").getData().Code;
			if (society !== "" && typeof society !== "undefined") {
				this.society = society;
				AppManagementHelper.getModel("UtilsJsonModel").setProperty("/Empresa", society);
				this.afterEmpresa();

				this.dialogSociety.close();
			} else {
				sap.m.MessageBox.alert("Debe seleccionar una de empresa!", {
					title: "Selección de Empresa"
				});
			}
		},
		ValidateCombo: function (oEvent) {
			var society = this.dialogSociety.getModel("Society").getData().Code;
			if (society !== "") {
				oEvent.getSource().setValueState("None");
			} else {
				oEvent.getSource().setValueState("Error");
			}
		},

		afterEmpresa: function () {

			if (this.society == 300) {
				var combo1 = this.byId("CodNovedadTextCombo");
				var combo2 = this.byId("CodNovedadKeyCombo");

				combo1.unbindItems();
				combo2.unbindItems();

				combo1.destroyItems();
				combo2.destroyItems();

				combo1.addItem(new sap.ui.core.Item({
					key: "D",
					text: "Desconexion"
				}));
				combo1.addItem(new sap.ui.core.Item({
					key: "P",
					text: "Perturbación"
				}));

				combo2.addItem(new sap.ui.core.Item({
					key: "D",
					text: "D"
				}));
				combo2.addItem(new sap.ui.core.Item({
					key: "P",
					text: "P"
				}));
			}

			this.getImageUrl();
			TipoEquipoService.loadTipoEquipo(this.society);
			EstacionesService.loadEstaciones(this.society);
			CausasService.loadAll(this.society);

			// if (this.society === "300") {
			// 	AppManagementHelper.getModel("ConsecuentesFormJsonModel").setProperty("/GenIndisponibilidad", true);
			// 	AppManagementHelper.getModel("ConsecuentesFormJsonModel").setProperty("/Vinculadost", true);
			// 	AppManagementHelper.getModel("ConsecuentesFormJsonModel").setProperty("/Texto", "Vinculado y sin tensión.");
			// 	AppManagementHelper.getModel("ConsecuentesFormJsonModel").setProperty("/CodDispAct", "NI");
			// }

			AppManagementHelper.getModel("ConsecuentesFormJsonModel").setProperty("/GenIndisponibilidad", true);
			AppManagementHelper.getModel("ConsecuentesFormJsonModel").setProperty("/Vinculadost", true);
			AppManagementHelper.getModel("ConsecuentesFormJsonModel").setProperty("/Texto", "Vinculado y sin tensión.");
			AppManagementHelper.getModel("ConsecuentesFormJsonModel").setProperty("/CodDispAct", "NI");

		},

		handleChangeIndis: function (oEvent) {
			var dDate = oEvent.getSource().getDateValue();
			AppManagementHelper.getModel("CammesaFormJsonModel").setProperty("/FechaHora", dDate);
			var consecuenteModel = AppManagementHelper.getModel("ConsecuentesFormJsonModel");
			var novedadesModel = AppManagementHelper.getModel("NovedadesFormJsonModel");
			consecuenteModel.setProperty("/EntIndis", novedadesModel.getProperty("/EntIndis"));

			//this.getSubindice();
		},

		handleChangeIndisConsecuentes: function (oEvent) {
			var dDate = oEvent.getSource().getDateValue();
			AppManagementHelper.getModel("ConsecuentesFormJsonModel").setProperty("/FechaHora", dDate);
		},
		handleChangeEntIndis: function (oEvent) {
			var dDate = oEvent.getSource().getDateValue();
			AppManagementHelper.getModel("NovedadesFormJsonModel").setProperty("/EntServicio", dDate);
		},
		onHandleChangeEntIndisConse: function (oEvent) {
			var dDate = oEvent.getSource().getDateValue();
			AppManagementHelper.getModel("ConsecuentesFormJsonModel").setProperty("/EntServicio", dDate);
		},
		handleTypeChange: function (oEvent) {
			AppManagementHelper.getModel("ConsecuentesFormJsonModel").setProperty("/Equnr", "");

			var tipo = oEvent.getSource().getSelectedKey();
			var estacion = AppManagementHelper.getModel("ConsecuentesFormJsonModel").getProperty("/Tplnr");
			var codigo = this.getView().byId("IUbic")?.getSelectedItem()?.getBindingContext("EstacionesJsonModel")?.getObject()?.Estacion; // Obtén el código de manera segura.

			if (this.lineas.includes(tipo)) {
				delete (AppManagementHelper.getModel("ConsecuentesFormJsonModel").getData().Tplnr);
				EquiposService.loadEquipos(tipo, null, null, this.society, AppManagementHelper.getModel("EquiposConsecuentesJsonModel"));
			} else if (tipo && estacion) {
				EquiposService.loadEquipos(tipo, estacion, codigo, this.society, AppManagementHelper.getModel("EquiposConsecuentesJsonModel"));
			}
			var sValue = oEvent.getParameter("value");
			AppManagementHelper.getModel("ConsecuentesFormJsonModel").setProperty("/DescTipo", sValue);
		},

		handleUbicationChange: function (oEvent) {
			var sValue = oEvent.getParameter("value");
			AppManagementHelper.getModel("ConsecuentesFormJsonModel").setProperty("/DescUbication", sValue);
		},

		handleEquipmentChange: function (oEvent) {
			var sValue = oEvent.getParameter("value");
			AppManagementHelper.getModel("ConsecuentesFormJsonModel").setProperty("/DescEquipment", sValue);
		},

		handleDispActuante: function (oEvent) {
			var sValue = oEvent.getParameter("value");
			AppManagementHelper.getModel("ConsecuentesFormJsonModel").setProperty("/DescDispActuante", sValue);
		},

		formatTipoEquipo: function (tipoEq) {
			if (!tipoEq) return "";
			var allTypes = AppManagementHelper.getModel("TipoEquipoJsonModel").getData().TipoEquipo;
			var ret = allTypes.find(function (el) {
				return el.Tipo == tipoEq;
			});
			return ret ? ret.Descripcion : "";
		},

		formatDispAct: function (dispAct) {
			if (!dispAct) return "";
			var allDisps = AppManagementHelper.getModel("DispActuantesJsonModel").getData();
			var ret = allDisps.find(function (el) {
				return el.Valkey == dispAct;
			});
			return ret ? ret.Valtext : "";
		},

		formatEstadoTiempo: function (estadoTiempo) {
			if (!estadoTiempo) return "";
			var allEstados = AppManagementHelper.getModel("EstadoTiempoJsonModel").getData();
			var ret = allEstados.find(function (el) {
				return el.Valkey == estadoTiempo;
			});
			return ret ? ret.Valtext : "";
		},

		formatCausa: function (causa) {
			if (!causa) return "";
			var allCausas = AppManagementHelper.getModel("AllCausasJsonModel").getData().Causas;
			var ret = allCausas.find(function (el) {
				return el.CodigoCausa == causa;
			});
			return ret ? ret.DescCausa : "";
		},

		handleChangeConsecCammDate: function (evt) {
			var date = evt.getSource().getDateValue();
			AppManagementHelper.getModel("ConsecuentesFormJsonModel").setProperty("/FechaHora", date);
		},

		cleanFormsByTab: function () {
			var sPath = FioriHelper.getAppPath();
			var now = new Date();

			var bIsEdit = AppManagementHelper.getModel("UtilsJsonModel").getProperty("/editableMode");
			if (bIsEdit) {
				var novedad = AppManagementHelper.getModel("NovedadesFormJsonModel").getData();
				NovedadesService.unblockNovedad(novedad.IdNovedad);
				//return null;
			}

			AppManagementHelper.getModel("UtilsJsonModel").setProperty("/editableMode", false);
			AppManagementHelper.getModel("UtilsJsonModel").setProperty("/editable", true);
			AppManagementHelper.getModel("UtilsJsonModel").setProperty("/editableDate", true);
			AppManagementHelper.getModel("UtilsJsonModel").setProperty("/visible", true);
			AppManagementHelper.getModel("UtilsJsonModel").setProperty("/Referencia", "");
			AppManagementHelper.getModel("NovedadesFormJsonModel").loadData(sPath + "model/NovedadesFormJsonModel.json", "", false);
			AppManagementHelper.getModel("NovedadesFormJsonModel").setProperty("/Anio", now.getFullYear().toString());
			AppManagementHelper.getModel("LicencesListJsonModel").loadData(sPath + "model/LicencesListJsonModel.json", "", false);
			AppManagementHelper.getModel("UtilsJsonModel").setProperty("/nroNovedad", "");
			AppManagementHelper.getModel("ConsecuentesFormJsonModel").loadData(sPath + "model/ConsecuentesFormJsonModel.json", "", false);
			if (this.society == 300) {
				AppManagementHelper.getModel("ConsecuentesFormJsonModel").setProperty("/GenIndisponibilidad", true);
				AppManagementHelper.getModel("ConsecuentesFormJsonModel").setProperty("/Vinculadost", true);
				AppManagementHelper.getModel("ConsecuentesFormJsonModel").setProperty("/CodDispAct", "NI");
			}
			AppManagementHelper.getModel("CammesaFormJsonModel").loadData(sPath + "model/CammesaFormJsonModel.json", "", false);
			AppManagementHelper.getModel("CommentsFormJsonModel").loadData(sPath + "model/CommentsFormJsonModel.json", "", false);
			AppManagementHelper.getModel("ConsequentListJsonModel").loadData(sPath + "model/ConsequentListJsonModel.json", "", false);
			AppManagementHelper.getModel("PruebasFormJsonModel").loadData(sPath + "model/PruebasFormJsonModel.json", "", false);
			AppManagementHelper.getModel("PruebasListJsonModel").loadData(sPath + "model/PruebasListJsonModel.json", "", false);
			AppManagementHelper.getModel("SignalsFormJsonModel").loadData(sPath + "model/SignalsFormJsonModel.json", "", false);
			AppManagementHelper.getModel("SignalsListJsonModel").loadData(sPath + "model/SignalsListJsonModel.json", "", false);
			AppManagementHelper.getModel("PruebasListJsonModel").loadData(sPath + "model/PruebasListJsonModel", "", false);
			AppManagementHelper.getModel("ENSListJsonModel").loadData(sPath + "model/ENSListJsonModel.json", "", false);
			AppManagementHelper.getModel("PerturbationJsonModel").loadData(sPath + "model/PerturbationJsonModel.json", "", false);
			AppManagementHelper.getModel("LTFormJsonModel").loadData(sPath + "model/LTFormJsonModel.json", "", false);
		},

		formatTime: function (dDate) {
			if (dDate)
				return FormatHelper.formatTimesView(dDate);
		},

		changeUbicacion: function (oEvent) {
			AppManagementHelper.getModel("NovedadesFormJsonModel").setProperty("/Equnr", "");



			var consecuenteModel = AppManagementHelper.getModel("ConsecuentesFormJsonModel");
			var novedadesModel = AppManagementHelper.getModel("NovedadesFormJsonModel");
			var equiposConsecuente = AppManagementHelper.getModel("EquiposConsecuentesJsonModel")
			equiposConsecuente.setData({ Equipos: [] })
			consecuenteModel.setProperty("/Tplnr", novedadesModel.getProperty("/Tplnr"));
			consecuenteModel.setProperty("/CodTipo", "")
			consecuenteModel.setProperty("/Equnr", "")


			var tipo = AppManagementHelper.getModel("NovedadesFormJsonModel").getProperty("/CodTipo");
			var estacion = oEvent.getSource().getSelectedItem().getBindingContext("EstacionesJsonModel").getObject().Codigo;
			var codigo = oEvent.getSource().getSelectedItem().getBindingContext("EstacionesJsonModel").getObject().Estacion;


			if (this.lineas.includes(tipo)) {
				EquiposService.loadEquipos(tipo, null, null, this.society);
			} else if (tipo && estacion) {
				EquiposService.loadEquipos(tipo, estacion, codigo, this.society);
			}

			this.getSubindice();
		},

		changeUbicacionConsecuentes: function (oEvent) {
			AppManagementHelper.getModel("ConsecuentesFormJsonModel").setProperty("/Equnr", "");
			var estacion = oEvent.getSource().getSelectedItem().getBindingContext("EstacionesJsonModel").getObject().Codigo;
			var tipo = AppManagementHelper.getModel("ConsecuentesFormJsonModel").getProperty("/CodTipo");
			var codigo = oEvent.getSource().getSelectedItem().getBindingContext("EstacionesJsonModel").getObject().Estacion;
			//AppManagementHelper.getModel("ConsecuentesFormJsonModel").setProperty("/Estacion", estacion);
			// 	if (this.lineas.includes(tipo)) {
			// 		EquiposService.loadEquipos(tipo, null, this.society, AppManagementHelper.getModel("EquiposConsecuentesJsonModel"));
			// 	} else if (tipo && estacion) {
			// 		EquiposService.loadEquipos(tipo, estacion, this.society, AppManagementHelper.getModel("EquiposConsecuentesJsonModel"));
			// 	}
			if (this.lineas.includes(tipo)) {
				EquiposService.loadEquipos(tipo, null, null, this.society, AppManagementHelper.getModel("EquiposConsecuentesJsonModel"));
			} else if (tipo && estacion) {
				EquiposService.loadEquipos(tipo, estacion, codigo, this.society, AppManagementHelper.getModel("EquiposConsecuentesJsonModel"));
			}
		},

		tipoEquipoChanged: function (oEvent) {
			//Limpio combo Equipo
			AppManagementHelper.getModel("NovedadesFormJsonModel").setProperty("/Equnr", "");

			//Traigo parametros para filtros
			var tipo = oEvent.getSource().getSelectedKey(); // Obtén el valor seleccionado del ComboBox.
			var estacion = AppManagementHelper.getModel("NovedadesFormJsonModel").getProperty("/Tplnr"); // Obtén la estación desde el modelo.
			var codigo = this.getView().byId("NUbicacion")?.getSelectedItem()?.getBindingContext("EstacionesJsonModel")?.getObject()?.Estacion; // Obtén el código de manera segura.

			if (this.lineas.includes(tipo)) {
				// Si `tipo` pertenece a las líneas definidas, elimina la propiedad 'Estacion' del modelo y carga los equipos.
				var novedadesFormModel = AppManagementHelper.getModel("NovedadesFormJsonModel");
				if (novedadesFormModel) {
					delete novedadesFormModel.Estacion; // Elimina la propiedad si existe.
				}
				EquiposService.loadEquipos(tipo, null, null, this.society); // Carga los equipos sin estación ni código.
			} else if (tipo && estacion) {
				// Si `tipo` y `estacion` están definidos, carga los equipos con estos valores.
				EquiposService.loadEquipos(tipo, estacion, codigo, this.society);
			}

		},

		formatName: function (bEditable) {
			return (bEditable) ? "Guardar Cambios" : "Guardar";
		},

		formatRadioDisp: function (bDisponibilidad) {
			if (bDisponibilidad === true) return 0;
			if (bDisponibilidad === false) return 1;
			return -1;
		},

		formatRadioSN: function (value) {
			return value === "S";
		},

		formatRadioComments: function (sValue) {
			switch (sValue) {
				case "":
					return -1;
				case "S":
					return 0;
				case "N":
					return 1;
			}
		},

		getSubindice: function () {
			var CodNovedad = AppManagementHelper.getModel("NovedadesFormJsonModel").getProperty("/CodNovedad");
			var Tplnr = AppManagementHelper.getModel("NovedadesFormJsonModel").getProperty("/Tplnr");
			var Equnr = AppManagementHelper.getModel("NovedadesFormJsonModel").getProperty("/Equnr");
			var InicioNove = AppManagementHelper.getModel("NovedadesFormJsonModel").getProperty("/InicioNove");
			var CodTipo = AppManagementHelper.getModel("NovedadesFormJsonModel").getProperty("/CodTipo");
			if (CodNovedad && Equnr && (Tplnr || this.lineas.includes(CodTipo)) && InicioNove) {
				SubindiceService.getSubindice(CodNovedad, Tplnr, Equnr, InicioNove);
			}
		},

		formatSubindice: function (subindice) {
			if (!subindice) return 0;
			return parseInt(subindice);
		},

		formatRadioPert: function (sPert) {
			switch (sPert) {
				case "":
					return -1;
				case "P":
					return 1;
				case "C":
					return 0;
				case "T":
					return 2;
			}
		},

		genIndisponibilidadChanged: function (event) {
			if (event.getParameter("selected")) {
				//AppManagementHelper.getModel("NovedadesFormJsonModel").setProperty("/GenIndisponibilidad", true);
				AppManagementHelper.getModel("UtilsJsonModel").setProperty("/editableDate", true);
			} else {
				//AppManagementHelper.getModel("NovedadesFormJsonModel").setProperty("/GenIndisponibilidad", false);
				var isRecierre = AppManagementHelper.getModel("NovedadesFormJsonModel").getProperty("/Recierre");
				if (isRecierre) {
					AppManagementHelper.getModel("UtilsJsonModel").setProperty("/editableDate", false);
					var novedadForm = AppManagementHelper.getModel("NovedadesFormJsonModel").getData();
					delete (novedadForm.EntIndis);
					delete (novedadForm.EntDispo);
					delete (novedadForm.EntServicio);
					AppManagementHelper.getModel("NovedadesFormJsonModel").refresh();
				} else {
					AppManagementHelper.getModel("UtilsJsonModel").setProperty("/editableDate", true);
				}
			}

		},

		recierreChanged: function (event) {
			var genIndisponibilidad = AppManagementHelper.getModel("NovedadesFormJsonModel").getProperty("/GenIndisponibilidad");
			if (genIndisponibilidad === false && event.getParameter("selected")) {
				AppManagementHelper.getModel("UtilsJsonModel").setProperty("/editableDate", false);
				var novedadForm = AppManagementHelper.getModel("NovedadesFormJsonModel").getData();
				delete (novedadForm.EntIndis);
				delete (novedadForm.EntDispo);
				delete (novedadForm.EntServicio);
				AppManagementHelper.getModel("NovedadesFormJsonModel").refresh();
			} else {
				AppManagementHelper.getModel("UtilsJsonModel").setProperty("/editableDate", true);
			}
		},

		genIndisponibilidadChangedConsecuentes: function (event) {
			if (event.getParameter("selectedIndex") === 0) {
				AppManagementHelper.getModel("ConsecuentesFormJsonModel").setProperty("/GenIndisponibilidad", true);
			} else {
				AppManagementHelper.getModel("ConsecuentesFormJsonModel").setProperty("/GenIndisponibilidad", false);
			}
		},

		openDialogNovedades: function () {
			var oFilterSelectionModel = AppManagementHelper.getModel("DateFilterSelectionJsonModel");
			var monthBefore = new Date();
			monthBefore.setMonth(monthBefore.getMonth() - 1);

			var aFilters = [];
			var InicioNove = oFilterSelectionModel.getProperty("/InicioNove");
			var FechaFinNove = oFilterSelectionModel.getProperty("/FechaFinNove");

			if (InicioNove != null && FechaFinNove != null)
				aFilters.push(new sap.ui.model.Filter("InicioNove", sap.ui.model.FilterOperator.BT, InicioNove, FechaFinNove));
			else
				aFilters.push(new sap.ui.model.Filter("InicioNove", sap.ui.model.FilterOperator.BT, monthBefore, new Date()));

			//aFilters.push(new sap.ui.model.Filter("FechaFinNove", sap.ui.model.FilterOperator.LE, new Date()));
			NovedadesService.FIND(aFilters);
			var oNovedadesModel = AppManagementHelper.getModel("NovedadesListJsonModel");
			if (oFilterSelectionModel.getProperty("/InicioNove") == null)
				oFilterSelectionModel.setProperty("/InicioNove", monthBefore);
			if (oFilterSelectionModel.getProperty("/FechaFinNove") == null)
				oFilterSelectionModel.setProperty("/FechaFinNove", new Date());
			var oDialog = NovedadDialogHelper.getDialog(NovedadesService, this);
			oDialog.setModel(oFilterSelectionModel, "DateFilterSelectionJsonModel");
			oDialog.setModel(oNovedadesModel, "NovedadesListJsonModel");
			this.getView().addDependent(oDialog);
			//NovedadDialogHelper.handleDateFilter();
			oDialog.open();
			BusyDialogHelper.open();
		},

		onSelectItem: function (oEvent) {
			var oSelectedNovedad = oEvent.getParameter("selectedItem").getBindingContext("TransenerOperaciones").getObject();
			AppManagementHelper.getModel("NovedadesFormJsonModel").setData(oSelectedNovedad);
			var consecuenteModel = AppManagementHelper.getModel("ConsecuentesFormJsonModel");
			var novedadesModel = AppManagementHelper.getModel("NovedadesFormJsonModel");
			consecuenteModel.setProperty("/Tplnr", novedadesModel.getProperty("/Tplnr"));
			consecuenteModel.setProperty("/InicioNove", novedadesModel.getProperty("/InicioNove"));
			consecuenteModel.setProperty("/EntIndis", novedadesModel.getProperty("/EntIndis"));
			/*var cammesaModel = AppManagementHelper.getModel("CammesaFormJsonModel");
			consecuenteModel.setProperty("/InformaCammesa", cammesaModel.getProperty("/InformaCammesa"));
			consecuenteModel.setProperty("/FechaHora", cammesaModel.getProperty("/FechaHora"));*/
			MotivosService.loadModel(oSelectedNovedad.CodNovedad, oSelectedNovedad.Empresa);
			CausasService.loadModel(oSelectedNovedad.CodNovedad, oSelectedNovedad.codMotivo, oSelectedNovedad.Empresa);
			AppManagementHelper.getModel("UtilsJsonModel").setProperty("/editable", true);
			AppManagementHelper.getModel("UtilsJsonModel").setProperty("/editableDate", true);
			this._editable = true;
		},

		/*selectAutoriza: function (oEvent) {
			var oCommentJsonModel = AppManagementHelper.getModel("CammesaFormJsonModel");
			var sValue = oEvent.getSource().getSelectedButton().data("value");
			oCommentJsonModel.setProperty("/Autoriza", sValue);
		},

		selectAutorizaConsecuentes: function (oEvent) {
			var oCommentJsonModel = AppManagementHelper.getModel("ConsecuentesFormJsonModel");
			var sValue = oEvent.getSource().getSelectedButton().data("value");
			oCommentJsonModel.setProperty("/Autoriza", sValue);
		},*/

		/*selectInformeCammesa: function (oEvent) {
			var oCommentJsonModel = AppManagementHelper.getModel("CammesaFormJsonModel");
			var sValue = oEvent.getSource().getSelectedButton().data("value");
			oCommentJsonModel.setProperty("/InformaCammesa", sValue);
		},

		selectInformeCammesaConsecuentes: function (oEvent) {
			var oCommentJsonModel = AppManagementHelper.getModel("ConsecuentesFormJsonModel");
			var sValue = oEvent.getSource().getSelectedButton().data("value");
			oCommentJsonModel.setProperty("/InformaCammesa", sValue);
		},*/

		informaCammesaSelected: function (evt) {
			AppManagementHelper.getModel("ConsecuentesFormJsonModel").setProperty("/InformaCammesa", evt.getParameter("selected"));
		},

		tipoPerturbacionChanged: function (event) {
			var oNovedadFormJsonModel = AppManagementHelper.getModel("NovedadesFormJsonModel");
			var oUtilsJsonModel = AppManagementHelper.getModel("UtilsJsonModel");
			if (event.getParameter("selectedIndex") === 0) {
				oUtilsJsonModel.setProperty("/enabledCaidas", true);
			} else {
				oUtilsJsonModel.setProperty("/enabledCaidas", false);
			}
			oNovedadFormJsonModel.setProperty("/TipoPerturbacion", event.getSource().getSelectedButton().data(
				"value"));
		},

		checkRadioEnabled: function (oEvent) {
			NovedadDialogHelper.checkRadioEnabled();
		},

		onChangeNov: function (oEvent) {
			NovedadDialogHelper.checkRadioEnabled();
			var codNovedad = oEvent.getParameter("selectedItem").getKey();
			AppManagementHelper.getModel("NovedadesFormJsonModel").setProperty("/CodMotivo", "");
			MotivosService.loadModel(codNovedad, this.society);
			if (codNovedad !== "C" && codNovedad !== "I") {
				AppManagementHelper.getModel("UtilsJsonModel").setProperty("/CammesaTab", true);
			} else {
				AppManagementHelper.getModel("UtilsJsonModel").setProperty("/CammesaTab", false);
			}
			this.getSubindice();

			if (this.society == 300) {
				if (codNovedad == "D") {
					AppManagementHelper.getModel("NovedadesFormJsonModel").setProperty("/CodDispAct", "NI");
				} else if (codNovedad == "P") {
					AppManagementHelper.getModel("NovedadesFormJsonModel").setProperty("/CodDispAct", "PR");
				}
			}

		},

		onChangeMotivo: function (evt) {
			NovedadDialogHelper.checkRadioEnabled();
			var codNovedad = AppManagementHelper.getModel("NovedadesFormJsonModel").getProperty("/CodNovedad");
			AppManagementHelper.getModel("NovedadesFormJsonModel").setProperty("/CodCausa", "");
			var codMotivo = evt.getSource().getSelectedKey();
			if (codNovedad == "P" && codMotivo == "19" || codNovedad == "P" && codMotivo == "7")
				AppManagementHelper.getModel("UtilsJsonModel").setProperty("/enabledRadio", true);
			CausasService.loadModel(codNovedad, codMotivo, this.society);
		},

		novedadesFormValid: function () {
			var oNovedadesModel = AppManagementHelper.getModel("NovedadesFormJsonModel");
			var oRules = {
				CodNovedad: ["required"],
				CodTipo: ["required"],
				InicioNove: ["required", "date"],
				EntIndis: ["required", "date"],
				CodWeather: ["required"],
				CodDispAct: ["required"],
				CodAreaResp: ["required"],
				CodCausa: ["required"],
				//CodTipFalla: ["required"],
				//CodUbFalla: ["required"],
				//Tplnr: ["required"],
				Equnr: ["required"],
				CodMotivo: ["required"],
				GenIndisponibilidad: ["required"]
			};
			var novedad = oNovedadesModel.getProperty("/CodNovedad");
			if (novedad === "C") {
				delete (oRules.CodDispAct);
				delete (oRules.CodAreaResp);
				delete (oRules.CodWeather);
				delete (oRules.GenIndisponibilidad);
			}
			if (novedad === "I") {
				delete (oRules.CodDispAct);
			}
			if (novedad === "D") {
				delete (oRules.CodDispAct);
				//delete(oRules.EntIndis);
			}
			var tipo = oNovedadesModel.getProperty("/CodTipo");
			if (!this.lineas.includes(tipo)) {
				oRules.Tplnr = ["required"];
			}
			var recierre = oNovedadesModel.getProperty("/Recierre");
			var genIndisponibilidad = oNovedadesModel.getProperty("/GenIndisponibilidad");
			if (recierre && genIndisponibilidad === false) {
				delete (oRules.EntIndis);
			}
			var data = oNovedadesModel.getData();
			var bValid = ValidateHelper.make(data, oRules);
			oNovedadesModel.refresh(true);
			return !bValid;
		},

		consecuentesFormValid: function () {
			var oConsecuentesModel = AppManagementHelper.getModel("ConsecuentesFormJsonModel");
			var oRules = {
				/*CodigoTipo: ["required"],
				CodigoEquipo: ["required"],
				CodigoDispAct: ["required"],
				GeneroIndisponibilidad: ["required"],
				//Autoriza: ["required"],
				//InformaCammesa: ["required"],
				HoraInicioNovedad: ["required", "date"],
				HoraIndisponibilidad: ["required", "date"],*/
				CodTipo: ["required"],
				InicioNove: ["required", "date"],
				EntIndis: ["required", "date"],
				//Tplnr: ["required"],
				Equnr: ["required"],
				GenIndisponibilidad: ["required"],
			};

			var oNovedadesModel = AppManagementHelper.getModel("NovedadesFormJsonModel");
			var novedad = oNovedadesModel.getProperty("/CodNovedad");
			if (novedad === "P") {
				oRules.CodDispAct = ["required"]
			}

			var tipo = oConsecuentesModel.getProperty("/CodTipo");
			if (!this.lineas.includes(tipo)) {
				oRules.Tplnr = ["required"];
			}

			var bValid = ValidateHelper.make(oConsecuentesModel.getData(), oRules);
			oConsecuentesModel.refresh(true);
			return !bValid;
		},

		consecuenteInformeCammesaValid: function () {

			var oConsecuentesModel = AppManagementHelper.getModel("ConsecuentesFormJsonModel");
			var oRules = {
				FechaHora: ["required"],
				Autoriza: ["required"],
				InformaCammesa: ["required"],
			};

			var bValid = ValidateHelper.make(oConsecuentesModel.getData(), oRules);
			oConsecuentesModel.refresh(true);
			return !bValid;
		},

		/*cammesaIsFilledConsecuentes: function () {
			var oCammesaForm = AppManagementHelper.getModel("ConsecuentesFormJsonModel").getData();
			return oCammesaForm.Autoriza !== "" && oCammesaForm.InformaCammesa !== "";
		},*/

		/*cammesaIsFilled: function () {
			var isCammesaEnabled = AppManagementHelper.getModel("UtilsJsonModel").getProperty("/CammesaTab");
			var oCammesaForm = AppManagementHelper.getModel("CammesaFormJsonModel").getData();
			if (!isCammesaEnabled) {
				return true;
			} else {
				return ( oCammesaForm.Texto !== "" &&  oCammesaForm.Autoriza !== "" && oCammesaForm.InformaCammesa !== ""
					&&
					oCammesaForm.FechaHora !== null
				);
			}
		},*/

		addOperation: function () {
			var bIsEdit = AppManagementHelper.getModel("UtilsJsonModel").getProperty("/editableMode");
			if (!bIsEdit) {

				if (!this.novedadesFormValid()) {
					MessageBoxHelper.showAlert("Alerta", "Existen campos de novedad vacios");
					AppManagementHelper.getModel("UtilsJsonModel").setProperty("/SelectedKeyTab", "1");
					return;
				}

				var data = AppManagementHelper.getModel("NovedadesFormJsonModel").getData();
				var bool = data.InicioNove <= data.EntIndis;
				if (data.EntDispo && data.EntServicio) {
					if (data.EntIndis > data.EntDispo || data.EntDispo > data.EntServicio) {
						bool = false;
					}
				} else if (data.EntDispo) {
					if (!(data.EntIndis < data.EntDispo)) {
						bool = false;
					}
				} else if (data.EntServicio) {
					MessageBoxHelper.showAlert("Alerta", "Si carga Ent. en servicio, debe cargar Ent. Disponibilidad ");
					AppManagementHelper.getModel("UtilsJsonModel").setProperty("/SelectedKeyTab", "1");
					return;
				}

				if (!bool && (!data.Recierre || data.GenIndisponibilidad)) {
					MessageBoxHelper.showAlert("Alerta", " Ent. Indisponibilidad debe ser mayor que Inicio de Novedad\n" +
						" Ent. Disponibilidad debe ser mayor que Ent. Indisponibilidad\n" +
						" Ent. Servicio debe ser mayor que Ent. Disponibilidad\n");
					AppManagementHelper.getModel("UtilsJsonModel").setProperty("/SelectedKeyTab", "1");
					return;
				}

				/*if (!this.cammesaIsFilled()) {
					MessageBoxHelper.showAlert("Alerta", "Debe cargar los campos Autoriza e Informa a CAMMESA");
					AppManagementHelper.getModel("UtilsJsonModel").setProperty("/SelectedKeyTab", "3");
					return;
				}*/

				NovedadesService.POST();
			} else {
				var sTabKey = AppManagementHelper.getModel("UtilsJsonModel").getProperty("/SelectedKeyTab");
				this.handleEdit(sTabKey);
			}

		},

		handleEdit: function (sTabKey) {
			var that = this;
			var promises = [];

			if (!this.novedadesFormValid()) {
				MessageBoxHelper.showAlert("Alerta", "Existen campos de novedad vacios");
				AppManagementHelper.getModel("UtilsJsonModel").setProperty("/SelectedKeyTab", "1");
				return;
			}

			var data = AppManagementHelper.getModel("NovedadesFormJsonModel").getData();
			var bool = data.InicioNove <= data.EntIndis;
			if (data.EntDispo && data.EntServicio) {
				if (data.EntIndis > data.EntDispo || data.EntDispo > data.EntServicio) {
					bool = false;
				}
			} else if (data.EntDispo) {
				if (!(data.EntIndis < data.EntDispo)) {
					bool = false;
				}
			} else if (data.EntServicio) {
				MessageBoxHelper.showAlert("Alerta", "Si carga Ent. en servicio, debe cargar Ent. Disponibilidad ");
				AppManagementHelper.getModel("UtilsJsonModel").setProperty("/SelectedKeyTab", "1");
				return;
			}

			if (!bool && (!data.Recierre || data.GenIndisponibilidad)) {
				MessageBoxHelper.showAlert("Alerta", " Ent. Indisponibilidad debe ser mayor que Inicio de Novedad\n" +
					" Ent. Disponibilidad debe ser mayor que Ent. Indisponibilidad\n" +
					" Ent. Servicio debe ser mayor que Ent. Disponibilidad\n");
				AppManagementHelper.getModel("UtilsJsonModel").setProperty("/SelectedKeyTab", "1");
				return;
			}

			/*if (!this.cammesaIsFilled()) {
				MessageBoxHelper.showAlert("Alerta", "Debe cargar los campos Autoriza e Informa a CAMMESA");
				AppManagementHelper.getModel("UtilsJsonModel").setProperty("/SelectedKeyTab", "3");
				return;
			}*/

			promises.push(NovedadesService.PUTPromise());
			promises.push(CammesaService.PUTCammesaPromise());
			promises.push(ParametrosSistemaService.PUTPromise());

			var oComentario = AppManagementHelper.getModel("CommentsFormJsonModel").getData();
			if (oComentario.Comentario !== "") {
				promises.push(ComentariosService.PUTCommentsPromise());
			}

			this.updateCounts = promises.length;

			Promise.all(promises.map(jQuery.proxy(this.reflectProgress, this))).then(function (results) {
				console.log(results, "finales");
				var message = "";
				var count = 0;
				if (!results[0].resolved) {
					message += "Error al guardar la novedad \n";
					count++;
				}
				if (!results[1].resolved) {
					message += "Error al guardar informe a CAMMESA \n";
					count++;
				}
				if (!results[2].resolved) {
					message += "Error al guardar los parametros de equipo \n";
					count++;
				}

				if (count) {
					if (count != 3) message += "Todos los demas cambios se han guardado satisfactoriamente";
					MessageBoxHelper.showAlert("Alerta", message);
				} else {
					var sPath = FioriHelper.getAppPath();
					that.cleanFormsByTab();
					MessageBoxHelper.showAlert("Alerta", "Los cambios se han guardado satisfactoriamente");
					AppManagementHelper.getModel("UtilsJsonModel").setProperty("/SelectedKeyTab", "1");
					NovedadesService.unblockNovedad(data.IdNovedad);
				}
				//cerrar progress bar y otros TODO
			});

		},
		reflectProgress: function (promise) {
			var that = this;
			return promise.then(data => ({
				resolved: true,
				data: data
			}), err => ({
				resolved: false,
				err: err
			})).finally(() => {
				var advance = 100 / that.updateCounts;
				//avanzar progress bar TODO
			});
		},

		senializacionAddPress: function () {
			var oUtilsJsonModel = AppManagementHelper.getModel("UtilsJsonModel");
			var bEdition = oUtilsJsonModel.getProperty("/editableMode");
			var oModel = AppManagementHelper.getModel("SignalsFormJsonModel");
			var oModelPerturbacion = AppManagementHelper.getModel("PerturbationJsonModel");
			var oSignal = $.extend({}, oModel.getData());
			var aPerturbacion = $.extend([], oModelPerturbacion.getData().Perturbacion);
			var oPerturbacion = aPerturbacion.shift();
			$.extend(oPerturbacion, oSignal);
			var oMergedSignal = $.extend({}, oPerturbacion, oSignal);
			if (!oMergedSignal.Posicion) {
				MessageBoxHelper.showAlert("Alerta", "Se debe cargar el Código de Relación");
				return;
			}
			if (!bEdition) {
				var oSignalListModel = AppManagementHelper.getModel("SignalsListJsonModel");
				var oSignalData = oSignalListModel.getData().Signals;
				//var iSignals = oSignalData.length + 1;
				//oMergedSignal.Posicion = iSignals;
				if (this.addSignal) {
					oSignalData.push(oMergedSignal);
				}
				oSignalListModel.refresh(true);
			} else {
				SignalsService.IndividualPOSTEdition(oMergedSignal);
			}
			// limpiado de perturbaciones
			var sPath = FioriHelper.getAppPath();
			AppManagementHelper.getModel("PerturbationJsonModel").loadData(sPath + "models/PerturbationJsonModel.json", "", false);
			this.addSignal = true;
		},
		causaChanged: function (evt) {
			if (this.society == 300) {
				var cammesaModel = AppManagementHelper.getModel("CammesaFormJsonModel");
				var cammesaText = cammesaModel.getProperty("/Texto");
				var itm = evt.getSource().getSelectedItem();
				if (!itm) return; //cambiaron el valor a mano por uno no existente
				if (this.anteriorCausa) {
					cammesaText = cammesaText.replace(this.anteriorCausa, "");
				}
				var text = itm.getBindingContext("CausasJsonModel").getObject().DescCausa;
				var final = "";
				if (cammesaText) {
					final = cammesaText + "\n" + text;
					this.anteriorCausa = "\n" + text;
				} else {
					final = text;
					this.anteriorCausa = text;
				}
				cammesaModel.setProperty("/Texto", final);
			}
		},

		vinculadoChanged: function (evt) {
			var isSelected = evt.getParameter("selected");
			if (this.society === "300" || this.society === "100") {
				var consecuenteModel = AppManagementHelper.getModel("ConsecuentesFormJsonModel");
				var comment = consecuenteModel.getProperty("/Texto");
				var final = "";
				if (isSelected) {
					if (!comment) {
						final = "Vinculado y sin tensión.";
					} else {
						if (!comment.includes("Vinculado y sin tensión.")) {
							final = comment + "\nVinculado y sin tensión."
						}
					}

				} else {
					final = comment.replace("\nVinculado y sin tensión.", "");
					final = final.replace("Vinculado y sin tensión.", "");
				}
				consecuenteModel.setProperty("/Texto", final);
			}
		},

		pruebaAddPress: function () {
			var oModel = AppManagementHelper.getModel("PruebasFormJsonModel");
			var oPrueba = $.extend({}, oModel.getData());
			var oUtilsJsonModel = AppManagementHelper.getModel("UtilsJsonModel");
			var bEdition = oUtilsJsonModel.getProperty("/editableMode");
			if (!oPrueba.Posicion) {
				MessageBoxHelper.showAlert("Alerta", "Se debe cargar el Código de Relación");
				return;
			}
			if (this.society == 300) {
				var cammesaModel = AppManagementHelper.getModel("CammesaFormJsonModel");
				var comment = cammesaModel.getProperty("/Texto");
				if (!comment) {
					cammesaModel.setProperty("/Texto", "Prueba Negativa");
				}
				if (!comment.includes("Prueba Negativa")) {
					cammesaModel.setProperty("/Texto", comment + "\nPrueba Negativa");
				}
			}

			if (!bEdition) {
				var oPruebaListModel = AppManagementHelper.getModel("PruebasListJsonModel");
				var oPruebaData = oPruebaListModel.getData().Pruebas;
				//var iPruebas = oPruebaData.length + 1;
				//oPrueba.Posicion = iPruebas;
				if (this.addPrueba) {
					oPruebaData.push(oPrueba);
				}
				oPruebaListModel.refresh(true);
			} else {
				PruebasService.IndividualPOSTEdition(oPrueba);
			}

			//this.addPrueba = true;
		},

		inicioNoveChanged: function (evt) {
			var date = evt.getSource().getDateValue();
			var valid = evt.getParameters().valid;
			var indispDesde = AppManagementHelper.getModel("NovedadesFormJsonModel").getProperty("/EntIndis");
			if (date && valid) {
				AppManagementHelper.getModel("NovedadesFormJsonModel").setProperty("/EntIndis", date);
				AppManagementHelper.getModel("CammesaFormJsonModel").setProperty("/FechaHora", date);
				AppManagementHelper.getModel("ConsecuentesFormJsonModel").setProperty("/FechaHora", date);
				this.getSubindice();
				var consecuenteModel = AppManagementHelper.getModel("ConsecuentesFormJsonModel");
				var novedadesModel = AppManagementHelper.getModel("NovedadesFormJsonModel");
				consecuenteModel.setProperty("/InicioNove", novedadesModel.getProperty("/InicioNove"));
				consecuenteModel.setProperty("/EntIndis", novedadesModel.getProperty("/EntIndis"));
			}
		},

		inicioNoveConsecuenteChanged: function (evt) {
			var date = evt.getSource().getDateValue();
			var valid = evt.getParameters().valid;
			var indispDesde = AppManagementHelper.getModel("ConsecuentesFormJsonModel").getProperty("/EntIndis");
			if (date && valid) {
				AppManagementHelper.getModel("ConsecuentesFormJsonModel").setProperty("/EntIndis", date);
				AppManagementHelper.getModel("ConsecuentesFormJsonModel").setProperty("/FechaHora", date);
			}
		},

		formatCammesaInform: function (bInformaCammesa) {
			return (bInformaCammesa) ? "SI" : "NO";
		},

		formatBooleanValues: function (bValue) {
			return (bValue) ? "SI" : "NO";
		},

		onChangeReduccion: function (oEvent) {
			var iValue = parseInt(oEvent.getParameter("value"));
			if (iValue >= 0 && iValue <= 100) {
				oEvent.getSource().setValue(parseInt(iValue));
				AppManagementHelper.getModel("NovedadesFormJsonModel").setProperty("/Factred", iValue.toString());
			} else {
				oEvent.getSource().setValue(0);
			}
		},

		deleteConsecuenteFromTable: function (oEvent) {
			var oControl = oEvent.getSource().getParent().getBindingContext("ConsequentListJsonModel").getObject();
			var oConsequentModel = AppManagementHelper.getModel("ConsequentListJsonModel");
			var aItems = oConsequentModel.getData().Consequents;
			var iIndex = aItems.indexOf(oControl);
			aItems.splice(iIndex, 1);
			oConsequentModel.refresh(true);
		},

		editConsecuenteForm: function (oEvent) {
			var object = oEvent.getSource().getBindingContext("ConsequentListJsonModel").getObject();
			object.editMode = true;

			var tipo = object.CodTipo;;
			var estacion = object.Tplnr;
			if (this.lineas.includes(tipo)) {
				EquiposService.loadEquipos(tipo, null, this.society, AppManagementHelper.getModel("EquiposConsecuentesJsonModel"));
			} else if (tipo && estacion) {
				EquiposService.loadEquipos(tipo, estacion, this.society, AppManagementHelper.getModel("EquiposConsecuentesJsonModel"));
			}
			if (!object.IdNovedad) {
				this.addConsecuente = false;
				AppManagementHelper.getModel("ConsecuentesFormJsonModel").setData(object);
				return;
			} else {
				this.addConsecuente = true;
			}
			NovedadesService.findNovedad([], object.IdNovedad).then(function (res) {
				var comentarios = res.ComentariosSet.results[0];
				var informe = res.InformeCammesaSet.results[0];

				if (comentarios) {
					jQuery.extend(object, comentarios);
				}

				if (informe) {
					informe.Autoriza = informe.Autoriza === "S";
					informe.InformaCammesa = informe.InformaCammesa === "S";
					jQuery.extend(object, informe);
				}

				AppManagementHelper.getModel("ConsecuentesFormJsonModel").setData(object);
			});
		},

		deleteConsecuenteCreated: function (evt) {
			var object = evt.getSource().getBindingContext("ConsequentListJsonModel").getObject();
			NovedadesService.deleteNovedad(object.IdNovedad).then(function (res) {
				MessageBoxHelper.showAlert("Alerta", "Se ha borrado el consecuente con exito.");
				RefreshService.refreshNovedad(object.Consecuente);
			});
		},

		deleteNovedad: function () {
			MessageBoxHelper.showConfirm("Alerta", "¿Esta seguro que desea eliminar la novedad?", jQuery.proxy(this.deleteNovedadA, this));
		},

		deleteNovedadA: function () {
			var that = this;
			var novedad = AppManagementHelper.getModel("NovedadesFormJsonModel").getData();

			NovedadesService.deleteNovedad(novedad.IdNovedad).then(function (res) {
				MessageBoxHelper.showAlert("Alerta", "Se ha borrado la novedad con exito.");
				//that.cleanFormsByTab();
			});
			that.cleanFormsByTab();
		},

		deleteSignalsFromTable: function (oEvent) {
			var obj = oEvent.getSource().getParent().getBindingContext("SignalsListJsonModel").getObject();
			var oSignalModel = AppManagementHelper.getModel("SignalsListJsonModel");

			var bEdition = AppManagementHelper.getModel("UtilsJsonModel").getProperty("/editableMode");
			if (!bEdition) {
				var aItems = oSignalModel.getData().Signals;
				var iIndex = aItems.indexOf(obj);
				aItems.splice(iIndex, 1);
				oSignalModel.refresh(true);
			} else {
				SignalsService.remove(obj).then(function (res) {
					MessageBoxHelper.showAlert("Alerta", "Se ha borrado la señalizacion con exito.");
					RefreshService.refreshNovedad(res);
				})
			}

		},

		deletePruebasFromTable: function (oEvent) {
			var obj = oEvent.getSource().getParent().getBindingContext("PruebasListJsonModel").getObject();
			var oPruebaModel = AppManagementHelper.getModel("PruebasListJsonModel");

			var bEdition = AppManagementHelper.getModel("UtilsJsonModel").getProperty("/editableMode");
			if (!bEdition) {
				var aItems = oPruebaModel.getData().Pruebas;
				var iIndex = aItems.indexOf(obj);
				aItems.splice(iIndex, 1);
				oPruebaModel.refresh(true);
			} else {
				PruebasService.remove(obj).then(function (res) {
					MessageBoxHelper.showAlert("Alerta", "Se ha borrado la prueba con exito.");
					RefreshService.refreshNovedad(res);
				})
			}

		},

		deleteSignalsFromTable2: function (oEvent) {
			var oControl = oEvent.getSource().getParent().getBindingContext("SignalsListJsonModel").getObject();
			var oSignalsModel = AppManagementHelper.getModel("SignalsListJsonModel");
			var aItems = oSignalsModel.getData().Signals;
			var iIndex = aItems.indexOf(oControl);
			aItems.splice(iIndex, 1);
			oSignalsModel.refresh(true);
		},

		millisToMinutes: function (millis) {
			var minutes = millis / 60000;
			return minutes;
		},

		cleanConsecuente: function () {
			var sPath = FioriHelper.getAppPath();
			var consecuenteModel = AppManagementHelper.getModel("ConsecuentesFormJsonModel");
			var novedadesModel = AppManagementHelper.getModel("NovedadesFormJsonModel");
			consecuenteModel.loadData(sPath + "model/ConsecuentesFormJsonModel.json", "", false);
			consecuenteModel.setProperty("/Tplnr", novedadesModel.getProperty("/Tplnr"));
			consecuenteModel.setProperty("/InicioNove", novedadesModel.getProperty("/InicioNove"));
			consecuenteModel.setProperty("/EntIndis", novedadesModel.getProperty("/EntIndis"));
			var cammesaModel = AppManagementHelper.getModel("CammesaFormJsonModel");
			consecuenteModel.setProperty("/InformaCammesa", cammesaModel.getProperty("/InformaCammesa"));
			consecuenteModel.setProperty("/FechaHora", cammesaModel.getProperty("/FechaHora"));
			this.addConsecuente = true;
			//consecuenteModel.refresh();
		},

		senializacionCleanPress: function () {
			//TODO get position on 1
			var signals = AppManagementHelper.getModel("SignalsListJsonModel").getData().Signals;
			var sPath = FioriHelper.getAppPath();
			AppManagementHelper.getModel("SignalsFormJsonModel").loadData(sPath + "model/SignalsFormJsonModel.json", "", false);
			AppManagementHelper.getModel("PerturbationJsonModel").loadData(sPath + "model/PerturbationJsonModel.json", "", false);
			AppManagementHelper.getModel("SignalsFormJsonModel").setProperty("/Posicion",
				(signals[signals.length - 1] ? parseInt(signals[signals.length - 1].Posicion) : 0) + 1 + "");
			this.addSignal = true;
		},

		cleanPrueba: function () {
			var sPath = FioriHelper.getAppPath();
			AppManagementHelper.getModel("PruebasFormJsonModel").loadData(sPath + "model/PruebasFormJsonModel.json", "", false);
			this.addPrueba = true;
		},

		calculateAutomaticENS: function (ENSListModel, path) {
			var iENS = 0;
			var aENS = ENSListModel.getData().ENSRegisters;
			for (var i = 0; i < aENS.length; i++) {
				var iRowPotencia = parseFloat(aENS[i].Potencia);
				var iCorte = parseFloat(aENS[i].Corte);
				if (!isNaN(iRowPotencia) && !isNaN(iCorte)) {
					var rowEns = ((iRowPotencia * iCorte) / 60);
					ENSListModel.setProperty(path + "/ENSRow", rowEns);
					iENS = iENS + rowEns;
				}

			}
			AppManagementHelper.getModel("NovedadesFormJsonModel").setProperty("/Ensval", iENS.toString().substring(0, 10));
			this.calcPotencia();
		},

		calcRowCorte: function (oEvent) {
			var ENSListModel = AppManagementHelper.getModel("ENSListJsonModel");
			var sPath = oEvent.getSource().getBindingContext("ENSListJsonModel").getPath();
			var data = ENSListModel.getProperty(sPath);
			var dReposicion = data.Reptime;
			var dInicioNovedadDate = data.Begtime;
			if (dReposicion > dInicioNovedadDate) {
				var iMilliSeconds = dReposicion.getTime() - dInicioNovedadDate.getTime();
				var iTotal = this.millisToMinutes(iMilliSeconds);
				ENSListModel.setProperty(sPath + "/Corte", iTotal.toString());
				this.calculateAutomaticENS(ENSListModel, sPath);
			}
		},

		calcPotencia: function () {
			var iPotenciaCortada = 0;
			var aENS = AppManagementHelper.getModel("ENSListJsonModel").getData().ENSRegisters;
			for (var i = 0; i < aENS.length; i++) {
				var iRowPotencia = parseFloat(aENS[i].Potencia);
				if (!isNaN(iRowPotencia))
					iPotenciaCortada = parseFloat(iPotenciaCortada + iRowPotencia);
			}
			AppManagementHelper.getModel("NovedadesFormJsonModel").setProperty("/Potenafect", iPotenciaCortada.toString());
			//this.calculateAutomaticENS();
		},

		cargarLT: function () {
			var oModel = AppManagementHelper.getModel("NovedadesFormJsonModel");
			var novedad = oModel.getData();
			var LTForm = AppManagementHelper.getModel("LTFormJsonModel").getData();
			var Empresa = this.getView().getModel("UtilsJsonModel").getProperty("/Empresa");
			var LT = {
				Anio: novedad.Anio,
				IdLicencia: LTForm.IdLicencia,
				Empresa: Empresa
			};
			if (this.onValidateLicencia(LT)) {

				var oUtilsJsonModel = this.getView().getModel("UtilsJsonModel");
				var bEdition = oUtilsJsonModel.getProperty("/editableMode");

				//AppManagementHelper.getModel("LTFormJsonModel").setProperty("/IdLicencia","");

				if (!bEdition) {
					var licencesListModel = AppManagementHelper.getModel("LicencesListJsonModel");
					var licenceData = licencesListModel.getData().Licences;
					licenceData.push(LT);
					AppManagementHelper.getModel("LTFormJsonModel").setProperty("/IdLicencia", "");
					licencesListModel.refresh(true);
				} else {
					this.getView().getModel("LicencesListJsonModel").setProperty("/Busy", true);

					LicenciaService.saveLicence(LT,
						jQuery.proxy(this.onSuccessSaveLTCallback, this, LT),
						jQuery.proxy(this.onErrorSaveLTCallback, this)
					);
				}
			}

		},
		onValidateLicencia: function (oLicencia) {
			if (oLicencia.IdLicencia == "" || typeof (oLicencia.IdLicencia) == "undefined") {
				MessageBoxHelper.showAlert("Guardar Licencia", "Debe Ingresar la Licencia");
				return false;
			}
			var LicencesModel = this.getView().getModel("LicencesListJsonModel").getData().Licences;
			for (var row in LicencesModel) {
				if (LicencesModel[row].Anio == oLicencia.Anio && LicencesModel[row].IdLicencia == oLicencia.IdLicencia) {
					MessageBoxHelper.showAlert("Guardar Licencia", "Esta licencia ya se encuentra registrada");
					return false;
				}
			}
			return true;
		},
		onSuccessSaveLTCallback: function (licencia, data) {
			MessageBoxHelper.showAlert("Guardar Licencia", "Se ha guardado la licencia exitosamente.");
			LicenciaService.loadList(licencia.Empresa, licencia.IdNovedad);
			AppManagementHelper.getModel("LTFormJsonModel").setProperty("/IdLicencia", "");
			var oModel = this.getView().getModel("LicencesListJsonModel");
			oModel.setProperty("/Busy", false);
		},
		onErrorSaveLTCallback: function () {
			MessageBoxHelper.showAlert("Guardar Licencia", "Ha ocurrido un error al intentar guardar.");
			var oModel = this.getView().getModel("LicencesListJsonModel");
			oModel.setProperty("/Busy", false);
		},
		consecuenteAddPress: function () {
			//this.aaaa();
			var oUtilsJsonModel = AppManagementHelper.getModel("UtilsJsonModel");
			var bEdition = oUtilsJsonModel.getProperty("/editableMode");
			var oModel = AppManagementHelper.getModel("ConsecuentesFormJsonModel");
			var oConsequent = $.extend({}, oModel.getData());
			//this.addConsecuente
			if (!this.consecuentesFormValid()) {
				MessageBoxHelper.showAlert("Alerta", "Existen campos de consecuente vacios");
				//AppManagementHelper.getModel("UtilsJsonModel").setProperty("/SelectedKeyTab", "1");
				return;
			}
			var oNovedadesModel = AppManagementHelper.getModel("NovedadesFormJsonModel");
			var novedad = oNovedadesModel.getProperty("/CodNovedad");
			/*if ((novedad == "P" || novedad == "D") && !this.consecuenteInformeCammesaValid()) {
				MessageBoxHelper.showAlert("Alerta", "Se deben completar los campos de fecha, Autoriza e Informa a CAMMESA");
				//AppManagementHelper.getModel("UtilsJsonModel").setProperty("/SelectedKeyTab", "1");
				//TODO cambiar pestaña
				return;
			}*/

			if (!oConsequent.editMode) {
				if (!bEdition) {
					var oConsequentListModel = AppManagementHelper.getModel("ConsequentListJsonModel");
					var aConsequentData = oConsequentListModel.getData().Consequents;
					if (this.addConsecuente) {
						aConsequentData.push(oConsequent);
					}
					oConsequentListModel.refresh(true);
				} else {
					ConsecuenteService.IndividualPOSTEdition(oConsequent);
				}
			} else {
				if (!bEdition) {
					//TODO revisar
					var oConsequentListModel = AppManagementHelper.getModel("ConsequentListJsonModel");
					var aConsequentData = oConsequentListModel.getData().Consequents;
					if (this.addConsecuente) {
						aConsequentData.push(oConsequent);
					}
					oConsequentListModel.refresh(true);
				} else {
					ConsecuenteService.updateConsecuente(oConsequent);
				}
			}
			var sPath = FioriHelper.getAppPath();
			AppManagementHelper.getModel("ConsecuentesFormJsonModel").loadData(sPath + "model/ConsecuentesFormJsonModel.json", "", false);
			if (this.society === "300") {
				AppManagementHelper.getModel("ConsecuentesFormJsonModel").setProperty("/GenIndisponibilidad", true);
				AppManagementHelper.getModel("ConsecuentesFormJsonModel").setProperty("/Vinculadost", true);
				AppManagementHelper.getModel("ConsecuentesFormJsonModel").setProperty("/CodDispAct", "NI");
				AppManagementHelper.getModel("ConsecuentesFormJsonModel").setProperty("/Texto", "Vinculado y sin tensión.");
			}
			var consecuenteModel = AppManagementHelper.getModel("ConsecuentesFormJsonModel");
			var novedadesModel = AppManagementHelper.getModel("NovedadesFormJsonModel");
			consecuenteModel.setProperty("/Tplnr", novedadesModel.getProperty("/Tplnr"));
			consecuenteModel.setProperty("/InicioNove", novedadesModel.getProperty("/InicioNove"));
			consecuenteModel.setProperty("/EntIndis", novedadesModel.getProperty("/EntIndis"));
			var cammesaModel = AppManagementHelper.getModel("CammesaFormJsonModel");
			consecuenteModel.setProperty("/InformaCammesa", cammesaModel.getProperty("/InformaCammesa"));
			consecuenteModel.setProperty("/FechaHora", cammesaModel.getProperty("/FechaHora"));
			this.addConsecuente = true;
		},

		editSignal: function (evt) {
			var obj = evt.getSource().getBindingContext("SignalsListJsonModel").getObject();
			AppManagementHelper.getModel("SignalsFormJsonModel").setData({
				Posicion: obj.Posicion,
				Senializacion: obj.Senializacion,
				Texto: obj.Texto
			});

			AppManagementHelper.getModel("PerturbationJsonModel").setData({
				Perturbacion: [obj]
			});

			this.addSignal = false;
		},

		editPrueba: function (evt) {
			var obj = evt.getSource().getBindingContext("PruebasListJsonModel").getObject()
			AppManagementHelper.getModel("PruebasFormJsonModel").setData(obj);
			this.addPrueba = false;
		},

		onDeleteENS: function (evt) {
			var that = this;
			var ens = evt.getSource().getBindingContext("ENSListJsonModel").getObject();
			//var oUtilsJsonModel = this.getView().getModel("UtilsJsonModel");
			//var bEdition = oUtilsJsonModel.getProperty("/editableMode");
			if (ens.Modif) {
				//this.getView().getModel("LicencesListJsonModel").setProperty("/Busy", true);
				ParametrosSistemaService.delete(ens).then(
					function (res) {
						console.log("borrado");
						var ensList = that.getView().getModel("ENSListJsonModel").getData().ENSRegisters;
						for (var row in ensList) {
							if (ensList[row] == ens) {
								var position = row;
								ensList.splice(position, 1);
							}
						}
						that.getView().getModel("ENSListJsonModel").updateBindings(true);
						sap.m.MessageBox.alert("Se ha borrado correctamente", {
							title: "Borrado Exitoso"
						});
					},
					function (err) {
						console.log("no borrado");
						sap.m.MessageBox.alert("Ha fallado el borrado del ENS", {
							title: "Borrado fallido"
						});
					});
			} else {
				var ensList = this.getView().getModel("ENSListJsonModel").getData().ENSRegisters;
				for (var row in ensList) {
					if (ensList[row] == ens) {
						var position = row;
						ensList.splice(position, 1);

					}
				}
				this.getView().getModel("ENSListJsonModel").updateBindings(true);
			}
		},

		onAddENS: function () {
			var novedad = AppManagementHelper.getModel("NovedadesFormJsonModel").getData();
			var dInicioNovedad = novedad.InicioNove;
			var IdNovedad = novedad.IdNovedad;
			var oENSListModel = AppManagementHelper.getModel("ENSListJsonModel");
			var oENS = {
				Modif: "",
				Potencia: "0",
				Reptime: null,
				Begtime: null,
				Corte: "0",
				ENSRow: "0",
				Comments: "",
			};
			if (IdNovedad) {
				oENS.IdNovedad = IdNovedad;
			}
			oENS.Begtime = dInicioNovedad;
			var aENSListData = oENSListModel.getData().ENSRegisters;
			aENSListData.push(oENS);
			oENSListModel.refresh(true);
		},

		reportNovedadesTipoEquipo: function () {
			var that = this;
			var model = AppManagementHelper.getModel("NovedadesPorEquiposJsonModel");
			model.setData({});
			this.dialogReporteTipoEquipo = new sap.m.Dialog({
				type: sap.m.DialogType.Message,
				title: "Novedades Por Tipo",
				content: [
					new sap.m.VBox({
						items: [
							new sap.m.HBox({
								items: [
									new sap.m.Label({
										text: "Región",
										width: "100px"
									}).addStyleClass("CustomLabel"),
									new sap.m.ComboBox({
										selectedKey: "{NovedadesPorEquiposJsonModel>/region}",
										items: {
											path: "EstacionesJsonModel>/Estaciones",
											template: new sap.ui.core.Item({
												key: "{EstacionesJsonModel>Estacion}",
												text: "{EstacionesJsonModel>Codigo}"
											})
										},
										layoutData: new sap.m.FlexItemData({
											growFactor: 1
										}),
										width: "120px"
									}),
									new sap.m.ComboBox({
										selectedKey: "{NovedadesPorEquiposJsonModel>/region}",
										items: {
											path: "EstacionesJsonModel>/Estaciones",
											template: new sap.ui.core.Item({
												key: "{EstacionesJsonModel>Estacion}",
												text: "{EstacionesJsonModel>Descripcion}"
											})
										},
										layoutData: new sap.m.FlexItemData({
											growFactor: 6
										}),
										width: "100%"
									})
								]
							}),
							new sap.m.HBox({
								items: [
									new sap.m.Label({
										text: "Tipo de Equipo",
										width: "100px"
									}).addStyleClass("CustomLabel"),
									new sap.m.ComboBox({
										selectedKey: "{NovedadesPorEquiposJsonModel>/tipo}",
										items: {
											path: "TipoEquipoJsonModel>/TipoEquipo",
											template: new sap.ui.core.Item({
												key: "{TipoEquipoJsonModel>Tipo}",
												text: "{TipoEquipoJsonModel>Tipo}"
											})
										},
										layoutData: new sap.m.FlexItemData({
											growFactor: 1
										}),
										width: "120px"
									}),
									new sap.m.ComboBox({
										selectedKey: "{NovedadesPorEquiposJsonModel>/tipo}",
										items: {
											path: "TipoEquipoJsonModel>/TipoEquipo",
											template: new sap.ui.core.Item({
												key: "{TipoEquipoJsonModel>Tipo}",
												text: "{TipoEquipoJsonModel>Descripcion}"
											})
										},
										layoutData: new sap.m.FlexItemData({
											growFactor: 6
										}),
										width: "100%"
									})
								]
							}),
							new sap.m.HBox({
								items: [
									new sap.m.HBox({
										items: [
											new sap.m.Label({
												text: "Desde",
												width: "100px"
											}).addStyleClass("CustomLabel"),
											new sap.m.DatePicker({
												dateValue: "{NovedadesPorEquiposJsonModel>/desde}",
												displayFormat: "dd/MM/yy HH:mm"
											})
										]
									}),
									new sap.m.HBox({
										items: [
											new sap.m.Label({
												text: "Hasta",
												width: "100px"
											}).addStyleClass("CustomLabel"),
											new sap.m.DatePicker({
												dateValue: "{NovedadesPorEquiposJsonModel>/hasta}",
												displayFormat: "dd/MM/yy HH:mm"
											})
										]
									})
								]
							})
						]
					})
				],
				buttons: [
					new sap.m.Button({
						//icon: "sap-icon://save",
						type: sap.m.ButtonType.Emphasized,
						text: "Exportar",
						press: [this.exportNovedadesPorEquipo, this]
					}),
					new sap.m.Button({
						//icon: "sap-icon://save",
						type: sap.m.ButtonType.Emphasized,
						text: "Cancelar",
						press: [function () {
							this.dialogReporteTipoEquipo.close();
						}, this]
					})
				]
			});
			var oModel = new sap.ui.model.json.JSONModel();
			this.getView().addDependent(this.dialogReporteTipoEquipo);
			this.dialogReporteTipoEquipo.setModel(oModel, "novs");
			this.dialogReporteTipoEquipo.open();
		},
		reportENS: function () {
			var that = this;
			var model = AppManagementHelper.getModel("InformeFiltersJsonModel");
			model.setData({});
			var regionesModel = AppManagementHelper.getModel("RegionesEnsJsonModel");
			if (this.society == 100) {
				regionesModel.setData({
					Regiones: [{
						Codigo: 102,
						Descripcion: "Transener SA-Gcia Reg Metropolitana"
					}, {
						Codigo: 103,
						Descripcion: "Transener SA-Gcia Reg Norte"
					}, {
						Codigo: 104,
						Descripcion: "Transener SA-Gcia Reg Sur"
					}]
				});
			} else {
				regionesModel.setData({
					Regiones: [{
						Codigo: 113,
						Descripcion: "NORTEBA"
					}, {
						Codigo: 114,
						Descripcion: "SURBA"
					}]
				});
			}
			this.dialogReporteEns = new sap.m.Dialog({
				type: sap.m.DialogType.Message,
				title: "Reportes ENS",
				content: [
					new sap.m.VBox({
						items: [
							new sap.m.HBox({
								items: [
									new sap.m.Label({
										text: "Región",
										width: "100px"
									}).addStyleClass("CustomLabel"),
									new sap.m.ComboBox({
										selectedKey: "{InformeFiltersJsonModel>/region}",
										items: {
											path: "RegionesEnsJsonModel>/Regiones",
											template: new sap.ui.core.Item({
												key: "{RegionesEnsJsonModel>Codigo}",
												text: "{RegionesEnsJsonModel>Codigo}"
											})
										},
										layoutData: new sap.m.FlexItemData({
											growFactor: 1
										}),
										width: "120px"
									}),
									new sap.m.ComboBox({
										selectedKey: "{InformeFiltersJsonModel>/region}",
										items: {
											path: "RegionesEnsJsonModel>/Regiones",
											template: new sap.ui.core.Item({
												key: "{RegionesEnsJsonModel>Codigo}",
												text: "{RegionesEnsJsonModel>Descripcion}"
											})
										},
										layoutData: new sap.m.FlexItemData({
											growFactor: 6
										}),
										width: "100%"
									})
								]
							}),
							new sap.m.HBox({
								items: [
									new sap.m.HBox({
										items: [
											new sap.m.Label({
												text: "Desde",
												width: "100px"
											}).addStyleClass("CustomLabel"),
											new sap.m.DatePicker({
												dateValue: "{InformeFiltersJsonModel>/desde}",
												displayFormat: "dd/MM/yy HH:mm"
											})
										]
									}),
									new sap.m.HBox({
										items: [
											new sap.m.Label({
												text: "Hasta",
												width: "100px"
											}).addStyleClass("CustomLabel"),
											new sap.m.DatePicker({
												dateValue: "{InformeFiltersJsonModel>/hasta}",
												displayFormat: "dd/MM/yy HH:mm"
											})
										]
									})
								]
							})
						]
					})
				],
				buttons: [
					new sap.m.Button({
						//icon: "sap-icon://save",
						type: sap.m.ButtonType.Emphasized,
						text: "Exportar",
						press: [this.exportEns, this]
					}),
					new sap.m.Button({
						//icon: "sap-icon://save",
						type: sap.m.ButtonType.Emphasized,
						text: "Cancelar",
						press: [function () {
							this.dialogReporteEns.close();
						}, this]
					})
				]
			});
			//var oModel = new sap.ui.model.json.JSONModel();
			this.getView().addDependent(this.dialogReporteEns);
			//this.dialogReporteEns.setModel(oModel, "novs");
			this.dialogReporteEns.open();
		},

		exportNovedadesPorEquipo: function () {
			var that = this;

			/*jQuery.sap.registerModulePath("index", "https://unpkg.com/docx@4.0.0/build/");
			jQuery.sap.require("index.index");*/
			//jQuery.sap.require("Transener/Operaciones/NovedadesServicio/libs/docx");
			//jQuery.sap.registerModulePath("File", "https://cdnjs.cloudflare.com/ajax/libs/FileSaver.js/1.3.8/");
			jQuery.sap.require("Transener/Operaciones/NovedadesServicio/libs/FileSaver");

			var filterData = AppManagementHelper.getModel("NovedadesPorEquiposJsonModel").getData();
			var filters = [];

			filters.push(new sap.ui.model.Filter({
				path: "Empresa",
				operator: sap.ui.model.FilterOperator.EQ,
				value1: this.society
			}));

			if (filterData.region) {
				filters.push(new sap.ui.model.Filter({
					path: "Estacion",
					operator: sap.ui.model.FilterOperator.EQ,
					value1: filterData.region
				}));
			}

			if (!filterData.tipo) {
				sap.m.MessageBox.alert("Debe seleccionar fecha desde, fecha hasta y tipo de equipo", {
					title: "Filtros reporte"
				});
				return;
			}

			filters.push(new sap.ui.model.Filter({
				path: "Tipoeq",
				operator: sap.ui.model.FilterOperator.EQ,
				value1: filterData.tipo
			}));

			if (filterData.desde && filterData.hasta) {
				filterData.hasta.setHours(23, 59, 59, 999);
				filters.push(new sap.ui.model.Filter({
					path: "Salida",
					operator: sap.ui.model.FilterOperator.BT,
					value1: filterData.desde,
					value2: filterData.hasta
				}));
			} else {
				sap.m.MessageBox.alert("Debe seleccionar fecha desde, fecha hasta y tipo de equipo", {
					title: "Filtros reporte"
				});
				return;
			}

			var headers = ["CT", (filterData.tipo && this.lineas.includes(filterData.tipo)) ? "Desde - Hasta" : "Estacion", "Salida",
				"Código de equipo",
				"Circuito", "Ref", "Salida",
				"Entrada", "Indisp Tiempo", "Indisp Tipo", "Cond.Atmosf"
			];
			var data = [headers.join(";")];
			this.globalBusyDialog.open();
			ReportesService.getNovedadesPorTipoEquipo(filters).then(function (res) {
				//debugger;

				for (var i = 0; i < res.length; i++) {
					var nov = res[i];
					var row = [];
					row.push(i + 1);
					row.push(nov.Estacion || nov.Extremos || "");
					row.push("");
					row.push(nov.Equipo || "");
					row.push(nov.Circuito || "");
					row.push(nov.Ref || "");
					row.push(nov.Salida && that.formatDateTime(nov.Salida) || "");
					row.push(nov.Entrada && that.formatDateTime(nov.Entrada) || "");
					row.push(nov.IndispTm && Math.floor(nov.IndispTm.ms / 1000 / 60) || "0");
					row.push(nov.IndispTp || "");
					row.push(nov.CondAtmos || "");
					data.push(row.join(";"));
				}

				var string = data.join("\n");

				var blob = new Blob(['\ufeff' + string], {
					type: 'text/csv;charset=utf-8;'
				});
				that.globalBusyDialog.close();
				if (navigator.msSaveBlob) { // IE 10+
					navigator.msSaveBlob(blob, "Reporte.csv");
				} else {
					var link = document.createElement("a");
					var url = URL.createObjectURL(blob);
					var isSafari = navigator.userAgent.indexOf('Safari') != -1 && navigator.userAgent.indexOf('Chrome') == -1;
					if (isSafari) //if Safari open in new window to save file with random filename.
						link.setAttribute("target", "_blank");
					link.setAttribute("href", url);
					link.setAttribute("download", "reporte.xls");
					link.style = "visibility:hidden";
					document.body.appendChild(link);
					link.click();
					document.body.removeChild(link);
				}

				//console.log(data);

				/*const doc = new Document();
				var fecha = doc.Header.createParagraph().right();
				fecha.createTextRun(that.formatDate(filterData.desde) + " a " + that.formatDate(filterData.hasta)).bold();
				var imgTransener = that.imageUrl;
				if (that.imageUrl) {
					if (that.society == 100) {
						doc.Header.createImage(imgTransener, 140, 55);
					} else {
						doc.Header.createImage(imgTransener, 140, 55);
					}
				}
				doc.Header.createParagraph().center().createTextRun(that.formatTipoEquipo(filterData.tipo)).bold();

				const table = doc.createTable(data.length, headers.length);
				for (i = 0; i < data.length; i++) {
					for (var j = 0; j < headers.length; j++) {
						table.getCell(i, j).addContent(new Paragraph(data[i][j]));
					}
				}*/

				/*const packer = new Packer();

				packer.toBlob(doc).then(blob => {
					saveAs(blob, "mydocument.docx");
					that.globalBusyDialog.close();
				});

				that.dialogReporteTipoEquipo.close();*/
			})

		},
		// exportReportsENS: function () {

		// 	var ensA =
		// 	console.log(ensA);
		// 	console.log("lala");
		// },

		exportEns: function () {
			//ReportesService.getEns(filters).then(function (res) {

			var filtersData = AppManagementHelper.getModel("InformeFiltersJsonModel").getData();
			var filters = [];
			filters.push(new sap.ui.model.Filter({
				path: "Empresa",
				operator: sap.ui.model.FilterOperator.EQ,
				value1: this.society
			}));
			if (filtersData.desde && filtersData.hasta) {
				filters.push(new sap.ui.model.Filter({
					path: "Fecha",
					operator: sap.ui.model.FilterOperator.BT,
					value1: filtersData.desde,
					value2: filtersData.hasta
				}));
			} else {
				sap.m.MessageBox.alert("Debe seleccionar fecha desde y fecha hasta", {
					title: "Filtros reporte ENS"
				});
				return;
			}
			if (filtersData.region) {
				filters.push(new sap.ui.model.Filter({
					path: "Region",
					operator: sap.ui.model.FilterOperator.EQ,
					value1: filtersData.region
				}));
			}
			ReportesService.getEns(filters).then(function (res) {
				var csv = [];
				var header = ["Fecha", "Tipo de Equipo", "Equipo en Falla", "Región", "Agente con Cortes", "Potencia Cortadas",
					"ENS", "Observaciones"

				];
				csv.push(header.join(";"));

				var rows = res.results;
				rows.forEach(function (el) {
					var row = [];
					row.push(FormatHelper.formatDate(el.Fecha));
					row.push(el.CodTipo);
					row.push(el.Eqfalla);
					row.push(el.Region);
					row.push(el.Agente);
					row.push('"=""' + parseFloat(el.Potenciacortada).toFixed(2) + '"""');
					row.push('"=""' + parseFloat(el.Ens).toFixed(2) + '"""');
					//row.push(el.Tiponovedad);
					row.push("\"" + el.Comentario + "\"");
					csv.push(row.join(";"));
				});

				// var ezeem = csv.join("\n");
				var string = csv.join("\n");

				var blob = new Blob(['\ufeff' + string], {
					type: 'text/csv;charset=utf-8;'
				});
				if (navigator.msSaveBlob) { // IE 10+
					navigator.msSaveBlob(blob, "Reporte ENS.xls");
				} else {
					var link = document.createElement("a");
					var url = URL.createObjectURL(blob);
					var isSafari = navigator.userAgent.indexOf('Safari') != -1 && navigator.userAgent.indexOf('Chrome') == -1;
					if (isSafari) //if Safari open in new window to save file with random filename.
						link.setAttribute("target", "_blank");
					link.setAttribute("href", url);
					link.setAttribute("download", "ENS.xls");
					link.style = "visibility:hidden";
					document.body.appendChild(link);
					link.click();
					document.body.removeChild(link);
				}
			})

			// console.log(ezeem);

			//})
		},

		filtersInformeDiario: function () {
			var that = this;
			var model = AppManagementHelper.getModel("InformeFiltersJsonModel");
			model.setData({});

			if (this.society == 300) {
				var fromDate = new Date();
				fromDate.setDate(fromDate.getDate() - 1)
				model.setProperty("/desde", fromDate);
				model.setProperty("/hasta", new Date());
			}

			this.dialogReportesDBF = new sap.m.Dialog({
				type: sap.m.DialogType.Message,
				title: "Informe Diario",
				escapeHandler: function (oPromise) {
					oPromise.reject();
				},
				content: [
					new sap.m.VBox({
						items: [
							new sap.m.HBox({
								items: [
									new sap.m.HBox({
										items: [
											new sap.m.Label({
												text: "Desde",
												width: "100px"
											}).addStyleClass("CustomLabel"),
											new sap.m.DatePicker({
												dateValue: "{InformeFiltersJsonModel>/desde}",
											})
										]
									}),
									new sap.m.HBox({
										items: [
											new sap.m.Label({
												text: "Hasta",
												width: "100px"
											}).addStyleClass("CustomLabel"),
											new sap.m.DatePicker({
												dateValue: "{InformeFiltersJsonModel>/hasta}",
											})
										]
									})
								]
							})
						]
					})
				],
				buttons: [
					new sap.m.Button({
						//icon: "sap-icon://save",
						type: sap.m.ButtonType.Emphasized,
						text: "Exportar",
						press: [function () {
							var filters = [];
							var filtersData = AppManagementHelper.getModel("InformeFiltersJsonModel").getData();
							if (!filtersData.desde || !filtersData.hasta) {
								return;
							}

							function addDay(fecha) {
								var dat = new Date(fecha)
								dat.setDate(dat.getDate() + 1);
								return dat;
							}
							var dateArray = [];
							var currentDate = new Date(new Date(filtersData.desde).setHours(0, 0, 0, 0));
							while (currentDate <= new Date(new Date(filtersData.hasta).setHours(0, 0, 0, 0))) {
								dateArray.push(currentDate);
								currentDate = addDay(currentDate);
							}
							if (this.society == 300) {
								filtersData.desde.setHours(6, 0, 0, 0); //6 am
								filtersData.hasta.setHours(6, 0, 0, 0); //6 am
							} else {
								filtersData.hasta.setHours(23, 59, 59, 999);
							}
							//filtersData.hasta.setHours(23, 59, 59, 999);
							filters.push(new sap.ui.model.Filter("InicioNove", sap.ui.model.FilterOperator.BT, filtersData.desde, filtersData.hasta));
							this.reporteDBFFilters = filters;
							this.reportesDBFFechas = dateArray;
							this.reportInformeDiario(filtersData.desde);
							this.dialogReportesDBF.close();
						}, this]
					}),
					new sap.m.Button({
						//icon: "sap-icon://save",
						type: sap.m.ButtonType.Emphasized,
						text: "Cancelar",
						press: [function () {
							this.dialogReportesDBF.close();
						}, this]
					})
				]
			});

			this.getView().addDependent(this.dialogReportesDBF);

			this.dialogReportesDBF.open();
		},

		reportInformeDiario: function (fechaDesde) {
			var that = this;
			//jQuery.sap.registerModulePath("index", "https://unpkg.com/docx@4.0.0/build/");
			//jQuery.sap.require("index.index");
			//jQuery.sap.registerModulePath("File", "https://cdnjs.cloudflare.com/ajax/libs/FileSaver.js/1.3.8/");
			jQuery.sap.require("Transener/Operaciones/NovedadesServicio/libs/docx");
			jQuery.sap.require("Transener/Operaciones/NovedadesServicio/libs/FileSaver");

			function addDestinatarios(doc, destinatarios) {
				if (destinatarios.length) {
					var paragraph = doc.createParagraph();
					paragraph.createTextRun("A: ").bold().font("arial").size(22);
					paragraph.createTextRun(destinatarios[0].Destinatario).tab().font("arial").size(22);
				}
				for (var i = 1; i < destinatarios.length; i++) {
					paragraph.createTextRun(destinatarios[i].Destinatario).tab().break().font("arial").size(22);
				}
			}

			function addForzadas(doc, forzadas) {

				function createForzada(doc, forzada) {
					var paragraph = doc.createParagraph();
					paragraph.createTextRun(forzada.Equipo + "  " + forzada.DescEquipo).bold().break().font("arial");
					if (forzada.EntServ) {
						paragraph.createTextRun("Salió de Servicio el " + FormatHelper.formatDate(forzada.IndDesde) + " a las " + FormatHelper.formatTime(
							forzada.IndDesde) + " hs.").bold().break().font("arial");
						paragraph.createTextRun("Entró en Servicio el " + FormatHelper.formatDate(forzada.EntServ) + " a las " + FormatHelper.formatTime(
							forzada.EntServ) + " hs.").break().font("arial");
					} else {
						paragraph.createTextRun("Salió de Servicio el " + FormatHelper.formatDate(forzada.IndDesde) + " a las " + FormatHelper.formatTime(
							forzada.IndDesde) + " hs. y continúa").bold().break().font("arial");
					}
					//TODOLUCAS esto se borro porque lo pidieron
					if (!forzada.Consecuente || that.society == 300) {
						if (forzada.Causa) paragraph.createTextRun("Causa: " + forzada.Causa).break().font("arial");
					}

					if (forzada.Comentario && that.society != 300) paragraph.createTextRun("Comentarios: " + forzada.Comentario).break().font("arial"); //TODO verificar y cambiar

					if (that.society == 300) {

						if (forzada.Recierre) {
							if (!forzada.GenIndisp) {
								paragraph.createTextRun("RECIERRE EXITOSO").break();
							} else {
								paragraph.createTextRun("RECIERRE NO EXITOSO").break();
							}

						}

						if (forzada.pruebas) {
							for (var k = 0; k < forzada.pruebas.length; k++) {
								var prueba = forzada.pruebas[k];
								var text = "Prueba efectuada el " + FormatHelper.formatDate(prueba.HoraPrueba) + " a las " +
									FormatHelper.formatTime(prueba.HoraPrueba) + " - " + prueba.Comentarios;
								paragraph.createTextRun(text).break().font("arial");
							}
						}

						if (forzada.seniales.length) paragraph.createTextRun("Señalizaciones registradas").break().font("arial");
						for (var j = 0; j < forzada.seniales.length; j++) {
							var row = forzada.seniales[j];

							var ezSignals = ["Fn", "Fr", "Fs", "Ft", "Tx", "Rx", "T2", "Ts2"];
							var pzSignals = ["Li", "Rr"];
							var text = "";

							if (row.Senializacion) {
								text += row.Senializacion + " ";
							}

							var row1Signals = ["Rrpi", "Bz", "PITR", "Pito", "Pit1", "Pili"];

							row1Signals.forEach(function (key) {
								if (row[key] === true) {
									if (key === "Pito") key = "Pit0";
									if (text) text += "-" + key.toUpperCase()
									else text += key.toUpperCase()
								}
							});
							if (text) paragraph.createTextRun(text).break().font("arial");
							text = "";

							var row2Signals = ["Km", "Fn", "Fr", "Fs", "Ft", "Tx", "Rx", "T2", "Ts2", "Li", "Rr"];

							if (row.Et) {
								text += row.Et + ": ";
							}

							row2Signals.forEach(function (key) {
								if (row[key] === true) {
									if (ezSignals.includes(key)) key = "EZ" + key;
									if (pzSignals.includes(key)) key = "PZ" + key;
									if (text) text += "-" + key.toUpperCase()
									else text += key.toUpperCase()
								}
							});

							if (row.Km) text += " DIST: " + row.Km + " KM";

							if (text) paragraph.createTextRun(text).break().font("arial");
							text = "";

							if (row.Et2) {
								text += row.Et2 + ": ";
							}

							var row3Signals = ["Km2", "Fn2", "Fr2", "Fs2", "Ft2", "Tx2", "Rx2", "T22", "Ts22", "Li2", "Rr2"];

							row3Signals.forEach(function (key) {
								if (row[key] === true) {
									key = key.slice(0, -1);
									if (ezSignals.includes(key)) key = "EZ" + key;
									if (pzSignals.includes(key)) key = "PZ" + key;
									if (text) text += "-" + key.toUpperCase()
									else text += key.toUpperCase()
								}
							});

							if (row.Km2) text += " DIST: " + row.Km2 + " KM";

							if (text) paragraph.createTextRun(text).break().font("arial");

						}
						if (!forzada.Consecuente) {
							paragraph.createTextRun("Factor de Reducción:" + forzada.Factred).break().font("arial");
							for (var j = 0; j < forzada.ens.length; j++) {
								var row = forzada.ens[j];
								paragraph.createTextRun("Potencia Restituida " + (j + 1) + ": " + row.Potencia +
									" Tiempo Reposicion " + (j + 1) + ": " + row.Corte).break().font("arial");
							}
							paragraph.createTextRun("Potencia Cortada:" + forzada.Potenafect + " MW").break().font("arial");
							paragraph.createTextRun("Energía No Suministrada:" + forzada.Ensval + " MWh").break().font("arial");
						}

					} else {
						if (forzada.UbicFalla) paragraph.createTextRun("Ubicación de la falla: " + forzada.UbicFalla).break().break().font("arial");
					}

					//paragraph.createTextRun("Ubicación de la falla " + forzada.UbicFalla).break().break();
					if (forzada.EstadoTiempo) paragraph.createTextRun("Estado del Tiempo: " + that.formatEstadoTiempo(forzada.EstadoTiempo)).break().font(
						"arial");
					if (forzada.DispAct) paragraph.createTextRun("Dispositivo Actuante: " + that.formatDispAct(forzada.DispAct)).break().font("arial");

					if (forzada.FinfCammesa) {
						paragraph.createTextRun("Se informó a CAMMESA el " +
							FormatHelper.formatDate(forzada.FinfCammesa) + " a las " + FormatHelper.formatTime(
								forzada.FinfCammesa) + " hs.").break().break().font("arial");

						paragraph.createTextRun(forzada.InfCammesa).break().font("arial");
					}
					//if (forzada.Causa) paragraph.createTextRun(forzada.Causa).break().font("arial");
				}

				if (forzadas.length) {
					var titulo = doc.createParagraph().center();
					titulo.createTextRun("FORZADAS").bold().underline().font("arial").size(22);
					for (var i = 0; i < forzadas.length; i++) {
						createForzada(doc, forzadas[i]);
					}
				}
			}

			function addProgramadas(doc, programadas) {

				function createProgramada(doc, programada) {
					var paragraph = doc.createParagraph();
					paragraph.createTextRun(programada.Equipo + "  " + programada.DescEquipo).bold().break().font("arial");

					if (programada.CodNovedad == "D") {
						if (programada.EntServ) {
							paragraph.createTextRun("Salió de Servicio el " + FormatHelper.formatDate(programada.InicioNove) +
								" a las " + FormatHelper.formatTime(programada.InicioNove) + " hs.").bold().break().font("arial");
							paragraph.createTextRun("Entró en Servicio el " + FormatHelper.formatDate(programada.EntServ) +
								" a las " + FormatHelper.formatTime(programada.EntServ) + " hs.").break().font("arial");
						} else {
							paragraph.createTextRun("Salió de Servicio el " + FormatHelper.formatDate(programada.InicioNove) +
								" a las " + FormatHelper.formatTime(programada.InicioNove) + " hs. y continúa").bold().break().font("arial");
						}
						paragraph.createTextRun("Causa: " + programada.Causa).break().font("arial");
						if (programada.FinfCammesa) {
							paragraph.createTextRun("Se informó a CAMMESA el " +
								FormatHelper.formatDate(programada.FinfCammesa) +
								" a las " + FormatHelper.formatTime(programada.FinfCammesa) + " hs.").break().break().font("arial");
							paragraph.createTextRun(programada.InfCammesa).break().font("arial");
							//paragraph.createTextRun("Número para Cammesa " + programada.Nroequipocammesa).break();
						}

					}

					if (programada.CodNovedad == "I") {
						if (programada.EntServ) {
							paragraph.createTextRun("Se Inició el " + FormatHelper.formatDate(programada.InicioNove) +
								" a las " + FormatHelper.formatTime(programada.InicioNove) + " hs.").bold().break().font("arial");
							paragraph.createTextRun("Finalizo el " + FormatHelper.formatDate(programada.EntServ) +
								" a las " + FormatHelper.formatTime(programada.EntServ) + " hs.").break().font("arial");
						} else {
							paragraph.createTextRun("Se Inició el " + FormatHelper.formatDate(programada.InicioNove) +
								" a las " + FormatHelper.formatTime(programada.InicioNove) + " hs. y continúa").bold().break().font("arial");
						}
						paragraph.createTextRun("Motivo: " + programada.Motivomtto).break().font("arial");
						paragraph.createTextRun("Causa: " + programada.Causa).break().font("arial");

					}
					if (programada.Comentario && that.society != 300) paragraph.createTextRun("Comentarios: " + programada.Comentario).break().font(
						"arial");

					/*paragraph.createTextRun("Se informó a CAMMESA el " + FormatHelper.formatDate(programada.FinfCammesa) + " a las " + FormatHelper.formatTime(
						programada.FinfCammesa) + " hs.").break().break();*/

				}

				if (programadas.length) {
					var titulo = doc.createParagraph().center();
					titulo.createTextRun("PROGRAMADAS").bold().underline().break().font("arial").size(22);
					for (var i = 0; i < programadas.length; i++) {
						createProgramada(doc, programadas[i]);
					}
				}
			}

			function addRecierres(doc, recierres) {

				function createRecierre(doc, recierre) {
					var paragraph = doc.createParagraph();
					paragraph.createTextRun(recierre.Equipo + "  " + recierre.DescEquipo).bold().break().font("arial");
					if (recierre.recierre && recierre.GenIndisp) {
						paragraph.createTextRun("Se Produjo el " + FormatHelper.formatDate(recierre.IndDesde) + " a las " + FormatHelper.formatTime(
							recierre.IndDesde) + " hs.").bold().break().font("arial");
					} else {
						paragraph.createTextRun("Se Produjo el " + FormatHelper.formatDate(recierre.InicioNove) + " a las " + FormatHelper.formatTime(
							recierre.InicioNove) + " hs.").bold().break().font("arial");
					}
					paragraph.createTextRun("Causa: " + recierre.Causa).break().font("arial");
					if (recierre.Comentario) paragraph.createTextRun("Comentarios: " + recierre.Comentario).break().font("arial"); //TODO verificar y cambiar
					if (that.society == 300) {
						if (recierre.Recierre) {
							if (!recierre.GenIndisp) {
								paragraph.createTextRun("RECIERRE EXITOSO").break();
							} else {
								paragraph.createTextRun("RECIERRE NO EXITOSO").break();
							}

						}

						if (recierre.pruebas) {
							for (var k = 0; k < recierre.pruebas.length; k++) {
								var prueba = recierre.pruebas[k];
								var text = "Prueba efectuada el " + FormatHelper.formatDate(prueba.HoraPrueba) + " a las " +
									FormatHelper.formatTime(prueba.HoraPrueba) + " - " + prueba.Comentarios;
								paragraph.createTextRun(text).break().font("arial");
							}
						}

						/*if (recierre.seniales.length) paragraph.createTextRun("Señalizaciones registradas").break().font("arial");
						for (var j = 0; j < recierre.seniales.length; j++) {
							var row = recierre.seniales[j];
							var text = "";
							for (var key in row) {
								if (row[key] === true) {
									if (text) text += "-" + key.toUpperCase()
									else text += key.toUpperCase()
								}
							}
							paragraph.createTextRun(text).break().font("arial");
						}*/
						if (recierre.seniales.length) paragraph.createTextRun("Señalizaciones registradas").break().font("arial");
						for (var j = 0; j < recierre.seniales.length; j++) {
							var row = recierre.seniales[j];

							var ezSignals = ["Fn", "Fr", "Fs", "Ft", "Tx", "Rx", "T2", "Ts2"];
							var pzSignals = ["Li", "Rr"];
							var text = "";

							if (row.Senializacion) {
								text += row.Senializacion + " ";
							}

							var row1Signals = ["Rrpi", "Bz", "PITR", "Pito", "Pit1", "Pili"];

							row1Signals.forEach(function (key) {
								if (row[key] === true) {
									if (key === "Pito") key = "Pit0";
									if (text) text += "-" + key.toUpperCase()
									else text += key.toUpperCase()
								}
							});
							if (text) paragraph.createTextRun(text).break().font("arial");
							text = "";

							var row2Signals = ["Fn", "Fr", "Fs", "Ft", "Tx", "Rx", "T2", "Ts2", "Li", "Rr"];

							if (row.Et) {
								text += row.Et + ": ";
							}

							row2Signals.forEach(function (key) {
								if (row[key] === true) {
									if (ezSignals.includes(key)) key = "EZ" + key;
									if (pzSignals.includes(key)) key = "PZ" + key;
									if (text) text += "-" + key.toUpperCase()
									else text += key.toUpperCase()
								}
							});

							if (row.Km) text += " DIST: " + row.Km + " KM";
							if (text) paragraph.createTextRun(text).break().font("arial");
							text = "";

							if (row.Et2) {
								text += row.Et2 + ": ";
							}

							var row3Signals = ["Fn2", "Fr2", "Fs2", "Ft2", "Tx2", "Rx2", "T22", "Ts22", "Li2", "Rr2"];

							row3Signals.forEach(function (key) {
								if (row[key] === true) {
									key = key.slice(0, -1);
									if (ezSignals.includes(key)) key = "EZ" + key;
									if (pzSignals.includes(key)) key = "PZ" + key;
									if (text) text += "-" + key.toUpperCase()
									else text += key.toUpperCase()
								}
							});

							if (row.Km2) text += " DIST: " + row.Km2 + " KM";
							if (text) paragraph.createTextRun(text).break().font("arial");

						}
					}

					/*					if (recierre.Recierre) {
											paragraph.createTextRun("RECIERRE EXITOSO").break();
										}
										paragraph.createTextRun("Comentarios: " + recierre.Comentario).break();*/
					/*if(recierre.UbicFalla)*/
					paragraph.createTextRun("Ubicación de la falla: " + recierre.UbicFalla).break().break().font("arial");
					/*if(recierre.EstadoTiempo)*/
					paragraph.createTextRun("Estado del Tiempo: " + that.formatEstadoTiempo(recierre.EstadoTiempo)).break().font("arial");
					paragraph.createTextRun("Dispositivo Actuante: " + that.formatDispAct(recierre.DispAct)).break().font("arial");
					//paragraph.createTextRun("Tipificación de la falla: " + that.getTipificacionFallaDesc(recierre.TipoFalla)).break();

				}

				if (recierres.length) {
					var titulo = doc.createParagraph().center();
					titulo.createTextRun("RECIERRES").bold().underline().break().font("arial").size(22);
					for (var i = 0; i < recierres.length; i++) {
						createRecierre(doc, recierres[i]);
					}
				}
			}

			function addComentarios(doc, comentarios) {

				function createComentario(doc, comentario) {
					var paragraph = doc.createParagraph();
					var parts = comentario.Comentario.split("\n");
					for (var i = 0; i < parts.length; i++) {
						paragraph.createTextRun(parts[i]).break().font("arial");
					}
					//paragraph.createTextRun(comentario.Comentario).break();
				}

				if (comentarios.length) {
					var titulo = doc.createParagraph().center();
					titulo.createTextRun("COMENTARIOS GENERALES").bold().underline().break().font("arial").size(22);
					for (var i = 0; i < comentarios.length; i++) {
						createComentario(doc, comentarios[i]);
					}
				}
			}

			var fechas = this.reportesDBFFechas;

			var filters = this.reporteDBFFilters;
			filters.push(new sap.ui.model.Filter({
				path: "Empresa",
				operator: sap.ui.model.FilterOperator.EQ,
				value1: this.society
			}));
			this.globalBusyDialog.open();
			var premises = [];
			premises.push(ReportesService.getInformeDiario(filters));
			var destinatariosFilters = [new sap.ui.model.Filter({
				path: "Empresa",
				operator: sap.ui.model.FilterOperator.EQ,
				value1: this.society
			})];
			premises.push(ReportesService.getDestinatarios(destinatariosFilters));

			Promise.all(premises).then(function (res) {
				var informes = res[0];

				var novedadesPromise = [];

				var service = oDataService.getModel("TransenerOperaciones");
				/*var lineaPromise = new Promise(function (resolve, reject) {
					service.read("/InfPnlzLineasSet", {
						filters: filters,
						success: resolve,
						error: reject
					});
				});*/
				if (that.society == 300) {
					for (var i = 0; i < informes.length; i++) {
						var novedad = informes[i];
						if (novedad.Tipo == "2" || novedad.Tipo == "4") {
							continue;
						}
						var entity = "/NovedadesServicioSet(IdNovedad='" + novedad.IdNovedad +
							"',Empresa='" + novedad.Empresa + "')";
						var expands = "SenialXNS_nav,PruebasXNS_nav,ENSRegXNS_NAV";

						novedadesPromise.push(new Promise(function (resolve, reject) {
							var nov = novedad;
							var responseFunc = function (response) {
								resolve({
									res: response,
									novedad: nov
								});
							}

							service.read(entity, {
								urlParameters: {
									"$expand": expands
								},
								success: responseFunc,
								error: reject
							});
						}));
					}
				}

				var destinatarios = res[1];

				Promise.all(novedadesPromise).then(function (resNovedades) {
					//debugger;
					for (var i = 0; i < resNovedades.length; i++) {
						var nov = resNovedades[i];
						var inf = nov.novedad;

						inf.seniales = nov.res.SenialXNS_nav.results;
						inf.pruebas = nov.res.PruebasXNS_nav.results;
						inf.ens = nov.res.ENSRegXNS_NAV.results;
						//informes.push(inf);
					}
					//debugger;
					//TODO informediario

					destinatarios.sort(function (a, b) {
						return a.orden - b.orden;
					});

					var fechasDiarias = [];
					for (var i = 0; i < fechas.length; i++) {
						var fecha = fechas[i];
						var final = new Date(fecha);
						final.setHours(23, 59, 59, 999);
						fechasDiarias[i] = {
							forzadas: [],
							programadas: [],
							recierres: [],
							comentariosGenerales: []
						};
						informes.forEach(function (el) {
							var diaNovedad = new Date(el.InicioNove);
							diaNovedad.setHours(0, 0, 0, 0);
							if (that.society == 300) {
								//transba
								var fechaTransba = fecha;
								fechaTransba.setHours(0, 0, 0, 0);
								if (fecha.getTime() != diaNovedad.getTime()) {
									return;
								}
							} else {
								//transener
								if (fecha >= diaNovedad) {
									if (el.EntServ) {
										if (el.EntServ < fecha) {
											return;
										}
										if (el.EntServ < final) {
											el.finalizada = true;
										}
									} else {
										el.finalizada = false;
									}
								} else {
									return;
								}
							}

							switch (el.Tipo) {
								case "1":
									fechasDiarias[i].forzadas.push(el);
									break;
								case "2":
									fechasDiarias[i].programadas.push(el);
									break;
								case "3":
									if (diaNovedad.getTime() == fecha.getTime()) {
										fechasDiarias[i].recierres.push(el);
									}
									break;
								case "4":
									//TODO creo que solo lo agrega el primer dia
									if (diaNovedad.getTime() == fecha.getTime()) {
										fechasDiarias[i].comentariosGenerales.push(el);
									}

									break;
							}
						});
					}

					//console.log(fechasDiarias);

					/*var forzadas = informes.filter(function (el) {
						return el.Tipo == 1;
					});
					var programadas = informes.filter(function (el) {
						return el.Tipo == 2;
					});
					var recierres = informes.filter(function (el) {
						return el.Tipo == 3;
					});
					var comentariosGenerales = informes.filter(function (el) {
						return el.Tipo == 4;
					});*/

					var imgTransener = that.imageUrl;
					//imgTransener = this.imageUrl;
					var doc = new Document({
						pageNumberStart: 1,
						pageNumberFormatType: PageNumberFormat.DECIMAL,
					});
					if (that.imageUrl) {
						if (that.society == 100) {
							doc.Header.createImage(imgTransener, 140, 55);
						} else {
							doc.Header.createImage(imgTransener, 140, 55);
						}
					}
					//TODO arial 10 y arial 11 para fechas, y los titulos, forzadas, comentarios, etc
					//.font("arial")  .size(22)
					var paragraph = doc.Header.createParagraph().createBorder();
					paragraph.Borders.addBottomBorder("black", "100", "single", "10");
					paragraph.center().createTextRun("COMUNICACION INTERNA").bold().font("arial").size(22);

					doc.Header.createParagraph().createTextRun().break();

					var fechaHoy = doc.createParagraph().right();
					//fechaHoy.createTextRun().break();
					fechaHoy.createTextRun("Fecha: " + FormatHelper.formatDate(new Date())).bold().font("arial").size(22);

					addDestinatarios(doc, destinatarios);

					var paragraph = doc.createParagraph();
					paragraph.createTextRun("DE: ").bold().break().font("arial").size(22);
					paragraph.createTextRun("CENTRO DE CONTROL").tab().font("arial").size(22);

					paragraph = doc.createParagraph();
					paragraph.createTextRun("REF: ").bold().break().font("arial").size(22);
					paragraph.createTextRun("NOVEDADES DE SERVICIO").tab().font("arial").size(22);

					/*var fecha2 = doc.createParagraph().right();
					fecha2.createTextRun("Fecha:" + FormatHelper.formatDate(new Date())).bold().underline();*/
					const dias = [
						'Domingo',
						'Lunes',
						'Martes',
						'Miércoles',
						'Jueves',
						'Viernes',
						'Sábado',
					];
					for (var i = 0; i < fechasDiarias.length; i++) {
						var fechaActual = fechasDiarias[i];
						var fechaDia = fechas[i];
						if (!(fechaActual.forzadas.length || fechaActual.programadas.length ||
							fechaActual.recierres.length || fechaActual.comentariosGenerales.length)) {
							continue;
						}
						var numeroDia = new Date(fechaDia).getDay();
						var nombreDia = dias[numeroDia];
						doc.createParagraph().right()
							.createTextRun("Fecha: " + nombreDia + " " + FormatHelper.formatDate(fechaDia)).bold().underline().font("arial").size(22);

						/*//////// SECCIÓN FORZADAS ////////*/
						function sortByInicioNove(el1, el2) {
							var a = el1.InicioNove.getTime();
							var b = el2.InicioNove.getTime();

							if (a < b) { // a comes first
								return -1
							} else if (b < a) { // b comes first
								return 1
							} else { // equal, so order is irrelevant
								return 0 // note: sort is not necessarily stable in JS
							}
						}
						fechaActual.forzadas.sort(sortByInicioNove);
						addForzadas(doc, fechaActual.forzadas);

						/*//////// SECCIÓN PROGRAMADAS ////////*/
						fechaActual.programadas.sort(sortByInicioNove);
						addProgramadas(doc, fechaActual.programadas);

						/*//////// SECCIÓN RECIERRES ////////*/
						fechaActual.recierres.sort(sortByInicioNove);
						addRecierres(doc, fechaActual.recierres);

						/*//////// SECCIÓN COMENTARIOS GENERALES ////////*/
						fechaActual.comentariosGenerales.sort(sortByInicioNove);
						addComentarios(doc, fechaActual.comentariosGenerales);
					}

					/*var titulo3 = doc.createParagraph().center();
					titulo3.createTextRun("COMENTARIOS GENERALES").bold().underline().break();

					var body6 = doc.createParagraph();
					body6.createTextRun("Control de Tensión").bold().break();
					body6.createTextRun("A solicitud de Cammesa se operó fuera de banda:").break().break();

					doc.createParagraph().bullet().createTextRun(
						"De 00:00 a 24:00 hs y continúa en la ET RE 142 kV, por requerimiento de TRANSNOA, por baja tensión en Catamarca.").break();
					doc.createParagraph(
						"De 00:00 a 24:00 hs y continúa en la ET LA 142 kV, por requerimiento de TRANSNOA, por baja tensión en La Rioja").bullet();
					doc.createParagraph(
						"De 00:00 a 24:00 hs y continúa en la ET SI (T2SI) 142 kV, por requerimiento de EMSA por baja tensión en ET Puerto Mineral (ante falla en el sistema de EMSA)."
					).bullet();
					doc.createParagraph(
						"De 00:00 a 03:06 hs y de 07:58 a 24:00 hs y continúa en la ET OL-TIBA 141 kV por requerimiento de TRANSBA por baja tensión en La Costa, en ambos períodos."
					).bullet();
					doc.createParagraph("De 00:00 a 24:00 hs y continúa en la ET LU 140 kV, por requerimiento de EDESAL, por baja tensión en San Luis.")
						.bullet();
					doc.createParagraph("De 18:25 a 20:50 hs en la ET ST 140 kV, por requerimiento de la EPESF, por baja tensión en Ceres").bullet();
					doc.createParagraph("De 19:25 a 20:42 hs en la ET RO 140 kV, por requerimiento de la EPESF por baja tensión en Cañada de Gómez.").bullet();
					doc.createParagraph(
						"De 20:14 a 24:00 hs y continúa en la ET BR 140 kV, por requerimiento de TRANSNOA por baja tensión en Santiago del Estero.").bullet();

					doc.createParagraph("Ing. Alfonso Burbaud").right();*/

					var packer = new Packer();
					var empresa = "";
					var documentName = "";

					if (that.society === "100") {
						empresa = "TRANSENER";
						documentName = "Informe Diario " + empresa + ".docx";
					} else {
						documentName = "NOV " +
							that.formatDate(fechaDesde).replace(new RegExp("/", 'g'), "") + ".docx";
					}

					packer.toBlob(doc).then(blob => {
						saveAs(blob, documentName);
						that.globalBusyDialog.close();
					});
				});

				return;

			});

			return;

		},

		reportesPDF: function () {
			var that = this;

			// this.dialogReportes = new sap.m.Dialog({
			// 	type: sap.m.DialogType.Message,
			// 	title: "Seleccione el reporte que desee descargar",
			// 	escapeHandler: function (oPromise) {
			// 		oPromise.reject();
			// 	},
			// 	content: [
			// 		new sap.m.VBox({
			// 			items: [
			// 				new sap.m.Button({
			// 					text: "Reporte ENRE Salidas",
			// 					press: [that.reportePDFENRESalidas, that]
			// 				}),
			// 				new sap.m.Button({
			// 					text: "Reporte ENRE Capacidad Transporte",
			// 					press: [that.reportePDFENRECapacidadTransporte, that]
			// 				}),
			// 				new sap.m.Button({
			// 					text: "Reporte ENRE Potencia Reactiva",
			// 					press: [that.reportePDFENREPotenciaReactiva, that]
			// 				}),
			// 				new sap.m.Button({
			// 					text: "Reporte ENRE Transformacion",
			// 					press: [that.reportePDFENRETransformacion, that]
			// 				}),
			// 			]
			// 		})
			// 	],
			// 	buttons: [
			// 		new sap.m.Button({
			// 			//icon: "sap-icon://save",
			// 			type: sap.m.ButtonType.Emphasized,
			// 			text: "Cerrar",
			// 			press: [function () {
			// 				this.dialogReportes.close()
			// 			}, this]
			// 		})
			// 	]
			// });

			this.getView().addDependent(this.dialogReportes);

			var model = AppManagementHelper.getModel("InformeFiltersJsonModel");
			model.setData({});
			this.dialogReportesPDF = new sap.m.Dialog({
				type: sap.m.DialogType.Message,
				title: "Reportes ENRE",
				escapeHandler: function (oPromise) {
					oPromise.reject();
				},
				content: [
					new sap.m.VBox({
						items: [
							new sap.m.HBox({
								items: [
									new sap.m.Label({
										text: "Reporte",
										width: "100px"
									}).addStyleClass("CustomLabel"),
									new sap.m.ComboBox({
										selectionChange: [this.onSelectReporte, this],
										selectedKey: "{InformeFiltersJsonModel>/Reporte}",
										items: [
											new sap.ui.core.Item({
												key: "R01",
												text: "ENRE Salidas"
											}),
											new sap.ui.core.Item({
												key: "R02",
												text: "ENRE Capacidad de Transporte"
											}),
											new sap.ui.core.Item({
												key: "R03",
												text: "ENRE Potencia Reactiva"
											}),
											new sap.ui.core.Item({
												key: "R04",
												text: "ENRE Transformación"
											})
										],
										layoutData: new sap.m.FlexItemData({
											growFactor: 1
										}),
										width: "100%"
									})
								]
							}),
							new sap.m.HBox({
								items: [
									new sap.m.Label({
										text: "Empresa",
										width: "100px"
									}).addStyleClass("CustomLabel"),
									new sap.m.ComboBox({
										selectedKey: "{InformeFiltersJsonModel>/Empresa}",
										items: {
											path: "NSEmpresasSet>/Empresas",
											template: new sap.ui.core.Item({
												key: "{NSEmpresasSet>CodEmpresa}",
												text: "{NSEmpresasSet>CodEmpresa}"
											})
										},
										layoutData: new sap.m.FlexItemData({
											growFactor: 1
										}),
										width: "120px"
									}),
									new sap.m.ComboBox({
										selectedKey: "{InformeFiltersJsonModel>/Empresa}",
										items: {
											path: "NSEmpresasSet>/Empresas",
											template: new sap.ui.core.Item({
												key: "{NSEmpresasSet>CodEmpresa}",
												text: "{NSEmpresasSet>Descripcion}"
											})
										},
										layoutData: new sap.m.FlexItemData({
											growFactor: 6
										}),
										width: "100%"
									})
								]
							}),
							new sap.m.HBox({
								items: [
									new sap.m.HBox({
										items: [
											new sap.m.Label({
												text: "Desde",
												width: "100px"
											}).addStyleClass("CustomLabel"),
											new sap.m.DatePicker({
												dateValue: "{InformeFiltersJsonModel>/desde}",
											})
										]
									}),
									new sap.m.HBox({
										items: [
											new sap.m.Label({
												text: "Hasta",
												width: "100px"
											}).addStyleClass("CustomLabel"),
											new sap.m.DatePicker({
												dateValue: "{InformeFiltersJsonModel>/hasta}",
											})
										]
									})
								]
							})
						]
					})
				],
				buttons: [
					new sap.m.Button({
						//icon: "sap-icon://save",
						type: sap.m.ButtonType.Emphasized,
						text: "Exportar",
						press: [function () {
							var filters = [];
							var filtersData = AppManagementHelper.getModel("InformeFiltersJsonModel").getData();

							/* (filtersData.Empresa == "" || typeof (filtersData.Empresa) == "undefined") {
								sap.m.MessageBox.alert("Debe seleccionar la Empresa", {
									title: "Filtros reporte"
								});
								return false;
							}*/
							if (filtersData.Empresa) {
								filters.push(new sap.ui.model.Filter({
									path: "Empresa",
									operator: sap.ui.model.FilterOperator.EQ,
									value1: filtersData.Empresa
								}));
							}

							filters.push(new sap.ui.model.Filter({
								path: "Sociedad",
								operator: sap.ui.model.FilterOperator.EQ,
								value1: this.society
							}));
							if (!(filtersData.desde && filtersData.hasta)) {
								sap.m.MessageBox.alert("Debe seleccionar fecha desde y fecha hasta", {
									title: "Filtros reporte"
								});
								return;
							}
							filtersData.hasta.setHours(23, 59, 59, 999);

							filters.push(new sap.ui.model.Filter("Fecsalida", sap.ui.model.FilterOperator.BT, filtersData.desde, filtersData.hasta));

							that.reportesPDFFilters = filters;
							var filtersData = AppManagementHelper.getModel("InformeFiltersJsonModel").getData();

							switch (filtersData.Reporte) {
								case "R01":
									that.reportePDFENRESalidas(that);
									break;
								case "R02":
									that.reportePDFENRECapacidadTransporte(that);
									break;
								case "R03":
									that.reportePDFENREPotenciaReactiva(that);
									break;
								case "R04":
									that.reportePDFENRETransformacion(that);
									break;
							}
							//this.dialogReportesPDF.close();
							//this.dialogReportes.open();
						}, this]
					}),
					new sap.m.Button({
						//icon: "sap-icon://save",
						type: sap.m.ButtonType.Emphasized,
						text: "Cancelar",
						press: [function () {
							this.dialogReportesPDF.close();
						}, this]
					})
				]
			});

			this.getView().addDependent(this.dialogReportesPDF);

			this.dialogReportesPDF.open();
		},

		formatDate: function (date) {
			var datePattern = sap.ui.core.format.DateFormat.getDateTimeInstance({
				pattern: "dd/MM/yyyy"
			});

			if (!date || date.length) return date;
			return datePattern.format(date);
		},

		formatTimeRPDF: function (date) {
			var timePattern = sap.ui.core.format.DateFormat.getDateTimeInstance({
				pattern: "HH:mm"
			});

			if (!date || date.length) return date;
			if (date.ms || date.ms === 0) {
				return timePattern.format(new Date(date.ms + new Date().getTimezoneOffset() * 60 * 1000));
			}
			return timePattern.format(date);
		},

		formatDateTime: function (date) {
			var pattern = sap.ui.core.format.DateFormat.getDateTimeInstance({
				pattern: "dd/MM/yyyy HH:mm"
			});

			if (!date || date.length) return date;
			if (date.ms || date.ms === 0) {
				return pattern.format(new Date(date.ms));
			}
			return pattern.format(date);
		},

		getFilterEmpresa: function () {
			var empresas = AppManagementHelper.getModel("NSEmpresasSet").getData().Empresas;
			var CodEmpresa = AppManagementHelper.getModel("InformeFiltersJsonModel").getData().Empresa;
			if (!CodEmpresa) return "";
			var found = empresas.find(function (el) {
				return el.CodEmpresa == CodEmpresa;
			});
			if (!found) {
				return "";
			}
			return found.Descripcion;
		},

		reportePDFENRESalidas: function () {
			jQuery.sap.registerModulePath("index", "https://unpkg.com/jspdf@1.4.1/dist/");
			jQuery.sap.require({
				modName: "index.jspdf",
				type: "min"
			});
			jQuery.sap.registerModulePath("index", "https://unpkg.com/jspdf-autotable@3.0.4/dist/");
			jQuery.sap.require({
				modName: "index.jspdf",
				type: "plugin.autotable"
			});
			//comentar al terminar los tests
			/*jQuery.sap.registerModulePath("index", "https://unpkg.com/jszip@3.1.5/dist/");
			jQuery.sap.require({
				modName: "index.jszip"
			});
			jQuery.sap.require("Transener/Operaciones/NovedadesServicio/libs/FileSaver");*/

			var that = this;
			var aFilters = this.reportesPDFFilters;
			var filtersData = AppManagementHelper.getModel("InformeFiltersJsonModel").getData();
			if (!filtersData.Empresa) {
				jQuery.sap.registerModulePath("index", "https://unpkg.com/jszip@3.1.5/dist/");
				jQuery.sap.require({
					modName: "index.jszip"
				});

				jQuery.sap.require("Transener/Operaciones/NovedadesServicio/libs/FileSaver");

				var empresas = AppManagementHelper.getModel("NSEmpresasSet").getData().Empresas;

				function reflect(promise) {
					return promise.then(function (res) {
						return {
							res: res,
							status: "resolved"
						}
					},
						function (err) {
							return {
								err: err,
								status: "rejected"
							}
						});
				}

				var promises = [];
				this.globalBusyDialog.open();
				for (var i = 0; i < empresas.length; i++) {
					var currFilters = aFilters.slice();
					currFilters.push(new sap.ui.model.Filter({
						path: "Empresa",
						operator: sap.ui.model.FilterOperator.EQ,
						value1: empresas[i].CodEmpresa
					}));
					promises.push(getReporteDoc(currFilters, empresas[i].Descripcion));
				}

				Promise.all(promises.map(reflect)).then(function (results) {
					var zip = new JSZip();
					for (var i = 0; i < results.length; i++) {
						var doc = results[i].res;
						var pdfData = doc.output("blob");
						zip.file(`ENRE-Salidas-${empresas[i].CodEmpresa}.pdf`, pdfData, {
							base64: true
						});
					}
					zip.generateAsync({
						type: "blob"
					})
						.then(function (content) {
							// see FileSaver.js

							that.globalBusyDialog.close();
							saveAs(content, "ENRE-Salidas.zip");
						});
				});

				return;
			}
			this.globalBusyDialog.open();
			getReporteDoc(aFilters, that.getFilterEmpresa()).then(function (doc) {
				that.globalBusyDialog.close();
				doc.save("ENRE-Salidas.pdf");
			});

			function getReporteDoc(filters, empresa) {
				return new Promise(function (resolve, reject) {
					ReportesService.getEnreSalidas(filters).then(function (data) {
						var estaciones = AppManagementHelper.getModel("EstacionesJsonModel").getProperty("/Estaciones");

						function searchEstacion(code) {
							for (var i = 0; i < estaciones.length; i++) {
								if (code === estaciones[i].Codigo) {
									return estaciones[i].Descripcion;
								}
							}
							return code; //esto no deberia volver 
						}

						var datePattern = sap.ui.core.format.DateFormat.getDateTimeInstance({
							pattern: "dd/MM/yyyy HH:mm"
						});

						function formatDate(date) {
							if (!date || date.length) return date;
							return datePattern.format(date);
						}

						var timePattern = sap.ui.core.format.DateFormat.getDateTimeInstance({
							pattern: "HH:mm"
						});

						function formatTime(date) {
							if (!date || date.length) return date;
							return timePattern.format(date);
						}

						var doc = new jsPDF({
							format: "a3",
							orientation: 'l',
							unit: "mm"
						});

						var imageUrl = that.imageUrl;
						if (that.imageUrl) {
							if (that.society == 100) {
								doc.addImage(imageUrl, 'PNG', 10, 10, 40, 15);
							} else {
								doc.addImage(imageUrl, 'PNG', 10, 10, 50, 13);
							}
						}
						doc.setFontSize(14);
						doc.setFontType("bold");
						doc.text(70, 10, "SISTEMA DE TRANSPORTE DE ENERGIA EN ALTA TENSION");
						doc.setFontSize(22);
						doc.text(70, 18, "CARGOS POR CONEXION - SALIDAS ( " + empresa + " )");
						doc.setFontType("normal");
						doc.setFontSize(8);
						var filtersData = AppManagementHelper.getModel("InformeFiltersJsonModel").getData();
						var desde = that.formatDate(filtersData.desde);
						var hasta = that.formatDate(filtersData.hasta);
						doc.text(70, 24, "Del " + desde + " al " + hasta + "");

						var newData = data.results.map(function (el) {
							el.EstacionDesc = searchEstacion(el.Estacion);
							el.Horaentrada = that.formatTimeRPDF(el.Fecentrasa);
							el.Fecentrasa = that.formatDate(el.Fecentrasa);
							el.Horasalida = that.formatTimeRPDF(el.Fecsalida);
							el.Fecsalida = that.formatDate(el.Fecsalida);
							el.Horainfcammesa = that.formatTimeRPDF(el.Horainfcammesa);

							for (var x in el) {
								if (el[x] === null || el[x] === undefined) {
									el[x] = "";
								}
							}
							//el.EntIndisFormat = formatDate(el.EntIndis);
							//el.EntDispoFormat = formatDate(el.EntDispo);

							//el.Autcammesa = el.Autcammesa ? "S" : "N";
							el.text = el.Motivo;
							return el;
						});

						var headers = [{
							Orden: "(1)",
							EstacionDesc: "(2)",
							Equipo: "(3)",
							Kv: "(4)",
							Fecsalida: "(5)",
							Horasalida: "(6)",
							Fecentrasa: "(7)",
							Horaentrada: "(8)",
							Tipoind: "(9)",
							Autorizacammesa: "(10)",
							Horainfcammesa: "(11)",
							text: "(12)",
						}, {
							Orden: "N°\nOrden",
							EstacionDesc: "\nEstacion\nTransformadora",
							Equipo: "Equipo",
							Kv: "K.V.",
							Fecsalida: "Salida Fecha",
							Horasalida: "Salida Hora",
							Fecentrasa: "Entrada Fecha",
							Horaentrada: "Entrada Hora",
							Tipoind: "Tipo\nIndisp.",
							Autorizacammesa: "Autoriz.\nCAMMESA",
							Horainfcammesa: "Hora Inf.\nCAMMESA",
							text: "Motivo de la Insdisponibilidad"
						}];

						var colLongs = [{
							"dataKey": "Orden"
						}, {
							"dataKey": "EstacionDesc"
						}, {
							"dataKey": "Equipo"
						}, {
							"dataKey": "Kv"
						}, {
							"dataKey": "Fecsalida"
						}, {
							"dataKey": "Horasalida"
						}, {
							"dataKey": "Fecentrasa"
						}, {
							"dataKey": "Horaentrada"
						}, {
							"dataKey": "Tipoind"
						}, {
							"dataKey": "Autorizacammesa"
						}, {
							"dataKey": "Horainfcammesa"
						}, {
							"dataKey": "text"
						}];
						doc.autoTable({
							head: headers,
							columns: colLongs,
							body: newData,
							startY: 25,
							margin: {
								horizontal: 7,
								top: 30,
								bottom: 55
							},
							bodyStyles: {
								valign: 'top'
							},
							styles: {
								overflow: 'linebreak',
								cellWidth: 'wrap',
								tableWidth: 300
							},
							columnStyles: {
								text: {
									cellWidth: 'auto'
								}
							},
							didDrawPage: function (data) {
								// Footer
								doc.setFontSize(10);

								// jsPDF 1.4+ uses getWidth, <1.4 uses .width
								var pageSize = doc.internal.pageSize;
								var pageHeight = pageSize.height ? pageSize.height : pageSize.getHeight();

								var text =
									`(1) Número de Orden
(2) Indica Nombre de la ET
(3)Equipamiento Afectado
(4) Tensión de Salida
(5) Día en que la Línea salió de Servicio
(6) Hora en que la Línea salió de Servicio
(7) Día en que la línea entró en Disponibilidad
(7) Hora en que la línea entró en Disponibilidad
(9) Tipo de Indisponibilidad: Forzada(F), Programada(P) o Restringida(R)
(10) Autorizó CAMMESA (Si/No)
(11) Hora en que se informó a CAMMESA.
(12) Motivo de la Indisponibilidad`;
								doc.text(text, data.settings.margin.left, pageHeight - 50);
							},
						});

						resolve(doc);

						//doc.save("ENRE-Salidas.pdf");

					});
				});
			}

		},

		reportePDFENRECapacidadTransporte: function () {
			var that = this;
			jQuery.sap.registerModulePath("index", "https://unpkg.com/jspdf@1.4.1/dist/");
			jQuery.sap.require({
				modName: "index.jspdf",
				type: "min"
			});
			jQuery.sap.registerModulePath("index", "https://unpkg.com/jspdf-autotable@3.0.4/dist/");
			jQuery.sap.require({
				modName: "index.jspdf",
				type: "plugin.autotable"
			});

			var that = this;
			var aFilters = this.reportesPDFFilters;
			var filtersData = AppManagementHelper.getModel("InformeFiltersJsonModel").getData();
			if (!filtersData.Empresa) {
				jQuery.sap.registerModulePath("index", "https://unpkg.com/jszip@3.1.5/dist/");
				jQuery.sap.require({
					modName: "index.jszip"
				});

				jQuery.sap.require("Transener/Operaciones/NovedadesServicio/libs/FileSaver");

				var empresas = AppManagementHelper.getModel("NSEmpresasSet").getData().Empresas;

				function reflect(promise) {
					return promise.then(function (res) {
						return {
							res: res,
							status: "resolved"
						}
					},
						function (err) {
							return {
								err: err,
								status: "rejected"
							}
						});
				}

				var promises = [];
				this.globalBusyDialog.open();
				for (var i = 0; i < empresas.length; i++) {
					var currFilters = aFilters.slice();
					currFilters.push(new sap.ui.model.Filter({
						path: "Empresa",
						operator: sap.ui.model.FilterOperator.EQ,
						value1: empresas[i].CodEmpresa
					}));
					promises.push(getReporteDoc(currFilters, empresas[i].Descripcion));
				}

				Promise.all(promises.map(reflect)).then(function (results) {
					var zip = new JSZip();
					for (var i = 0; i < results.length; i++) {
						var doc = results[i].res;
						var pdfData = doc.output("blob");
						zip.file(`ENRE-Capacidad-de-transporte-${empresas[i].CodEmpresa}.pdf`, pdfData, {
							base64: true
						});
					}
					zip.generateAsync({
						type: "blob"
					})
						.then(function (content) {
							// see FileSaver.js
							that.globalBusyDialog.close();
							saveAs(content, "ENRE-Capacidad-de-transporte.zip");
						});
				});

				return;
			}
			this.globalBusyDialog.open();
			getReporteDoc(aFilters, that.getFilterEmpresa()).then(function (doc) {
				that.globalBusyDialog.close();
				doc.save("ENRE-Capacidad-de-transporte.pdf");
			});

			function getReporteDoc(filters, empresa) {
				return new Promise(function (resolve, reject) {
					ReportesService.getEnreCapacidadTransp(filters).then(function (data) {

						var estaciones = AppManagementHelper.getModel("EstacionesJsonModel").getProperty("/Estaciones");

						function searchEstacion(code) {
							for (var i = 0; i < estaciones.length; i++) {
								if (code === estaciones[i].Codigo) {
									return estaciones[i].Descripcion;
								}
							}
							return code; //esto no deberia volver 
						}

						var datePattern = sap.ui.core.format.DateFormat.getDateTimeInstance({
							pattern: "dd/MM/yyyy HH:mm"
						});

						function formatDate(date) {
							if (!date || date.length) return date;
							return datePattern.format(date);
						}

						var timePattern = sap.ui.core.format.DateFormat.getDateTimeInstance({
							pattern: "HH:mm"
						});

						function formatTime(date) {
							if (!date || date.length) return date;
							return timePattern.format(date);
						}

						var doc = new jsPDF({
							format: "a3",
							orientation: 'l',
							unit: "mm"
						});

						var imageUrl = that.imageUrl;
						if (that.imageUrl) {
							if (that.society == 100) {
								doc.addImage(imageUrl, 'PNG', 10, 10, 40, 15);
							} else {
								doc.addImage(imageUrl, 'PNG', 10, 10, 50, 13);
							}
						}
						doc.setFontSize(14);
						doc.setFontType("bold");
						doc.text(70, 10, "SISTEMA DE TRANSPORTE DE ENERGIA EN ALTA TENSION");
						doc.setFontSize(22);
						doc.text(70, 18, "CARGOS POR CAPACIDAD DE TRANSPORTE ( " + empresa + " )");
						doc.setFontType("normal");
						doc.setFontSize(8);
						var filtersData = AppManagementHelper.getModel("InformeFiltersJsonModel").getData();
						var desde = that.formatDate(filtersData.desde);
						var hasta = that.formatDate(filtersData.hasta);
						doc.text(70, 24, "Del " + desde + " al " + hasta + "");

						var newData = data.results.map(function (el) {
							el.EstacionDesc = searchEstacion(el.Estacion);
							el.Horaentrada = that.formatTimeRPDF(el.Fecentrasa);
							el.Fecentrasa = that.formatDate(el.Fecentrasa);
							el.Horasalida = that.formatTimeRPDF(el.Fecsalida);
							el.Fecsalida = that.formatDate(el.Fecsalida);
							el.Horainfcammesa = that.formatTimeRPDF(el.Horainfcammesa);

							for (var x in el) {
								if (!(el[x] !== null)) {
									el[x] = "";
								}
							}
							//el.EntIndisFormat = formatDate(el.EntIndis);
							//el.EntDispoFormat = formatDate(el.EntDispo);

							//var informeCammesa = el.InformeCammesaSet[0];
							//el.Autcammesa = el.Autcammesa ? "S" : "N";
							el.text = el.Motivo;
							return el;
						});

						var headers = [{
							Orden: "(1)",
							Linea: "(2)",
							Kv: "(3)",
							Km: "(4)",
							Fecsalida: "(5)",
							Horasalida: "(6)",
							Fecentrasa: "(7)",
							Horaentrada: "(8)",
							Tipoind: "(9)",
							Resporcentage: "(10)",
							Rd: "(11)",
							Autcammesa: "(12)",
							Horainfcammesa: "(13)",
							text: "(14)"
						}, {
							Orden: "N°\nOrden",
							Linea: "Linea",
							Kv: "K.V.",
							Km: "KM",
							Fecsalida: "Salida Fecha",
							Horasalida: "Salida Hora",
							Fecentrasa: "Entrada Fecha",
							Horaentrada: "Entrada Hora",
							Tipoind: "Tipo\nIndisp.",
							Resporcentage: "Res%",
							Rd: "RD",
							Autcammesa: "Autoriz.\nCAMMESA",
							Horainfcammesa: "Hora Inf.\nCAMMESA",
							text: "Motivo de la Insdisponibilidad"
						}];

						var colLongs = [{
							"title": "N°\nOrden",
							"dataKey": "Orden"
						}, {
							"title": "Linea",
							"dataKey": "Linea"
						}, {
							"title": "K.V.",
							"dataKey": "Kv"
						}, {
							"title": "KM",
							"dataKey": "Km"
						}, {
							"title": "Salida Fecha",
							"dataKey": "Fecsalida"
						}, {
							"title": "Salida Hora",
							"dataKey": "Horasalida"
						}, {
							"title": "Entrada Fecha",
							"dataKey": "Fecentrasa"
						}, {
							"title": "Entrada Hora",
							"dataKey": "Horaentrada"
						}, {
							"title": "Tipo\nIndisp.",
							"dataKey": "Tipoind"
						}, {
							"title": "Rest%",
							"dataKey": "Resporcentage"
						}, {
							"title": "RD",
							"dataKey": "Rd"
						}, {
							"title": "Autoriz.\nCAMMESA",
							"dataKey": "Autcammesa"
						}, {
							"title": "Hora Inf.\nCAMMESA",
							"dataKey": "Horainfcammesa"
						}, {
							"title": "Motivo de la Insdisponibilidad",
							"dataKey": "text"
						}];
						doc.autoTable({
							head: headers,
							columns: colLongs,
							body: newData,
							startY: 25,
							margin: {
								horizontal: 7,
								top: 30,
								bottom: 60
							},
							bodyStyles: {
								valign: 'top'
							},
							styles: {
								overflow: 'linebreak',
								cellWidth: 'wrap',
								tableWidth: 300
							},
							columnStyles: {
								text: {
									cellWidth: 'auto'
								}
							},
							didDrawPage: function (data) {
								// Footer
								doc.setFontSize(10);

								// jsPDF 1.4+ uses getWidth, <1.4 uses .width
								var pageSize = doc.internal.pageSize;
								var pageHeight = pageSize.height ? pageSize.height : pageSize.getHeight();

								var text =
									`(1) Número de Orden
(2) Indica Nombre de la Línea de ET a ET
(3)Tensión de Servicio de la Línea
(4) Longitud de la Línea
(5) Día en que la Línea salió de Servicio
(6) Hora en que la Línea salió de Servicio
(7) Día en que la línea entró en Disponibilidad
(8) Hora en que la línea entró en Disponibilidad
(9) Tipo de Indisponibilidad: Forzada(F), Programada(P) o Restringida(R)
(10) Factor de Reducción, si lo hubo, en por ciento (FR)
(11) Se activaron D.A.G. y/o desconexión de cargas (RD=Si/No)
(12) Autorizó CAMMESA (Si/No)
(13) Hora en que se informó a CAMMESA.
(14) Motivo de la Indisponibilidad`
								doc.text(text, data.settings.margin.left, pageHeight - 55);
							},
						});
						resolve(doc);
						//doc.save("ENRE-Capacidad-de-transporte.pdf");
					})
				})
			}

		},

		reportePDFENREPotenciaReactiva: function () {
			var that = this;
			jQuery.sap.registerModulePath("index", "https://unpkg.com/jspdf@1.4.1/dist/");
			jQuery.sap.require({
				modName: "index.jspdf",
				type: "min"
			});
			jQuery.sap.registerModulePath("index", "https://unpkg.com/jspdf-autotable@3.0.4/dist/");
			jQuery.sap.require({
				modName: "index.jspdf",
				type: "plugin.autotable"
			});

			var that = this;
			var aFilters = this.reportesPDFFilters;
			var filtersData = AppManagementHelper.getModel("InformeFiltersJsonModel").getData();
			if (!filtersData.Empresa) {
				jQuery.sap.registerModulePath("index", "https://unpkg.com/jszip@3.1.5/dist/");
				jQuery.sap.require({
					modName: "index.jszip"
				});

				jQuery.sap.require("Transener/Operaciones/NovedadesServicio/libs/FileSaver");

				var empresas = AppManagementHelper.getModel("NSEmpresasSet").getData().Empresas;

				function reflect(promise) {
					return promise.then(function (res) {
						return {
							res: res,
							status: "resolved"
						}
					},
						function (err) {
							return {
								err: err,
								status: "rejected"
							}
						});
				}

				var promises = [];
				this.globalBusyDialog.open();
				for (var i = 0; i < empresas.length; i++) {
					var currFilters = aFilters.slice();
					currFilters.push(new sap.ui.model.Filter({
						path: "Empresa",
						operator: sap.ui.model.FilterOperator.EQ,
						value1: empresas[i].CodEmpresa
					}));
					promises.push(getReporteDoc(currFilters, empresas[i].Descripcion));
				}

				Promise.all(promises.map(reflect)).then(function (results) {
					var zip = new JSZip();
					for (var i = 0; i < results.length; i++) {
						var doc = results[i].res;
						var pdfData = doc.output("blob");
						zip.file(`ENRE-Potencia-Reactiva-${empresas[i].CodEmpresa}.pdf`, pdfData, {
							base64: true
						});
					}
					zip.generateAsync({
						type: "blob"
					})
						.then(function (content) {
							// see FileSaver.js
							that.globalBusyDialog.close();
							saveAs(content, "ENRE-Potencia-Reactiva.zip");
						});
				});

				return;
			}
			this.globalBusyDialog.open();
			getReporteDoc(aFilters, that.getFilterEmpresa()).then(function (doc) {
				that.globalBusyDialog.close();
				doc.save("ENRE-Potencia-Reactiva.pdf");
			});

			function getReporteDoc(filters, empresa) {
				return new Promise(function (resolve, reject) {
					ReportesService.getEnrePotReactiva(filters).then(function (data) {

						var estaciones = AppManagementHelper.getModel("EstacionesJsonModel").getProperty("/Estaciones");

						function searchEstacion(code) {
							for (var i = 0; i < estaciones.length; i++) {
								if (code === estaciones[i].Codigo) {
									return estaciones[i].Descripcion;
								}
							}
							return code; //esto no deberia volver 
						}

						var datePattern = sap.ui.core.format.DateFormat.getDateTimeInstance({
							pattern: "dd/MM/yyyy"
						});

						function formatDate(date) {
							if (!date || date.length) return date;
							return datePattern.format(date);
						}

						var timePattern = sap.ui.core.format.DateFormat.getDateTimeInstance({
							pattern: "HH:mm"
						});

						function formatTime(date) {
							if (!date || date.length) return date;
							if (date.ms) {
								return timePattern.format(new Date(date.ms));
							}
							return timePattern.format(date);
						}

						var doc = new jsPDF({
							format: "a3",
							orientation: 'l',
							unit: "mm"
						});

						var imageUrl = that.imageUrl;
						if (that.imageUrl) {
							if (that.society == 100) {
								doc.addImage(imageUrl, 'PNG', 10, 10, 40, 15);
							} else {
								doc.addImage(imageUrl, 'PNG', 10, 10, 50, 13);
							}
						}
						doc.setFontSize(14);
						doc.setFontType("bold");
						doc.text(70, 10, "SISTEMA DE TRANSPORTE DE ENERGIA EN ALTA TENSION");
						doc.setFontSize(22);
						doc.text(70, 18, "EQUIPAMIENTO DE POTENCIA REACTIVA ( " + empresa + " )");
						doc.setFontType("normal");
						doc.setFontSize(8);
						var filtersData = AppManagementHelper.getModel("InformeFiltersJsonModel").getData();
						var desde = that.formatDate(filtersData.desde);
						var hasta = that.formatDate(filtersData.hasta);
						doc.text(70, 24, "Del " + desde + " al " + hasta + "");

						var newData = data.results.map(function (el) {
							el.EstacionDesc = searchEstacion(el.Estacion);
							el.Horaentrada = that.formatTimeRPDF(el.Fecentrasa);
							el.Fecentrasa = that.formatDate(el.Fecentrasa);
							el.Horasalida = that.formatTimeRPDF(el.Fecsalida);
							el.Fecsalida = that.formatDate(el.Fecsalida);
							el.Horainfcammesa = that.formatTimeRPDF(el.Horainfcammesa);

							for (var x in el) {
								if (el[x] === null || el[x] === undefined) {
									el[x] = "";
								}
							}
							//el.EntIndisFormat = formatDate(el.EntIndis);
							//el.EntDispoFormat = formatDate(el.EntDispo);

							el.text = el.Motivo;
							return el;
						});

						var headers = [{
							Orden: "(1)",
							EstacionDesc: "(2)",
							Equipo: "(3)",
							Mvar: "(4)",
							Fecsalida: "(5)",
							Horasalida: "(6)",
							Fecentrasa: "(7)",
							Horaentrada: "(8)",
							Tipoind: "(9)",
							Autorizacammesa: "(10)",
							Horainfcammesa: "(11)",
							text: "(12)",
						}, {
							Orden: "N°\nOrden",
							EstacionDesc: "\nEstacion\nTransformadora",
							Equipo: "Equipo",
							Mvar: "MV Ar.",
							Fecsalida: "Salida Fecha",
							Horasalida: "Salida Hora",
							Fecentrasa: "Entrada Fecha",
							Horaentrada: "Entrada Hora",
							Tipoind: "Tipo\nIndisp.",
							Autorizacammesa: "Autoriz.\nCAMMESA",
							Horainfcammesa: "Hora Inf.\nCAMMESA",
							text: "Motivo de la Insdisponibilidad"
						}];

						var colLongs = [{
							"title": "N°\nOrden",
							"dataKey": "Orden"
						}, {
							"title": "Estacion\nTransformadora",
							"dataKey": "EstacionDesc"
						}, {
							"title": "Equipo",
							"dataKey": "Equipo"
						}, {
							"title": "MV Ar.",
							"dataKey": "Mvar"
						}, {
							"title": "Salida Fecha",
							"dataKey": "Fecsalida"
						}, {
							"title": "Salida Hora",
							"dataKey": "Horasalida"
						}, {
							"title": "Entrada Fecha",
							"dataKey": "Fecentrasa"
						}, {
							"title": "Entrada Hora",
							"dataKey": "Horaentrada"
						}, {
							"title": "Tipo\nIndisp.",
							"dataKey": "Tipoind"
						}, {
							"title": "Autoriz.\nCAMMESA",
							"dataKey": "Autorizacammesa"
						}, {
							"title": "Hora Inf.\nCAMMESA",
							"dataKey": "Horainfcammesa"
						}, {
							"title": "Motivo de la Insdisponibilidad",
							"dataKey": "text"
						}];
						doc.autoTable({
							head: headers,
							columns: colLongs,
							body: newData,
							startY: 25,
							margin: {
								horizontal: 7,
								top: 30,
								bottom: 55
							},
							bodyStyles: {
								valign: 'top'
							},
							styles: {
								overflow: 'linebreak',
								cellWidth: 'wrap',
								tableWidth: 300
							},
							columnStyles: {
								text: {
									cellWidth: 'auto'
								}
							},
							didDrawPage: function (data) {
								// Footer
								doc.setFontSize(10);

								// jsPDF 1.4+ uses getWidth, <1.4 uses .width
								var pageSize = doc.internal.pageSize;
								var pageHeight = pageSize.height ? pageSize.height : pageSize.getHeight();

								var text =
									`(1) Número de Orden
(2) Indica Nombre de la ET
(3)Equipamiento Afectado
(4) Tensión de Salida
(5) Día en que la Línea salió de Servicio
(6) Hora en que la Línea salió de Servicio
(7) Día en que la línea entró en Disponibilidad
(7) Hora en que la línea entró en Disponibilidad
(9) Tipo de Indisponibilidad: Forzada(F), Programada(P) o Restringida(R)
(10) Autorizó CAMMESA (Si/No)
(11) Hora en que se informó a CAMMESA.
(12) Motivo de la Indisponibilidad`
								doc.text(text, data.settings.margin.left, pageHeight - 50);
							},
						});
						resolve(doc);
						//doc.save("ENRE-Potencia-Reactiva.pdf");
					});
				});
			}

		},

		getTipificacionFallaDesc: function (code) {
			var tipificaciones = AppManagementHelper.getModel("TipificacionesFallas").getProperty("/TipificacionesFallas");
			var encontrada = tipificaciones.find(function (el) {
				return el.Valkey == code;
			});
			return (encontrada && encontrada.Valtext) || "";
		},

		reportePDFENRETransformacion: function () {
			var that = this;
			jQuery.sap.registerModulePath("index", "https://unpkg.com/jspdf@1.4.1/dist/");
			jQuery.sap.require({
				modName: "index.jspdf",
				type: "min"
			});
			jQuery.sap.registerModulePath("index", "https://unpkg.com/jspdf-autotable@3.0.4/dist/");
			jQuery.sap.require({
				modName: "index.jspdf",
				type: "plugin.autotable"
			});

			var that = this;
			var aFilters = this.reportesPDFFilters;
			var filtersData = AppManagementHelper.getModel("InformeFiltersJsonModel").getData();
			if (!filtersData.Empresa) {
				jQuery.sap.registerModulePath("index", "https://unpkg.com/jszip@3.1.5/dist/");
				jQuery.sap.require({
					modName: "index.jszip"
				});

				jQuery.sap.require("Transener/Operaciones/NovedadesServicio/libs/FileSaver");

				var empresas = AppManagementHelper.getModel("NSEmpresasSet").getData().Empresas;

				function reflect(promise) {
					return promise.then(function (res) {
						return {
							res: res,
							status: "resolved"
						}
					},
						function (err) {
							return {
								err: err,
								status: "rejected"
							}
						});
				}

				var promises = [];
				this.globalBusyDialog.open();
				for (var i = 0; i < empresas.length; i++) {
					var currFilters = aFilters.slice();
					currFilters.push(new sap.ui.model.Filter({
						path: "Empresa",
						operator: sap.ui.model.FilterOperator.EQ,
						value1: empresas[i].CodEmpresa
					}));
					promises.push(getReporteDoc(currFilters, empresas[i].Descripcion));
				}

				Promise.all(promises.map(reflect)).then(function (results) {
					var zip = new JSZip();
					for (var i = 0; i < results.length; i++) {
						var doc = results[i].res;
						var pdfData = doc.output("blob");
						zip.file(`ENRE-Transformacion-${empresas[i].CodEmpresa}.pdf`, pdfData, {
							base64: true
						});
					}
					zip.generateAsync({
						type: "blob"
					})
						.then(function (content) {
							// see FileSaver.js
							that.globalBusyDialog.close();
							saveAs(content, "ENRE-Transformacion.zip");
						});
				});

				return;
			}
			this.globalBusyDialog.open();
			getReporteDoc(aFilters, that.getFilterEmpresa()).then(function (doc) {
				that.globalBusyDialog.close();
				doc.save("ENRE-Transformacion.pdf");
			});

			function getReporteDoc(filters, empresa) {
				return new Promise(function (resolve, reject) {
					ReportesService.getEnreTransformaciones(filters).then(function (data) {

						var estaciones = AppManagementHelper.getModel("EstacionesJsonModel").getProperty("/Estaciones");

						function searchEstacion(code) {
							for (var i = 0; i < estaciones.length; i++) {
								if (code === estaciones[i].Codigo) {
									return estaciones[i].Descripcion;
								}
							}
							return code; //esto no deberia volver 
						}

						var datePattern = sap.ui.core.format.DateFormat.getDateTimeInstance({
							pattern: "dd/MM/yyyy HH:mm"
						});

						function formatDate(date) {
							if (!date || date.length) return date;
							return datePattern.format(date);
						}

						var timePattern = sap.ui.core.format.DateFormat.getDateTimeInstance({
							pattern: "HH:mm"
						});

						function formatTime(date) {
							if (!date || date.length) return date;
							return timePattern.format(date);
						}

						var doc = new jsPDF({
							format: "a3",
							orientation: 'l',
							unit: "mm"
						});

						var imageUrl = that.imageUrl;
						if (that.imageUrl) {
							if (that.society == 100) {
								doc.addImage(imageUrl, 'PNG', 10, 10, 40, 15);
							} else {
								doc.addImage(imageUrl, 'PNG', 10, 10, 50, 13);
							}
						}
						doc.setFontSize(14);
						doc.setFontType("bold");
						doc.text(70, 10, "SISTEMA DE TRANSPORTE DE ENERGIA EN ALTA TENSION");
						doc.setFontSize(22);
						doc.text(70, 18, "CARGOS POR CONEXION - TRANSFORMACION ( " + empresa + " )");
						doc.setFontType("normal");
						doc.setFontSize(8);
						var filtersData = AppManagementHelper.getModel("InformeFiltersJsonModel").getData();
						var desde = that.formatDate(filtersData.desde);
						var hasta = that.formatDate(filtersData.hasta);
						doc.text(70, 24, "Del " + desde + " al " + hasta + "");

						var newData = data.results.map(function (el) {
							el.EstacionDesc = searchEstacion(el.Estacion);
							el.Horaentrada = that.formatTimeRPDF(el.Fecentrasa);
							el.Fecentrasa = that.formatDate(el.Fecentrasa);
							el.Horasalida = that.formatTimeRPDF(el.Fecsalida);
							el.Fecsalida = that.formatDate(el.Fecsalida);
							el.Horainfcammesa = that.formatTimeRPDF(el.Horainfcammesa);

							for (var x in el) {
								if (el[x] === null || el[x] === undefined) {
									el[x] = "";
								}
							}
							//el.EntIndisFormat = formatDate(el.EntIndis);
							//el.EntDispoFormat = formatDate(el.EntDispo);

							//var informeCammesa = el.InformeCammesaSet[0];
							//el.Autcammesa = el.Autcammesa ? "S" : "N";
							el.text = el.Motivo;
							return el;
						});

						var headers = [{
							Orden: "(1)",
							EstacionDesc: "(2)",
							Equipo: "(3)",
							Potmva: "(4)",
							Kv: "(5)",
							Fecsalida: "(6)",
							Horasalida: "(7)",
							Fecentrasa: "(8)",
							Horaentrada: "(9)",
							Tipoind: "(10)",
							Autoriza: "(11)",
							Res: "(12)",
							Ens: "(13)",
							Horainfcammesa: "(14)",
							text: "(15)"
						}, {
							Orden: "N°\nOrden",
							EstacionDesc: "\nEstacion\nTransformadora",
							Equipo: "Equipo",
							Potmva: "POT\nMVA",
							Kv: "KV",
							Fecsalida: "Salida Fecha",
							Horasalida: "Salida Hora",
							Fecentrasa: "Entrada Fecha",
							Horaentrada: "Entrada Hora",
							Tipoind: "Tipo\nIndisp.",
							Autoriza: "Autoriz.\nCAMMESA",
							Res: "Rest%",
							Ens: "ENS",
							Horainfcammesa: "Hora Inf.\nCAMMESA",
							text: "Motivo de la Insdisponibilidad"
						}];

						var colLongs = [{
							"title": "N°\nOrden",
							"dataKey": "Orden"
						}, {
							"title": "Estacion\nTransformadora",
							"dataKey": "EstacionDesc"
						}, {
							"title": "Equipo",
							"dataKey": "Equipo"
						}, {
							"title": "POT\nMVA",
							"dataKey": "Potmva"
						}, {
							"title": "KV",
							"dataKey": "Kv"
						}, {
							"title": "Salida\nFecha",
							"dataKey": "Fecsalida"
						}, {
							"title": "Salida\nHora",
							"dataKey": "Horasalida"
						}, {
							"title": "Entrada\nFecha",
							"dataKey": "Fecentrasa"
						}, {
							"title": "Entrada\nHora",
							"dataKey": "Horaentrada"
						}, {
							"title": "Tipo\nIndisp.",
							"dataKey": "Tipoind"
						}, {
							"title": "Autoriz.\nCAMMESA",
							"dataKey": "Autoriza"
						}, {
							"title": "rest%",
							"dataKey": "Res"
						}, {
							"title": "ENS",
							"dataKey": "Ens"
						}, {
							"title": "Hora Inf.\nCAMMESA",
							"dataKey": "Horainfcammesa"
						}, {
							"title": "Motivo de la Insdisponibilidad",
							"dataKey": "text"
						}];
						doc.autoTable({
							head: headers,
							columns: colLongs,
							body: newData,
							startY: 25,
							margin: {
								horizontal: 7,
								top: 30,
								bottom: 55
							},
							bodyStyles: {
								valign: 'top'
							},
							styles: {
								overflow: 'linebreak',
								cellWidth: 'wrap',
								tableWidth: 300
							},
							columnStyles: {
								text: {
									cellWidth: 'auto'
								}
							},
							didDrawPage: function (data) {
								// Footer
								doc.setFontSize(10);

								// jsPDF 1.4+ uses getWidth, <1.4 uses .width
								var pageSize = doc.internal.pageSize;
								var pageHeight = pageSize.height ? pageSize.height : pageSize.getHeight();

								var text =
									`(1) Número de Orden
(2) Indica Nombre de la ET
(3) Equipamiento Afectado.
(4) Potencia del Transformador.
(5) Tensión de Servicio (Prim.-Secund.-Terc.)
(6) Día en que la Línea salió de Servicio
(7) Hora en que la Línea salió de Servicio
(8) Día en que la línea entró en Disponibilidad
(9) Hora en que la línea entró en Disponibilidad
(10) Tipo de Indisponibilidad: Forzada(F), Programada(P) o Restringida(R)
(11) Autorizó CAMMESA (Si/No)
(12) Factor de Reducción, si lo hubo, en por ciento (FR)
(13) Se produjo Energía no Suministrada(Si/No)
(14) Hora en que se informó a CAMMESA.
(15) Motivo de la Indisponibilidad`;
								doc.text(text, data.settings.margin.left, pageHeight - 50);
							},
						});
						resolve(doc);
						//doc.save("ENRE-Transformacion.pdf");
					});
				})
			}

		},

		reporteDBF: function () {
			var Reporte = "";
			this.loadNSEmpresas(this.society, Reporte);
			var that = this;
			var model = AppManagementHelper.getModel("InformeFiltersJsonModel");
			model.setData({});

			function exportData(isExcel) {
				//jQuery.sap.registerModulePath("index", "https://unpkg.com/dbf@latest/");
				//jQuery.sap.require("index.dbf");
				jQuery.sap.require("Transener/Operaciones/NovedadesServicio/libs/dbf");
				var filters = [];
				var filtersData = AppManagementHelper.getModel("InformeFiltersJsonModel").getData();

				//TODO remove
				//filtersData.Empresa = "1";

				/*	if (filtersData.Empresa) {
						filters.push(new sap.ui.model.Filter({
							path: "Empresa",
							operator: sap.ui.model.FilterOperator.EQ,
							value1: filtersData.Empresa || ""
						}));
					}*/
				filters.push(new sap.ui.model.Filter({
					path: "Empresa",
					operator: sap.ui.model.FilterOperator.EQ,
					value1: filtersData.Empresa || ""
				}));

				filters.push(new sap.ui.model.Filter({
					path: "Sociedad",
					operator: sap.ui.model.FilterOperator.EQ,
					value1: that.society
				}));

				if (!(filtersData.desde && filtersData.hasta)) {
					sap.m.MessageBox.alert("Debe seleccionar fecha desde y fecha hasta", {
						title: "Filtros reporte"
					});
					return;
				}
				filtersData.hasta.setHours(23, 59, 59, 999);

				filters.push(new sap.ui.model.Filter("InicioNove", sap.ui.model.FilterOperator.BT, filtersData.desde, filtersData.hasta));

				function saveByteArray(reportName, byte) {
					var blob = new Blob([byte], {
						type: "application/pdf"
					});
					var link = document.createElement('a');
					link.href = window.URL.createObjectURL(blob);
					var fileName = reportName;
					link.download = fileName;
					link.click();
				}

				function insert(str, index, value) {
					return str.substr(0, index) + value + str.substr(index);
				}
				that.globalBusyDialog.open();
				ReportesService.getInformeCammesa(filters).then(
					function (data) {
						data = data.map(function (el) {
							delete el.__metadata;
							delete el.Empresa;
							delete el.InicioNove;
							delete el.Sociedad;
							if (el.Fsal === "00000000") {
								el.Fsal = "";
								el.Hsal = "";
								el.Msal = "";
							} else {
								el.Fsal = insert(el.Fsal, 6, "/");
								el.Fsal = insert(el.Fsal, 4, "/");
								el.Fsal = el.Fsal.split("/").reverse().join("/");
							}

							if (el.Fent === "00000000") {
								el.Fent = "";
								el.Hent = "";
								el.Ment = "";
							} else {
								el.Fent = insert(el.Fent, 6, "/");
								el.Fent = insert(el.Fent, 4, "/");
								el.Fent = el.Fent.split("/").reverse().join("/");
							}

							if (el.Finf === "00000000") {
								el.Finf = "";
								el.Hinf = "";
								el.Minf = "";
							} else {
								el.Finf = insert(el.Finf, 6, "/");
								el.Finf = insert(el.Finf, 4, "/");
								el.Finf = el.Finf.split("/").reverse().join("/");
							}

							return el;
						});
						var buf = dbf.structure(data);
						var empresaCode = that.society == 100 ? "TR" : "TB";
						if (isExcel) {

							make_xlsx_lib(XLSX);

							var Sheet = XLSX.utils.json_to_sheet(data);
							var Workbook = XLSX.utils.book_new();
							XLSX.utils.book_append_sheet(Workbook, Sheet, "SheetJS");
							that.globalBusyDialog.close();
							return XLSX.writeFile(Workbook, "Informe a Cammesa XLS_" + empresaCode + ".xlsx", {
								cellStyles: true
							});

						} else {
							saveByteArray("Informe a Cammesa DBF_" + empresaCode + ".dbf", buf.buffer);
							that.globalBusyDialog.close();
						}
					}
				);
			}
			this.dialogReporteDBF = new sap.m.Dialog({
				type: sap.m.DialogType.Message,
				title: "Informe a CAMMESA",
				escapeHandler: function (oPromise) {
					oPromise.reject();
				},
				content: [
					new sap.m.VBox({
						items: [
							new sap.m.HBox({
								items: [
									new sap.m.Label({
										text: "Empresa",
										width: "100px"
									}).addStyleClass("CustomLabel"),
									new sap.m.ComboBox({
										selectedKey: "{InformeFiltersJsonModel>/Empresa}",
										items: {
											path: "NSEmpresasSet>/Empresas",
											template: new sap.ui.core.Item({
												key: "{NSEmpresasSet>CodEmpresa}",
												text: "{NSEmpresasSet>CodEmpresa}"
											})
										},
										layoutData: new sap.m.FlexItemData({
											growFactor: 1
										}),
										width: "120px"
									}),
									new sap.m.ComboBox({
										selectedKey: "{InformeFiltersJsonModel>/Empresa}",
										items: {
											path: "NSEmpresasSet>/Empresas",
											template: new sap.ui.core.Item({
												key: "{NSEmpresasSet>CodEmpresa}",
												text: "{NSEmpresasSet>Descripcion}"
											})
										},
										layoutData: new sap.m.FlexItemData({
											growFactor: 6
										}),
										width: "100%"
									})
								]
							}),
							new sap.m.HBox({
								items: [
									new sap.m.HBox({
										items: [
											new sap.m.Label({
												text: "Desde",
												width: "100px"
											}).addStyleClass("CustomLabel"),
											new sap.m.DatePicker({
												dateValue: "{InformeFiltersJsonModel>/desde}",
											})
										]
									}),
									new sap.m.HBox({
										items: [
											new sap.m.Label({
												text: "Hasta",
												width: "100px"
											}).addStyleClass("CustomLabel"),
											new sap.m.DatePicker({
												dateValue: "{InformeFiltersJsonModel>/hasta}",
											})
										]
									})
								]
							})
						]
					})
				],
				buttons: [
					new sap.m.Button({
						//icon: "sap-icon://save",
						type: sap.m.ButtonType.Emphasized,
						text: "Exportar Excel",
						press: [function () {
							exportData(true);
							//this.dialogReporteDBF.close();
						}, this]
					}),
					new sap.m.Button({
						//icon: "sap-icon://save",
						type: sap.m.ButtonType.Emphasized,
						text: "Exportar",
						press: [function () {
							exportData();
							//this.dialogReporteDBF.close();
						}, this]
					}),
					new sap.m.Button({
						//icon: "sap-icon://save",
						type: sap.m.ButtonType.Emphasized,
						text: "Cerrar",
						press: [function () {
							this.dialogReporteDBF.close();
						}, this]
					})
				]
			});

			this.getView().addDependent(this.dialogReporteDBF);

			this.dialogReporteDBF.open();
		},

		dialogPenalidadesFilter: function () {
			var that = this;
			var model = AppManagementHelper.getModel("InformeFiltersJsonModel");
			model.setData({});
			this.dialogReportePenalidades = new sap.m.Dialog({
				type: sap.m.DialogType.Message,
				title: "Reporte de Penalizaciones",
				escapeHandler: function (oPromise) {
					oPromise.reject();
				},
				content: [
					new sap.m.VBox({
						items: [
							new sap.m.HBox({
								items: [
									new sap.m.HBox({
										items: [
											new sap.m.Label({
												text: "Desde",
												width: "100px"
											}).addStyleClass("CustomLabel"),
											new sap.m.DatePicker({
												dateValue: "{InformeFiltersJsonModel>/desde}",
											})
										]
									}),
									new sap.m.HBox({
										items: [
											new sap.m.Label({
												text: "Hasta",
												width: "100px"
											}).addStyleClass("CustomLabel"),
											new sap.m.DatePicker({
												dateValue: "{InformeFiltersJsonModel>/hasta}",
											})
										]
									})
								]
							})
						]
					})
				],
				buttons: [
					new sap.m.Button({
						//icon: "sap-icon://save",
						type: sap.m.ButtonType.Emphasized,
						text: "Exportar",
						press: [function () {
							//jQuery.sap.registerModulePath("index", "https://unpkg.com/dbf@latest/");
							//jQuery.sap.require("index.dbf");
							jQuery.sap.require("Transener/Operaciones/NovedadesServicio/libs/dbf");
							var filters = [];
							var filtersData = AppManagementHelper.getModel("InformeFiltersJsonModel").getData();

							filters.push(new sap.ui.model.Filter({
								path: "Empresa",
								operator: sap.ui.model.FilterOperator.EQ,
								value1: this.society
							}));

							if (!(filtersData.desde && filtersData.hasta)) {
								sap.m.MessageBox.alert("Debe seleccionar fecha desde y fecha hasta", {
									title: "Filtros reporte"
								});
								return;
							}
							filtersData.hasta.setHours(23, 59, 59, 999);

							filters.push(new sap.ui.model.Filter("Fs", sap.ui.model.FilterOperator.BT, filtersData.desde, filtersData.hasta));
							this.reportePenalidades(filters);
							this.dialogReportePenalidades.close();
						}, this]
					}),
					new sap.m.Button({
						//icon: "sap-icon://save",
						type: sap.m.ButtonType.Emphasized,
						text: "Cancelar",
						press: [function () {
							this.dialogReportePenalidades.close();
						}, this]
					})
				]
			});

			this.getView().addDependent(this.dialogReportePenalidades);

			this.dialogReportePenalidades.open();
		},

		reportePenalidades: function (filters) {
			var that = this;
			var titles = ["Lineas", "Transformadores", "Equipos Reactivos", "Conexiones"];

			var headers = [];
			//lineas

			headers.push(["N° Novedad", "Nombre", "Tension", "KM", "Cat", "FS", "ES", "TipoSal", "Rest", "RD", "Autorizada", "Observaciones",
				"Terceros", "NEMO", "Region"
			]);
			//transformadores
			headers.push(["N° Novedad", "Estacion", "Equipo", "Mva", "Tension", "Fs", "Es", "Tiposal", "Rest", "Ens", "Autorizada", "Observaciones",
				"Terceros", "NEMO", "Region"
			]);
			//equiposReactivos
			headers.push(["N° Novedad", "Estacion", "Equipo", "Mvar", "--", "Fs", "Es", "Tiposal", "Rest", "--", "Autorizada", "Observaciones",
				"Terceros", "NEMO", "Region"
			]);
			//conexiones
			headers.push(["N° Novedad", "Estacion", "Equipo", "Tension", "--", "Fs", "Es", "Tiposal", "--", "--", "Autorizada", "Observaciones",
				"Terceros", "NEMO", "Region", "Descripcion"
			]);

			var allProperties = [];
			//lineas
			allProperties.push(["Idnovedad", "Nombre", "Tension", "Km", "Cat", {
				path: "Fs",
				formatter: this.formatDateTime
			}, {
					path: "Es",
					formatter: this.formatDateTime
				},
				"TipoSalida", "Rest", "RD", "Autorizada", "Observaciones", "Terceros", "Nemo", "Region"
			]);
			//transformadores
			allProperties.push(["Idnovedad", "Estacion", "Equipo", "Mva", "Tension", {
				path: "Fs",
				formatter: this.formatDateTime
			}, {
					path: "Es",
					formatter: this.formatDateTime
				},
				"Tiposal", "Rest", "Ens", "Autorizada", "Observaciones", "Terceros", "Nemo", "Region"
			]);

			//equiposReactivos
			allProperties.push(["Idnovedad", "Estacion", "Equipo", "Mvar", "vacio", {
				path: "Fs",
				formatter: this.formatDateTime
			}, {
					path: "Es",
					formatter: this.formatDateTime
				},
				"Tiposal", "Rest", "vacio", "Autorizada", "Observaciones", "Terceros", "Nemo", "Region"
			]);
			//conexiones
			allProperties.push(["Idnovedad", "Estacion", "Equipo", "Tension", "vacio", {
				path: "Fs",
				formatter: this.formatDateTime
			}, {
					path: "Es",
					formatter: this.formatDateTime
				},
				"Tiposal", "vacio", "vacio", "Autorizada", "Observaciones", "Terceros", "Nemo", "Region", "Descripcion"
			]);
			/*oModeld.read("/EmpresaUsuarioSet";*/
			var service = oDataService.getModel("TransenerOperaciones");
			this.globalBusyDialog.open();
			var lineaPromise = new Promise(function (resolve, reject) {
				service.read("/InfPnlzLineasSet", {
					filters: filters,
					success: resolve,
					error: reject
				});
			});

			var transformadoresPromise = new Promise(function (resolve, reject) {
				service.read("/InfPnlzTransformadoresSet", {
					filters: filters,
					success: resolve,
					error: reject
				});
			});

			var equiposReactivosPromise = new Promise(function (resolve, reject) {
				service.read("/InfPnlzEqReactivosSet", {
					filters: filters,
					success: resolve,
					error: reject
				});
			});

			var conexionesPromise = new Promise(function (resolve, reject) {
				service.read("/InfPnlzConexionesSet", {
					filters: filters,
					success: resolve,
					error: reject
				});
			});

			var premises = [lineaPromise, transformadoresPromise, equiposReactivosPromise, conexionesPromise];

			Promise.all(premises).then(function (responses) {
				responses = responses.map(function (el) {
					return el.results;
				});
				var csv = [];
				for (var i = 0; i < responses.length; i++) {
					csv.push(titles[i]);
					var response = responses[i];
					var header = headers[i];
					var properties = allProperties[i];
					var headerRow = [];
					for (var j = 0; j < header.length; j++) {
						headerRow.push(header[j]);
					}
					csv.push(headerRow.join(";"));

					for (j = 0; j < response.length; j++) {
						var dataRow = response[j];
						var row = [];
						for (var k = 0; k < properties.length; k++) {
							var property = properties[k];
							if (typeof property === 'object') {
								var value = dataRow[property.path];
								//this only accepts values, except the property name
								//the property name is the first value sent to the formatter
								if (property.formatter) {
									if (property.extraParams) {
										var args = [value].concat(property.extraParams);
										value = property.formatter.apply(this, args);
									} else {
										value = property.formatter(value);
									}
								}
								if (value === null || value === undefined) {
									value = "";
								}
								row.push("\"" + value + "\"");
							} else {
								var value = dataRow[property];
								if (value === null || value === undefined) {
									value = "";
								}
								row.push("\"" + value + "\"");
							}
						}
						csv.push(row.join(";"));
					}
					csv.push("");
				}
				var string = csv.join("\n");

				var blob = new Blob(['\ufeff' + string], {
					type: 'text/csv;charset=utf-8;'
				});
				if (navigator.msSaveBlob) { // IE 10+
					navigator.msSaveBlob(blob, "Reporte Penalidades.xls");
					that.globalBusyDialog.close();
				} else {
					var link = document.createElement("a");
					var url = URL.createObjectURL(blob);
					var isSafari = navigator.userAgent.indexOf('Safari') != -1 && navigator.userAgent.indexOf('Chrome') == -1;
					if (isSafari) //if Safari open in new window to save file with random filename.
						link.setAttribute("target", "_blank");
					link.setAttribute("href", url);
					link.setAttribute("download", "Penalizaciones.xls");
					link.style = "visibility:hidden";
					document.body.appendChild(link);
					link.click();
					document.body.removeChild(link);
					that.globalBusyDialog.close();
				}
			});

		},

		isUbicacionEditable: function (formularioEditable, tipoEquipo, viewEquipo) {
			if (!formularioEditable && !viewEquipo) return false;
			var isEditable = !this.lineas.includes(tipoEquipo);
			if (!isEditable) {
				AppManagementHelper.getModel("NovedadesFormJsonModel").setProperty("/Tplnr", "");
			}
			return isEditable;
		},

		isUbicacionEditableConsecuentes: function (tipoEquipo) {
			var isEditable = !this.lineas.includes(tipoEquipo);
			/*if (!isEditable) {
				AppManagementHelper.getModel("ConsecuentesFormJsonModel").setProperty("/CodigoUbicacion", "");
			}*/
			return isEditable;
		},

		getImageUrl: function () {
			var that = this;
			var xhr = new XMLHttpRequest();
			//test webide images/transener.png
			if (that.society === "100") {
				xhr.open("GET", "/sap/fiori/novedadesservicio/webapp/images/transener.png", true);
			} else {
				xhr.open("GET", "/sap/fiori/novedadesservicio/webapp/images/TRANSBA.png", true);
			}

			xhr.responseType = "blob";
			xhr.onload = function (e) {
				//console.log(this.response);
				if (e.srcElement.status >= 400) {
					that.imageUrl = false;
					return;
				}
				var reader = new FileReader();
				reader.onload = function (event) {
					var res = event.target.result;
					that.imageUrl = res;
				};
				var file = this.response;
				reader.readAsDataURL(file);
			};
			xhr.send();
		},

		dialogENREExcel: function () {
			var that = this;
			var model = AppManagementHelper.getModel("InformeFiltersJsonModel");
			model.setData({});

			/*if (this.society == 300) {
				var fromDate = new Date();
				fromDate.setDate(fromDate.getDate() - 1)
				model.setProperty("/desde", fromDate);
				model.setProperty("/hasta", new Date());
			}*/

			this.dialogENREExcel = new sap.m.Dialog({
				type: sap.m.DialogType.Message,
				title: "ENRE 390",
				escapeHandler: function (oPromise) {
					oPromise.reject();
				},
				content: [
					new sap.m.VBox({
						items: [
							new sap.m.HBox({
								items: [
									new sap.m.HBox({
										items: [
											new sap.m.Label({
												text: "Desde",
												width: "100px"
											}).addStyleClass("CustomLabel"),
											new sap.m.DatePicker({
												dateValue: "{InformeFiltersJsonModel>/desde}",
											})
										]
									}),
									new sap.m.HBox({
										items: [
											new sap.m.Label({
												text: "Hasta",
												width: "100px"
											}).addStyleClass("CustomLabel"),
											new sap.m.DatePicker({
												dateValue: "{InformeFiltersJsonModel>/hasta}",
											})
										]
									})
								]
							})
						]
					})
				],
				buttons: [
					new sap.m.Button({
						//icon: "sap-icon://save",
						type: sap.m.ButtonType.Emphasized,
						text: "Exportar",
						press: [function () {
							//var filters = [];
							var filtersData = AppManagementHelper.getModel("InformeFiltersJsonModel").getData();
							if (!filtersData.desde || !filtersData.hasta) {
								return;
							}

							/*function addDay(fecha) {
								var dat = new Date(fecha)
								dat.setDate(dat.getDate() + 1);
								return dat;
							}
							var dateArray = [];*/
							/*var currentDate = new Date(new Date(filtersData.desde).setHours(0, 0, 0, 0));
							while (currentDate <= new Date(new Date(filtersData.hasta).setHours(0, 0, 0, 0))) {
								dateArray.push(currentDate);
								currentDate = addDay(currentDate);
							}*/
							/*if (this.society == 300) {
								filtersData.desde.setHours(6, 0, 0, 0); //6 am
								filtersData.hasta.setHours(6, 0, 0, 0); //6 am
							} else {*/
							filtersData.hasta.setHours(23, 59, 59, 999);
							//}
							//filtersData.hasta.setHours(23, 59, 59, 999);
							//filters.push(new sap.ui.model.Filter("InicioNove", sap.ui.model.FilterOperator.BT, filtersData.desde, filtersData.hasta));
							//this.reporteEnre390Filters = filters;
							//this.reportesDBFFechas = dateArray;
							this.reporteENREExcel(filtersData.desde, filtersData.hasta);
							this.dialogENREExcel.close();
						}, this]
					}),
					new sap.m.Button({
						//icon: "sap-icon://save",
						type: sap.m.ButtonType.Emphasized,
						text: "Cancelar",
						press: [function () {
							this.dialogENREExcel.close();
						}, this]
					})
				]
			});

			this.dialogENREExcel.addStyleClass("customDialog");

			this.getView().addDependent(this.dialogENREExcel);

			this.dialogENREExcel.open();
		},

		reporteENREExcel: function (desde, hasta) {
			//pasado al top
			/*jQuery.sap.registerModulePath("excel", "//unpkg.com/xlsx/dist/");*/

			/* STYLES FOR XLXS */

			//borrado, mantener aca por si se desea tratar de hacer lo de los estilos
			/*jQuery.sap.registerModulePath("styles_xlxs", "//cdnjs.cloudflare.com/ajax/libs/xlsx/0.14.1/");
			jQuery.sap.require({
				modName: "styles_xlxs.xlsx",
				type: "core.min"
			});*/
			var date1 = new Date();
			var date2 = new Date();

			date1.setFullYear(2018);

			ReportesService.getEnre390(desde, hasta).then(function (res) {
				make_xlsx_lib(XLSX);

				var headers = [{
					"ID": "IdNovedad",
					"NOMBRE": "LineaDesc",
					"LONG (li)( Km )": "Longitud",
					"FSAL": "Fsal",
					"HSAL": "Hsal",
					"MSAL": "Msal",
					"FENT": "Fent",
					"HENT": "Hent",
					"MENT": "Ment",
					"TIEMPO (ti)(HS)": "Tiempo",
					"(li x ti)": "Lixti",
					"ENS": "Ens",
					"OBSERVACION": "Observacion"
				}, {
					"ID": "IdNovedad",
					"NOMBRE": "LineaDesc",
					"POTENCIA (Si) ( MVA )": "Potencia",
					"FSAL": "Fsal",
					"HSAL": "Hsal",
					"MSAL": "Msal",
					"FENT": "Fent",
					"HENT": "Hent",
					"MENT": "Ment",
					"TIEMPO (ti)(HS)": "Tiempo",
					"(si x ti)": "Lixti",
					"ENS": "Ens",
					"OBSERVACION": "Observacion"
				}];
				res = res.map(function (res) {
					return res.results;
				})

				function filterForzadaAut(el) {
					return el.ForzadaAut == "A";
				};

				function filterForzada(el) {
					return el.ForzadaAut == "F";
				}

				function mapKeysH0(el) {
					var nuevo = {};
					for (var key in headers[0]) {
						nuevo[key] = el[headers[0][key]];
					}
					return nuevo;
				}

				function mapKeysH1(el) {
					var nuevo = {};
					for (var key in headers[1]) {
						nuevo[key] = el[headers[1][key]];
					}
					return nuevo;
				}

				var tabla1 = res[0].filter(filterForzadaAut).map(mapKeysH0);

				var tabla2 = res[0].filter(filterForzada).map(mapKeysH0);

				var tabla3 = res[1].filter(filterForzadaAut).map(mapKeysH0);

				var tabla4 = res[1].filter(filterForzada).map(mapKeysH0);

				var tabla5 = res[4].filter(filterForzadaAut).map(mapKeysH0);

				var tabla6 = res[4].filter(filterForzada).map(mapKeysH0);

				var tabla7 = res[2].filter(filterForzadaAut).map(mapKeysH1);

				var tabla8 = res[2].filter(filterForzada).map(mapKeysH1);

				var tabla9 = res[3].filter(filterForzadaAut).map(mapKeysH1);

				var tabla10 = res[3].filter(filterForzada).map(mapKeysH1);

				//(Si x ti)

				var dataBook1 = [{
					"NOMBRE": "Gabriel",
					"LONG (li)( Km )": "Contreras",
					"FSAL": "95232423",
					"HSAL": "113243343",
					"MSAL": "acl.gabriel@gmail.com",
					"FENT": "aguero 1229",
					"HENT": "Inclusion Services",
					"MENT": "Vault",
					"TIEMPO (ti)(HS)": "1,77",
					"(li x ti)": "74,2",
					"NS": "NO",
					"OBSERVACION": "Animales, plantaciones, condiciones meteorológicas, nidos de aves y otros objetos que afecten la aislación"
				}, {
					"NOMBRE": "Delvis",
					"LONG (li)( Km )": "Cedeño",
					"FSAL": "953323234",
					"HSAL": "113232243",
					"MSAL": "dcedeno@gmail.com",
					"FENT": "aguero 1229",
					"HENT": "Vault",
					"MENT": "Vault",
					"TIEMPO (ti)(HS)": "1,77",
					"(li x ti)": "74,2",
					"NS": "NO",
					"OBSERVACION": "Otras (desprendimiento hilo de guardia, caída de estructuras por accidente, terceros, pérdida de vínculo de transmisión, corte de conductor o morseto, desprendimiento de puentes, error de conexionado, aisladores, revisión de equipamiento, vandalismo, aislador bushing, enlaces de comunicaciones, extensión horario de trabajo)"
				}, {
					"NOMBRE": "Joel",
					"LONG (li)( Km )": "Crespo",
					"FSAL": "932423434",
					"HSAL": "1129692929",
					"MSAL": "casthielle@gmail.com",
					"FENT": "Segurola 3500",
					"HENT": "Inclusion Services",
					"MENT": "Vault",
					"TIEMPO (ti)(HS)": "1,77",
					"(li x ti)": "74,2",
					"NS": "NO",
					"OBSERVACION": "Falla interna en el equipo de potencia (incluyendo interruptor, seccionador, descargador, trafos de medición, reactores de línea o de tercearios, acoplamiento de O.P., nivel de aceite de cuba y RBC, tableros de control, etc.)"
				}, {
					"NOMBRE": "Carlos",
					"LONG (li)( Km )": "Cohano",
					"FSAL": "932423434",
					"HSAL": "1129692929",
					"MSAL": "casthielle@gmail.com",
					"FENT": "Segurola 3500",
					"HENT": "Inclusion Services",
					"MENT": "Vault",
					"TIEMPO (ti)(HS)": "1,77",
					"(li x ti)": "74,2",
					"NS": "NO",
					"OBSERVACION": "Falla interna en el equipo de potencia (incluyendo interruptor, seccionador, descargador, trafos de medición, reactores de línea o de tercearios, acoplamiento de O.P., nivel de aceite de cuba y RBC, tableros de control, etc.)"
				}];
				var ntL1 = "A" + (4 + tabla1.length + 5);
				var ntLt1 = "A" + (4 + tabla1.length + 3);
				var otherDataBook1 = [{
					"NOMBRE": "Lucas",
					"LONG (li)( Km )": "Andujar",
					"FSAL": "95232423",
					"HSAL": "113243343",
					"MSAL": "acl.gabriel@gmail.com",
					"FENT": "aguero 1229",
					"HENT": "Inclusion Services",
					"MENT": "Vault",
					"TIEMPO (ti)(HS)": "1,77",
					"(li x ti)": "74,2",
					"NS": "NO",
					"OBSERVACION": "Animales, plantaciones, condiciones meteorológicas, nidos de aves y otros objetos que afecten la aislación"
				}, {
					"NOMBRE": "Margarita",
					"LONG (li)( Km )": "Machado",
					"FSAL": "953323234",
					"HSAL": "113232243",
					"MSAL": "dcedeno@gmail.com",
					"FENT": "aguero 1229",
					"HENT": "Vault",
					"MENT": "Vault",
					"TIEMPO (ti)(HS)": "1,77",
					"(li x ti)": "74,2",
					"NS": "NO",
					"OBSERVACION": "Otras (desprendimiento hilo de guardia, caída de estructuras por accidente, terceros, pérdida de vínculo de transmisión, corte de conductor o morseto, desprendimiento de puentes, error de conexionado, aisladores, revisión de equipamiento, vandalismo, aislador bushing, enlaces de comunicaciones, extensión horario de trabajo)"
				}, {
					"NOMBRE": "Pedro",
					"LONG (li)( Km )": "Ramirez",
					"FSAL": "932423434",
					"HSAL": "1129692929",
					"MSAL": "casthielle@gmail.com",
					"FENT": "Segurola 3500",
					"HENT": "Inclusion Services",
					"MENT": "Vault",
					"TIEMPO (ti)(HS)": "1,77",
					"(li x ti)": "74,2",
					"NS": "NO",
					"OBSERVACION": "Falla interna en el equipo de potencia (incluyendo interruptor, seccionador, descargador, trafos de medición, reactores de línea o de tercearios, acoplamiento de O.P., nivel de aceite de cuba y RBC, tableros de control, etc.)"
				}];
				/* Initial row at A2 */
				var ws = XLSX.utils.aoa_to_sheet([
					["FORZADAS AUTORIZADAS -  LINEAS TRANSENER 500 kV"]
				], {
					origin: "A2:E2"
				});
				XLSX.utils.sheet_add_aoa(ws, [
					["FORZADAS - LINEAS TRANSENER 500 kV"]
				], {
					origin: ntLt1
				});
				XLSX.utils.sheet_add_json(ws, tabla2, {
					origin: ntL1
				});

				var posRefCell = "A" + (4 + tabla1.length + tabla2.length + 8);
				var posRefCellContent = "A" + (4 + tabla1.length + tabla2.length + 10);
				var posRefCellContentDEsc = "B" + (4 + tabla1.length + tabla2.length + 10);
				XLSX.utils.sheet_add_aoa(ws, [
					["REFERENCIAS"]
				], {
					origin: posRefCell
				});
				var refBook1 = [
					["ID"],
					["NOMBRE"],
					["LONG (li)(Km)"],
					["FSAL"],
					["HSAL"],
					["MSAL"],
					["FENT"],
					["HENT"],
					["MENT"],
					["TIEMPO (ti)"],
					["(li x ti)"],
					["ENS"],
					["OBSERVACION"]
				];
				var refBook1_2 = [
					["ID de la novedad"],
					["Descripción del Equipo según CAMMESA"],
					["Longitud de la Línea"],
					["Fecha Salida de Servicio"],
					["Hora Salida de Servicio"],
					["Minuto Salida de Servicio"],
					["Fecha Entrada de Servicio"],
					["Hora Entrada de Servicio"],
					["Minuto Entrada de Servicio"],
					["Tiempo (en Horas) de Indisponibilidad"],
					["Longitud de la Línea por Tiempo (en Horas) de Indisponibilidad"],
					["Energía No Suministrada (S: si - N: no)"],
					["Clasificación según PT12 (Procedimiento Técnico de CAMMESA)"]
				];
				XLSX.utils.sheet_add_aoa(ws, refBook1, {
					origin: posRefCellContent
				});
				XLSX.utils.sheet_add_aoa(ws, refBook1_2, {
					origin: posRefCellContentDEsc
				});

				var sheet = XLSX.utils.sheet_add_json(ws, tabla1, {
					sheet: "Test Excel Book 1",
					origin: "A4",
					fill: {
						patternType: "none",
						fgColor: {
							rgb: "FF000000"
						},
						bgColor: {
							rgb: "00000000"
						}
					}
				});

				/* BOOK 2 CONTENT */
				var libro2_datos = [{
					"NOMBRE": "Andres",
					"LONG (li)( Km )": "Andorra",
					"FSAL": "95232423",
					"HSAL": "113243343",
					"MSAL": "acl.gabriel@gmail.com",
					"FENT": "aguero 1229",
					"HENT": "Inclusion Services",
					"MENT": "Vault",
					"TIEMPO (ti)(HS)": "1,77",
					"(li x ti)": "74,2",
					"ENS": "NO",
					"OBSERVACION": "Animales, plantaciones, condiciones meteorológicas, nidos de aves y otros objetos que afecten la aislación"
				}, {
					"NOMBRE": "E.T.RAMALLO SAN NICOLAS 132.0 LI",
					"LONG (li)( Km )": "6",
					"FSAL": "21/12/2016",
					"HSAL": "10",
					"MSAL": "39",
					"FENT": "21/12/2016",
					"HENT": "13",
					"MENT": "07",
					"TIEMPO (ti)(HS)": "1,77",
					"(li x ti)": "74,2",
					"ENS": "NO",
					"OBSERVACION": "Otras (desprendimiento hilo de guardia, caída de estructuras por accidente, terceros, pérdida de vínculo de transmisión, corte de conductor o morseto, desprendimiento de puentes, error de conexionado, aisladores, revisión de equipamiento, vandalismo, aislador bushing, enlaces de comunicaciones, extensión horario de trabajo)"
				}];
				var next_table = "A" + (4 + tabla3.length + 5);
				var next_table_title = "A" + (4 + tabla3.length + 3);
				var libro2_datos_otro = [{
					"NOMBRE": "OTROP",
					"LONG (li)( Km )": "MAN",
					"FSAL": "95232423",
					"HSAL": "113243343",
					"MSAL": "acl.gabriel@gmail.com",
					"FENT": "aguero 1229",
					"HENT": "Inclusion Services",
					"MENT": "Vault",
					"TIEMPO (ti)(HS)": "1,77",
					"(li x ti)": "74,2",
					"ENS": "NO",
					"OBSERVACION": "Animales, plantaciones, condiciones meteorológicas, nidos de aves y otros objetos que afecten la aislación"
				}, {
					"NOMBRE": "E.T.RAMALLO SAN NICOLAS 132.0 LI",
					"LONG (li)( Km )": "6",
					"FSAL": "21/12/2016",
					"HSAL": "10",
					"MSAL": "39",
					"FENT": "21/12/2016",
					"HENT": "13",
					"MENT": "07",
					"TIEMPO (ti)(HS)": "1,77",
					"(li x ti)": "74,2",
					"ENS": "NO",
					"OBSERVACION": "Otras (desprendimiento hilo de guardia, caída de estructuras por accidente, terceros, pérdida de vínculo de transmisión, corte de conductor o morseto, desprendimiento de puentes, error de conexionado, aisladores, revisión de equipamiento, vandalismo, aislador bushing, enlaces de comunicaciones, extensión horario de trabajo)"
				}, {
					"NOMBRE": "VILLA LIA RAMALLO 220.0 1 LI",
					"LONG (li)( Km )": "6",
					"FSAL": "21/12/2016",
					"HSAL": "10",
					"MSAL": "39",
					"FENT": "21/12/2016",
					"HENT": "13",
					"MENT": "07",
					"TIEMPO (ti)(HS)": "1,77",
					"(li x ti)": "74,2",
					"ENS": "NO",
					"OBSERVACION": "Otras (desprendimiento hilo de guardia, caída de estructuras por accidente, terceros, pérdida de vínculo de transmisión, corte de conductor o morseto, desprendimiento de puentes, error de conexionado, aisladores, revisión de equipamiento, vandalismo, aislador bushing, enlaces de comunicaciones, extensión horario de trabajo)"
				}];
				/* Initial row at A2 */
				var ws2 = XLSX.utils.aoa_to_sheet([
					["FORZADAS AUTORIZADAS - LINEAS TRANSENER 220 - 132 kV"]
				], {
					origin: "A2:E2"
				});
				XLSX.utils.sheet_add_aoa(ws2, [
					["FORZADAS - LINEAS TRANSENER 220 - 132 kV"]
				], {
					origin: next_table_title
				});
				XLSX.utils.sheet_add_json(ws2, tabla4, {
					origin: next_table
				});
				var sheet2 = XLSX.utils.sheet_add_json(ws2, tabla3, {
					sheet: "Test Excel Book 2",
					origin: "A4"
				});

				/* BOOK 3 CONTENT */
				var dataBook3 = [{
					"nombre": "Eusebio",
					"apellido": "Labriola",
					"documento": "14895655",
					"telefono": "1166666666",
					"email": "eulab@xx.lc",
					"direccion": "Carabobo 3214",
					"empresa": "AAA"
				}, {
					"nombre": "Juana",
					"apellido": "Giralt",
					"documento": "18999999",
					"telefono": "1122222222",
					"email": "jaltgi@cc.cc",
					"direccion": "Nuñez	196",
					"empresa": "BBB"
				}, {
					"nombre": "Martin",
					"apellido": "Palermo",
					"documento": "12345678",
					"telefono": "1111111111",
					"email": "palermo.martin@tt.yy",
					"direccion": "Carlos Calvo 1250",
					"empresa": "CCC"
				}

				];
				var otherDataBook3 = [{
					"NOMBRE": "OTROP",
					"LONG (li)( Km )": "MAN",
					"FSAL": "95232423",
					"HSAL": "113243343",
					"MSAL": "acl.gabriel@gmail.com",
					"FENT": "aguero 1229",
					"HENT": "Inclusion Services",
					"MENT": "Vault",
					"TIEMPO (ti)(HS)": "1,77",
					"(li x ti)": "74,2",
					"ENS": "NO",
					"OBSERVACION": "Animales, plantaciones, condiciones meteorológicas, nidos de aves y otros objetos que afecten la aislación"
				}, {
					"NOMBRE": "E.T.RAMALLO SAN NICOLAS 132.0 LI",
					"LONG (li)( Km )": "6",
					"FSAL": "21/12/2016",
					"HSAL": "10",
					"MSAL": "39",
					"FENT": "21/12/2016",
					"HENT": "13",
					"MENT": "07",
					"TIEMPO (ti)(HS)": "1,77",
					"(li x ti)": "74,2",
					"ENS": "NO",
					"OBSERVACION": "Otras (desprendimiento hilo de guardia, caída de estructuras por accidente, terceros, pérdida de vínculo de transmisión, corte de conductor o morseto, desprendimiento de puentes, error de conexionado, aisladores, revisión de equipamiento, vandalismo, aislador bushing, enlaces de comunicaciones, extensión horario de trabajo)"
				}, {
					"NOMBRE": "VILLA LIA RAMALLO 220.0 1 LI",
					"LONG (li)( Km )": "6",
					"FSAL": "21/12/2016",
					"HSAL": "10",
					"MSAL": "39",
					"FENT": "21/12/2016",
					"HENT": "13",
					"MENT": "07",
					"TIEMPO (ti)(HS)": "1,77",
					"(li x ti)": "74,2",
					"ENS": "NO",
					"OBSERVACION": "Otras (desprendimiento hilo de guardia, caída de estructuras por accidente, terceros, pérdida de vínculo de transmisión, corte de conductor o morseto, desprendimiento de puentes, error de conexionado, aisladores, revisión de equipamiento, vandalismo, aislador bushing, enlaces de comunicaciones, extensión horario de trabajo)"
				}];
				var ntB3 = "A" + (4 + tabla5.length + 5);
				var ntB3T = "A" + (4 + tabla5.length + 3);
				// Initial row at A2
				var ws3 = XLSX.utils.aoa_to_sheet([
					["FORZADAS AUTORIZADAS - LINEAS TRANSENER 500 kV + TI"]
				], {
					origin: "A2:E2"
				});
				XLSX.utils.sheet_add_aoa(ws3, [
					["FORZADA - LINEAS TRANSENER 500 kV + TI"]
				], {
					origin: ntB3T
				});
				XLSX.utils.sheet_add_json(ws3, tabla6, {
					origin: ntB3
				});
				var sheet3 = XLSX.utils.sheet_add_json(ws3, tabla5, {
					sheet: "Test Excel Book 3",
					origin: "A4"
				});

				/* BOOK 4 CONTENT */
				var dataBook4 = [{
					"nombre": "Irving",
					"apellido": "Saenz",
					"documento": "7894562",
					"telefono": "1133333333",
					"email": "masaenz@rr.tt",
					"direccion": "San Martin 3214",
					"empresa": "DDD"
				}, {
					"nombre": "Ana",
					"apellido": "Barilari",
					"documento": "12456789",
					"telefono": "1198765432",
					"email": "barilari.ana@cc.xs",
					"direccion": "Alberti 1236",
					"empresa": "EEE"
				}, {
					"nombre": "Carolina",
					"apellido": "Rosso",
					"documento": "15896654",
					"telefono": "1133333333",
					"email": "roscaro@lk.oi",
					"direccion": "Echeverria 1235",
					"empresa": "GGG"
				}

				];
				var otherDataBook4 = [{
					"NOMBRE": "OTROP",
					"LONG (li)( Km )": "MAN",
					"FSAL": "95232423",
					"HSAL": "113243343",
					"MSAL": "acl.gabriel@gmail.com",
					"FENT": "aguero 1229",
					"HENT": "Inclusion Services",
					"MENT": "Vault",
					"TIEMPO (ti)(HS)": "1,77",
					"(li x ti)": "74,2",
					"ENS": "NO",
					"OBSERVACION": "Animales, plantaciones, condiciones meteorológicas, nidos de aves y otros objetos que afecten la aislación"
				}, {
					"NOMBRE": "E.T.RAMALLO SAN NICOLAS 132.0 LI",
					"LONG (li)( Km )": "6",
					"FSAL": "21/12/2016",
					"HSAL": "10",
					"MSAL": "39",
					"FENT": "21/12/2016",
					"HENT": "13",
					"MENT": "07",
					"TIEMPO (ti)(HS)": "1,77",
					"(li x ti)": "74,2",
					"ENS": "NO",
					"OBSERVACION": "Otras (desprendimiento hilo de guardia, caída de estructuras por accidente, terceros, pérdida de vínculo de transmisión, corte de conductor o morseto, desprendimiento de puentes, error de conexionado, aisladores, revisión de equipamiento, vandalismo, aislador bushing, enlaces de comunicaciones, extensión horario de trabajo)"
				}, {
					"NOMBRE": "VILLA LIA RAMALLO 220.0 1 LI",
					"LONG (li)( Km )": "6",
					"FSAL": "21/12/2016",
					"HSAL": "10",
					"MSAL": "39",
					"FENT": "21/12/2016",
					"HENT": "13",
					"MENT": "07",
					"TIEMPO (ti)(HS)": "1,77",
					"(li x ti)": "74,2",
					"ENS": "NO",
					"OBSERVACION": "Otras (desprendimiento hilo de guardia, caída de estructuras por accidente, terceros, pérdida de vínculo de transmisión, corte de conductor o morseto, desprendimiento de puentes, error de conexionado, aisladores, revisión de equipamiento, vandalismo, aislador bushing, enlaces de comunicaciones, extensión horario de trabajo)"
				}];
				var ntB4 = "A" + (4 + tabla7.length + 5);
				var ntB4T = "A" + (4 + tabla7.length + 3);
				// Initial row at A2
				var ws4 = XLSX.utils.aoa_to_sheet([
					["FORZADAS AUTORIZADAS - TRANSFORMADORES TRANSENER"]
				], {
					origin: "A2:E2"
				});
				XLSX.utils.sheet_add_aoa(ws4, [
					["FORZADAS - TRANSFORMADORES TRANSENER"]
				], {
					origin: ntB4T
				});
				XLSX.utils.sheet_add_json(ws4, tabla8, {
					origin: ntB4
				});
				var sheet4 = XLSX.utils.sheet_add_json(ws4, tabla7, {
					sheet: "Test Excel Book 4",
					origin: "A4"
				});

				/* BOOK 5 CONTENT */
				var dataBook5 = [{
					"nombre": "Andres",
					"apellido": "Rodriguez",
					"documento": "94223456",
					"telefono": "1144444444",
					"email": "arodri@hg.jh",
					"direccion": "Estados Unidos 3214",
					"empresa": "HHH"
				}, {
					"nombre": "Jose",
					"apellido": "Suarez",
					"documento": "95988789",
					"telefono": "1177777777",
					"email": "jsuarez@sd.cc",
					"direccion": "Rivadavia 1236",
					"empresa": "III"
				}, {
					"nombre": "Maria Angelica",
					"apellido": "Ambrosio",
					"documento": "95666222",
					"telefono": "1155588899",
					"email": "mangbrosio@gf.hg",
					"direccion": "Peru 356",
					"empresa": "JJJ"
				}

				];
				var otherDataBook5 = [{
					"NOMBRE": "OTROP",
					"LONG (li)( Km )": "MAN",
					"FSAL": "95232423",
					"HSAL": "113243343",
					"MSAL": "acl.gabriel@gmail.com",
					"FENT": "aguero 1229",
					"HENT": "Inclusion Services",
					"MENT": "Vault",
					"TIEMPO (ti)(HS)": "1,77",
					"(li x ti)": "74,2",
					"ENS": "NO",
					"OBSERVACION": "Animales, plantaciones, condiciones meteorológicas, nidos de aves y otros objetos que afecten la aislación"
				}, {
					"NOMBRE": "E.T.RAMALLO SAN NICOLAS 132.0 LI",
					"LONG (li)( Km )": "6",
					"FSAL": "21/12/2016",
					"HSAL": "10",
					"MSAL": "39",
					"FENT": "21/12/2016",
					"HENT": "13",
					"MENT": "07",
					"TIEMPO (ti)(HS)": "1,77",
					"(li x ti)": "74,2",
					"ENS": "NO",
					"OBSERVACION": "Otras (desprendimiento hilo de guardia, caída de estructuras por accidente, terceros, pérdida de vínculo de transmisión, corte de conductor o morseto, desprendimiento de puentes, error de conexionado, aisladores, revisión de equipamiento, vandalismo, aislador bushing, enlaces de comunicaciones, extensión horario de trabajo)"
				}, {
					"NOMBRE": "VILLA LIA RAMALLO 220.0 1 LI",
					"LONG (li)( Km )": "6",
					"FSAL": "21/12/2016",
					"HSAL": "10",
					"MSAL": "39",
					"FENT": "21/12/2016",
					"HENT": "13",
					"MENT": "07",
					"TIEMPO (ti)(HS)": "1,77",
					"(li x ti)": "74,2",
					"ENS": "NO",
					"OBSERVACION": "Otras (desprendimiento hilo de guardia, caída de estructuras por accidente, terceros, pérdida de vínculo de transmisión, corte de conductor o morseto, desprendimiento de puentes, error de conexionado, aisladores, revisión de equipamiento, vandalismo, aislador bushing, enlaces de comunicaciones, extensión horario de trabajo)"
				}];
				var ntB5 = "A" + (4 + tabla9.length + 5);
				var ntB5T = "A" + (4 + tabla9.length + 3);
				// Initial row at A2
				var ws5 = XLSX.utils.aoa_to_sheet([
					["FORZADAS AUTORIZADAS- TRANSFORMADORES TRANSENER + TI"]
				], {
					origin: "A2:E2"
				});
				XLSX.utils.sheet_add_aoa(ws5, [
					["FORZADAS - TRANSFORMADORES TRANSENER + TI"]
				], {
					origin: ntB5T
				});
				XLSX.utils.sheet_add_json(ws5, tabla10, {
					origin: ntB5
				});
				var sheet5 = XLSX.utils.sheet_add_json(ws5, tabla9, {
					sheet: "Test Excel Book 5",
					origin: "A4"
				});

				/* BOOK 6 CONTENT */
				var datos_nros = [
					["1"],
					["2"],
					["3"],
					["4"],
					["5"],
					["6"],
					["7"],
					["8"],
					["9"],
					["10"],
					["11"],
					["12"],
					["13"],
					["14"],
					["15"],
					["16"],
					["17"],
					["18"],
					["19"]
				];
				var datos_desc = [
					["Actuación correcta de automatismos del SADI"],
					["Actuación incorrecta de automatismos del SADI"],
					["Actuación incorrecta de los sistemas de protecciones y comunicaciones"],
					["Afectación de estructuras"],
					["Animales, plantaciones, condiciones meteorológicas, nidos de aves y otros objetos que afecten la aislación"],
					["Error humano/maniobra"],
					["Falla en barras"],
					[
						"Falla interna en el equipo de potencia (incluyendo interruptor, seccionador, descargador, trafos de medición, reactores de línea o de tercearios, acoplamiento de O.P., nivel de aceite de cuba y RBC, tableros de control, etc.)"
					],
					[
						"Otras (desprendimiento hilo de guardia, caída de estructuras por accidente, terceros, pérdida de vínculo de transmisión, corte de conductor o morseto, desprendimiento de puentes, error de conexionado, aisladores, revisión de equipamiento, vandalismo, aislador bushing, enlaces de comunicaciones, extensión horario de trabajo)"
					],
					["Tormenta eléctrica (descargas atmosféricas, viento intenso, etc.)"],
					["Atentado"],
					["Incendio de campos"],
					["Actuación de protecciones en zona de respaldo remoto"],
					["Desconocidas"],
					["Oscilaciones de Potencia"],
					["Sobrecarga"],
					["Protección de sobretensión, subfrecuencia, sobrefrecuencia, sobreflujo"],
					["Meteoro (Tormado, Inundación, Terremoto)"],
					["Vinculada y sin Tensión por la pérdida de vínculos"]
				];
				var ws6 = XLSX.utils.sheet_add_aoa(ws6, datos_nros, {
					origin: "A1"
				});
				var sheet6 = XLSX.utils.sheet_add_aoa(ws6, datos_desc, {
					sheet: "Test Excel Book 6",
					origin: "B1"
				});

				var Workbook = XLSX.utils.book_new();

				XLSX.utils.book_append_sheet(Workbook, sheet, "LINEAS TRANSENER 500 kV")
				XLSX.utils.book_append_sheet(Workbook, sheet2, "LINEAS TRANSENER 220 132kV")
				XLSX.utils.book_append_sheet(Workbook, sheet3, "LINEAS TRANSENER + TI")
				XLSX.utils.book_append_sheet(Workbook, sheet4, "TRAFOS TRANSENER")
				XLSX.utils.book_append_sheet(Workbook, sheet5, "TRAFOS TRANSENER + TI")
				XLSX.utils.book_append_sheet(Workbook, sheet6, "HOJA 1")

				//console.log(Workbook.Sheets);
				//Workbook.Sheets.sheet.A1.s = { fill: {patternType: "none",fgColor: {rgb: "FF000000"},bgColor: {rgb: "00000000"}} }

				XLSX.writeFile(Workbook, 'ENRE 390.xlsx', {
					cellStyles: true
				});
			});
		},

		deleteLicence: function (oEvent) {
			var licencia = oEvent.getSource().getBindingContext("LicencesListJsonModel").getObject();
			var oUtilsJsonModel = this.getView().getModel("UtilsJsonModel");
			var bEdition = oUtilsJsonModel.getProperty("/editableMode");
			if (!bEdition) {
				var LicencesModel = this.getView().getModel("LicencesListJsonModel").getData().Licences;
				for (var row in LicencesModel) {
					if (LicencesModel[row].Anio == licencia.Anio && LicencesModel[row].IdLicencia == licencia.IdLicencia) {
						var position = row;
						LicencesModel.splice(position, 1);
						this.getView().getModel("LicencesListJsonModel").updateBindings(true);
					}
				}
			} else {
				this.getView().getModel("LicencesListJsonModel").setProperty("/Busy", true);
				LicenciaService.onDeleteLicence(licencia,
					jQuery.proxy(this.onSuccessDeleteLic, this, licencia),
					jQuery.proxy(this.onErrorDeleteLic, this)
				)
			}
		},
		onSuccessDeleteLic: function (licencia, data) {
			MessageBoxHelper.showAlert("Eliminar Licencia", "Se ha eliminado la licencia exitosamente.");
			LicenciaService.loadList(licencia.Empresa, licencia.IdNovedad);
			var oModel = this.getView().getModel("LicencesListJsonModel");
			oModel.setProperty("/Busy", false);
		},
		onErrorDeleteLic: function () {
			var oModel = this.getView().getModel("LicencesListJsonModel");
			oModel.setProperty("/Busy", false);
			MessageBoxHelper.showAlert("Eliminar Licencia", "Ha ocurrido un error al intentar eliminar la licencia.");
		},
		onSearchNovedad: function () {
			var that = this;
			var oModel = this.getView().getModel("UtilsJsonModel");
			var data = {
				NroNovedad: oModel.getProperty("/nroNovedad"),
				Empresa: oModel.getProperty("/Empresa")
			}
			if (!data.NroNovedad) {
				MessageBoxHelper.showAlert("Novedad de Servicio", "Debe indicar un número de novedad.")
				return;
			}
			var strId = data.NroNovedad;
			var k = strId.length;
			for (var i = 10; i > k; i--) {
				strId = "0" + strId;
			}

			NovedadesService.blockNovedad(strId).then(function (res) {
				if (res.Usuario) {
					MessageBoxHelper.showAlert("Novedad de Servicio", "La novedad se encuentra bloqueada por: " +
						res.Usuario);
					return;
				}
				that.onSearchNovedadUnblocked.bind(that)();
			}, function (err) {
				MessageBoxHelper.showAlert("Novedad de Servicio", "Ha fallado la busqueda de la novedad: " +
					data.NroNovedad);
			});
		},
		onSearchNovedadUnblocked: function () {
			var oModel = this.getView().getModel("UtilsJsonModel");
			var data = {
				NroNovedad: oModel.getProperty("/nroNovedad"),
				Empresa: oModel.getProperty("/Empresa")
			}
			if (!data.NroNovedad) {
				MessageBoxHelper.showAlert("Novedad de Servicio", "Debe indicar un número de novedad.")
				return;
			}
			NovedadesService.SearchNovedad(data,
				jQuery.proxy(this.onSuccessLoadCallback, this),
				jQuery.proxy(this.onErrorLoadCallback, this)
			)
		},
		onSuccessLoadCallback: function (oSelectedNovedad) {
			if (!oSelectedNovedad.IdNovedad) {
				MessageBoxHelper.showAlert("Novedad de Servicio", "Esta novedad no existe.")
				return;
			}
			if (oSelectedNovedad.Consecuente != "") {
				MessageBoxHelper.showAlert("Novedad de Servicio", "Esta novedad de servicio es consecuente de la Novedad Nro.: " +
					oSelectedNovedad.Consecuente)
			} else {
				/*var novedad = AppManagementHelper.getModel("NovedadesFormJsonModel").getData();
					NovedadesService.unblockNovedad(novedad.IdNovedad);*/

				var oUtilsJsonModel = this.getView().getModel("UtilsJsonModel");
				var codNovedad = oSelectedNovedad.CodNovedad;
				if (codNovedad !== "C" && codNovedad !== "I") {
					oUtilsJsonModel.setProperty("/CammesaTab", true);
				} else {
					oUtilsJsonModel.setProperty("/CammesaTab", false);
				}
				oUtilsJsonModel.setProperty("/IdNovedad", oSelectedNovedad.IdNovedad);
				this.setNavigationPropertiesData(oSelectedNovedad);
				MotivosService.loadModel(oSelectedNovedad.CodNovedad, oSelectedNovedad.Empresa);
				CausasService.loadModel(oSelectedNovedad.CodNovedad, oSelectedNovedad.CodMotivo, oSelectedNovedad.Empresa);
				EquiposService.loadEquipos(oSelectedNovedad.CodTipo, oSelectedNovedad.Estacion, null, oSelectedNovedad.Empresa);
				LicenciaService.loadList(oSelectedNovedad.Empresa, oSelectedNovedad.IdNovedad);
				oUtilsJsonModel.setProperty("/editable", false);
				oUtilsJsonModel.setProperty("/editableMode", true);
				oUtilsJsonModel.setProperty("/editableDate", true);
				oUtilsJsonModel.setProperty("/visible", false);
				oUtilsJsonModel.setProperty("/Referencia", oSelectedNovedad.IdNovedad);
				NovedadDialogHelper.checkRadioEnabled();
			}
		},
		onErrorLoadCallback: function () {

		},
		setNavigationPropertiesData: function (oSelectedNovedad) {
			if (oSelectedNovedad.InformeCammesaSet.results.length > 0) {
				oSelectedNovedad.InformeCammesaSet.results[0].Autoriza = oSelectedNovedad.InformeCammesaSet.results[0].Autoriza === "S";
				oSelectedNovedad.InformeCammesaSet.results[0].InformaCammesa = oSelectedNovedad.InformeCammesaSet.results[0].InformaCammesa ===
					"S";
				AppManagementHelper.getModel("CammesaFormJsonModel").setData(oSelectedNovedad.InformeCammesaSet.results[0]);
			}

			if (oSelectedNovedad.ComentariosSet.results.length > 0) {
				AppManagementHelper.getModel("CommentsFormJsonModel").setData(oSelectedNovedad.ComentariosSet.results[0]);
			}
			if (oSelectedNovedad.ENSRegXNS_NAV.results.length > 0) {
				oSelectedNovedad.ENSRegXNS_NAV.results.map(function (element) {
					element.ENSRow = (element.Corte / 60) * element.Potencia;
				});
			}
			AppManagementHelper.getModel("NovedadesFormJsonModel").setData(oSelectedNovedad);
			AppManagementHelper.getModel("ConsequentListJsonModel").setData({
				Consequents: oSelectedNovedad.ConsecuentesSet.results
			});
			AppManagementHelper.getModel("PruebasListJsonModel").setData({
				Pruebas: oSelectedNovedad.PruebasXNS_nav.results
			});
			AppManagementHelper.getModel("SignalsListJsonModel").setData({
				Signals: oSelectedNovedad.SenialXNS_nav.results
			});
			AppManagementHelper.getModel("ENSListJsonModel").setData({
				ENSRegisters: oSelectedNovedad.ENSRegXNS_NAV.results
			});
			var consecuenteModel = AppManagementHelper.getModel("ConsecuentesFormJsonModel");
			var novedadesModel = AppManagementHelper.getModel("NovedadesFormJsonModel");
			consecuenteModel.setProperty("/Tplnr", novedadesModel.getProperty("/Tplnr"));
			consecuenteModel.setProperty("/InicioNove", novedadesModel.getProperty("/InicioNove"));
			consecuenteModel.setProperty("/EntIndis", novedadesModel.getProperty("/EntIndis"));
			var cammesaModel = AppManagementHelper.getModel("CammesaFormJsonModel");
			consecuenteModel.setProperty("/InformaCammesa", cammesaModel.getProperty("/InformaCammesa"));
			consecuenteModel.setProperty("/FechaHora", cammesaModel.getProperty("/FechaHora"));
			this.addConsecuente = true;
		},
		onSelectReporte: function (evt) {
			var Reporte = evt.getSource().getSelectedKey()
			this.loadNSEmpresas(this.society, Reporte);
		}

	});
});