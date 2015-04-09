/* jshint esnext: true */
'use strict';

var app = app || {};
var Mustache = require('mustache');
var $ = require('jquery');
var Backbone = require('backbone');
Backbone.$ = $;

var SidebarView = Backbone.View.extend({
	el: '#sidebar',

	template: $('#sidebar-template').html(),

	events: {
		'keydown #label': 'labelKeydown',
		'keyup #label': 'labelKeyup',
		'keydown #formulaInput': 'formulaKeydown',
		'keyup #formulaInput': 'formulaKeyup'
	},

	initialize: function(){
		this.render();
	},

	render: function(){
		this.$el.html(Mustache.render(this.template));
	},

	labelKeydown: function(){},
	labelKeyup: function(){},
	formulaKeydown: function(){},
	formulaKeyup: function(){}
});

var sidebarview = new SidebarView();