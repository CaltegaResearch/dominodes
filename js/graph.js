var uniqueNum = 0;

var nodes = {};

function addNode(){
	var data = {
		label: "",
		value: "",
		inputs: [],
		outputs: [],
		formula: "",
		color: "grey",
		comment: ""
	};

	var id = "n"+uniqueNum;
	nodes[id] = data;
	uniqueNum += 1;
	return id;
}
function removeNode(id){
	var n = nodes[id];
	for(var i=0; i<n.inputs.length; i++){
		nodes[n.inputs[i]].outputs.splice(nodes[n.inputs[i]].outputs.indexOf(id),1);
		$("#"+n.inputs[i]+id).remove();
		delete edges[n.inputs[i] + id];
	}
	for(var i=0; i<n.outputs.length; i++){
		nodes[n.outputs[i]].inputs.splice(nodes[n.outputs[i]].inputs.indexOf(id),1);
		$("#"+id+n.outputs[i]).remove();
		delete edges[id+n.outputs[i]];
	}
	delete nodes.id;
	$("#"+id).remove();
}

function refreshGraph(){
	evalGraph();
	Object.keys(nodes).forEach(function(key){
		$("#"+key+" .right p").html(nodes[key].value);
	});
}

function setLabel(id, label){
	nodes[id].label = label;
}
function setValue(id, value){
	nodes[id].value = value;
}
function addInput(id, id2){
	nodes[id].inputs.push(id2);
}
function addOutput(id, id2){
	nodes[id].outputs.push(id2);
}
function removeInput(id, id2){
	nodes[id].inputs.splice(nodes[id].inputs.indexOf(id2),1);
}
function removeOutput(id, id2){
	nodes[id].outputs.splice(nodes[id].outputs.indexOf(id2),1);
}
function setFormula(id, formula){
	nodes[id].formula = formula;
}
function setColor(id, color){
	nodes[id].color = color;
}
function setComment(id, comment){
	nodes[id].comment = comment;
}

function evalFormula(id){
	var replaced = nodes[id].formula;

	nodes[id].inputs.forEach(function(cell){
		if(nodes[cell].value === '-') return '-';
		var re = new RegExp(nodes[cell].label, "gi");
		replaced = replaced.replace(re, nodes[cell].value);
	});

	try{
		return math.eval(replaced);
	}
	catch(err){
		return '-';
	}
}

function evalGraph(){
	visited = [];
	notYet = Object.keys(nodes);
	function traverse(cell){

		nodes[cell].inputs.forEach(function(next){
			if (visited.indexOf(next) !== -1){
				return traverse(next);
			}
		});

		setValue(cell, evalFormula(cell));
		visited.push(notYet.splice(notYet.indexOf(cell), 1));
	}

	while(notYet.length > 0){
		traverse(notYet[0]);
	}
}