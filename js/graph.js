var uniqueNum = 0;

var nodes = {};

function addNode(){
	var data = {
		label: "",
		value: "",
		inputs: [],
		outputs: [],
		formula: "",
		color: "white",
		comment: ""
	};

	var id = "n"+uniqueNum;
	nodes[id] = data;
	uniqueNum += 1;
	return id;
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