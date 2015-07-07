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
	var keys = Object.keys(graph.nodes);
	for(let i=0; i<keys.length; i++){
		$("#"+keys[i]).remove();
		if(graph.nodes[keys[i]].outputs){
			for(let j=0; j<graph.nodes[keys[i]].outputs.length; j++){
				$("#"+keys[i]+graph.nodes[keys[i]].outputs[j]).remove();
			}
		}
	}
	graph.nodes = {}; // jshint ignore:line
	uniqueNum = 1; // jshint ignore:line
}

function saveGraph(graphName){
	var toSave = {};
	for(let key of Object.keys(graph.nodes)){
		toSave[key] = graph.nodes[key].getSaveData();
	}
	jsonFile.writeFile(graphName, toSave, function(err){
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
			graph.nodes = {}; // jshint ignore:line
			var keys = Object.keys(obj);
			uniqueNum = keys.length + 1; // jshint ignore:line
			for(let i=0; i<keys.length; i++){
				let id = keys[i];
				let x = parseInt(obj[id].left.split('vw'))*VW;
				let y = parseInt(obj[id].top.split('vw'))*VW;
				let color = obj[id].color;
				let value = obj[id].value;
				createCell(x,y,color,id,value);
				graph.nodes[id].outputs = obj[id].outputs;
				graph.nodes[id].inputs = obj[id].inputs;
				graph.nodes[id].label = obj[id].label;
			}
			for(let i=0; i<keys.length; i++){
				let id = keys[i];
				for(let j=0; j<graph.nodes[id].outputs.length; j++){
					createEdge(id,graph.nodes[id].outputs[j]);
				}
			}
		}
		else{
			console.log(err);
			alert("Load failed: "+err);
		}
	});
}
