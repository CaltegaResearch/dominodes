/* jshint esnext: true */
'use strict';

var SidebarView = require('./js/views/sidebar.js');
var ToolbarView = require('./js/views/toolbar.js');
var GraphView = require('./js/views/graph.js');
var GraphCollection = require('./js/collections/graph.js');

var sidebar = new SidebarView();
var toolbar = new ToolbarView();
var graphcollection = new GraphCollection();
var graph = new GraphView({ collection: graphcollection });

