chrome.runtime.sendMessage( {method: "get_options"}, function(response) {
	//console.log(response);

var domains = JSON.parse(response['exclude_domains']);
if (domains.hasOwnProperty(window.location.hostname)) {
	//console.log('excluded');
	return;
}

function parseURI(url) {
  var m = String(url).replace(/^\s+|\s+$/g, '').match(/^([^:\/?#]+:)?(\/\/(?:[^:@]*(?::[^:@]*)?@)?(([^:\/?#]*)(?::(\d*))?))?([^?#]*)(\?[^#]*)?(#[\s\S]*)?/);
  // authority = '//' + user + ':' + pass '@' + hostname + ':' port
  return (m ? {
    href     : m[0] || '',
    protocol : m[1] || '',
    authority: m[2] || '',
    host     : m[3] || '',
    hostname : m[4] || '',
    port     : m[5] || '',
    pathname : m[6] || '',
    search   : m[7] || '',
    hash     : m[8] || ''
  } : null);
}

function absolutizeURI(base, href) {// RFC 3986

  function removeDotSegments(input) {
    var output = [];
    input.replace(/^(\.\.?(\/|$))+/, '')
         .replace(/\/(\.(\/|$))+/g, '/')
         .replace(/\/\.\.$/, '/../')
         .replace(/\/?[^\/]*/g, function (p) {
      if (p === '/..') {
        output.pop();
      } else {
        output.push(p);
      }
    });
    return output.join('').replace(/^\//, input.charAt(0) === '/' ? '/' : '');
  }

  href = parseURI(href || '');
  base = parseURI(base || '');

  return !href || !base ? null : (href.protocol || base.protocol) +
         (href.protocol || href.authority ? href.authority : base.authority) +
         removeDotSegments(href.protocol || href.authority || href.pathname.charAt(0) === '/' ? href.pathname : (href.pathname ? ((base.authority && !base.pathname ? '/' : '') + base.pathname.slice(0, base.pathname.lastIndexOf('/') + 1) + href.pathname) : base.pathname)) +
         (href.protocol || href.authority || href.pathname ? href.search : (href.search || base.search)) +
         href.hash;
}

var is_hovering_on_link = false;
var display_hoverreader=false; // set to not display
var is_hovering=false; // set to not current hovering
var scrolled=0; // set initial scroll
var hoverX=0; // current mouseX position
var hoverY=0; // current mouseY position
var startHoverUrl=''; // last URL hovered over
var currentHoverUrl='' // current URL that is hovered over
$(document).ready(function() {
	// append hoverread div
	$("body").append("<div style='display:none;position:absolute;background:white;border: 5px solid #3498db;padding:10px;z-index:9999;max-width:700px;overflow:scroll;box-shadow: 5px 5px 5px 0px rgba(77,77,77,1);' id='hoverReadDisplay'>STUFF GOES HERE</div>")

	//console.log("hoverread works!");

	var timer;
	$("body").on('mouseenter', 'a', function(event) {
		is_hovering=true;
	    //console.log("hovering!");
	    // get href url
		var articleUrl= $(this).attr("href");





		startHoverUrl = articleUrl;
		var currentLinkPointer = $(this);
		originalHoverX = event.clientX;
		originalHoverY = event.clientY;
		//$(this).css({color:"green", "text-decoration":"underline"});
		// get absolute URL in case href is a relative link
		currentUrl = document.URL;
		articleUrl = absolutizeURI(currentUrl, articleUrl);

        if (articleUrl.indexOf('venue') > -1) {
            var pdf_url = 'http://www.nycgo.com/assets/files/programs/rw/2014S/' + articleUrl.split('/').pop() + '.pdf'
            scrolled=0;
            $("#hoverReadDisplay").scrollTop(0);
            //console.log("scroll position: "+$("#hoverReadDisplay").scrollTop());
            display_hoverreader=true;

            // calculate where to display
            pageWidth = $(window).width();
            pageHeight = $(window).height();

            // console.log('original'+originalHoverX+' '+originalHoverY);
            // console.log('new'+hoverX+' '+hoverY);
            //console.log("pageWidth: "+pageWidth+"pageHeight: "+pageHeight);
            leftWidth = event.clientX;

            if(leftWidth>pageWidth-leftWidth){
                modalWidth = leftWidth-70;
                leftModalStart = 20;
            }
            else{
                modalWidth = pageWidth-leftWidth-80;
                leftModalStart = event.clientX+20;
            }
            //topModalStart = event.clientY;
            topModalStart = window.pageYOffset+20;
            //console.log("modalWidth: "+modalWidth);
            modalHeight = pageHeight-70;

            // font
            hoverReadFont = response.option_font_face;
            //console.log(hoverReadFont);
            // font size
            hoverReadFontSize = response.option_font_size;
            //console.log(hoverReadFontSize);

            hover_read_output = "<div id='title' style='font-family:"+hoverReadFont+";font-weight: 300;font-style: normal;letter-spacing: -0.04em;font-size: 30px;line-height: 1.1;color: #2c3e50;text-rendering: optimizelegibility;'>"+data.title+"</div>"+"<div style='float:left;'><img style='margin-top:5px;height:25px;width:25px;' src='http://htmlscraper.com/hoverread/icon128.png'></div><div style='float:left;margin-top:10px;margin-left:5px;font-weight: 300;font-size:12px;font-family:"+hoverReadFont+";'>Powered by HoverReader</div><div><object data='" + pdf_url + "' type='application/pdf'>alt:<a href='" + pdf_url + "'>test.pdf</a></object></div>";
            $("#hoverReadDisplay").html(hover_read_output).css({top: topModalStart+"px", left: leftModalStart+"px", width:modalWidth+"px", height:modalHeight+"px"}).fadeIn();
        }
	    //console.log(articleUrl);
	    // don't display for youtube
		// if(articleUrl.indexOf("youtube.com") !== -1){
		// 	//console.log("link is youtube");
		// 	return 0;
		// }

		// timer = setTimeout(function () {
		// 	$.getJSON("http://www.htmlscraper.com/hoverread/read.php?", {
		// 	    articleUrl: articleUrl
		// 	  }).done(function( data ) {
		// 	      //console.log(data);
		// 		if(data.body!="<div>Sorry</div>↵" && data.body.length>300 && is_hovering){
		// 			// set scroll back to 0
		// 			scrolled=0;
	 //    			$("#hoverReadDisplay").scrollTop(0);
	 //    			//console.log("scroll position: "+$("#hoverReadDisplay").scrollTop());
		// 			display_hoverreader=true;

		// 			// calculate where to display
		// 	        pageWidth = $(window).width();
		// 	        pageHeight = $(window).height();

		// 	        // console.log('original'+originalHoverX+' '+originalHoverY);
		// 	        // console.log('new'+hoverX+' '+hoverY);
		// 	        //console.log("pageWidth: "+pageWidth+"pageHeight: "+pageHeight);
		// 	        leftWidth = event.clientX;

		// 	        if(leftWidth>pageWidth-leftWidth){
		// 	        	modalWidth = leftWidth-70;
		// 	        	leftModalStart = 20;
		// 	        }
		// 	        else{
		// 	        	modalWidth = pageWidth-leftWidth-80;
		// 	        	leftModalStart = event.clientX+20;
		// 	        }
		// 	        //topModalStart = event.clientY;
		// 	        topModalStart = window.pageYOffset+20;
		// 	        //console.log("modalWidth: "+modalWidth);
		// 	        modalHeight = pageHeight-70;

		// 	        // font
		// 	        hoverReadFont = response.option_font_face;
		// 	    	//console.log(hoverReadFont);
		// 	        // font size
		// 	        hoverReadFontSize = response.option_font_size;
		// 	        //console.log(hoverReadFontSize);

		// 			hover_read_output = "<div id='title' style='font-family:"+hoverReadFont+";font-weight: 300;font-style: normal;letter-spacing: -0.04em;font-size: 30px;line-height: 1.1;color: #2c3e50;text-rendering: optimizelegibility;'>"+data.title+"</div>"+"<div style='float:left;'><img style='margin-top:5px;height:25px;width:25px;' src='http://htmlscraper.com/hoverread/icon128.png'></div><div style='float:left;margin-top:10px;margin-left:5px;font-weight: 300;font-size:12px;font-family:"+hoverReadFont+";'>Powered by HoverReader</div><div id='body' style='float:left;font-size:"+hoverReadFontSize+"px;font-family:"+hoverReadFont+";letter-spacing: .01rem;line-height: 1.5;color: #333332;font-weight: 500;'>"+data.body+"</div>";
		// 			$("#hoverReadDisplay").html(hover_read_output).css({top: topModalStart+"px", left: leftModalStart+"px", width:modalWidth+"px", height:modalHeight+"px"}).fadeIn();
		// 		}
		// 		else{
		// 			//console.log("don't output!");
		// 			//$(currentLinkPointer).css({color:"red", "text-decoration":"underline"});
		// 		}
		// 	});
		// }, 100);
	}).on('mouseleave', 'a', function() {
		clearTimeout(timer);
	    display_hoverreader=false;
	    is_hovering=false;
	    scrolled=0;
	    $("#hoverReadDisplay").scrollTop(0);
	    //console.log("stopped hovering");
	    $("#hoverReadDisplay").html("").hide();
	    $(this).removeAttr( 'style' );

	});


	// if down is pressed
	$(document).keydown(function(e){
	    if (e.keyCode == 40 && display_hoverreader==true) {
	    	//console.log("down pressed, hovering:"+display_hoverreader);
	    	scrolled=scrolled+300;
	    	if(scrolled>$('#hoverReadDisplay')[0].scrollHeight)
	    		scrolled=$('#hoverReadDisplay')[0].scrollHeight;
        	//console.log(scrolled);

        	$('#hoverReadDisplay').stop().animate({
			  scrollTop: scrolled
			}, 800);

	       return false;
	    }
	    if (e.keyCode == 38 && display_hoverreader==true) {
			//console.log("up pressed, hovering:"+display_hoverreader);
			scrolled=scrolled-300;
			if(scrolled<0)
	       		scrolled=0;
	    	//console.log(scrolled);

	    	$('#hoverReadDisplay').stop().animate({
			  scrollTop: scrolled
			}, 800);

	       return false;
	    }

	});


	$('body').mousewheel(function(event, delta) {
		if(display_hoverreader==true) {
	        //console.log("scrolling with trackpad!");
	        // adjust trackpad
	        scrolled=scrolled-event.deltaY*event.deltaFactor;
	    	if(scrolled>$('#hoverReadDisplay')[0].scrollHeight)
	    		scrolled=$('#hoverReadDisplay')[0].scrollHeight;
        	//console.log(scrolled);

        	$('#hoverReadDisplay').stop().animate({
			  scrollTop: scrolled
			}, 0);
	        return false; // prevent default
    	}
    });

	$(document).click(function() {
		// hide hoverReadDisplay
		if(display_hoverreader){
			clearTimeout(timer);
			display_hoverreader=false;
			is_hovering=false;
			scrolled=0;
			$("#hoverReadDisplay").scrollTop(0);
			//console.log("stopped hovering");
			$("#hoverReadDisplay").html("").hide();
		}
	});

	/*
	// track current mouse position
	$(document).mousemove(function(event) {
	    hoverX = event.pageX;
	    hoverY = event.pageY;

	});
	*/


});

});