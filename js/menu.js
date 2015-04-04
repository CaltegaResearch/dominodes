var jsonFile = require('jsonfile');
var gui = require('nw.gui');

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
	for(var i=0; i<keys.length; i++){
		$("#"+keys[i]).remove();
		if(nodes[keys[i]].outputs){
			for(var j=0; j<nodes[keys[i]].outputs.length; j++){
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
	if(graphName == ""){
		return;
	}
	clearGraph();
	jsonFile.readFile(graphName, function(err,obj){
		if(!err){
			nodes = obj;
			var keys = Object.keys(nodes);
			uniqueNum = keys.length + 1;
			for(var i=0; i<keys.length; i++){
				var id = keys[i];
				var x = nodes[id].left;
				var y = nodes[id].top;
				var color = nodes[id].color;
				var value = nodes[id].value;
				createCell(x,y,color,id,value);
			}
			for(var i=0; i<keys.length; i++){
				var id = keys[i];
				for(var j=0; j<nodes[id].outputs.length; j++){
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