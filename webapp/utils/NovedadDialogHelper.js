sap.ui.define(["Transener/Operaciones/NovedadesServicio/utils/AppManagementHelper",
	"Transener/Operaciones/NovedadesServicio/services/MotivosService",
	"Transener/Operaciones/NovedadesServicio/services/NovedadesService",
	"Transener/Operaciones/NovedadesServicio/utils/FormatHelper",
	"Transener/Operaciones/NovedadesServicio/services/EquiposService",
	"Transener/Operaciones/NovedadesServicio/services/LicenciaService",
	"Transener/Operaciones/NovedadesServicio/services/CausasService",
	"Transener/Operaciones/NovedadesServicio/utils/MessageBoxHelper"
], function (AppManagementHelper, MotivosService, NovedadesService, FormatHelper, EquiposService,
	LicenciaService, CausasService, MessageBoxHelper) {
	"use strict";
	return {
		oDialog: null,
		lineas: ["L1", "L2", "L3", "L4", "L5", "L6", "L9"],

		checkRadioEnabled: function (oEvent) {
			var oUtilsJsonModel = AppManagementHelper.getModel("UtilsJsonModel");
			var oNovedadesJsonModel = AppManagementHelper.getModel("NovedadesFormJsonModel");
			var sMotivo = AppManagementHelper.getModel("NovedadesFormJsonModel").getProperty("/CodMotivo");
			var sCodigoNovedad = AppManagementHelper.getModel("NovedadesFormJsonModel").getProperty("/CodNovedad");
			if ((sMotivo === "02" || sMotivo === "03") && (sCodigoNovedad === "P")) {
				oUtilsJsonModel.setProperty("/enabledRadio", true);
			} else {
				oUtilsJsonModel.setProperty("/enabledRadio", false);
				oUtilsJsonModel.setProperty("/enabledCaidas", false);
				oNovedadesJsonModel.setProperty("/Cantidadtorrescaidas", "");
				oNovedadesJsonModel.setProperty("/TipoPerturbacion", "");
			}
		},

		getDialog: function (novserv, mainController) {
			this.mainController = mainController;
			this.NovedadesService = novserv;
			var oSorter = new sap.ui.model.Sorter("InicioNove", false, false);
			var oDialog = new sap.m.Dialog({
				title: 'Novedades',
				contentWidth: "950px",
				contentHeight: "500px",
				resizable: true,
				content: [
					new sap.m.VBox({
						items: [
							new sap.m.Panel({
								width: "97%",
								content: [
									new sap.m.HBox({
										alignContent: sap.m.FlexAlignContent.SpaceBetween,
										items: [
											new sap.m.Label({
												text: "Tipo:",
												layoutData: new sap.m.FlexItemData({
													growFactor: 1,
													baseSize: "0"
												})
											}).addStyleClass("sapUiSmallMarginEnd sapUiSmallMarginTop"),
											new sap.m.ComboBox({
												items: {
													path: "TipoEquipoJsonModel>/TipoEquipo",
													template: new sap.ui.core.Item({
														key: "{TipoEquipoJsonModel>Tipo}",
														text: "{TipoEquipoJsonModel>Tipo}"
													})
												},
												selectedKey: "{DateFilterSelectionJsonModel>/TipoEquipo}",
												change: [this.filterEstacionChanged, this],
												layoutData: new sap.m.FlexItemData({
													growFactor: 1,
													baseSize: "0"
												})
											}).addStyleClass("sapUiTinyMarginEnd"),
											new sap.m.Label({
												text: "Ubicacion:",
												layoutData: new sap.m.FlexItemData({
													growFactor: 1,
													baseSize: "0"
												})
											}).addStyleClass("sapUiSmallMarginBeginEnd sapUiSmallMarginTop"),
											new sap.m.ComboBox({
												items: {
													path: "EstacionesJsonModel>/Estaciones",
													template: new sap.ui.core.Item({
														key: "{EstacionesJsonModel>Estacion}",
														text: "{EstacionesJsonModel>Codigo}"
													})
												},
												enabled: {
													path: "DateFilterSelectionJsonModel>/TipoEquipo",
													formatter: this.isNotLinea.bind(this)
												},
												selectedKey: "{DateFilterSelectionJsonModel>/Ubicacion}",
												change: [this.filterEstacionChanged, this],
												layoutData: new sap.m.FlexItemData({
													growFactor: 1,
													baseSize: "0"
												})
											}).addStyleClass("sapUiTinyMarginEnd"),
											new sap.m.Label({
												text: "Equipo:",
												layoutData: new sap.m.FlexItemData({
													growFactor: 1,
													baseSize: "0"
												})
											}).addStyleClass("sapUiSmallMarginBeginEnd sapUiSmallMarginTop"),
											new sap.m.ComboBox({
												items: {
													path: "novFilterEquipos>/Equipos",
													template: new sap.ui.core.Item({
														key: "{novFilterEquipos>Codequipo}",
														text: "{novFilterEquipos>Codigo}"
													})
												},
												selectedKey: "{DateFilterSelectionJsonModel>/Equipo}",
												change: [this.handleDateFilter, this],
												layoutData: new sap.m.FlexItemData({
													growFactor: 1,
													baseSize: "0"
												})
											}).addStyleClass("sapUiTinyMarginEnd"),
										]
									}).addStyleClass("sapUiTinyMarginBeginEnd"),
									new sap.m.HBox({
										alignContent: sap.m.FlexAlignContent.SpaceBetween,
										items: [
											new sap.m.Label({
												text: "Inicio Novedad:",
												layoutData: new sap.m.FlexItemData({
													growFactor: 1.02,
													baseSize: "0"
												})
											}).addStyleClass("sapUiSmallMarginEnd sapUiSmallMarginTop"),
											new sap.m.DatePicker({
												change: [this.handleDateFilter, this],
												dateValue: "{DateFilterSelectionJsonModel>/InicioNove}",
												displayFormat: "dd/MM/yyyy",
												layoutData: new sap.m.FlexItemData({
													growFactor: 1,
													baseSize: "0"
												})
											}).addStyleClass("sapUiTinyMarginEnd"),
											new sap.m.Label({
												text: "Fin Novedad:",
												layoutData: new sap.m.FlexItemData({
													growFactor: 1.04,
													baseSize: "0"
												})
											}).addStyleClass("sapUiSmallMarginBeginEnd sapUiSmallMarginTop"),
											new sap.m.DatePicker({
												displayFormat: "dd/MM/yyyy",
												change: [this.handleDateFilter, this],
												dateValue: "{DateFilterSelectionJsonModel>/FechaFinNove}",
												layoutData: new sap.m.FlexItemData({
													growFactor: 1,
													baseSize: "0"
												})
											}),
											new sap.m.Button({
												icon: "sap-icon://clear-filter",
												press: [this.cleanDates, this],
												layoutData: new sap.m.FlexItemData({
													growFactor: 2,
													baseSize: "0"
												})
											}).addStyleClass("sapUiTinyMarginBegin buttonInverted btn-display")
										]
									}).addStyleClass("sapUiTinyMarginBeginEnd")
								]
							}).addStyleClass("customPanel"),
							new sap.m.Table({
								growing: false,
								mode: sap.m.ListMode.SingleSelectMaster,
								selectionChange: [this.preSelectNovedad, this],
								columns: [
									new sap.m.Column({
										header: new sap.m.Text({
											text: "Id Novedad"
										}),
									}),
									new sap.m.Column({
										header: new sap.m.Text({
											text: "Codigo de Novedad"
										}),
									}),
									new sap.m.Column({
										header: new sap.m.Text({
											text: "Equipo"
										}),
									}),
									new sap.m.Column({
										header: new sap.m.Text({
											text: "Inicio de novedad"
										}),
									})
								],
								items: {
									path: "NovedadesListJsonModel>/Novedades",
									sorter: oSorter,
									template: new sap.m.ColumnListItem({
										cells: [
											new sap.m.Text({
												text: "{NovedadesListJsonModel>IdNovedad}"
											}),
											new sap.m.Text({
												text: "{NovedadesListJsonModel>CodNovedad}"
											}),
											new sap.m.Text({
												text: "{NovedadesListJsonModel>Equnr}"
											}),
											new sap.m.Text({
												text: {
													path: "NovedadesListJsonModel>InicioNove",
													formatter: $.proxy(this.formatDateTime, this)
												}
											})
										]
									})
								},
							})
						]
					})
				],
				beginButton: new sap.m.Button({
					text: 'Cerrar',
					press: [this.closeDialog, this]
				}).addStyleClass("buttonInverted")
			});
			this.oDialog = oDialog;
			return oDialog;
		},

		formatDateTime: function (dDate) {
			if (dDate) {
				return FormatHelper.formatDateTime(dDate);
			}
		},

		cleanDateModel: function () {
			var oDateModel = AppManagementHelper.getModel("DateFilterSelectionJsonModel");
			oDateModel.setData({
				InicioNove: null,
				FechaFinNove: null
			});
			oDateModel.setProperty("/InicioNove", null);
			oDateModel.setProperty("/FechaFinNove", null);
		},

		cleanDates: function () {
			this.cleanDateModel();
			if (!NovedadesService) {
				NovedadesService = this.NovedadesService;
			}
			NovedadesService.FIND([]);
		},

		handleDateFilter: function () {
			var aFilter = [];
			var oDateModel = AppManagementHelper.getModel("DateFilterSelectionJsonModel");
			var dInicioNovedad = oDateModel.getProperty("/InicioNove");
			var dFinNovedad = oDateModel.getProperty("/FechaFinNove");
			var equipo = oDateModel.getProperty("/Equipo");
			var estacion = oDateModel.getProperty("/Ubicacion");
			var tipo = oDateModel.getProperty("/TipoEquipo");

			if ((dInicioNovedad !== null && dFinNovedad !== null) && (dInicioNovedad <= dFinNovedad)) {
				dFinNovedad.setHours(23, 59, 59, 999);
				aFilter.push(new sap.ui.model.Filter("InicioNove", sap.ui.model.FilterOperator.BT, dInicioNovedad, dFinNovedad));
				//aFilter.push(new sap.ui.model.Filter("FechaFinNove", sap.ui.model.FilterOperator.LE, dFinNovedad));
				if (!NovedadesService) {
					NovedadesService = this.NovedadesService;
				}
				if (equipo) {
					aFilter.push(new sap.ui.model.Filter("Equnr", sap.ui.model.FilterOperator.EQ, equipo));
				}
				if (estacion) {
					aFilter.push(new sap.ui.model.Filter("Estacion", sap.ui.model.FilterOperator.EQ, estacion));
				}
				if (tipo) {
					aFilter.push(new sap.ui.model.Filter("CodTipo", sap.ui.model.FilterOperator.EQ, tipo));
				}

				NovedadesService.FIND(aFilter);
			}
		},

		setNavigationPropertiesData: function (oSelectedNovedad) {
			if (oSelectedNovedad.InformeCammesaSet.length !== 0) {
				oSelectedNovedad.InformeCammesaSet[0].Autoriza = oSelectedNovedad.InformeCammesaSet[0].Autoriza === "S";
				oSelectedNovedad.InformeCammesaSet[0].InformaCammesa = oSelectedNovedad.InformeCammesaSet[0].InformaCammesa === "S";
				AppManagementHelper.getModel("CammesaFormJsonModel").setData(oSelectedNovedad.InformeCammesaSet[0]);
			}

			if (oSelectedNovedad.ComentariosSet.length !== 0) {
				AppManagementHelper.getModel("CommentsFormJsonModel").setData(oSelectedNovedad.ComentariosSet[0]);
			}
			if (oSelectedNovedad.ENSRegXNS_NAV.length > 0) {
				oSelectedNovedad.ENSRegXNS_NAV.map(function (element) {
					element.ENSRow = (element.Corte / 60) * element.Potencia;
				});
			}
			AppManagementHelper.getModel("NovedadesFormJsonModel").setData(oSelectedNovedad);
			AppManagementHelper.getModel("ConsequentListJsonModel").setData({
				Consequents: oSelectedNovedad.ConsecuentesSet
			});
			AppManagementHelper.getModel("PruebasListJsonModel").setData({
				Pruebas: oSelectedNovedad.PruebasXNS_nav
			});
			AppManagementHelper.getModel("SignalsListJsonModel").setData({
				Signals: oSelectedNovedad.SenialXNS_nav
			});
			var lastSignal = oSelectedNovedad.SenialXNS_nav[oSelectedNovedad.SenialXNS_nav.length - 1];
			AppManagementHelper.getModel("SignalsFormJsonModel").setProperty("/Posicion", (lastSignal ? parseInt(lastSignal.Posicion) : 0) + 1 +
				"");
			//TODO add default signal position
			AppManagementHelper.getModel("ENSListJsonModel").setData({
				ENSRegisters: oSelectedNovedad.ENSRegXNS_NAV
			});
			var consecuenteModel = AppManagementHelper.getModel("ConsecuentesFormJsonModel");
			var novedadesModel = AppManagementHelper.getModel("NovedadesFormJsonModel");
			consecuenteModel.setProperty("/Tplnr", novedadesModel.getProperty("/Tplnr"));
			consecuenteModel.setProperty("/InicioNove", novedadesModel.getProperty("/InicioNove"));
			consecuenteModel.setProperty("/EntIndis", novedadesModel.getProperty("/EntIndis"));
			var cammesaModel = AppManagementHelper.getModel("CammesaFormJsonModel");
			consecuenteModel.setProperty("/InformaCammesa", cammesaModel.getProperty("/InformaCammesa"));
			consecuenteModel.setProperty("/FechaHora", cammesaModel.getProperty("/FechaHora"));
		},

		// preSelectNovedad: function (oEvent) {
		// 	var that = this;

		// 	var oSelectedNovedad = oEvent.getParameter("listItem").getBindingContext("NovedadesListJsonModel").getObject();
		// 	if (!NovedadesService) {
		// 		NovedadesService = this.NovedadesService;
		// 	}
		// 	NovedadesService.blockNovedad(oSelectedNovedad.IdNovedad).then(function (res) {
		// 		if (res.Usuario) {
		// 			MessageBoxHelper.showAlert("Novedad de Servicio", "La novedad se encuentra bloqueada por: " +
		// 				res.Usuario);
		// 			return;
		// 		}
		// 		that.selectNovedad.bind(that)(oSelectedNovedad);
		// 	}, function (err) {
		// 		MessageBoxHelper.showAlert("Novedad de Servicio", "Ha fallado la busqueda de la novedad: " +
		// 			oSelectedNovedad.IdNovedad);
		// 	});
		// },
		preSelectNovedad: function (oEvent) {
			var that = this;

			var oSelectedNovedad = oEvent.getParameter("listItem").getBindingContext("NovedadesListJsonModel").getObject();

			if (!this.NovedadesService) {
				MessageBoxHelper.showAlert("Error", "El servicio de novedades no está disponible.");
				return;
			}
			AppManagementHelper.getModel("NovedadesFormJsonModel").setProperty("/", []);
			this.NovedadesService.blockNovedad(oSelectedNovedad.IdNovedad)
				.then(function (res) {
					if (res.Usuario) {
						MessageBoxHelper.showAlert(
							"Novedad de Servicio",
							`La novedad se encuentra bloqueada por: ${res.Usuario}`
						);
						return;
					}
					that.selectNovedad(oSelectedNovedad);
				})
				.catch(function (err) {
					// eslint-disable-next-line no-console
					console.error("Error al bloquear la novedad:", err);
					MessageBoxHelper.showAlert(
						"Novedad de Servicio",
						`Ha fallado la búsqueda de la novedad: ${oSelectedNovedad.IdNovedad}`
					);
				});
		}
		,

		selectNovedad: function (oSelectedNovedad) {
			//var oSelectedNovedad = oEvent.getParameter("listItem").getBindingContext("NovedadesListJsonModel").getObject();
			if (oSelectedNovedad.Consecuente !== "") {
				this.closeDialog();
				MessageBoxHelper.showAlert("Novedad de Servicio", "Esta novedad de servicio es consecuente de la Novedad Nro.: " +
					oSelectedNovedad.Consecuente);

				return;
			}
			var oUtilsJsonModel = AppManagementHelper.getModel("UtilsJsonModel");
			var codNovedad = oSelectedNovedad.CodNovedad;
			if (codNovedad !== "C" && codNovedad !== "I") {
				oUtilsJsonModel.setProperty("/CammesaTab", true);
			} else {
				oUtilsJsonModel.setProperty("/CammesaTab", false);
			}
			oUtilsJsonModel.setProperty("/IdNovedad", oSelectedNovedad.IdNovedad);

			Promise.all([
				MotivosService.loadModel(oSelectedNovedad.CodNovedad, oSelectedNovedad.Empresa),
				CausasService.loadModel(oSelectedNovedad.CodNovedad, oSelectedNovedad.CodMotivo, oSelectedNovedad.Empresa),
				EquiposService.loadEquipos(oSelectedNovedad.CodTipo, oSelectedNovedad.Estacion, null, oSelectedNovedad.Empresa),
				LicenciaService.loadList(oSelectedNovedad.Empresa, oSelectedNovedad.IdNovedad)
			]).then(() => {
				this.setNavigationPropertiesData(oSelectedNovedad);
			}).catch(error => {
				console.error("Error al cargar los servicios:", error);
			});
		
			oUtilsJsonModel.setProperty("/editable", false);
			oUtilsJsonModel.setProperty("/editableDate", true);
			oUtilsJsonModel.setProperty("/editableMode", true);
			oUtilsJsonModel.setProperty("/visible", false);
			oUtilsJsonModel.setProperty("/Referencia", oSelectedNovedad.IdNovedad);
			this.checkRadioEnabled();
			this.closeDialog();
		},

		openDialog: function () {
			this.oDialog.open();
		},

		closeDialog: function () {
			this.oDialog.close();
		},

		filterEstacionChanged: function (evt) {
			var estacion = AppManagementHelper.getModel("DateFilterSelectionJsonModel").getProperty("/Ubicacion");
			var tipo = AppManagementHelper.getModel("DateFilterSelectionJsonModel").getProperty("/TipoEquipo");
			var novFilterEquipos = new sap.ui.model.json.JSONModel({});
			this.oDialog.setModel(novFilterEquipos, "novFilterEquipos");
			if (this.lineas.includes(tipo)) {
				AppManagementHelper.getModel("DateFilterSelectionJsonModel").setProperty("/Ubicacion", null);
				EquiposService.loadEquipos(tipo, null, this.mainController.society, novFilterEquipos);
			} else if (tipo && estacion) {
				EquiposService.loadEquipos(tipo, estacion, this.mainController.society, novFilterEquipos);
			}
			this.handleDateFilter();
		},

		isNotLinea: function (tipo) {
			return !this.lineas.includes(tipo);
		}
	};

});