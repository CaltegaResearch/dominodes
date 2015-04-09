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
		'click' : 'onClick',
		'click .cell' : 'onCellClick',
		'click .cell .port-left' : 'onInputClicked',
		'click .cell .port-right' : 'onOutputClicked'
	},

	initialize: function(){
		this.render();
	},

	render: function(){
		this.$el.html('success');
	},

	onDblClick : function(){},
	onClick : function(){},
	onCellClick : function(){},
	onInputClicked : function(){},
	onOutputClicked : function(){}
});

var graphview = new GraphView();