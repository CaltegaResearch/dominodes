var jsonFile = require('jsonfile');
var gui = require('nw.gui');

var win = gui.Window.get();

var menubar = new gui.Menu({ type: 'menubar' });
var fileMenu = new gui.Menu();
fileMenu.append(new gui.MenuItem({
    label: 'New',
    click: function() {
    }
}));

menubar.append(new gui.MenuItem({ label: 'File', submenu: fileMenu}));
win.menu = menubar;

function save(graphName){
	jsonFile.writeFile('graphs/'+graphName+'.dominodes', nodes, function(err){
		console.log(err);
		alert("Save failed: "+err);
	});
}

function load(graphName){
	jsonFile.readFile('graphs/'+graphName+'.dominodes', function(err,obj){
		if(!err){
			nodes = obj;
		}
		else{
			console.log(err);
			alert("Load failed: "+err);
		}
	});
}
