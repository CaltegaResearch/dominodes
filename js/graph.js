var uniqueNum = 1;

var nodes = {};

var ERRORSTRING = "---";

function addNode(){
	/*
	Creates a new node object and adds it to the graph.
	Returns the id of the new object.
		(guaranteed to be unique)
	 */
	var data = {
		label: "Node"+uniqueNum,
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
	/*
	Removes the node with the given id from the graph,
		and removes all associated edges.
	 */
	var n = nodes[id];
	for(var i=0; i<n.inputs.length; i++){
		nodes[n.inputs[i]].outputs.splice(nodes[n.inputs[i]].outputs.indexOf(id),1);
		$("#"+n.inputs[i]+id).remove();
	}
	for(var i=0; i<n.outputs.length; i++){
		nodes[n.outputs[i]].inputs.splice(nodes[n.outputs[i]].inputs.indexOf(id),1);
		$("#"+id+n.outputs[i]).remove();
	}
	delete nodes[id];
	$("#"+id).remove();
	refreshGraph();
}

function refreshGraph(){
	/*
	Re-evaluates the entire graph and updates the labels.
	 */
	evalGraph();
	Object.keys(nodes).forEach(function(key){
		$("#"+key+" .right p").html(nodes[key].value);
	});
}

function setLabel(id, label){
	/*
	Sets the label of the node with the given id,
		and refreshes the graph.
	 */
	nodes[id].label = label;
	$("#"+id+" .left p").html(label);
	refreshGraph();
}

function setValue(id, value){
	/*
	Sets the value of the cell with the given id.
	 */
	nodes[id].value = value;
	$("#"+id+" .right p").html(value);
	if(value == ERRORSTRING){
		$("#"+id).addClass("error");
	}else{
		$("#"+id).removeClass("error");
	}
}

function setFormula(id, formula){
	/*
	Sets the formula of the cell with the given id,
		and refreshes the graph.
	 */
	nodes[id].formula = formula;
	refreshGraph();
}

function addInput(id, id2){
	/*
	Adds the node with id2 to the inputs of the node with id.
	 */
	nodes[id].inputs.push(id2);
}

function addOutput(id, id2){
	/*
	Adds the node with id2 to the outputs of the node with id.
	 */
	nodes[id].outputs.push(id2);
}

function removeInput(id, id2){
	/*
	Removes the node with id2 from the inputs of the node with id,
		and refreshes the graph.
	 */
	nodes[id].inputs.splice(nodes[id].inputs.indexOf(id2),1);
	refreshGraph();
}

function removeOutput(id, id2){
	/*
	Removes the node with id2 from the ouputs of the node with id,
		and refreshes the graph.
	 */
	nodes[id].outputs.splice(nodes[id].outputs.indexOf(id2),1);
	refreshGraph();
}

function setColor(id, color){
	/*
	Sets the color of the node with the given id.
	 */
	nodes[id].color = color;
}

function setComment(id, comment){
	/*
	Sets the comment of the node with the given id.
	TODO: REMOVE
	 */
	nodes[id].comment = comment;
}

function evalFormula(id){
	/*
	Evaluates the formula of the cell with the given id.
	Returns the evaluated formula or an error string.
	 */
	var replaced = nodes[id].formula;

	nodes[id].inputs.forEach(function(cell){
		if(nodes[cell].value === ERRORSTRING) return ERRORSTRING;
		var re = new RegExp(nodes[cell].label, "gi");
		replaced = replaced.replace(re, nodes[cell].value);
	});

	try{
		return math.eval(replaced);
	}
	catch(err){
		return ERRORSTRING;
	}
}

function evalGraph(){
	/*
	Evaluates the entire graph.
	Uses recursion.
	 */
	var visited = [];
	var notYet = Object.keys(nodes);
	function traverse(cell){
		nodes[cell].inputs.forEach(function(next){
			if (visited.indexOf(next) == -1){
				traverse(next);
			}
		});

		setValue(cell, evalFormula(cell));
		visited.push(notYet.splice(notYet.indexOf(cell), 1)[0]);
	}
	while(notYet.length > 0){
		traverse(notYet[0]);
	}
}
