var jsonFile = require('jsonfile');
var gui = require('nw.gui');

var win = gui.Window.get();

function initMenu(){
	var menubar = new gui.Menu({ type: 'menubar' });
	var fileMenu = new gui.Menu();
	fileMenu.append(new gui.MenuItem({
	    label: 'New',
	    click: function() {
	    }
	}));
	fileMenu.append(new gui.MenuItem({
	    label: 'Open',
	    click: function() {
	    	$("#openFileDialog").change(function(key){
	    		loadGraph($(this).val());
	    	});
	    	$("#openFileDialog").trigger("click");
	    }
	}));
	fileMenu.append(new gui.MenuItem({
	    label: 'Save',
	    click: function() {
	    	$("#saveFileDialog").change(function(key){
	    		saveGraph($(this).val());
	    	});
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

initMenu();

function saveGraph(graphName){
	jsonFile.writeFile(graphName, nodes, function(err){
		if(err){
			console.log(err);
			alert("Save failed: "+err);
		}
	});
}

function loadGraph(graphName){
	console.log(graphName);
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
			console.log(obj);
		}
		else{
			console.log(err);
			alert("Load failed: "+err);
		}
	});
}