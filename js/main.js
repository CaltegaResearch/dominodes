var selectedCell = null;
var selectedInput = null;
var selectedOutput = null;
var edges = {};

var cellTemplate = $('#cell-template').html();
Mustache.parse(cellTemplate);

function addCell(x,y,label,value,color){
	var data = {
		"label" : label,
		"value" : value,
		"color" : color
	};

	var rendered = Mustache.render(cellTemplate, data);
	var ID = addNode();
	var cell = $(rendered).draggable({snap:true})
		.bind('drag', onCellDragged)
		.attr("id", ID)
		.css("top", y)
		.css("left", x)
		.click(onCellClick)
		.dblclick(onCellDblClick)
		.on('keydown',onCellKeyDown);
	$(".wrapper").append(cell);
	toggleSelected(cell.get(0));
	cell.get(0).children[0].children[0].focus();
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
		setColor(selectedCell,color);
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
	}
}

function onInputClicked(element){
	selectedInput = element.parentNode.id;
	if(selectedOutput){
		addInput(selectedInput,selectedOutput);
		addOutput(selectedOutput,selectedInput);
		var inOff = $("#"+selectedInput).offset();
		var outOff = $("#"+selectedOutput).offset();
		var outX = outOff.left+250;
		var outY = outOff.top+25;
		var inX = inOff.left;
		var inY = inOff.top+25;
		var diff= (inX-outX)/2;
		var dstr = "M"+outX+","+outY+" C"+(outX+diff)+","+outY
					+" "+(inX-diff)+","+inY+" "+inX+","+inY;
		var path = "<path id=\""+selectedOutput+selectedInput+"\" d=\""+dstr+"\" />";
		edges[selectedOutput+selectedInput] = path;
		var edge = document.createElementNS("http://www.w3.org/2000/svg", "path");
		edge.setAttribute('d',dstr);
		edge.setAttribute('id',selectedOutput+selectedInput);
		$("#edgesSvg").append(edge);
	}
	selectedInput = null;
	selectedOutput = null;
}
function onOutputClicked(element){
	selectedInput = null;
	selectedOutput = element.parentNode.id;
}

function onCellClick(e){
	if(selectedCell == e.currentTarget){
		onCellDblClick(e);
	}else{
		e.stopPropagation();
		toggleSelected(e.currentTarget);
	}
}
function onCellDblClick(e){
	e.stopPropagation();
	var pointX = e.pageX - e.currentTarget.style.left.split("px")[0];
	var pointY = e.pageY - e.currentTarget.style.top.split("px")[0];
	if(pointX < 150){
		e.currentTarget.children[0].children[0].focus();
	}else{
		e.currentTarget.children[1].children[0].focus();
		e.currentTarget.children[1].children[0].innerHTML = nodes[selectedCell.id].formula;
	}
}
function onCellKeyDown(e){
	var cell = document.activeElement.parentNode.parentNode;
	var id = cell.id;
	setLabel(id, cell.children[0].children[0].innerHTML);
	setValue(id, cell.children[1].children[0].innerHTML);
	setFormula(id, cell.children[1].children[0].innerHTML);
	if (e.which == 13) {
	  	e.stopPropagation();
		clearFocus();
		clearSelected();
		return false;
	}
}

function clearFocus(){
	if ("activeElement" in document){
		document.activeElement.blur();
		refreshGraph();
	}
}

function toggleSelected(cell){
	var tmp = selectedCell;
	clearSelected();
	clearFocus();
	cell.classList.add("selected");
	selectedCell = cell;
}
function clearSelected(){
	if(selectedCell){
		selectedCell.classList.remove("selected");
		refreshGraph();
	}
	selectedCell = null;
}

$("#trash").droppable({
	hoverClass: "not-transparent",
    drop: function( event, ui ) {
    	removeNode(ui.draggable.get(0).id);
    }
});
$(".wrapper").dblclick(function(e){
	addCell(e.pageX - 150,e.pageY - 30);
});
$(".wrapper").click(function(e){
	clearSelected();
})
$(document).keypress(function(e) {
  if(e.which == 13) {
  	e.stopPropagation();
    window.blur();
    clearSelected();
  }
});