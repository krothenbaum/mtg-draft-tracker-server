$(document).ready(function () {
	$.scrollify({
		section: '.scroll-section',
		scrollbars: false,
		before: function(index,panel) {
			$(panel[index]).find('.slideLeft').addClass('slideLeftToRight');
			$(panel[index]).find('.slideRight').addClass('slideRightToLeft');
		},
		after: function(index,panel) {
			$(panel[index]).find('.slideLeft').removeClass('slideLeftToRight');
			$(panel[index]).find('.slideRight').removeClass('slideRightToLeft');
		},
	});

	$('.draft-info').click(function(){
    $(this).nextUntil('.row-spacing').slideToggle('slow');
	});
})