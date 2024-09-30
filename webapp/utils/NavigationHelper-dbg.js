sap.ui.define([
	//utils
	"Transener/Operaciones/NovedadesServicio/utils/FioriComponentHelper"
	], function(FioriComponentHelper) {
	"use strict";

	return {
		
		_appId: "app",
		
		_getApp: function() {
	    	//gets component
	    	var component = FioriComponentHelper.getComponent();
			return component.byId("App").byId(this._appId);
		},
		
		_pageIsMaster: function(pageId) {
			return (pageId.match(/Master$/) !== null);
		},

		_getPageName: function(pageId) {
			var pageParts = pageId.split(".");
			return pageParts[pageParts.length - 1];
		},
		
		_getPageInstance: function(pageId, pageName) {
			var isMaster = this._pageIsMaster(pageId);
			//verifica si ya instancio esa pagina
		    var component = FioriComponentHelper.getComponent();
			var view = component.byId("App").byId(pageName);
			if (!view) {
				//creates view
				var viewId = component.byId("App").createId(pageName);
				view = sap.ui.jsview(viewId, pageId);
				//adds view to split app
				this._getApp().addPage(view, isMaster);
			}
			return view;
		},
		
		//options: objeto con pageId, context, model, transitionName
		to: function(options) {
			var pageName = this._getPageName(options.pageId);
			//gets view
			var view = this._getPageInstance(options.pageId, pageName);
			//modelo
			if (options.model) {
				view.setModel(options.model);
			}
			//contexto
			if (options.context) {
				view.setBindingContext(options.context);
			}
			//navigates
			var viewId = view.getId();
			this._getApp().to(viewId, options.transitionName);
		},
		
		destroyPage: function(pageId) {
		    var component = FioriComponentHelper.getComponent();
			var view = component.byId("App").byId(pageId);
			//destruye vista
			view.destroy();
		},
		
		//options: object with pageName, destroy
		back: function(options) {
			options = (options) ? options: {};
			//pagina actual
			var currentPageId = this._getApp().getCurrentPage().getId();
			//back
			if (options.pageName) {
				this._getApp().backToPage(options.pageName);
			}
			else {
				this._getApp().back();
			}
			//se fija si debe eliminar la pagina actual
			if (options.destroy) {
				var navigationHelper = this;
				setTimeout(function() {
					navigationHelper.destroyPage(currentPageId);
				}, 500);
			}
		}
	};
});