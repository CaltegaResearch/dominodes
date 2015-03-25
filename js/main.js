var selectedCell = null;
var selectedInput = null;
var selectedOutput = null;

var cellTemplate = $('#cell-template').html();
Mustache.parse(cellTemplate);

function createCell(x,y,color){
	var ID = addNode();
	var data = {
		"label" : nodes[ID].label,
		"value" : '-',
		"color" : 'grey'
	};

	var rendered = Mustache.render(cellTemplate, data);
	var cell = $(rendered).draggable({snap:true})
		.bind('drag', onCellDragged)
		.attr("id", ID)
		.css("top", y)
		.css("left", x)
		.click(onCellClick);
	$(".wrapper").append(cell);
	selectCell(cell.get(0));
}

function onCellDragged(event, ui){
	var id = event.currentTarget.id;
	var offset = ui.offset;
	for(var i=0; i<nodes[id].inputs.length;i++){
		var pathid = nodes[id].inputs[i]+id;
		var path = document.getElementById(pathid);
		var ds = path.getAttribute("d").split(" ");
		ds[1] = "C"+((offset.left+parseInt(ds[0].split("M")[1].split(",")[0]))/2)+","+ds[1].split(",")[1];
		ds[2] = ((offset.left+parseInt(ds[0].split("M")[1].split(",")[0]))/2)+","+(offset.top+25);
		ds[3] = offset.left+","+(offset.top+25);
		path.setAttribute('d',ds.join(" "));
	}
	for(var i=0; i<nodes[id].outputs.length;i++){
		var pathid = id+nodes[id].outputs[i];
		var path = document.getElementById(pathid);
		var ds = path.getAttribute("d").split(" ");
		ds[0] = "M"+(offset.left+250)+","+(offset.top+25);
		ds[1] = "C"+((offset.left+250+parseInt(ds[3].split(",")[0]))/2)+","+(offset.top+25);
		ds[2] = ((offset.left+250+parseInt(ds[3].split(",")[0]))/2)+","+ds[2].split(",")[1];
		path.setAttribute('d',ds.join(" "));
	}
}

function setSelectedColor(color){
	if(selectedCell){
		clearSelectedColor();
		selectedCell.classList.add(color);
		setColor(selectedCell.id,color);
	}
}

function clearSelectedColor(){
	if(selectedCell){
		selectedCell.classList.remove('blue');
		selectedCell.classList.remove('teal');
		selectedCell.classList.remove('green');
		selectedCell.classList.remove('yellow');
		selectedCell.classList.remove('orange');
		selectedCell.classList.remove('red');
		selectedCell.classList.remove('pink');
		selectedCell.classList.remove('grey');
	}
}

function onInputClicked(element){
	selectedInput = element.parentNode.id;
	if(nodes[selectedOutput].outputs.indexOf(selectedInput) !== -1){
		nodes[selectedInput].inputs.splice(nodes[selectedInput].inputs.indexOf(selectedOutput),1);
		nodes[selectedOutput].outputs.splice(nodes[selectedOutput].outputs.indexOf(selectedInput),1);
		$("#"+selectedOutput+selectedInput).remove();
		delete edges[selectedOutput+selectedInput];
	}
	else if(selectedOutput!==selectedInput){
		addInput(selectedInput,selectedOutput);
		addOutput(selectedOutput,selectedInput);
		var inOff = $("#"+selectedInput).offset();
		var outOff = $("#"+selectedOutput).offset();
		var outX = outOff.left+250;
		var outY = outOff.top+25;
		var inX = inOff.left;
		var inY = inOff.top+25;
		var diff= (inX-outX)/2;
		var dstr = "M"+outX+","+outY+" C"+(outX+diff)+","+outY+" "+(inX-diff)+","+inY+" "+inX+","+inY;
		var path = "<path id=\""+selectedOutput+selectedInput+"\" d=\""+dstr+"\" />";
		var edge = document.createElementNS("http://www.w3.org/2000/svg", "path");
		edge.setAttribute('d',dstr);
		edge.setAttribute('id',selectedOutput+selectedInput);
		$("#edgesSvg").append(edge);
		refreshGraph();
	}
	selectedInput = null;
	selectedOutput = null;
}
function onOutputClicked(element){
	selectedInput = null;
	selectedOutput = element.parentNode.id;
}

function onCellClick(e){
	selectCell(e.currentTarget);
	e.stopPropagation();
}

function selectCell(cell){
	if(selectedCell){
		selectedCell.classList.remove("selected");
	}
	cell.classList.add("selected");
	selectedCell = cell;
	loadSideBar(selectedCell.id);
}

function unselectCell(){
	if(selectedCell){
		selectedCell.classList.remove("selected");
	}
}

function addToFormula(text){
	var id = selectedCell.id;
	setFormula(id,nodes[id].formula+text);
	$("#formulaInput").html(nodes[id].formula);
}

function loadSideBar(id){
	var label = nodes[id].label;
	var formula = nodes[id].formula;
	var inputs = nodes[id].inputs;
	$("#label").html(label);
	$("#formulaInput").html(formula);
	$("#inputsList").html("");
	for(var i=0; i<inputs.length; i++){
		var c = nodes[inputs[i]].color;
		var l = nodes[inputs[i]].label;
		$("#inputsList").append(
			"<li onclick=\"addToFormula('"+l+"')\" class=\""+c+"\">"+l+"</li>"
		);
	}
}

$("#label").keydown(function(e){
	if(e.which == 13){
		e.stopPropagation();
		e.currentTarget.blur();
	}
});
$("#label").keyup(function(e){
	if($("#label").html().indexOf("<br>") != -1){
		$("#label").html($("#label").html().replace("<br>",""));
	}
	setLabel(selectedCell.id, $("#label").html());
});
$("#formulaInput").keydown(function(e){
	if(e.which == 13){
		e.stopPropagation();
		e.currentTarget.blur();
	}
})
$("#formulaInput").keyup(function(e){
	setFormula(selectedCell.id, $("#formulaInput").html());
});

$("#trash").droppable({
	hoverClass: "not-transparent",
    drop: function( event, ui ) {
    	removeNode(ui.draggable.get(0).id);
    }
});
$(".wrapper").dblclick(function(e){
	createCell(e.pageX - 150,e.pageY - 30);
});
$(".wrapper").click(function(e){
	unselectCell();
})
$(document).keypress(function(e) {
	if(e.which == 13) {
 	 	e.stopPropagation();
 		window.blur();
	    unselectCell();
 	}
});