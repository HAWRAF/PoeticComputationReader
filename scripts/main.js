// Storage Functions

var storage = Storages.localStorage

function saveSettings(currentSettings) {
	storage.set('settings', currentSettings)
}

function resetSettings() {

	storage.set('settings', defaultSettings)
	settings = $.extend(true, {}, defaultSettings);

	applyFilters()
	updateSliders()
	updateSwitches()
	updatePreview()
	
}

function saveSettings() {
	storage.set('settings', settings)
}
// START OF CONTROL PANEL SECTION

var $controlPanel = $("#control-panel");

$(".control-panel .ex").hammer().bind("tap", function() {
	$controlPanel.addClass("hide")
	if (settings.initialLoad) {
		settings.initialLoad = false;
		storage.set('settings.initialLoad', false)
	}
});

$(".adjust-icon-wrapper").hammer().bind("tap", function() {
	$controlPanel.removeClass("hide")
});

$("#reset-settings").hammer().bind("tap", function() {
	var r = confirm("Are you sure you want to reset?");
	if (r == true) {
			if (!window.isMobile) {
				var progress = window.smscene.progress()
			}
	    resetSettings()
  		if (!window.isMobile) {
	    	window.controller.scrollTo( progress * window.smscene.duration() ) 
			}
	} 
})


var defaultSettings = {
	initialLoad: true,
	goToBookmark: false,
	modalOpen: true,
	fromNav: false,
	bookmark: {
		chapter: 1,
		progress: 0
	},
	typeSize: {
		chapterHeader: 72,
		sectionTitle: 42,
		subTitle: 32,
		body: 18
	},
	typeContrast: "baskerville",
	typeContrastVal: 4,
	lineHeight: {
		chapterHeader: 1.4,
		sectionTitle: 1.4,
		subTitle: 1.4,
		body: 1.4
	},
	letterSpacing: {
		chapterHeader: 2,
		sectionTitle: 1.75,
		subTitle: 1.2,
		body: 1
	},
	lineLength: "0%",
	background: "white",
	citations: true,
	images: true,
	focusMode: false,
	dislexiaMode: false, // dyslexia spelled wrong accross the board here :( keeping to maintain db
	highlights: {},
	highlightText: {},
	currentChapter: 1,
	currentPage: 1,
	bookmark: 1
};

var settings = storage.get('settings') || defaultSettings;

var defaults = {
	typeSize: {
		chapterHeader: 72,
		sectionTitle: 42,
		subTitle: 32,
		body: 18
	},
	typeContrast: {
		1: "helvetica",
		2: "gill-sans",
		3: "merriweather",
		4: "baskerville",
		5: "cutive-mono"
	},
	typeContrastVal: 4,
	lineHeight: {
		chapterHeader: 1.4,
		sectionTitle: 1.4,
		subTitle: 1.4,
		body: 1.4
	},
	letterSpacing: {
		chapterHeader: 2,
		sectionTitle: 1.75,
		subTitle: 1.2,
		body: 1
	}
};

// new Clipboard('#clipboard')
var hltr = new TextHighlighter($("#pinContainer").get(0), {
	onAfterHighlight: function(obj) {
	}
});

var $body = $("body");

var $main = $(".main");
var $container = $("#container");
var $mainWrapper = $(".main-wrapper");
var $altWrapper =  $(".alt-wrapper");


var $contentWrapper = $(".content-wrapper, .alt-reference, .reference");
var $firstContentWrapper = $('.content-wrapper-1')
var $chapterHeader = $(".chapter-heading");
var $sectionTitle = $(".section-title");
var $subTitle = $(".sub-title");
var $bodyText = $(".body-text");
var $reference = $("#reference");
var $altReference = $(".alt-reference");
var $pageWrapper = $(".page-wrapper");
var $scrollHandle = $('.scroll-handle');


var $previewText = $("#preview-text");
var $preview = $("#preview");

var $shutterTop = $(".shutter-top");
var $shutterBottom = $(".shutter-bottom")

var $tooltip = $("#tooltip");
// var $clipboard = $("#clipboard")

var fontMultiplier = 1;
var typeContrast = 2;
var lineHeight = 1;
var letterSpacing = 1;
var backgroundClass = "white"
var lineLength = "40px";

var w = window.innerWidth;
var h = window.innerHeight;

var separationOffsets = {main: 0, alt: 0};
var $separationLine = $("#separation-line")
var $window = $(window)

var synth = window.speechSynthesis;
var $citationBlocks = $(".citation-block:not(.image-block)");
var $altCitationBlocks = $(".alt-citation-block");
var $citationNums = $(".citation-num-wrapper");
var $citationNumIcons = $(".citation-num");

var $imageBlocks = $('.image-block, .canvas-container');
var $canvas = $('canvas')
var $referenceHeader = $('.reference-header');
var $chapterTitle = $('#chapter-title');
var $applyFilters = $('#apply-filters');

var $bookmarkIcon = $("#bookmark-icon");
var $bookmarkModal = $("#bookmark-modal");
var $bookmarkLocation = $("#bookmark-location");
var $bookmarkStay = $("#bookmark-stay");
var $bookmarkGo = $("#bookmark-go");

var $body = $("html, body");
var $pinContainer = $("#pinContainer");

var HEADERHEIGHT = 47;
var MOBILEMULTIPLIER = .82;

window.ONMAINPAGE = true;

window.p1Offset = 0;
window.p2Offset = 0;
window.p3Offset = 0;

window.p1OffsetAlt = 0;
window.p2OffsetAlt = 0;
window.p3OffsetAlt = 0;

window.currOffsetY = 0;
window.init = function() { 

	window.scrollTo(0, 0);
	$(window).scrollTop(0);
	window.controller.scrollTo(0)

	applySettings()

	if (!settings.highlightText[window.currentChapter]) {settings.highlightText[window.currentChapter] = []}
	
	setUpButtons()
	updateSliders()
	updateSwitches()
	updatePreview()

	setSeparationLine()
	setReferenceHeaders()
	setReferenceImages()
	setAltReferenceHeaders()
	setCitationLocations()
	setCitationNumLocations()
	setAltCitationLocations()


	scrollHeight = $(document).height() - $(window).height()
	
	setTimeout(function() {
		//added again application of the settings b/c of loading differences between the scrolling and this...
		applySettings()
		saveSettings(settings)

		setReferenceHeaders()
		setReferenceImages()
		setCitationLocations()

		setAltReferenceHeaders()
		setCitationLocations()

		setCitationNumLocations()
		setAltCitationLocations()
		applyFilters()
		getBookmark()

		settings.fromNav = false;
		storage.set('settings.fromNav', false);
		if (settings.initialLoad) {
				$controlPanel.removeClass("hide")
		}
	}, 300)
}


var $fontSize = $("#font-size"),
		$typeContrast = $("#type-contrast"),
		$lineHeight = $("#line-height"),
		$letterSpacing = $("#letter-spacing"),
		$lineLength = $("#line-length"),
		$focusSlider = $("#focus-slider");

$fontSize.on("change", function(ev) {
	$target = $(ev.delegateTarget);
	fontMultiplier = $target.get(0).value / 100;
	for (var key in settings.typeSize) {
		settings.typeSize[key] = defaults.typeSize[key] * fontMultiplier
	}
	$previewText.css("font-size", defaults.typeSize.body * fontMultiplier)
	activateApplyBtn()
})	

$typeContrast.on("change", function(ev) {
	$target = $(ev.delegateTarget);
	typeContrast = $target.get(0).value
	settings.typeContrast = defaults.typeContrast[typeContrast]
	settings.typeContrastVal = typeContrast
	$previewText.attr("class", "preview-text " + settings.typeContrast)
	activateApplyBtn()
})

$lineHeight.on("change", function(ev) {
	$target = $(ev.delegateTarget);
	lineHeight = $target.get(0).value / 100;
	for (var key in settings.lineHeight) {
		settings.lineHeight[key] = defaults.lineHeight[key] * lineHeight
	}

	$previewText.css("line-height", defaults.lineHeight.body * lineHeight)
	activateApplyBtn()
})


$letterSpacing.on("change", function(ev) {
	$target = $(ev.delegateTarget);
	letterSpacing = $target.get(0).value / 100;
	for (var key in settings.letterSpacing) {
		settings.letterSpacing[key] = defaults.letterSpacing[key] * letterSpacing
	}
	$previewText.css("letter-spacing", defaults.letterSpacing.body * letterSpacing)
	activateApplyBtn()
})

$lineLength.on("change", function(ev) {
	$target = $(ev.delegateTarget);
	lineLength = 100 - $target.get(0).value;
	if (lineLength < 100 && !$preview.hasClass("dashed")) {
		$preview.addClass("dashed")
	} else if (lineLength === 0) {
		$preview.removeClass("dashed")
	}
	lineLength = lineLength + "%";
	$preview.css("margin-left", lineLength)
	settings.lineLength = lineLength;
	activateApplyBtn()
})

$focusSlider.on("change", function(ev) {
	$target = $(ev.delegateTarget);
	var val = $target.get(0).value;

	var y = map(val, 0, 100, 47 + 10, h/2);
	$shutterTop.css('transform', "translate3d(0, "+y+"px, 0)");
	$shutterBottom.css("transform", "translate3d(0, -"+y+"px, 0)");
})

$(".color").hammer().bind("tap",function(ev) {
	var $target = $(ev.delegateTarget);
	var color = $target.data("color");
	backgroundClass = color;
	if ($preview.attr("current-color")) {
		$preview.removeClass($preview.attr("current-color"))
	}

	settings.background = color;
	$preview.addClass(color)
	$preview.attr("current-color", color)
	activateApplyBtn()
})

$typeContrast.on("change", function(ev) {
	$target = $(ev.delegateTarget);
	typeContrast = $target.get(0).value
	settings.typeContrast = defaults.typeContrast[typeContrast]
	settings.typeContrastVal = typeContrast
	$previewText.attr("class", "preview-text " + settings.typeContrast)
	activateApplyBtn()
})

$(".font").hammer().bind("tap", function(ev) {
	var font = $(ev.delegateTarget).data("font")
	settings.typeContrast = font;
	settings.typeContrastVal = font;
	$previewText.attr("class", "preview-text " + settings.typeContrast)
	activateApplyBtn()
	// update the active state of the button
})

$applyFilters.hammer().bind("tap", function() {
	// get current progress
	if (!window.isMobile) {
		var progress = window.smscene.progress()
	}
	
	if (settings.initialLoad) {
		settings.initialLoad = false;
		storage.set('settings.initialLoad', false)
	}

	applyFilters()
	deactivateApplyBtn()
	// scroll back to where you were in the content
	if (!window.isMobile) {
		window.controller.scrollTo( progress * window.smscene.duration() ) 
	}
})

function activateApplyBtn() {
	if ($applyFilters.hasClass("inactive")) {
		$applyFilters.removeClass("inactive")
	}
}
function deactivateApplyBtn() {
	if (!$applyFilters.hasClass("inactive")) {
		$applyFilters.addClass("inactive")
	}
}
function applyFilters() {
  applySettings()
	saveSettings(settings)

	setReferenceHeaders()
	setReferenceImages()
	setCitationLocations()

	setAltReferenceHeaders()
	setCitationLocations()

	setCitationNumLocations()
	setAltCitationLocations()


	window.ONMAINPAGE ? window.mainReset() : window.altReset()

	$pinContainer.height(window.innerHeight)
}

function applySettings() {
	updateFontSize()
	updateLineHeight()
	updateLetterSpacing()
	updateTypeContrast() 
	updateLineLength()
	updateBackground()

	if (window.isMobile && settings.typeSize.sectionTitle > 50) {
		$body.addClass("break-words")
	} else if (window.isMobile && settings.typeSize.sectionTitle >= 42 && w < 360) {
		$body.addClass("break-words")
	} else {
		$body.removeClass("break-words")
	}
	if (window.isMobile) {
		$controlPanel.addClass("hide")
	}
	//update values in control panel to reflect the loaded settings !!!
}

function updateSliders() {
	$fontSize.val(getFontVal())
	$typeContrast.val(getContrastVal())
	$lineHeight.val(getHeightVal())
	$letterSpacing.val(getSpacingVal())
	$lineLength.val(getLengthVal())
}




function updatePreview() {
	$previewText.css("font-size", settings.typeSize.body)
	$previewText.attr("class", "preview-text " + settings.typeContrast)
	$previewText.css("line-height", settings.lineHeight.body)
	$previewText.css("letter-spacing", settings.letterSpacing.body)
	if ($preview.attr("current-color")) {
		$preview.removeClass($preview.attr("current-color"))
	}

	$preview.addClass(settings.background)
	$preview.attr("current-color", settings.background)
}


function updateSwitches() {
		getCitationsVal() ? $('.citations-controls .on-btn').trigger("click") :
											$('.citations-controls .off-btn').trigger("click");

	getImagesVal() ? $('.image-controls .on-btn').trigger("click") :
									 $('.image-controls .off-btn').trigger("click");

	getFocusVal() ? $('.focus-controls .on-btn').trigger("click") :
									$('.focus-controls .off-btn').trigger("click");

	getDislexiaVal() ? $('.dislexia-controls .on-btn').trigger("click") :
										 $('.dislexia-controls .off-btn').trigger("click");
}

function getFontVal() {
 return (settings.typeSize.body / (defaults.typeSize.body)) * 100
}

function getContrastVal() {
 return settings.typeContrastVal
}

function getHeightVal() {
	return (settings.lineHeight.body / defaults.lineHeight.body ) * 100
}

function getSpacingVal() {
	return (settings.letterSpacing.body / defaults.letterSpacing.body) * 100
}

function getLengthVal() {
	return 100 - settings.lineLength.slice(0, settings.lineLength.length - 1)
}

function getCitationsVal() {
	return settings.citations
}

function getImagesVal() {
	return settings.images
}

function getFocusVal() {
	return settings.focusMode
}	

function getDislexiaVal() {
	return settings.dislexiaMode
}

function updateFontSize() {
	var multiplier = window.isMobile ? MOBILEMULTIPLIER : 1;

	$contentWrapper.css("font-size", settings.typeSize.body * multiplier)
	$citationNumIcons.css("font-size", settings.typeSize.body * multiplier * .5)
	$chapterHeader.css("font-size", settings.typeSize.chapterHeader * multiplier)
	$sectionTitle.css("font-size", settings.typeSize.sectionTitle * multiplier)
	$subTitle.css("font-size", settings.typeSize.subTitle * multiplier)
}

function updateTypeContrast() {
	$body.removeClass($body.attr("data-type"));
	$body.attr("data-type", settings.typeContrast);
	$body.addClass(settings.typeContrast);
	// $body.attr("class", settings.typeContrast)
}

function updateLineHeight() {
	$contentWrapper.css("line-height", settings.lineHeight.body)
	$bodyText.css("line-height", settings.lineHeight.body)
	$chapterHeader.css("line-height", settings.lineHeight.chapterHeader)
	$sectionTitle.css("line-height", settings.lineHeight.sectionTitle)
	$subTitle.css("line-height", settings.lineHeight.subTitle)
}

function updateLetterSpacing() {
	$contentWrapper.css("letter-spacing", settings.letterSpacing.body)
	$chapterHeader.css("letter-spacing", settings.letterSpacing.chapterHeader)
	$sectionTitle.css("letter-spacing", settings.letterSpacing.sectionTitle)
	$bodyText.css("letter-spacing", settings.letterSpacing.body)
	$subTitle.css("letter-spacing", settings.letterSpacing.subTitle)
}

function updateLineLength() {
	if (parseInt(settings.lineLength.replace(/\D+/g, '')) === 0) {
		$preview.removeClass("dashed")
	} else if (parseInt(settings.lineLength.replace(/\D+/g, '')) < 100) {
		$preview.addClass("dashed")
	} 
	$preview.css("margin-left", settings.lineLength)
	var lineLength = "calc("+settings.lineLength+" + 61px)"
	$main.css("padding-left", lineLength)

	$altReference.css("width", 75 - parseInt(settings.lineLength.replace(/\D+/g, '')) + "%")

}

var currentColor = null;

function updateBackground() {
	// $container.addClass(backgroundClass)
	$(".temp-wrapper, .alt-wrapper, body").removeClass(currentColor)


	currentColor = settings.background
	$(".temp-wrapper, .alt-wrapper, body").addClass(settings.background)
}

function setSeparationLine() {
	separationOffsets.main = Math.round($reference.offset().left);
	separationOffsets.alt = Math.round($reference.get(0).getBoundingClientRect().width + $('#main').offset().left);

	$separationLine.css("transform", "translateX("+separationOffsets.main+"px)")
}

function setAltReferenceHeaders() {
	var $altChapterHead = $("#alt-chapter-head")
	var rect = $altChapterHead.get(0).getBoundingClientRect()
	var offset = rect.top

	var $altReferenceHeader = $("#alt-reference-header");
	var headerRect = $altReferenceHeader.get(0).getBoundingClientRect()
	var headerHeight = headerRect.height;

	$altReferenceHeader.css("transform", "translateY("+(offset - window.p1OffsetAlt)+"px)");
	var marginBottom = headerHeight - rect.height + 30;
	$altChapterHead.css("margin-bottom", marginBottom)
}

function setReferenceHeaders() {
	var offset = $chapterTitle.get(0).getBoundingClientRect().top;
	var height = $referenceHeader.get(0).getBoundingClientRect().height;
	var margin = 100;
	$referenceHeader.css("transform", "translateY("+(offset - window.p1Offset)+"px)");

	// var chapterHeight = $chapterTitle.height()
	// var contentOffset = offset + height - $firstContentWrapper.get(0).getBoundingClientRect().top
	// var val = contentOffset + (chapterHeight * 2)
	// $firstContentWrapper.css("margin-top",  val)
}

// function setImageLocations() {
// 	$imageBlocks.each(function() {

// 	})
// }

function setReferenceImages() {
	if (window.isMobile) {
		var h1 = $('.page-1').offset().top
		var h2 = $('.page-2').offset().top
		var h3 = $('.page-3').offset().top
	}

	$imageBlocks.each(function() {
		var $this = $(this);
		var ref = $this.data('ref');
		var height = $this.height()
		var $ref = $("." + ref)
		$ref.css("margin-bottom", height + 40);
		var rect = $ref.get(0).getBoundingClientRect()
		// var offset  = $ref.offset().top
		var offset = window.isMobile ? $ref.offset().top : rect.top;
		var height = window.isMobile ? rect.height : rect.height
		var margin = window.isMobile ? 40 : 20

		var pageOffset = 0;
		var page = parseInt($this.data("page"));

		if (page === 1) {
			pageOffset = window.isMobile ? h1 : window.p1Offset
		} else if (page === 2) {
			pageOffset = window.isMobile ? h2 :window.p2Offset
		} else {
			pageOffset = window.isMobile ? h3 :window.p3Offset
		}

		var val = (offset + height + margin) - pageOffset
		$(this).css("transform", "translateY("+val+"px)")
	})
}

function setCanvasSketches() {
	var $canvas = $(".canvas-container")
	$canvas.each(function() {
		var $this = $(this);
		var ref = $this.data('ref');

		var height = $this.height()
		var $ref = $("." + ref)
		$ref.css("margin-bottom", height + 40);
		var rect = $ref.get(0).getBoundingClientRect()
		var offset  = $ref.offset().top
		var height = rect.height
		$(this).css("transform", "translateY("+(offset + height + 20)+"px)")
  })
}

function setCitationLocations() {
	if (window.isMobile) {
		var h1 = $('.page-1').offset().top
		var h2 = $('.page-2').offset().top
		var h3 = $('.page-3').offset().top
	}

	$citationBlocks.each(function(idx, item) {
		var $this  = $(this);
		var ref = $this.data("ref")
		var rect = $("." + ref).get(0).getBoundingClientRect()
		var offset = rect.top
		var pageOffset = 0;
		var page = parseInt($this.data("page"));

		if (page === 1) {
			pageOffset = window.isMobile ? h1 : window.p1Offset
		} else if (page === 2) {
			pageOffset = window.isMobile ? h2 :window.p2Offset
		} else {
			pageOffset = window.isMobile ? h3 :window.p3Offset
		}

		var val = offset - pageOffset

		$this.css("transform", "translateY("+val+"px)")
	})
}

function setCitationNumLocations() {
	if (!window.isMobile) {return}

	var h1,h2,h3;

	h1 = $('.page-1').offset().top
	h2 = $('.page-2').offset().top
	h3 = $('.page-3').offset().top

	$citationNums.each(function() {
		var $this  = $(this);
		var ref = $this.data("ref")
		var rect = $("." + ref).get(0).getBoundingClientRect()
		// var offset = rect.top
		var pageOffset = 0;
		var page = parseInt($this.data("page"));

		if (page === 1) {
			pageOffset = h1;

		} else if (page === 2) {
			pageOffset = h2;
		} else {
			pageOffset = h3;
		}

		var val = $("." + ref).offset().top - pageOffset

		if ($this.hasClass("image-citation-wrapper")) {
			val += rect.height + 40 // b/c image is centered between paragraph + padding
		} else {
			val += 10 // add padding
		}
		
		$this.css("transform", "translateY("+val+"px)")
	})
}


function setAltCitationLocations() {
	$altCitationBlocks.each(function() {
		var $this  = $(this);
		var ref = $this.data("ref")

		var $ref = $("#" + ref)
		var rect = $ref.get(0).getBoundingClientRect()
		var refHeight = rect.height;
		var offset = rect.top
		var pageOffset = 0;
		var page = parseInt($this.data("page"));

		var citationRect = this.getBoundingClientRect();
		var citationHeight = citationRect.height;

		if (citationHeight > refHeight) {
			var diffHeight = citationHeight - refHeight;
			$ref.css("margin-bottom", diffHeight)
		}		
		if (page === 1) {
			pageOffset = window.p1OffsetAlt
		} else if (page === 2) {
			pageOffset = window.p2OffsetAlt
		} else {
			pageOffset = window.p3OffsetAlt
		}

		if ($this.hasClass("alt-image-block")) {
			var val = offset + refHeight - pageOffset
		} else {
			var val = offset - pageOffset
		}	
		
		$(this).css("transform", "translateY("+val+"px)")
	})
}


function setUpButtons() {
	$('a.nav-link').hammer().bind("tap", function(ev) {
		ev.preventDefault();
		storage.set('settings.fromNav', true);

		window.location.href = $(ev.delegateTarget).attr("href")
	})

	$(".on-btn").hammer().bind("tap", function(ev) {
		var $target = $(ev.delegateTarget);
		if (!$target.hasClass("active")) {
			$target.addClass("active")
			$target.siblings(".off-btn").removeClass("active")
			routeButtonAction($target)
		} 
	})	

	$(".off-btn").hammer().bind("tap", function(ev) {
		var $target = $(ev.delegateTarget);
		if (!$target.hasClass("active")) {
			$target.addClass("active")
			$target.siblings(".on-btn").removeClass("active")
			routeButtonAction($target)
		} 
	})	


	function routeButtonAction($target) {
		var section = $target.data("section");
		var isOn = $target.attr('data-isOn') == "true" ? true : false
		switch(section) {
			case "citations": 
				toggleCitations(isOn)
				break;
			case "images": 
				toggleImages(isOn)
				break;
			case "focus": 
				toggleFocusMode(isOn)
				break;
			case "dislexia":
				toggleDislexiaMode(isOn)
				break;
		}
	}

	function toggleCitations(isOn) {
		!isOn ?  citationsOff() : citationsOn();

		function citationsOff() {
			$reference.removeClass("citations")
			settings.citations = false;
			storage.set('settings.citations', false)
		}

		function citationsOn() {
			$reference.addClass("citations")
			settings.citations = true;
			storage.set('settings.citations', true)
		}
	}

	function toggleImages(isOn) {
		!isOn ?  imageOff() : imageOn();

		function imageOn() {
			$reference.addClass("images")
			settings.images = true
			storage.set('settings.images', true)
		} 
		function imageOff() {
			$reference.removeClass("images")
			settings.images = false
			storage.set('settings.images', false)
		}
	}

	function toggleFocusMode(isOn) {
		!isOn ? focusOff() : focusOn()
		
		function focusOn() {
			$container.removeClass("hidefocus") 
			settings.focusMode = true;
			storage.set('settings.focusMode', true)
		}

		function focusOff() {
			$container.addClass("hidefocus") 
			settings.focusMode = false;
			storage.set('settings.focusMode', false)
		}
	}

	function toggleDislexiaMode(isOn) {
			!isOn ? dislexiaOff() : dislexiaOn()

			function dislexiaOn() {
				$body.addClass("open-dyslexic")
				settings.dislexiaMode = true;
				storage.set('settings.dislexiaMode', true)
			}
			function dislexiaOff() {
				$body.removeClass("open-dyslexic")
				settings.dislexiaMode = false;
				storage.set('settings.dislexiaMode', false)
			}
	}
}



function toggleAltView() {
	window.ONMAINPAGE = false;

	$separationLine.addClass("show");
	$pageWrapper.addClass("is-transitioning");
	$scrollHandle.addClass("is-transitioning");

	setTimeout(function() {
		// $mainWrapper.fadeOut()
		$mainWrapper.addClass("fadeOut");
	}, 0)
	setTimeout(function() {

		$separationLine.css("transform", "translate3d("+separationOffsets.alt+"px, 0, 0)");
	}, 250)

	setTimeout(function() {
		// $altWrapper.css('opacity', 1).css("display", "block");
		window.altReset()
		setAltReferenceHeaders()
		setCitationNumLocations()
		setAltCitationLocations()

	}, 600);

		setTimeout(function() {
		$altWrapper.addClass("fadeIn")
		$separationLine.removeClass("show");
		$pageWrapper.removeClass("is-transitioning")
		$scrollHandle.removeClass("is-transitioning");

	}, 1000)
}

function toggleMainView() {
	window.ONMAINPAGE = true;
	$pageWrapper.addClass("is-transitioning");
	$separationLine.addClass("show");
	$scrollHandle.addClass("is-transitioning");

	setTimeout(function() {
		// $altWrapper.fadeOut()
		$altWrapper.removeClass("fadeIn")
	}, 0)

	setTimeout(function() {
		$separationLine.css("transform", "translate3d("+separationOffsets.main+"px, 0, 0)");
	}, 250)

	setTimeout(function() {
			window.mainReset()

			setReferenceHeaders()
			setReferenceImages()
			setCitationLocations()


			

	},600)

		setTimeout(function() {
		$mainWrapper.removeClass("fadeOut");
		$separationLine.removeClass("show");
		$pageWrapper.removeClass("is-transitioning");
		$scrollHandle.removeClass("is-transitioning");

	}, 1000)
}


$('.handle-top').on('mousedown', function(ev) {
	ev.preventDefault()
	addShutterMouseListener("top")
	$(window).on("mouseup", removeShutterMouseListener)
})

$('.handle-bottom').on('mousedown', function(ev) {
	ev.preventDefault()
	addShutterMouseListener("bottom")
	$(window).on("mouseup", removeShutterMouseListener)
})

$('.scroll-handle').on('mousedown', function(ev) {
	ev.preventDefault()
	offsetDiff = ev.clientY - window.currOffsetY - 47
	addScrollMouseListener(offsetDiff)
	$(window).on("mouseup", removeScrollMouseListener)
})

$('.citation').hammer().bind("tap", function(ev) {
	if (window.isMobile) {
		return
	}
	var id = $(ev.delegateTarget).data("id");
	toggleAltView()
})

$citationNums.hammer().bind("tap", function() {
	$mainWrapper.addClass("view-reference")
})

$('.alt-body-text, .alt-chapter-head').hammer().bind("tap", function(ev) {
	var id = $(ev.delegateTarget).data("ref");

	toggleMainView()
})


$('.image-switch').hammer().bind("tap", function() {
	$(this).toggleClass("open")
})


function addShutterMouseListener(dir) {
	$body.addClass("grabbed");

	$(window).on("mousemove", function(ev) {
		if (dir === "top") {
			var y = ev.clientY;
			if (y > h / 2) {y = h / 2}
			if (y < 47 + 10) {y = 47 + 10}

			var inputVal = map(y, 47 + 10,  h/2, 0, 100);

			$shutterTop.css('transform', "translate3d(0, "+y+"px, 0)")
			$shutterBottom.css("transform", "translate3d(0, -"+y+"px, 0)")
			$focusSlider.val(inputVal)
		} else {
			var y = h - ev.clientY;
			if (y > h / 2) {y = h / 2}
			if (y < 47 + 10) {y = 47 + 10}

			var inputVal = map(y, 47 + 10,  h/2, 0, 100);

			$shutterTop.css('transform', "translate3d(0, "+y+"px, 0)");
			$shutterBottom.css("transform", "translate3d(0, -"+y+"px, 0)");

			$focusSlider.val(inputVal)

		}
	})

	// $shutterTop.css('transform', "translate3d(0, "+y+"px, 0)");
	// $shutterBottom.css("transform", "translate3d(0, -"+y+"px, 0)");

}

function removeShutterMouseListener() {
	$body.removeClass("grabbed");

	$(window).unbind('mousemove')
	$(window).unbind('mouseup')
	$(window).on("mouseup", function(ev) {
	highlighted = getSelectionText()
	var coords = getSelectionCoords()
	if (highlighted) {
		openTooltip(ev, coords)
	} 
})
}

var currentOffsetY = 0;
var offsetDiff = 0;
function addScrollMouseListener(val) {
	$body.addClass("grabbed");
	
	$(window).on("mousemove", function(ev) {
		var y = ev.clientY - 47 - val;
		ratio  = y * (window.smscene.duration()) / (h - 47 - 100) 
		window.controller.scrollTo(ratio)
	})
}

function removeScrollMouseListener() {
	$body.removeClass("grabbed");

	$(window).unbind('mousemove')
	$(window).unbind('mouseup')
	$(window).on("mouseup", function(ev) {
	highlighted = getSelectionText()
	var coords = getSelectionCoords()
	if (highlighted) {
		openTooltip(ev, coords)
	} 
})
}

$(".controls").on("scroll", function(ev) {
	ev.stopPropagation()
})


// START OF LINE SCROLLING SECTION

var $progressRight = $('#progress-right .scroll-handle');
var $progressLeft = $("#progress-left");
var scrollHeight = $(document).height() - $(window).height()

var isScheduled;
var ratio;
function update() {
		if(isScheduled){return;}

		isScheduled = true;

		ratio = window.scrollY / scrollHeight * (h - 47 - 100)
		currentOffsetY = ratio
		requestAnimationFrame(function(){
			// $progressRight.css("transform", "translate3d(0,"+ratio+"px,0)")
			isScheduled = false;
		});

	}

function handleResize() {
	// scrollHeight = $(document).height() - $(window).height()
	// h = window.innerHeight
}

// window.addEventListener('scroll', update, false);
// window.addEventListener('resize', handleResize, false);

$(window).on("resize", function() {
  var thisFunction = arguments.callee;
  clearTimeout(thisFunction.timeoutId);
  thisFunction.timeoutId = setTimeout(function() {
      thisFunction.timeoutId = null; 
      $pinContainer.width(window.innerWidth)
      $pinContainer.height(window.innerHeight)
			// setReferenceHeaders()
			// setReferenceImages()
			// setCitationLocations()

			// setAltReferenceHeaders()
			// setCitationLocations()
			// setAltCitationLocations()
			// // setTimeout(function() {
			// 	window.ONMAINPAGE ? window.mainReset() : window.altReset()

			applyFilters()
			// }, 100)

  }, 200);
})
window.addEventListener('load', update, false);

window.requestAnimFrame = (function(){
	return  window.requestAnimationFrame       ||
			window.webkitRequestAnimationFrame ||
			window.mozRequestAnimationFrame    ||
			window.oRequestAnimationFrame      ||
			window.msRequestAnimationFrame     ||
			function( callback ){
				window.setTimeout(callback, 1000 / 60);
			};
})();



 // START OF TOOLTIP SECTION
var highlighted, utterance;

$(window).on("mouseup", function(ev) {
	highlighted = getSelectionText()
	var coords = getSelectionCoords()
	if (highlighted) {
		openTooltip(ev, coords)
	} 
})

$(window).on("mousedown", function(ev) {
	if ($(ev.target).hasClass("tool") || $(ev.target).hasClass("tooltip") || $(ev.target).hasClass("toolimg")) {
		return
	}
	closeTooltip()
})


$("#speech").hammer().bind("tap", function() {
	textToSpeech(highlighted)
});

$("#twitter").hammer().bind("tap", function() {
	generateTweet(highlighted)
});

$("#highlight").hammer().bind("tap", setHighlight)


function setHighlight() {
	var highlight = hltr.doHighlight(true)
	var text = getSelectionText()
	settings.highlightText[window.currentChapter].push(text);
	storage.set('settings.highlightText.' + window.currentChapter, settings.highlightText[window.currentChapter])

	var serialized = hltr.serializeHighlights()
	var storageLoc = 'settings.highlights.' + window.currentChapter
	storage.set(storageLoc, serialized)
	settings.highlights = serialized;
}

function deserializeHighlights() {
	var highlights = hltr.deserializeHighlights(settings.highlights[window.currentChapter]);
}


function getHighlightText() {
	var highlights = []
	for (var key in settings.highlights) {
		var arr = JSON.parse(settings.highlights[key]);
		if (arr && arr.length > 0) {
			for (var i = 0; i < arr.length; i++) {
				var text = arr[i][1];
				highlights.push({text: text})
			}

		} 
	}
	return highlights
}

function getSelectionText() {
    var text = "";
    if (window.getSelection) {
        text = window.getSelection().toString();
    } else if (document.selection && document.selection.type != "Control") {
        text = document.selection.createRange().text;
    }
    return text;
}

function getSelectionCoords(win) {
    win = win || window;

    var doc = win.document;
    var sel = doc.selection, range, rects, rect;
    var x = 0, y = 0;
    if (sel) {
        if (sel.type != "Control") {
            range = sel.createRange();
            range.collapse(true);
            x = range.boundingLeft;
            y = range.boundingTop;
        }
    } else if (win.getSelection) {
        sel = win.getSelection();
        if (sel.rangeCount) {
            range = sel.getRangeAt(0).cloneRange();
            if (range.getClientRects) {
                range.collapse(true);
                rects = range.getClientRects();
                if (rects.length > 0) {
                    rect = rects[0];
                }
                if (!rect) {return}
                x = rect.left;
                y = rect.top;
            }
            // Fall back to inserting a temporary element
            if (x == 0 && y == 0) {
                var span = doc.createElement("span");
                if (span.getClientRects) {

                    span.appendChild( doc.createTextNode("\u200b") );
                    range.insertNode(span);
                    rect = span.getClientRects()[0];
                    if (!rect) {return}
                    x = rect.left;
                    y = rect.top;
                    var spanParent = span.parentNode;
                    spanParent.removeChild(span);

                    spanParent.normalize();
                }
            }
        }
    }
    return { x: x, y: y + $(win).scrollTop() };
}


function textToSpeech(text) {
	if (synth) {
		synth.cancel()
	}
  utterance = new SpeechSynthesisUtterance(text);
	synth.speak(utterance)
}

window.onbeforeunload = function(event) {
	// make sure we go to the top before reloading
 window.controller.scrollTo(0)

 // window.controller.scr
	if (synth) {
		synth.cancel()
	}    
};

// function updateClipboard(text) {
// 	$clipboard.attr("data-clipboard-text", text)
// }

function openTooltip(ev, coords) {
	window.toolTipOpen = true;
	$tooltip.addClass("show");
	var x,y;
	x = ev.clientX;
	y = ev.clientY;
	x = coords.x;
	y = coords.y;
	$tooltip.css("top", y).css("left", x)
}
window.closeTooltip = function(ev, coords) {
	window.toolTipOpen = false;
	$tooltip.removeClass("show");
}
window.clearSelectedText = function() {
	if (window.getSelection) {
	   if (window.getSelection().empty) {  // Chrome
	     window.getSelection().empty();
	   } else if (window.getSelection().removeAllRanges) {  // Firefox
	     window.getSelection().removeAllRanges();
	   }
	} else if (document.selection) {  // IE?
	  document.selection.empty();
	}
}

function generateTweet(text) {

	if (text.length > 140) {
		text = text.slice(0, 137) + "..."
	} 
	var uriEnc = encodeURIComponent(text)
  var redirectWindow = window.open('https://twitter.com/intent/tweet?text=' + uriEnc, '_blank');
  redirectWindow.location;
}

// general Bookmarking Stuff

window.setBookmark = function(chapter, location) {
	if (settings.modalOpen) {return}
	settings.bookmark = {
		chapter: chapter,
		location: location
	}
	storage.set('settings.bookmark', settings.bookmark);


	toggleBookmarkIcon(location)
}

function toggleBookmarkIcon(location) {
	$bookmarkIcon.addClass("show");
	clearTimeout(window.bookmMarkRemoved);
	window.bookmMarkRemoved = setTimeout(function(){
		$bookmarkIcon.removeClass("show");
	}, 4000);
}

function getBookmark() {
	if (!settings.initialLoad && !settings.goToBookmark && !settings.fromNav && settings.bookmark.chapter && settings.bookmark.location) {
		settings.modalOpen = true;

		$bookmarkLocation.text(settings.bookmark.chapter)
		$bookmarkModal.addClass("show");
		$bookmarkStay.hammer().bind("tap", function() {
			settings.modalOpen = false;
			storage.set('settings.modalOpen', false)
			$bookmarkModal.remove()
		})
		$bookmarkGo.hammer().bind("tap", function() {
			goToBookmark()
		})
	} else {
		settings.modalOpen = false;
		storage.set('settings.modalOpen', false)
	}

	if (settings.goToBookmark) {
		settings.goToBookmark = false;
		storage.set('settings.goToBookmark', false)
		settings.modalOpen = false;
		storage.set('settings.modalOpen', false)

		if (!window.isMobile) {
			window.controller.scrollTo(settings.bookmark.location * window.smscene.duration())
		}

	}
} 

function goToBookmark() {
	settings.goToBookmark = true;
	storage.set('settings.goToBookmark', true)
	window.location.href = "/chapters/ch." + settings.bookmark.chapter + "-p.1"
}

$(window).on("load", function() {
	init()
	$("#loading").fadeOut()
})

$(document).ready(function() {
		$(window).scrollTop(0);
		// window.
		deserializeHighlights()
})

if (window.isMobile) {
	var $mainWrapper = $('.main-wrapper');
		$mainWrapper.hammer().bind("swipeleft", function() {
		$mainWrapper.addClass("view-reference")
	});
	$mainWrapper.hammer().bind("swiperight", function() {
		$mainWrapper.removeClass("view-reference")
	});
}	

function map(value, low1, high1, low2, high2) {
  return low2 + (high2 - low2) * (value - low1) / (high1 - low1);
}