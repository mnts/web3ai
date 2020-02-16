$(function(){
	window.tip = {
		active: false,
		hide: function(selector){
			//if(tip.active){
				$(selector || '.tip:not(.static)').hide();
				$('.fcs').removeClass('fcs');
				tip.active = false;
			//}
		}
	};

	$(document).click(function(ev){
		if(!$(ev.target).parents('.tip:not(.options)').length && !$(ev.target).hasClass('tip'))
			tip.hide();
	});

	$('.tip > .choose').click(function(){
		if($(this).hasClass('disabled')) return;
		$(this).toggleClass('v');
		return false;
	});

	$('.tip > .option').click(function(){
		$(this).parent('.tip:not(.static)').fadeOut(100);
	});
});


$.fn.tip = function(conf){
	$(this).each(function(){
		var cfg = {
			$t: $(this),
			id: 'tip',
			fix: false,
			pos: 'b',
			context: false,
			event: 'click',
			fadeOutSpeed: 10,
			fadeInSpeed: 10,
			stay: false
		}
		$.extend(cfg, conf);

		if(cfg.context)
			var $ctx = $(this);

		var $cont = cfg.$tip = $('#'+cfg.id);

		function showTip(){
			if($cont.is(':visible'))
				tip.hide($cont);

			var $el = cfg.context?$(this):cfg.$t;

			if(cfg.ba)
				if(cfg.ba($el) === false) return false;

			if(!cfg.$t.parents('.tip').length)
				$('.tip:not(.notRelated)').fadeOut(cfg.fadeOutSpeed);

			if(cfg.pos != 'last')
				$('.fcs').removeClass('fcs');


			if($cont.length){
				$cont[0].init = $el[0];
				var w = $cont.outerWidth(),
					h = $cont.outerHeight(),
					ew = $el.outerWidth(),
					eh = $el.outerHeight(),
					et = $el.offset().top,
					el = $el.offset().left;

				var css = {}

				if(typeof cfg.pos == 'function')
					css = cfg.pos($el, $cont);
				else if(cfg.pos == 't' || cfg.pos == 'b'){
					var tp = (et-h),
						bp = (et + eh);

					css.top = (cfg.pos == 'b')?((($(window).height()) < (bp+h))?tp:bp):bp;

					if(cfg.pos == 't')
						css.top = tp>0?tp:bp;

					if(cfg.fix == 'w'){
						css.width = ew;
						css.left = el;
					}
					else
					if(cfg.fix == 'h'){
						css.height = eh;
						css.top = et;
					}
					else
					if(cfg.fix == 'c'){
						css.left = el + (ew-w)/2;
					}
					else{
						//var pl = el + (ew - w)/2
						//css.left = pl<0?(el + 2):pl;
						css.left = el;
					}
				}
				else if(cfg.pos == 'r'){
					css.left = el + ew;
					css.top = et + (eh - h)/2;
				}
				else if(cfg.pos == 'l'){
					css.left = el - w;
					css.top = et + (eh - h)/2;
				}
				else if(cfg.pos == 'last'){
					var $lastTip = $('.tip:visible');
					css.top = $lastTip.css('top');
					css.left = $lastTip.css('left');
				}

				var width = css.width || w,
					right = css.left + width;

				if(right > $(document).width()){
					css.left = $(document).width() - width - 1;
				}

				if(css.left < 0)
					css.left = 0;

				if(cfg.pos != 'last' && cfg.event != 'hover')
					$el.addClass('fcs');

				tip.active = true;

				var classPos = {
					t: 'tip-top',
					r: 'tip-right',
					l: 'tip-left',
					b: 'tip-bottom'
				};

				var $tri = $cont.children('.tri');
				if($tri.length && cfg.fix == 'c')
					$tri.css('left', el - css.left + ew/2 - 5);

				$cont.removeClass('tip-left tip-right tip-top tip-bottom').addClass(classPos[cfg.pos])
				.css(css).fadeIn(cfg.fadeInSpeed, function(){
					if(cfg.afterAppear)
						cfg.afterAppear(cfg);
				});
			}
			return false;
		};

		cfg.func = showTip;

		if(cfg.on){
			cfg.on(cfg);
		}

		if(typeof cfg.onEdit == 'function')
			cfg.$t.on('keyup', function(ev){
				cfg.onEdit(ev, cfg);
			});

		else
		if(cfg.context)
			$ctx.on('contextmenu', cfg.context, showTip);
		else{
			if(cfg.event) cfg.$t[cfg.event](showTip);
			if(cfg.event == 'hover')
				cfg.$t.mouseout(function(){
					$('#'+cfg.id).fadeOut(100);
				});
		}

	});
	return this;
};

const template = document.createElement('template');

template.innerHTML = `
  <style>
    :host, main {

    }

    :host {
      height: 100%;
    }

    main{
    }

    main > .app{
      display: none;
      width: 100%;
      height: 100%;
    }

    main > .app.selected{
      display: block;
    }
  </style>

  <main>
    <slot></slot>
  </main>
`;


class tip extends HTMLElement{


};
