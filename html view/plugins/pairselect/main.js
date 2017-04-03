$(document).ready( function(){

	$('#MasterSelectBox').pairMaster();

	$('#btnAdd').click(function(){
		$('#MasterSelectBox').addSelected('#PairedSelectBox');
	});

	$('#btnRemove').click(function(){
		$('#PairedSelectBox').removeSelected('#MasterSelectBox'); 
	});
});
    