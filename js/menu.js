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
	nodes = {};
	uniqueNum = 1;
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
			nodes = obj;
			var keys = Object.keys(nodes);
			uniqueNum = keys.length + 1;
			for(let i=0; i<keys.length; i++){
				let id = keys[i];
				let x = nodes[id].left;
				let y = nodes[id].top;
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
