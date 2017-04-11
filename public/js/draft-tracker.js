$(document).ready(function () {
	$.scrollify({
		section: '.scroll-section',
		scrollbars: false,
		before: function(index,panel) {
			console.log(index);
			console.log(panel);
			console.log(panel[index])
			// $('.scroll-section img').removeClass('slideLefToRight');
			// $('.scroll-section img').addClass('slideLefToRight');
			$(panel[index]).find('img').addClass('slideLefToRight');
		},
		// after: function() {
		// 	$('.scroll-section img').addClass('.fadeIn');
		// },
	});
})