

$(document).ready(function () {
	$.scrollify({
		section: '.scroll-section',
		scrollbars: false,
		before: function(index,panel) {
			$(panel[index]).find('img').addClass('slideLefToRight');
		},
		after: function(index,panel) {
			$(panel[index]).find('img').removeClass('slideLefToRight');
		},
	});
})