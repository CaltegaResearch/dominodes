/*jshint esnext: true */
'use strict';
var uniqueNum = 1;

class Dominode{
	constructor(x,y,color,id,value){
		this.id = id || "n"+uniqueNum;
		this.label = "Node"+uniqueNum;
		this.value = value || "";
		this.inputs = [];
		this.outputs = [];
		this.formula = "";
		this.color = color || "grey";
		this.top = y || "0";
		this.left = x || "0";

		uniqueNum += 1;
	}

	setParentGraph(g){
		this.parentGraph = g;
	}

	setFormula(formula){
		this.formula = formula;
		this.parentGraph.refresh();
	}

	removeInput(id){
		this.inputs.splice(this.inputs.indexOf(id),1);
		this.parentGraph.refresh();
	}

	removeOutput(id){
		this.outputs.splice(this.outputs.indexOf(id),1);
		this.parentGraph.refresh();
	}

	addInput(id){
		this.inputs.push(id);
	}

	addOutput(id){
		this.outputs.push(id);
	}

	setColor(color){
		this.color = color;
		$('#'+this.id).addClass(color);
	}

	setLabel(label){
		this.label = label;
		this.parentGraph.refresh();
		$("#"+this.id+" .left p").html(label);
		if(label === ''){
			$("#"+this.id).addClass("error");
		}else{
			$("#"+this.id).removeClass("error");
		}
	}

	setValue(value){
		this.value = value;
		$("#"+this.id+" .right p").html(value);
		if(value === ERRORSTRING){
			$("#"+this.id).addClass("error");
		}else{
			$("#"+this.id).removeClass("error");
		}
	}
}