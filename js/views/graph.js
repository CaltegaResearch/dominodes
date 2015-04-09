/* jshint esnext: true */
'use strict';

var app = app || {};
var $ = require('jquery');
var Backbone = require('backbone');
Backbone.$ = $;

var GraphView = Backbone.View.extend({
	el: '#wrapper',

	events: {
		'dblclick' : 'onDblClick',
		'click' : 'onClick'
	},

	initialize: function(){
		this.render();
		this.listenTo(this.collection, 'add', this.addNode);
	},

	render: function(){
		this.collection.each(function(node){
			var nodeView = new NodeView({ model: node });
			this.$el.append(nodeView.render().el);
		}, this);
		return this;
	},

	addNode: function(node){
		var nodeView = new NodeView({ model: node });
		this.$el.append(nodeView.render().el);
	},

	onDblClick : function(){},
	onClick : function(){}
});

var graphview = new GraphView();