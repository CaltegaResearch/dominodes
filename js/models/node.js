/*jshint esnext: true */
(function(){
	'use strict';
	var Backbone = require('backbone');
	var uuid = require('node-uuid');
	var uniqueNum = 0;

	var Node = Backbone.Model.extend({
		defaults:{
			value: "",
			inputs: [],
			outputs: [],
			formula: "",
			color: "grey",
			comment: "",
			top:"0",
			left:"0"
		},
		initialize: function(){
			this.set({
				id: uuid.v4(),
				label: "Node"+(uniqueNum++)
			});
		}
	});

	module.exports = Node;
})();
