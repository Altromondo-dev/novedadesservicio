sap.ui.define([
	"sap/ui/core/Control",
	"sap/m/ComboBox",
	"sap/m/ComboBoxRenderer",
	"sap/m/ComboBoxBase"
], function (Control, ComboBox, ComboBoxRenderer, ComboBoxBase) {
	"use strict";
	return ComboBox.extend("sap.m.isComboBox", {
		metadata: {
			properties: {},
		},
		renderer: ComboBoxRenderer,

		oninput: function (oEvent) {
			sap.m.ComboBoxBase.prototype.oninput.apply(this, arguments);

			if (oEvent.isMarked("invalid")) {
				return;
			}

			var bToggleOpenState = (this.getPickerType() === "Dropdown");

			this.loadItems(function () {
				var oSelectedItem = this.getSelectedItem(),
					sValue = oEvent.target.value,
					bEmptyValue = sValue === "",
					oControl = oEvent.srcControl,
					aVisibleItems;

				if (bEmptyValue && !this.bOpenedByKeyboardOrButton) {
					aVisibleItems = this.getItems();
				} else {
					aVisibleItems = this.filterItems({
						properties: this._getFilters(),
						value: sValue
					});
				}

				var bItemsVisible = !!aVisibleItems.length;
				var oFirstVisibleItem = aVisibleItems[0]; // first item that matches the value
				var bTextMatched = (oFirstVisibleItem && jQuery.sap.startsWithIgnoreCase(oFirstVisibleItem.getText(), sValue));
				var bSearchBoth = this.getFilterSecondaryValues();
				var bDesktopPlatform = sap.ui.Device.system.desktop;

				if (bEmptyValue || !bItemsVisible ||
					(!oControl._bDoTypeAhead && (this._getSelectedItemText() !== sValue))) {
					this.setSelection(null);

					if (oSelectedItem !== this.getSelectedItem()) {
						this.fireSelectionChange({
							selectedItem: this.getSelectedItem()
						});
					}
				}

				this._sInputValueBeforeOpen = sValue;

				if (this.isOpen()) {
					// this._highlightList(sValue);
				}

				if (bItemsVisible) {
					if (bEmptyValue && !this.bOpenedByKeyboardOrButton) {
						this.close();
					} else if (bToggleOpenState) {
						this.open();
						this.scrollToItem(this.getSelectedItem());
					}
				} else if (this.isOpen()) {
					if (bToggleOpenState && !this.bOpenedByKeyboardOrButton) {
						this.close();
					}
				} else {
					this.clearFilter();
				}
			}, {
				name: "input",
				busyIndicator: false
			});

			if (this.bProcessingLoadItemsEvent && bToggleOpenState) {
				this.open();
			}
		},

		filterItems: function (mOptions, aItems) {
			var aProperties = mOptions.properties,
				sValue = mOptions.value,
				bEmptyValue = sValue === "",
				bMatch = false,
				bTextMatch = false,
				aMutators = [],
				aFilteredItems = [],
				oItem = null;

			this._oFirstItemTextMatched = null;

			aProperties.forEach(function (property) {
				aMutators.push("get" + property.charAt(0).toUpperCase() + property.slice(1));
			});

			aItems = aItems || this.getItems();

			for (var i = 0; i < aItems.length; i++) {
				oItem = aItems[i];

				// the item match with the value
				bMatch = bEmptyValue;
				for (var j = 0; j < aMutators.length; j++) {
					//cambie el filtro de un "empieza por" a un "contiene"
					if (oItem[aMutators[j]]().toLowerCase().includes(sValue.toLowerCase())) {
						bMatch = true;
						if (aMutators[j] === "getText") {
							bTextMatch = true;
						}
					}
				}

				if (bMatch) {
					aFilteredItems.push(oItem);
				}
				this._setItemVisibility(oItem, bMatch);
			}
			return aFilteredItems;
		},

	});
});