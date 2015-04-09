/*jshint esnext: true */
(function(){
	'use strict';
	var Backbone = require('backbone');
	var uuid = require('node-uuid');
	var uniqueNum = 1;

	var Node = Backbone.Model.extend({
		defaults:{
			id: uuid.v4(),
			label: "Node"+uniqueNum,
			value: "",
			inputs: [],
			outputs: [],
			formula: "",
			color: "grey",
			comment: "",
			top:"0",
			left:"0"
		}
	});

	var Nodes = Backbone.Collection.extend({
	  model: Node
	});
})();
