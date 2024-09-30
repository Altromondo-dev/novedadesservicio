sap.ui.define([
	"sap/ui/core/Control",
	"sap/ui/layout/form/Form",
	"sap/ui/layout/form/FormRenderer"
], function (Control, Form, FormRenderer) {
	"use strict";
	return Control.extend("sap.m.isFilterBar", {
		metadata: {
			properties: {
				filters: {type: "string[]"}
			},
		},
		renderer: function (rm, control) {
			rm.write("<span>HELLO WORLD</span>");
			rm.renderControl(control.getForm());
		},

		getForm: function () {
			return new sap.ui.layout.form.Form({
				formContainers: [
					new sap.ui.layout.form.FormContainer({
						formElements: [
							new sap.ui.layout.form.FormElement({
								label: new sap.m.Label({
									text: "{i18n>Id}",
									layoutData: new sap.ui.layout.GridData({
										span: "L6 M6 S12"
									})
								}),
								fields: [
									new sap.m.Input({
										type: sap.m.InputType.Number,
										maxLength: 10,
										layoutData: new sap.ui.layout.GridData({
											span: "L6 M6 S12"
										})

									})
								]
							}),
						]
					})
				]
			})
		}

		/*oninput: function (oEvent) {
			
		}*/

	});
});