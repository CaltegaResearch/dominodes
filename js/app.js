/* jshint esnext: true */
'use strict';

var $ = require('jquery');
var Backbone = require('backbone');
Backbone.$ = $;

var SidebarView = require('./js/views/sidebar.js');
var ToolbarView = require('./js/views/toolbar.js');
var GraphView = require('./js/views/graph.js');
var GraphCollection = require('./js/collections/graph.js');

var sidebar = new SidebarView();
var toolbar = new ToolbarView();
var graphcollection = new GraphCollection();
var graph = new GraphView({ collection: graphcollection });

var App = Backbone.View.extend({

	initialize: function(){
		this.sidebar = new SidebarView();
		this.toolbar = new ToolbarView();
		this.graphcollection = new GraphCollection();
		this.graph = new GraphView({ collection: this.graphcollection });
	}
});

var app = new App();