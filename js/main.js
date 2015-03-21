var selectedCell = null;
var selectedInput = null;
var selectedOutput = null;
var edges = [];

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

function onInputClicked(element){
	console.log(element);
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
		var dstr = "M"+outX+","+outY+" C"+(outX+50)+","+outY
					+" "+(inX-50)+","+inY+" "+inX+","+inY;
		var path = "<path id=\""+selectedOutput+selectedInput+"\" d=\""+dstr+"\" />";
		edges.push(path);
		var edge = document.createElementNS("http://www.w3.org/2000/svg", "path");
		edge.setAttribute('d',dstr);
		edge.setAttribute('id',selectedOutput+selectedInput);
		$("#edgesSvg").append(edge);
	}
	selectedInput = null;
	selectedOutput = null;
}
function onOutputClicked(element){
	console.log(element);
	selectedInput = null;
	selectedOutput = element.parentNode.id;
}

function onCellClick(e){
	e.stopPropagation();
	toggleSelected(e.currentTarget);
}
function onCellDblClick(e){
	e.stopPropagation();
	var pointX = e.pageX - e.currentTarget.style.left.split("px")[0];
	var pointY = e.pageY - e.currentTarget.style.top.split("px")[0];
	if(pointX < 150){
		e.currentTarget.children[0].children[0].focus();
	}else{
		e.currentTarget.children[1].children[0].focus();
	}
}
function onCellKeyDown(e){
	var cell = document.activeElement.parentNode.parentNode;
	var id = cell.id;
	setLabel(id, cell.children[0].children[0].innerHTML);
	setValue(id, cell.children[1].children[0].innerHTML);
	if (e.which == 13) {
	  	e.stopPropagation();
	    if ("activeElement" in document){
    		document.activeElement.blur();
	    }
		clearSelected();
		return false;
	}
}

function toggleSelected(cell){
	var tmp = selectedCell;
	clearSelected();
	cell.classList.add("selected");
	selectedCell = cell;
}
function clearSelected(){
	if(selectedCell){
		selectedCell.classList.remove("selected");
	}
	selectedCell = null;
}

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