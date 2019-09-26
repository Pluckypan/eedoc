$(document).ready(function() {
	$('a.nav-item').click(function() {
		$('html, body').animate({
			scrollTop: $($(this).attr('href')).offset().top + -60 + 'px'
		}, {
			duration: 500,
			easing: 'swing'
		});
		return false;
	});
	$('.year').html(new Date().getFullYear());
});
$(function() {
	$('a.nav-item').click(function(e) {
		$('a.nav-item').removeClass('active');
		$(this).addClass('active');
	});
});
