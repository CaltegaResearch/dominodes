(function(){
	'use strict';
	var Backbone = require('backbone');

  var Graph = Backbone.Collection.extend({
    model: Node
  });

	module.exports = Graph;
})();
