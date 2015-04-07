/* global nodes,uniqueNum,alert,VW,createCell,createEdge */
"use strict";
var jsonFile = require('jsonfile');
var gui = require('nw.gui');
var $ = require('jquery');

var win = gui.Window.get();

function initMenu(){
	var menubar = new gui.Menu({ type: 'menubar' });
	var fileMenu = new gui.Menu();
	fileMenu.append(new gui.MenuItem({
	    label: 'New',
	    click: function() {
	    	clearGraph();
	    }
	}));
	fileMenu.append(new gui.MenuItem({
	    label: 'Open',
	    click: function() {
	    	$("#openFileDialog").trigger("click");
	    }
	}));
	fileMenu.append(new gui.MenuItem({
	    label: 'Save',
	    click: function() {
	    	$("#saveFileDialog").trigger("click");
	    }
	}));
	fileMenu.append(new gui.MenuItem({
	    label: 'Exit',
	    click: function() {
	        gui.App.quit();
	    }
	}));

	menubar.append(new gui.MenuItem({ label: 'File', submenu: fileMenu}));
	win.menu = menubar;
}

$("#openFileDialog").change(function(key){
	loadGraph($(this).val());
	$("#openFileDialog").val("");
});
$("#saveFileDialog").change(function(key){
	saveGraph($(this).val());
	$("#saveFileDialog").val("");
});

initMenu();

function clearGraph(){
	var keys = Object.keys(nodes);
	for(let i=0; i<keys.length; i++){
		$("#"+keys[i]).remove();
		if(nodes[keys[i]].outputs){
			for(let j=0; j<nodes[keys[i]].outputs.length; j++){
				$("#"+keys[i]+nodes[keys[i]].outputs[j]).remove();
			}
		}
	}
	nodes = {}; // jshint ignore:line
	uniqueNum = 1; // jshint ignore:line
}

function saveGraph(graphName){
	jsonFile.writeFile(graphName, nodes, function(err){
		if(err){
			console.log(err);
			alert("Save failed: "+err);
		}
	});
}

function loadGraph(graphName){
	if(!graphName){
		return;
	}
	clearGraph();
	jsonFile.readFile(graphName, function(err,obj){
		if(!err){
			nodes = obj; // jshint ignore:line
			var keys = Object.keys(nodes);
			uniqueNum = keys.length + 1; // jshint ignore:line
			for(let i=0; i<keys.length; i++){
				let id = keys[i];
				let x = parseInt(nodes[id].left.split('vw'))*VW;
				let y = parseInt(nodes[id].top.split('vw'))*VW;
				let color = nodes[id].color;
				let value = nodes[id].value;
				createCell(x,y,color,id,value);
			}
			for(let i=0; i<keys.length; i++){
				let id = keys[i];
				for(let j=0; j<nodes[id].outputs.length; j++){
					createEdge(id,nodes[id].outputs[j]);
				}
			}
		}
		else{
			console.log(err);
			alert("Load failed: "+err);
		}
	});
}
