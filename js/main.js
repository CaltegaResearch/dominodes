var selectedCell = null;
var selectedInput = null;
var selectedOutput = null;

var cellTemplate = $('#cell-template').html();
Mustache.parse(cellTemplate);

function createCell(x,y,color,id,value){
	var ID = id || addNode();
	color = color || "grey";
	value = value || '-';
	var data = {
		"label" : nodes[ID].label,
		"value" : value,
		"color" : color
	};

	var rendered = Mustache.render(cellTemplate, data);
	var cell = $(rendered).draggable({snap:true, containment: "parent"})
		.bind('drag', onCellDragged)
		.attr("id", ID)
		.css("top", y)
		.css("left", x)
		.dblclick(onCellDblClick)
		.click(onCellClick);
	$(".wrapper").append(cell);

	saveCellPos(ID);
	selectCell(cell.get(0));
	$("#label").focus();
	$("#label").select();
}

function createEdge(from,to){
	var cellHeight = parseInt($("#"+to).css('height').split(".")[0]);
	var cellWidth = parseInt($("#"+to).css('width').split(".")[0]);
	var inOff = $("#"+to).offset();
	var outOff = $("#"+from).offset();
	var outX = outOff.left+cellWidth;
	var outY = outOff.top+cellHeight/2;
	var inX = inOff.left;
	var inY = inOff.top+cellHeight/2;
	var diff= (inX-outX)/2;
	var dstr = "M"+outX+","+outY+" C"+(outX+diff)+","+outY+" "+(inX-diff)+","+inY+" "+inX+","+inY;
	var path = "<path id=\""+from+to+"\" d=\""+dstr+"\" />";
	var edge = document.createElementNS("http://www.w3.org/2000/svg", "path");
	edge.setAttribute('d',dstr);
	edge.setAttribute('id',from+to);
	$("#edgesSvg").append(edge);
}

function saveCellPos(id){
	var VW = window.innerWidth/100;
	nodes[id].left = (parseInt($("#"+id).css("left").split("px")[0])/VW) + "vw";
	nodes[id].top = (parseInt($("#"+id).css("top").split("px")[0])/VW) + "vw";
}

function destroyCell(id){
	removeNode(id);
	$("#formulaInput").val("");
	$("#label").val("");
	$("#inputsList").html("");
	$("#formulaInput").blur();
}

function onCellDragged(event, ui){
	var id = event.currentTarget.id;
	selectCell(event.currentTarget);
	$("#formulaInput").focus();
	var offset = ui.offset;
	var cellWidth = parseInt($("#"+id).css("width").split("px")[0]);
	var cellHeight = parseInt($("#"+id).css("height").split("px")[0]);

	saveCellPos(id);

	for(var i=0; i<nodes[id].inputs.length;i++){
		var pathid = nodes[id].inputs[i]+id;
		var path = document.getElementById(pathid);
		var ds = path.getAttribute("d").split(" ");
		ds[1] = "C"+((offset.left+parseInt(ds[0].split("M")[1].split(",")[0]))/2)+","+ds[1].split(",")[1];
		ds[2] = ((offset.left+parseInt(ds[0].split("M")[1].split(",")[0]))/2)+","+(offset.top+cellHeight/2);
		ds[3] = offset.left+","+(offset.top+cellHeight/2);
		path.setAttribute('d',ds.join(" "));
	}
	for(var i=0; i<nodes[id].outputs.length;i++){
		var pathid = id+nodes[id].outputs[i];
		var path = document.getElementById(pathid);
		var ds = path.getAttribute("d").split(" ");
		ds[0] = "M"+(offset.left+cellWidth)+","+(offset.top+cellHeight/2);
		ds[1] = "C"+((offset.left+cellWidth+parseInt(ds[3].split(",")[0]))/2)+","+(offset.top+cellHeight/2);
		ds[2] = ((offset.left+cellWidth+parseInt(ds[3].split(",")[0]))/2)+","+ds[2].split(",")[1];
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
	if(selectedOutput == null){
		return;
	}
	selectedInput = element.parentNode.id;
	if(nodes[selectedOutput].outputs.indexOf(selectedInput) !== -1){
		nodes[selectedInput].inputs.splice(nodes[selectedInput].inputs.indexOf(selectedOutput),1);
		nodes[selectedOutput].outputs.splice(nodes[selectedOutput].outputs.indexOf(selectedInput),1);
		$("#"+selectedOutput+selectedInput).remove();
	}
	else if(!willFormCycle(selectedOutput).has(selectedInput)){
		addInput(selectedInput,selectedOutput);
		addOutput(selectedOutput,selectedInput);
		createEdge(selectedOutput,selectedInput);
		refreshGraph();
	}
	selectedInput = null;
	selectedOutput = null;
}
function onOutputClicked(element){
	selectedInput = null;
	selectedOutput = element.parentNode.id;
	var cycleNodes = willFormCycle(selectedOutput);
	for(var node of cycleNodes){
		$('#'+node).addClass("disabled");
	}
	$(".wrapper").on("click",function(e){
		if(e.originalEvent.originalTarget.className != "port port-right"){
			selectedOutput = null;
			resetDisabled();
			$(this).off(e);
		}
	});
}

function resetDisabled(){
	var keys = Object.keys(nodes);
	for(var i=0; i<keys.length;i++){
		$("#"+keys[i]).removeClass("disabled");
	}
}

function onCellClick(e){
	selectCell(e.currentTarget);
	$("#formulaInput").focus();
	//e.stopPropagation();
}
function onCellDblClick(e){
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
	var cursorPos = document.getElementById("formulaInput").selectionStart;
	var id = selectedCell.id;
	var oldFormula = nodes[id].formula;
	var newFormula = oldFormula.substring(0,cursorPos)+text+oldFormula.substring(cursorPos);
	setFormula(id,newFormula);
	$("#formulaInput").val(newFormula);
	$("#formulaInput").focus();
}

function loadSideBar(id){
	var label = nodes[id].label;
	var formula = nodes[id].formula;
	var inputs = nodes[id].inputs;
	$("#label").val(label);
	$("#formulaInput").val(formula);
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
	setLabel(selectedCell.id, $("#label").val());
});
$("#formulaInput").keydown(function(e){
	if(e.which == 13){
		e.stopPropagation();
		e.currentTarget.blur();
	}
})
$("#formulaInput").keyup(function(e){
	setFormula(selectedCell.id, $("#formulaInput").val());
});

$("#trash").droppable({
	hoverClass: "not-transparent",
    drop: function( event, ui ) {
    	destroyCell(ui.draggable.get(0).id);
    }
});
$(".wrapper").dblclick(function(e){
	createCell(e.pageX - 150,e.pageY - 30);
});
$(".wrapper").click(function(e){
	console.log(e);
	if(e.originalEvent.originalTarget.className == "wrapper"){
		unselectCell();
	}
})
$(document).keypress(function(e) {
	if(e.which == 13) {
 	 	e.stopPropagation();
 		window.blur();
	    unselectCell();
 	}
});
