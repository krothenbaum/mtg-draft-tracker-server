$(document).ready(function () {
	$.scrollify({
		section: '.scroll-section',
		scrollbars: false,
		before: function(index,panel) {
			$(panel[index]).find('.slide').addClass('slideLefToRight');
		},
		after: function(index,panel) {
			$(panel[index]).find('.slide').removeClass('slideLefToRight');
		},
	});

	$('.draft-info').click(function(){
    $(this).nextUntil('.row-spacing').slideToggle('slow');
	});
})