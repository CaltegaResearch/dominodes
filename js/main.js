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
	var cell = $(rendered).draggable();
	cell.css("top", y);
	cell.css("left", x);
	cell.click(onCellClick);
	$(".wrapper").append(cell);
}

function onCellClick(e){
	e.stopPropagation();
	toggleSelected(e.currentTarget);
}

function toggleSelected(cell){
	if(selectedCell){
		selectedCell.classList.remove("selected");
	}
	if(cell != selectedCell){
		cell.classList.add("selected");
		selectedCell = cell;
	}else{
		selectedCell = null;
	}
}

$(".wrapper").click(function(e){
	addCell(e.pageX - 150,e.pageY - 30);
});