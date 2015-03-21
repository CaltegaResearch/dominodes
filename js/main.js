var cellTemplate = $('#cell-template').html();
Mustache.parse(cellTemplate);

function addCell(label,value,color){
	var data = {
		"label" : label,
		"value" : value,
		"color" : color
	};

	var rendered = Mustache.render(cellTemplate, data);
	$(".wrapper").append(rendered);
}

addCell('CPC',1.35);
addCell('sales', 'yes');
addCell('bruh','swag');

setDraggable();