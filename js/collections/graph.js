(function(){
	'use strict';
	var Backbone = require('backbone');
	var NodeModel = require('../../js/models/node.js');

	var Graph = Backbone.Collection.extend({
		model: NodeModel
	});

	module.exports = Graph;
})();