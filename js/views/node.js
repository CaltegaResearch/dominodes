/* jshint esnext: true */
'use strict';

var app = app || {};
var Mustache = require('mustache');
var $ = require('jquery');
var Backbone = require('backbone');
Backbone.$ = $;

var NodeView = Backbone.View.extend({
	tagName: 'div',

	template: $('#cell-template').html(),

	events: {
		'click' : 'onClick',
		'click .port-left' : 'onInputClicked',
		'click .port-right' : 'onOutputClicked'
	},

	render: function(){
		this.$el.html(Mustache.render(this.template, this.model.toJSON()));
		return this;
	},

	onClick : function(){},
	onInputClicked : function(){},
	onOutputClicked : function(){}
});

module.exports = NodeView;