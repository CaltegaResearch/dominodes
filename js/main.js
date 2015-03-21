var selectedCell = null;

var cellTemplate = $('#cell-template').html();
Mustache.parse(cellTemplate);

function addCell(x,y,label,value,color){
	var data = {
		"label" : label,
		"value" : value,
		"color" : color
	};

	var rendered = Mustache.render(cellTemplate, data);
	var cell = $(rendered).draggable({snap:true});
	cell.css("top", y);
	cell.css("left", x);
	cell.click(onCellClick);
	cell.dblclick(onCellDblClick);
	cell.on('keydown',onCellKeyDown);
	$(".wrapper").append(cell);
	toggleSelected(cell.get(0));
	cell.get(0).children[0].children[0].focus();
}

function onCellClick(e){
	e.stopPropagation();
	toggleSelected(e.currentTarget);
}
function onCellDblClick(e){
	e.stopPropagation();
	var pointX = e.pageX - e.currentTarget.style.left.split("px")[0];
	var pointY = e.pageY - e.currentTarget.style.top.split("px")[0];
	if(pointX < 150){
		e.currentTarget.children[0].children[0].focus();
	}else{
		e.currentTarget.children[1].children[0].focus();
	}
}
function onCellKeyDown(e){
	if (e.which == 13) {
	  	e.stopPropagation();
	    if ("activeElement" in document){
    		document.activeElement.blur();
	    }
		clearSelected();
		return false;
	}
}

function toggleSelected(cell){
	var tmp = selectedCell;
	clearSelected();
	cell.classList.add("selected");
	selectedCell = cell;
}
function clearSelected(){
	if(selectedCell){
		selectedCell.classList.remove("selected");
	}
	selectedCell = null;
}

$(".wrapper").dblclick(function(e){
	addCell(e.pageX - 150,e.pageY - 30);
});
$(".wrapper").click(function(e){
	clearSelected();
})
$(document).keypress(function(e) {
  if(e.which == 13) {
  	e.stopPropagation();
    window.blur();
    clearSelected();
  }
});