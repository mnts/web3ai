$(function(){
	var $editor = $('<div>', {id: "editor", class: 'o', style: 'display: none'}).appendTo('pineal-layout');

	$('<button>', {title: 'indent', class: 'fa fa-save'}).click(ev => {
		
	}).appendTo($editor);

	$('<button>', {title: 'bold'}).css({fontWeight: 'bold'}).text('B').click(ev => {
		document.execCommand('bold', false, null);
	}).appendTo($editor);

	$('<button>', {title: 'italic'}).css({fontStyle: 'italic'}).text('I').click(ev => {
		document.execCommand('italic', false, null);
	}).appendTo($editor);
	
	$('<button>', {title: 'underline'}).css({textDecoration: 'underline'}).text('U').click(ev => {
		document.execCommand('underline', false, null);
	}).appendTo($editor);
	
	$('<button>', {title: 'Simple list', class: 'fa fa-list-ul'}).click(ev => {
		document.execCommand('InsertUnorderedList', false, null);
	}).appendTo($editor);
	$('<button>', {title: 'Ordered list', class: 'fa fa-list-ol'}).click(ev => {
		document.execCommand('InsertOrderedList', false, null);
	}).appendTo($editor);
	$('<button>', {title: 'indent', class: 'fa fa-indent'}).click(ev => {
		document.execCommand('indent', false, null);
	}).appendTo($editor);
	$('<button>', {title: 'outdent', class: 'fa fa-outdent'}).click(ev => {
		document.execCommand('outdent', false, null);
	}).appendTo($editor);

	$('<button>', {title: 'Paragraph'}).text('P').click(ev => {
		document.execCommand('FormatBlock', false, 'p');
	}).appendTo($editor);

	$('<button>', {title: 'Header1'}).text('H1').click(ev => {
		document.execCommand('FormatBlock', false, 'h1');
	}).appendTo($editor);

	$('<button>', {title: 'Header2'}).text('H2').css({fontSize: '12px'}).click(ev => {
		document.execCommand('FormatBlock', false, 'h2');
	}).appendTo($editor);

	$('<button>', {title: 'Header3'}).text('H3').css({fontSize: '11px'}).click(ev => {
		document.execCommand('FormatBlock', false, 'h3');
	}).appendTo($editor);

	$('<button>', {title: 'Header4'}).text('H4').css({fontSize: '10px'}).click(ev => {
		document.execCommand('FormatBlock', false, 'h4');
	}).appendTo($editor);

	$('<button>', {title: 'Header5'}).text('H5').css({fontSize: '9px'}).click(ev => {
		document.execCommand('FormatBlock', false, 'h5');
	}).appendTo($editor);

	$('<button>', {title: 'Header6'}).text('H6').css({fontSize: '8px'}).click(ev => {
		document.execCommand('FormatBlock', false, 'h6');
	}).appendTo($editor);

	$('<button>', {title: 'Horizontal line'}).text('-').click(ev => {
		document.execCommand('insertHorizontalRule', false, null);
	}).appendTo($editor);

	var hide = true;

	$editor.mousedown(function(){
		hide = false;
	});

	$('#textEditor-save').click(function(){
		TextEditor.save();
	});

	$('#textEditor-cleanStyle').click(function(){
		$('#textEditor-data *').removeAttr('style class id');
	});

	var selector = 'pineal-htm[contentEditable], article[contentEditable]';
	$(document).on('focus', selector, ev => {
		$editor.slideDown('fast');
	}).on('blur', selector, ev => {
		var $article = $(this);
		if(hide)
			$editor.slideUp('fast');
		else
			hide = true;
	});
});
