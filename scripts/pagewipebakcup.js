	// going to move this over into main.js for the final build

	$(function () {
			 if (window.isMobile) {
			 	// return
			 }

	     var h = window.innerHeight;
			 var $scrollHandle = $('#scroll-handle');
			 var $scrollPanel = $('#scroll-panel');

	     var elementWidth = $(".main-wrapper").width()
	     var h1 = $('.page-1').height() * -1 + h;
	     var h2 = $('.page-2').height() * -1 + h;
	     var h3 = $('.page-3').height() * -1 + h;

			 var ah1 = $('.aw-1').height() * -1 + h;
			 var ah2 = $('.aw-2').height() * -1 + h;
			 var ah3 = $('.aw-3').height() * -1 + h;

	     var w = (-1 * elementWidth) + 7;

	     var total = h1 + h2 + h3 + (w * 2);
				
			 $scrollPanel.append("<span class='page-marker' style='top: "+((.4) * (h - 47 - 100))+"px'></span>")
			 $scrollPanel.append("<span class='page-marker' style='top: "+((.8) * (h - 47 - 100))+"px'></span>")

	     var controller = new ScrollMagic.Controller();

			 var rtime;
			 var timeout = false;
			 var delta = 200;
			 var progress = 0;

	     var wipeAnimation = new TimelineMax()
	         .fromTo(".page-1", 1, {y: "0%"}, {y: h1, ease: Linear.easeNone})
	         .fromTo(".page-1", 1, {x: "0%"}, {x: w, ease: Power1.easeOut})

	         .fromTo(".page-2", 1, {y: "0%"}, {y: h2, ease: Linear.easeNone}) 
	         .fromTo(".page-2", 1, {x: "0%"}, {x: w, ease: Power1.easeOut})

		       .fromTo(".page-3", 1, {y: "0%"}, {y: h3, ease: Linear.easeNone});
	     
	     var scene = new ScrollMagic.Scene({
	         triggerElement: "#pinContainer",
	         triggerHook: "onLeave",
	     })
			
	     .setPin("#pinContainer")
	     .setTween(wipeAnimation)
	     .addTo(controller)
	     .duration(-1 * total)
	     .on("progress", function (e) {
	     		if (window.toolTipOpen) {
	     			window.closeTooltip()
	     			window.clearSelectedText()
	     		}
	     		
	     		progress = e.progress;
					window.currOffsetY = e.progress * (h - 100 - 47)

					$scrollHandle.css("transform", "translate3d(0,"+(e.progress * (h - 100 - 47))+"px,0)");
			    clearTimeout(window.progressFinished);
			    window.progressFinished = setTimeout(function(){
			    	window.p1Offset = getPercentage(e.progress, 0, h1)
			    	window.p2Offset = getPercentage(e.progress, .4, h2)
			    	window.p3Offset = getPercentage(e.progress, .8, h3)

			    	window.p1OffsetAlt = getPercentage(e.progress, 0, ah1)
			    	window.p2OffsetAlt = getPercentage(e.progress, .4, ah2)
			    	window.p3OffsetAlt = getPercentage(e.progress, .8, ah3)

			    	window.setBookmark(window.currentChapter, e.progress)
			    }, 1000);
				});	

	     function getPercentage(progress, subtractor, height) {
	     		return Math.max(0, Math.min((progress - subtractor) / .2, 1)) * height
	     }

				
				// change behaviour of controller to animate scroll instead of jump
				// controller.scrollTo(function (newpos) {
				// 	TweenMax.to(window, 1, {scrollTo: {y: newpos}});
				// });

				$('.citation-block').click(function(e) {
					e.preventDefault();
					var id = "#alt-" + $(this).data("ref");
					setTimeout(function() {
						if ($(id).length > 0) {
							
							// trigger scrol
							controller.scrollTo(id);

								// if supported by the browser we can even update the URL.
							// if (window.history && window.history.pushState) {
							// 	history.pushState("", document.title, id);
							// }
						}
					}, 1500)

				});

				window.altReset = function() {
				  ah1 = $('.aw-1').height() * -1 + h;
				  ah2 = $('.aw-2').height() * -1 + h;
				  ah3 = $('.aw-3').height() * -1 + h;
					elementWidth = $(".main-wrapper").width()
					w = (-1 * elementWidth) + 7;

		    	window.p1OffsetAlt = getPercentage(progress, 0, ah1)
		    	window.p2OffsetAlt = getPercentage(progress, .4, ah2)
		    	window.p3OffsetAlt = getPercentage(progress, .8, ah3)

					total = ah1 + ah2 + ah3 + (w * 2)
					window.scrollTotal = $(document).height() - $(window).height();
				 	wipeAnimation.kill()
				 	wipeAnimation = new TimelineMax()
		         .fromTo(".page-1", 1, {y: "0%"}, {y: ah1, ease: Linear.easeNone})
		         .fromTo(".page-1", 1, {x: "0%"}, {x: w , ease: Linear.easeNone})

		         .fromTo(".page-2", 1, {y: "0%"}, {y: ah2, ease: Linear.easeNone}) 
		         .fromTo(".page-2", 1, {x: "0%"}, {x: w , ease: Linear.easeNone})

			       .fromTo(".page-3", 1, {y: "0%"}, {y: ah3, ease: Linear.easeNone});
			      scene.setTween(wipeAnimation)

			      // could add this -- it creates a weird moment when transitioning between
			      // the regular view and the alternate view

			      // scene.duration(total * -1) 
				}
				
				window.mainReset = function() {
					h = window.innerHeight;
					elementWidth = $(".main-wrapper").width()
					var $markers = $('.page-marker');
					$markers.eq(0).css("top", ((.4) * (h - 47 - 100)))
					$markers.eq(1).css("top", ((.8) * (h - 47 - 100)))

					h1 = $('.page-1').height() * -1 + h;
					h2 = $('.page-2').height() * -1 + h;
					h3 = $('.page-3').height() * -1 + h;
					w = (-1 * elementWidth) + 7;
	
		    	window.p1Offset = getPercentage(progress, 0, h1)
		    	window.p2Offset = getPercentage(progress, .4, h2)
		    	window.p3Offset = getPercentage(progress, .8, h3)

					total = h1 + h2 + h3 + (w * 2)
					window.scrollTotal = $(document).height() - $(window).height();

				 	wipeAnimation.kill()
				 	wipeAnimation = new TimelineMax()
		         .fromTo(".page-1", 1, {y: "0%"}, {y: h1, ease: Linear.easeNone})
		         .fromTo(".page-1", 1, {x: "0%"}, {x: w , ease: Linear.easeNone})

		         .fromTo(".page-2", 1, {y: "0%"}, {y: h2, ease: Linear.easeNone}) 
		         .fromTo(".page-2", 1, {x: "0%"}, {x: w , ease: Linear.easeNone})

			       .fromTo(".page-3", 1, {y: "0%"}, {y: h3, ease: Linear.easeNone});
			      scene.setTween(wipeAnimation)
			      scene.duration(total * -1)
				}

		     window.controller = controller;
				 window.smscene = scene;
	});