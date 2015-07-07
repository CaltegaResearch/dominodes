/*jshint esnext: true */
'use strict';
var $ = require('jquery');
var math = require('mathjs');
const ERRORSTRING = "---";

class Graph{
	constructor(){
		this.nodes = {};
	}

	addNode(x,y,color,id,value){
		let n = new Dominode(x,y,color,id,value);
		n.setParentGraph(this);
		this.nodes[n.id] = n;
	}

	refresh() {
		this.evaluate()
		for(let key of Object.keys(this.nodes)){
			$("#"+key+" .right p").html(this.nodes[key].value);
		}
	}

	evaluateFormula(id) {
		let replaced = this.nodes[id].formula;
		for(let cell of this.nodes[id].inputs){
			if(this.nodes[cell].value === ERRORSTRING){
				 return ERRORSTRING;
			}
			let re = new RegExp(this.nodes[cell].label, "gi");
			replaced = replaced.replace(re, this.nodes[cell].value);
		}
		try{
			return math.eval(replaced) || '-';
		}
		catch(err){
			return ERRORSTRING;
		}
	}

	evaluate(){
		var visited = [];
		var notYet = Object.keys(this.nodes);
		function traverse(cell){
			for(let next of this.nodes[cell].inputs){
				if (visited.indexOf(next) === -1){
					traverse(next);
				}
			}
			setValue(cell, this.evalFormula(cell));
			visited.push(notYet.splice(notYet.indexOf(cell), 1)[0]);
		}
		while(notYet.length > 0){
			traverse(notYet[0]);
		}
	}

	removeNode(id){
		var n = this.nodes[id];
		for(let i of n.inputs){
			this.nodes[i].removeOutput(id);
			$("#"+i+id).remove();
		}
		for(let i of n.outputs){
			this.nodes[i].removeInput(id);
			$("#"+id+i).remove();
		}
		delete this.nodes[id];
		$("#"+id).remove();
		this.refreshGraph();
	}

	willFormCycle(origin){
		var visited = new Set();
		var toVisit = [origin];
		while(toVisit.length>0){
			let x = toVisit.pop();
			if (!visited.has(x)){
				visited.add(x);
				toVisit = toVisit.concat(this.nodes[x].inputs);
			}
		}
		return visited;
	}
}