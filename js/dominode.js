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
		this.comment = "";
		this.top = y || "0";
		this.left = x || "0";

		uniqueNum += 1;
	}
}