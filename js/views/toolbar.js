/* jshint esnext: true */
'use strict';

var app = app || {};
var Mustache = require('mustache');
var $ = require('jquery');
var Backbone = require('backbone');
Backbone.$ = $;

var ToolbarView = Backbone.View.extend({
	el: '#toolbar',

	template: $('#toolbar-template').html(),

	events: {
	},

	initialize: function(){
		this.render();
	},

	render: function(){
		this.$el.html(Mustache.render(this.template));
	}

});

var toolbarview = new ToolbarView();