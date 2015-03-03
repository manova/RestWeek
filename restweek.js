
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
var display_restweek=false; // set to not display
var is_hovering=false; // set to not current hovering
var scrolled=0; // set initial scroll
var scrolled_x=0;
var hoverX=0; // current mouseX position
var hoverY=0; // current mouseY position
var startHoverUrl=''; // last URL hovered over
var currentHoverUrl='' // current URL that is hovered over
$(document).ready(function() {
    // append hoverread div
    $("body").append("<div style='display:none;position:absolute;background:white;border: 5px solid #F52D8C;padding:10px;z-index:9999;max-width:700px;overflow:scroll;box-shadow: 5px 5px 5px 0px rgba(77,77,77,1);' id='rest_week_display'>STUFF GOES HERE</div>")

    var timer;
    $("body").on('mouseenter', 'a', function(event) {
        is_hovering=true;
        var articleUrl= $(this).attr("href");





        startHoverUrl = articleUrl;
        var currentLinkPointer = $(this);
        originalHoverX = event.clientX;
        originalHoverY = event.clientY;
        currentUrl = document.URL;
        articleUrl = absolutizeURI(currentUrl, articleUrl);
        console.log(articleUrl);

        if (articleUrl.indexOf('venue') > -1) {
            var pdf_url = 'http://www.nycgo.com/assets/files/programs/rw/2014S/' + articleUrl.split('/').pop() + '.pdf'
            console.log(pdf_url);
            scrolled=0;
            $("#rest_week_display").scrollTop(0);
            //console.log("scroll position: "+$("#rest_week_display").scrollTop());
            display_restweek=true;

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
            hoverReadFont = 'Arial';
            //console.log(hoverReadFont);
            // font size
            hoverReadFontSize = 22;
            //console.log(hoverReadFontSize);

            var pdf_height = 3500;
            var pdf_width = 1500;
            hover_read_output = "<div style='float:left;'><img style='margin-top:5px;height:25px;width:25px;' src='http://i.imgur.com/YEC1ksj.png'></div><div style='float:left;margin-top:10px;margin-left:5px;font-weight: 300;font-size:12px;font-family:"+hoverReadFont+";'>Courtesy of RestWeek</div><object data='" + pdf_url + "' type='application/pdf' height='" + pdf_height + "' width='" + pdf_width + "'>alt:<a href='" + pdf_url + "'>test.pdf</a></object>";
            $("#rest_week_display").html(hover_read_output).css({top: topModalStart+"px", left: leftModalStart+"px", width:modalWidth+"px", height:modalHeight+"px"}).fadeIn();
        }
    }).on('mouseleave', 'a', function() {
        clearTimeout(timer);
        display_restweek=false;
        is_hovering=false;
        scrolled=0;
        scrolled_x=0;
        $("#rest_week_display").scrollTop(0);
        $("#rest_week_display").scrollLeft(0);
        $("#rest_week_display").html("").hide();
        $(this).removeAttr( 'style' );

    });


    $(document).keydown(function(e){
        if (e.keyCode == 40 && display_restweek==true) {
            scrolled=scrolled+300;
            if(scrolled>$('#rest_week_display')[0].scrollHeight)
                scrolled=$('#rest_week_display')[0].scrollHeight;

            $('#rest_week_display').stop().animate({
              scrollTop: scrolled
            }, 800);

           return false;
        }
        if (e.keyCode == 38 && display_restweek==true) {
            scrolled=scrolled-300;
            if(scrolled<0)
                scrolled=0;

            $('#rest_week_display').stop().animate({
              scrollTop: scrolled
            }, 800);

           return false;
        }
        if (e.keyCode == 37 && display_restweek==true) {
            scrolled=scrolled-300;
            if(scrolled<0)
                scrolled=0;

            $('#rest_week_display').stop().animate({
              scrollLeft: scrolled
            }, 800);

           return false;
        }
        if (e.keyCode == 39 && display_restweek==true) {
            scrolled=scrolled+300;
            if(scrolled<0)
                scrolled=0;

            $('#rest_week_display').stop().animate({
              scrollLeft: scrolled
            }, 800);

           return false;
        }

    });


    $('body').mousewheel(function(event, delta) {
        if(display_restweek==true) {
            scrolled=scrolled-event.deltaY*event.deltaFactor;
            if(scrolled>$('#rest_week_display')[0].scrollHeight)
                scrolled=$('#rest_week_display')[0].scrollHeight;

            $('#rest_week_display').stop().animate({
              scrollTop: scrolled
            }, 0);
            scrolled_x=scrolled_x+event.deltaX*event.deltaFactor;
            if(scrolled_x>$('#rest_week_display')[0].scrollWidth)
                scrolled_x=$('#rest_week_display')[0].scrollWidth;

            $('#rest_week_display').stop().animate({
              scrollLeft: scrolled_x
            }, 0);
            return false; // prevent default
        }
    });

    $(document).click(function() {
        if(display_restweek){
            clearTimeout(timer);
            display_restweek=false;
            is_hovering=false;
            scrolled=0;
            $("#rest_week_display").scrollTop(0);
            $("#rest_week_display").html("").hide();
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
