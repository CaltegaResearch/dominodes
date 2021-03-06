
/* global Graph,Dominode,removeNode,setColor,setLabel,setFormula,willFormCycle,
   addInput,addOutput,refreshGraph */
'use strict';
//globals for jquery-ui
global.document = window.document;
global.navigator = window.navigator;

var $ = require('jquery');
require('jquery-ui');
var Mustache = require('mustache');

const COLORS = ['blue','teal','green','yellow','orange','red','pink','grey'];

//viewport width/100; may change if window is resized
var VW = window.innerWidth/100;

var selectedCell;
var selectedInput;
var selectedOutput;
var graph = new Graph();

var cellTemplate = $('#cell-template').html();
Mustache.parse(cellTemplate);

function createCell(x,y,color,id,value){
	//default options

	var n = graph.addNode(x+"px",y+"px",color,id,value);

	var rendered = Mustache.render(cellTemplate, n);
	var cell = $(rendered)
		.draggable({snap: true, containment: 'parent'})
		.bind('drag', onCellDragged)
		.dblclick(onCellDblClick)
		.click(onCellClick);
	$('.wrapper').append(cell);

	saveCellPos(n.id);
	selectCell(n.id);
	$('#label').focus();
	$('#label').select();
}

function createEdge(from,to){
	var cellHeight = parseInt($('#'+to).css('height').split('.')[0]);
	var cellWidth = parseInt($('#'+to).css('width').split('.')[0]);
	var inOff = $('#'+to).offset();
	var outOff = $('#'+from).offset();
	var outX = outOff.left+cellWidth;
	var outY = outOff.top+cellHeight/2;
	var inX = inOff.left;
	var inY = inOff.top+cellHeight/2;
	var diff= (inX-outX)/2;
	var dstr = 'M'+outX+','+outY+' C'+(outX+diff)+','+outY+' '+(inX-diff)+','+inY+" "+inX+","+inY;
	var path = '<path id="'+from+to+'" d="'+dstr+'" />';
	var edge = document.createElementNS('http://www.w3.org/2000/svg', 'path');
	edge.setAttribute('d',dstr);
	edge.setAttribute('id',from+to);
	$('#edgesSvg').append(edge);
}

function saveCellPos(id){
	graph.nodes[id].left = (parseInt($('#'+id).css('left').split('px')[0])/VW) + 'vw';
	graph.nodes[id].top = (parseInt($('#'+id).css('top').split('px')[0])/VW) + 'vw';
}

function destroyCell(id){
	graph.removeNode(id);
	clearSideBar();
}

function onCellDragged(event, ui){
	var id = event.currentTarget.id;
	selectCell(id);
	$('#formulaInput').focus();
	saveCellPos(id);
	updateEdges(id);
}

function updateEdges(id){
	var offset = $('#'+id).offset();
	var cellWidth = parseInt($('#'+id).css('width').split('px')[0]);
	var cellHeight = parseInt($('#'+id).css('height').split('px')[0]);

	for(let inputId of graph.nodes[id].inputs){
		let pathid = inputId+id;
		let path = document.getElementById(pathid);
		let ds = path.getAttribute('d').split(' ');
		ds[1] = 'C'+((offset.left+parseInt(ds[0].split('M')[1].split(',')[0]))/2)+','+ds[1].split(',')[1];
		ds[2] = ((offset.left+parseInt(ds[0].split('M')[1].split(',')[0]))/2)+','+(offset.top+cellHeight/2);
		ds[3] = offset.left+','+(offset.top+cellHeight/2);
		path.setAttribute('d',ds.join(' '));
	}
	for(let outputId of graph.nodes[id].outputs){
		let pathid = id+outputId;
		let path = document.getElementById(pathid);
		let ds = path.getAttribute('d').split(' ');
		ds[0] = 'M'+(offset.left+cellWidth)+','+(offset.top+cellHeight/2);
		ds[1] = 'C'+((offset.left+cellWidth+parseInt(ds[3].split(',')[0]))/2)+','+(offset.top+cellHeight/2);
		ds[2] = ((offset.left+cellWidth+parseInt(ds[3].split(',')[0]))/2)+','+ds[2].split(',')[1];
		path.setAttribute('d',ds.join(' '));
	}
}

function setSelectedColor(color){
	if(selectedCell){
		//clear any color class it already has
		for(let possibleColor of COLORS){
			$('#'+selectedCell).removeClass(possibleColor);
		}
		graph.nodes[selectedCell].setColor(color);
	}
}

function onInputClicked(id){
	if(!selectedOutput){
		//only add/remove edge if output was clicked first
		return;
	}
	selectedInput = id;
	if(graph.nodes[selectedOutput].outputs.indexOf(selectedInput) !== -1){
		//edge exists: need to remove
		graph.nodes[selectedInput].removeInput(selectedOutput);
		graph.nodes[selectedOutput].removeOutput(selectedInput);
		$('#'+selectedOutput+selectedInput).remove();
	}
	else if(!graph.willFormCycle(selectedOutput).has(selectedInput)){
		//edge doesn't exist and doesn't form cycle: need to add
		graph.nodes[selectedInput].addInput(selectedOutput);
		graph.nodes[selectedOutput].addOutput(selectedInput);
		createEdge(selectedOutput,selectedInput);
		graph.refresh();
	}

	//reset output and input
	selectedInput = null;
	selectedOutput = null;
}
function onOutputClicked(id){
	selectedInput = null;
	selectedOutput = id;
	var cycleNodes = graph.willFormCycle(selectedOutput);
	//add disabled classes to nodes that will form a cycle
	for(let node of cycleNodes){
		$('#'+node).addClass('disabled');
	}

	//temp function that removes disabled classes for cycle detection
	$('.wrapper').on('click',function(e){
		if(e.originalEvent.target.className.indexOf('port-right') === -1){
			selectedOutput = null;
			resetDisabled();
			//remove this click event
			$(this).off(e);
		}
	});
}

function resetDisabled(){
	for(let id of Object.keys(graph.nodes)){
		$('#'+id).removeClass('disabled');
	}
}

function onCellClick(e){
	selectCell(e.currentTarget.id);
	$('#formulaInput').focus();
}
function onCellDblClick(e){
	e.stopPropagation();
}

function selectCell(id){
	if(selectedCell){
		$('#'+selectedCell).removeClass('selected');
	}
	$('#'+id).addClass('selected');
	selectedCell = id;
	loadSideBar(selectedCell);
}

function unselectCell(){
	if(selectedCell){
		$('#'+selectedCell).removeClass('selected');
	}
}

function addToFormula(text){
	var cursorPos = document.getElementById('formulaInput').selectionStart;
	var id = selectedCell;
	var oldFormula = graph.nodes[id].formula;
	//insert text at cursor
	var newFormula = oldFormula.substring(0,cursorPos) +
					 text +
					 oldFormula.substring(cursorPos);

	graph.nodes[id].setFormula(newFormula);
	$('#formulaInput').val(newFormula);
	$('#formulaInput').focus();
}

function clearSideBar(){
	$('#formulaInput').val('');
	$('#label').val('');
	$('#inputsList').html('');
	$('#formulaInput').blur();
}

function loadSideBar(id){
	var label = graph.nodes[id].label;
	var formula = graph.nodes[id].formula;
	$('#label').val(label);
	$('#formulaInput').val(formula);
	$('#inputsList').html('');
	for(let inputId of graph.nodes[id].inputs){
		let c = graph.nodes[inputId].color;
		let l = graph.nodes[inputId].label;
		$('#inputsList').append(
			'<li onclick="addToFormula(\''+l+'\')" class="'+c+'">'+l+'</li>'
		);
	}
}

$(window).resize(function(){
	for(let id of Object.keys(graph.nodes)){
		$('#'+id).css('top',graph.nodes[id].top);
		$('#'+id).css('left',graph.nodes[id].left);
		updateEdges(id);
	}
});

$('#label').keydown(function(e){
	if(e.which === 13){
		e.stopPropagation();
		e.currentTarget.blur();
	}
});
$('#label').keyup(function(e){
	graph.nodes[selectedCell].setLabel($('#label').val());
});
$('#formulaInput').keydown(function(e){
	if(e.which === 13){
		e.stopPropagation();
		e.currentTarget.blur();
	}
});
$('#formulaInput').keyup(function(e){
	graph.nodes[selectedCell].setFormula($('#formulaInput').val());
});

$('#trash').droppable({
	hoverClass: 'not-transparent',
    drop: function( event, ui ) {
    	destroyCell(ui.draggable.get(0).id);
    }
});
$('.wrapper').dblclick(function(e){
	createCell(e.pageX, e.pageY);
});
$('.wrapper').click(function(e){
	//only unselect if they clicked blank area
	if(e.originalEvent.target.className.indexOf('wrapper') > -1){
		unselectCell();
	}
});
$(document).keypress(function(e) {
	//pressing enter deselects cell
	if(e.which === 13) {
 	 	e.stopPropagation();
 		window.blur();
	    unselectCell();
 	}
});
