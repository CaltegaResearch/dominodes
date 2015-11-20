var selectedCell = null;

var editingLabel = false;
var editingFormula = false;

// TODO: DEPRECATE
var selectedInput = null;
var selectedOutput = null;

var cellTemplate = $('#cell-template').html();
Mustache.parse(cellTemplate);

function createCell(x,y,color){
	/*
	Creates a cell and adds it to the graph.
	Selects the created cell.
	 */
	var ID = addNode();
	var data = {
		"label" : nodes[ID].label,
		"value" : '-',
		"color" : 'grey'
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
	selectCell(cell.get(0));

	$("#"+ID+" .left p").dblclick(onCellLabelDoubleClicked);
	$("#"+ID+" .left p").keydown(unSelectOnEnter);

	$("#"+ID+" .right p").dblclick(onCellValueDoubleClicked);
	$("#"+ID+" .right p").keydown(unSelectOnEnter);
}

function onCellDragged(event, ui){
	/*
	Updates the edges between nodes when one node is dragged.
	 */
	var id = event.currentTarget.id;
	selectCell(event.currentTarget);
	var offset = ui.offset;
	var cellWidth = parseInt($("#"+id).css("width").split("px")[0]);
	var cellHeight = parseInt($("#"+id).css("height").split("px")[0]);
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
	/*
	Changes the color of the selected cell to the given color.
	 */
	if(selectedCell){
		clearSelectedColor();
		selectedCell.classList.add(color);
		setColor(selectedCell.id,color);
	}
}

function clearSelectedColor(){
	/*
	Removes every color class from the selected cell.
	 */
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
	/*
	Connects the clicked cell to the previously clicked output cell.
	TODO: DEPRECATE
	 */
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
		var cellHeight = parseInt($("#"+selectedInput).css('height').split(".")[0]);
		var cellWidth = parseInt($("#"+selectedInput).css('width').split(".")[0]);
		var inOff = $("#"+selectedInput).offset();
		var outOff = $("#"+selectedOutput).offset();
		var outX = outOff.left+cellWidth;
		var outY = outOff.top+cellHeight/2;
		var inX = inOff.left;
		var inY = inOff.top+cellHeight/2;
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
	/*
	Sets the current cell as the selected ouput cell.
	TODO: DEPRECATE
	 */
	selectedInput = null;
	selectedOutput = element.parentNode.id;
}

function onCellClick(e){
	/*
	Selects the clicked cell.
	 */
	selectCell(e.currentTarget);
	e.stopPropagation();
}

function onCellDblClick(e){
	/*
	Stops the event from bubbling to prevent new cell from being created.
	 */
	e.stopPropagation();
}

function selectCell(cell){
	/*
	Unselects the previously selected cell,
		and sets the selected cell as the given cell.
	 */
	unselectCell();

	cell.classList.add("selected");
	selectedCell = cell;
}

function unselectCell(){
	/*
	Removes the "selected" class from the current selected cell.
	Updates the label or formula of the selected cell if it was being edited.
	 */
	if(selectedCell){
		if(editingLabel){
			editingLabel = false;
			var newLabel = $("#"+selectedCell.id+" .left p").html();
			newLabel = newLabel.replace("<br>","");
			setLabel(selectedCell.id, newLabel);
		}
		if(editingFormula){
			editingFormula = false;
			var newFormula = $("#"+selectedCell.id+" .right p").html();
			newFormula = newFormula.replace("<br>","");
			setFormula(selectedCell.id, newFormula);
		}
		selectedCell.classList.remove("selected");
	}
}

function addToFormula(text){
	/*
	Inserts the given text into the formula input box at the cursor location.
	TODO: Update to no longer use the removed/deprecated formulaInput.
	 */
	var cursorPos = document.getElementById("formulaInput").selectionStart;
	var id = selectedCell.id;
	var oldFormula = nodes[id].formula;
	var newFormula = oldFormula.substring(0,cursorPos)+text+oldFormula.substring(cursorPos);
	setFormula(id,newFormula);
	$("#formulaInput").val(newFormula);
	$("#formulaInput").focus();
}

function onCellLabelDoubleClicked(e){
	/*
	Focuses and selects the label of the double-clicked cell.
	 */
	e.stopPropagation();
	var id = e.currentTarget.parentNode.parentNode.id;
	selectCell(e.currentTarget.parentNode.parentNode);
	$("#"+id+" .left p").focus();
	document.execCommand('selectAll', false, null);
	window.editingLabel = true;
}

function onCellValueDoubleClicked(e){
	/*
	Focuses and selects the value of the double-clicked cell.
	Replaces the value with the cell's formula for editing.
	 */
	e.stopPropagation();
	var id = e.currentTarget.parentNode.parentNode.id;
	selectCell(e.currentTarget.parentNode.parentNode);
	$("#"+id+" .right p").html(nodes[id].formula);
	$("#"+id+" .right p").focus();
	document.execCommand('selectAll', false, null);
	window.editingFormula = true;
}

function unSelectOnEnter(e){
	/*
	Checks to see if the enter key is pressed, and if so deselects the cell.
	 */
	if(e.which == 13){
		e.currentTarget.blur();
		unselectCell();
		e.preventDefault();
		e.stopPropagation();
 	}
}

$(".wrapper").dblclick(function(e){
	/*
	Creates a cell at the location that was double clicked.
	Note:
		If a cell was double clicked, the event is stopped before this is run.
	 */
	createCell(e.pageX - 150,e.pageY - 30);
});

$(".wrapper").click(function(e){
	/*
	Unselects the currently selected cell if blank space is clicked.
	 */
	unselectCell();
});

$(document).keypress(function(e) {
	/*
	Checks to see if the enter key is pressed, and then blurs the input.
	Checks to see if the backspace key is pressed,
		and then deletes the currently selected cell.
	 */
	if(e.which == 13) {
 	 	e.stopPropagation();
 		window.blur();
	    unselectCell();
 	}
	if(e.which == 8 && selectedCell && !window.editingLabel && !window.editingFormula){
		e.stopPropagation();
		removeNode(selectedCell.id);
		window.blur();
	}
});
