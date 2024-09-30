sap.ui.define([
	//helpers
], function() {
	"use strict";

	return {

		_reader: null,
		_file: [],

		//callback will have a binarystring as parameter, ie callback(binaryString)
		readBinaryString: function(File, fileLoadedCallback) {
			//inicializa reader
			this._reader = new FileReader();
			this._reader.onload = jQuery.proxy(this._onFileReaderLoad, this, fileLoadedCallback);
			//comienza upload
			this._reader.binaryType = File.type;
			this._reader.binaryName = File.name;
			this._reader.readAsBinaryString(File);
			this._file.push(this._reader);
		},

		_onFileReaderLoad: function(callback) {
			//busco contenido xstring del archivo
			var bin = [];
			//for (var i = 0; i < this._file.length; i++) {
			var binaryString = {};

			binaryString.FileBin = btoa(this._reader.result);
			binaryString.FileName = this._reader.binaryName;
			binaryString.FileType = this._reader.binaryType;
			//};
			//bin.push(binaryString);
			//llamo a Callback
			callback(binaryString);
			binaryString = {};
		}

	};
});