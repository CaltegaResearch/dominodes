/*jshint esnext: true */
'use strict';
var $ = require('jquery');
var math = require('mathjs');
var nodes = {};
const ERRORSTRING = "---";

function addNode(){
	var data = {
		label: "Node"+uniqueNum,
		value: "",
		inputs: [],
		outputs: [],
		formula: "",
		color: "grey",
		comment: "",
		top:"0",
		left:"0"
	};

	var id = "n"+uniqueNum;
	nodes[id] = data;
	return id;
}

function removeNode(id){
	var n = nodes[id];
	for(let i of n.inputs){
		nodes[i].outputs.splice(nodes[i].outputs.indexOf(id),1);
		$("#"+i+id).remove();
	}
	for(let i of n.outputs){
		nodes[i].inputs.splice(nodes[i].inputs.indexOf(id),1);
		$("#"+id+i).remove();
	}
	delete nodes[id];
	$("#"+id).remove();
	refreshGraph();
}

function refreshGraph(){
	evalGraph();
	for(let key of Object.keys(nodes)){
		$("#"+key+" .right p").html(nodes[key].value);
	}
}

function setLabel(id, label){
	nodes[id].label = label;
	$("#"+id+" .left p").html(label);
	refreshGraph();
	if(label === ''){
		$("#"+id).addClass("error");
	}else{
		$("#"+id).removeClass("error");
	}
}
function setValue(id, value){
	nodes[id].value = value;
	$("#"+id+" .right p").html(value);
	if(value === ERRORSTRING){
		$("#"+id).addClass("error");
	}else{
		$("#"+id).removeClass("error");
	}
}
function setFormula(id, formula){
	nodes[id].formula = formula;
	refreshGraph();
}
function addInput(id, id2){
	nodes[id].inputs.push(id2);
}
function addOutput(id, id2){
	nodes[id].outputs.push(id2);
}
function removeInput(id, id2){
	nodes[id].inputs.splice(nodes[id].inputs.indexOf(id2),1);
	refreshGraph();
}
function removeOutput(id, id2){
	nodes[id].outputs.splice(nodes[id].outputs.indexOf(id2),1);
	refreshGraph();
}
function setColor(id, color){
	nodes[id].color = color;
}
function setComment(id, comment){
	nodes[id].comment = comment;
}

function evalFormula(id){
	var replaced = nodes[id].formula;

	for(let cell of nodes[id].inputs){
		if(nodes[cell].value === ERRORSTRING){
			 return ERRORSTRING;
		}
		let re = new RegExp(nodes[cell].label, "gi");
		replaced = replaced.replace(re, nodes[cell].value);
	}

	try{
		return math.eval(replaced) || '-';
	}
	catch(err){
		return ERRORSTRING;
	}
}

function evalGraph(){
	var visited = [];
	var notYet = Object.keys(nodes);
	function traverse(cell){
		for(let next of nodes[cell].inputs){
			if (visited.indexOf(next) === -1){
				traverse(next);
			}
		}
		setValue(cell, evalFormula(cell));
		visited.push(notYet.splice(notYet.indexOf(cell), 1)[0]);
	}
	while(notYet.length > 0){
		traverse(notYet[0]);
	}
}

function willFormCycle(origin){
	var visited = new Set();
	var toVisit = [origin];
	while(toVisit.length>0){
		let x = toVisit.pop();
		if (!visited.has(x)){
			visited.add(x);
			toVisit = toVisit.concat(nodes[x].inputs);
		}
	}
	return visited;
}
