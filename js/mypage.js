var isScrolling = false;


/*  Хакаем плагин Baron.js (https://github.com/Diokuz/baron), пытаемся вникнуть
    Добавляем геттер на scroller - baron.getScroller()
    Добавляем колбэк-слушатели событий:
    - baron.onCreate - запускается при инициализации scrollbar-а
    - baron.onScroll - запускается при событии 'onscroll' контента scrollbar-а
    - baron.onWheel - запускается при событии 'mousewheel' контента scrollbar-а
    Профит */


// задаём параметры инициализации для baron - объекта scrollbar
$(window).on("load", function () {
	baron({
		root: '.baron',
		scroller: '.baron__scroller',
		bar: '.baron__bar',
		scrollingCls: '_scrolling',
		draggingCls: '_dragging'
	}).fix({
		elements: '.header__title',
		outside: 'header__title_state_fixed',
		before: 'header__title_position_top',
		after: 'header__title_position_bottom',
		clickable: true
	}).controls({

		// Element to be used as interactive track. Note: it could be different from 'track' param of baron.
		track: '.baron__track',
		forward: '.baron__down',
		backward: '.baron__up'
	});
});

			
// инициализация
baron.onCreate(function(o) {
	$('nav').css( 'top', '0px' );
	$('.ribbon').removeClass('active');
	$('.pic_logo').removeClass('active');
	$('a.active').removeClass('active');
	$('a[href="#'+'home'+'"]').addClass('active');
	animateToScroll(o, 0, 1500, "easeOutCubic");
});


// скролл страницы
baron.onScroll(function(e, o) {

	// позиционируем все зависимые элементы от sticky-положения navbar-а
	var sticky  = $('.navbar_box').offset().top;
	if (sticky <= 0 ) {
		$('.ribbon').addClass('active');
		$('.pic_logo').addClass('active');
		$('.downer').addClass('active');
		$('.social_bar').addClass('active');
	} else {
		$('.ribbon').removeClass('active');
		$('.pic_logo').removeClass('active');
		$('.downer').removeClass('active');
		$('.social_bar').removeClass('active');
	}

	// смена инфо-статуса текущего просматриваемого контента
	$('section').each(function(i,el) {
		var top  = $(el).offset().top;
		var bottom = top + $(el).height();

		// Так как использование custom scrollbara уже меняет динамически
		// положение элементов контейнера, то var scroll делаем статичным.
		var scroll = 16; // var scroll = scroller.scrollTop

		var id = $(el).attr('id');
		if( scroll > top && scroll < bottom) {
			$('nav a.active').removeClass('active');
			$('nav a[href="#'+id+'"]').addClass('active');
			var delta = 0 - (getSectionPos(id) - 1) * 26;
			var top_delta = String(delta) + 'px';
			$('nav').css( 'top', top_delta );					
		}
	});
});

			
// плавный скролл страницы со смещением в высоту контента по каждому из пунктов
baron.onWheel(function(e, o) {
	var delta = (e.detail) ? e.detail * -40 : e.wheelDelta;				
	if (delta !== undefined) {
		$('section').each(function(i,el) {
			var top  = $(el).offset().top;
			var bottom = top + $(el).height();
			var scroll = 16;
			var id = $(el).attr('id');
			if( scroll > top && scroll < bottom) {
				e.preventDefault();
				var pos = getSectionPos(id);
				var next = (delta < 0) ? getSectionId(pos + 1) : getSectionId(pos - 1);
				var to_top = $('#' + next).offset().top + o.scrollTop;
				animateToScroll(o, to_top, 1500, "easeOutQuart");
			}
		});
	}				
});


// плавный якорный переход к контенту по клику navbar-а
$(document).on("click", ".mybar a", function (event) {
	var o = baron.getScroller();
	if (o !== undefined) {
		event.preventDefault(); 
		var id  = $(this).attr('href');

		// Так как использование custom scrollbara уже меняет динамически
		// положение элементов контейнера, то уточняем положение элемента на o.scrollTop
		var top = $(id).offset().top + o.scrollTop;
		animateToScroll(o, top, 1500, "easeOutQuart");
	}			
});


// валидация формы обратной связи и отправка почтового запроса с сайта
$(document).on("focus", ".dialog_form .button_upform", function (event) {
	$(".status_send").css('color', '#707070');
	$(".status_send").text("Подождите...");

	// валидация и отправка
	var name = $("input#name").val();
	var mail = $("input#email").val();
	var msg = $("#msgsend").val();
	var name_reg = /^[a-zA-Zа-яА-Я]+$/;
	var mail_reg = /^([a-zA-Z0-9_.-])+@([a-zA-Z0-9_.-])+\.([a-zA-Z])+([a-zA-Z])+/;
	var name_is = (name.length > 1) ? (name_reg.test(name) ? true : false) : false;
	var mail_is = (mail.length > 7) ? (mail_reg.test(mail) ? true : false) : false;
	var msg_is = (msg.length > 1) ? true : false;
	if (name_is && mail_is && msg_is) {
		var post = new MailTo(name, mail, msg);
		post.response(function(isSend) {
			if (isSend) {

				// если сообщение отправилось
				$(".status_send").css('color', '#707070');
				$(".status_send").text("Сообщение успешно отправлено!");
				$("input#name").val("");
				$("input#email").val("");
				$("#msgsend").val("");
			} else {

				// если сообщение не отправилось с ошибкой на сервере
				$(".status_send").css('color', '#FF3232');
				$(".status_send").text("Ошибка на сервере :-(  Свяжитесь с нами по контактам ниже :-)");
			}
		});
		post.send('daily.soft@mail.ru',
			  'Daily Soft',
			  'Вопрос с Сайта!');

	} else {

		// если поля формы были заполнены не верно
		$(".status_send").css('color', '#FF3232');
		$(".status_send").text("Ошибка! Пожалуйста, заполните правильно необходимые поля!");		
	}
});

			
// анимация скролла (параметры - смещение скролла на..., время анимации, тип анимации)
function animateToScroll(content, position, time, animation) {
	if (!isScrolling) {
		isScrolling = true;
		$(content).animate({
				scrollTop: position
			}, {
				duration: time,
				specialEasing: { scrollTop: animation },
				complete: function() { isScrolling = false; }
			}
		);
	}
}


// возвращает порядковый индекс теущей секции по #id
function getSectionPos(id_name) {
	var result = -1;
	switch (id_name) {
		case 'home': result = 1; break;
		case 'more': result = 2; break;
		case 'projects': result = 3; break;
		case 'about': result = 4; break;
		case 'contacts': result = 5; break;
	}
	return result;
}


// возвращает #id теущей секции по порядковому индексу
function getSectionId(pos_value) {
	var result;
	if (pos_value <= 1) result = 'home';
	else if (pos_value == 2) result = 'more';
	else if (pos_value == 3) result = 'projects';
	else if (pos_value == 4) result = 'about';
	else if (pos_value >= 5) result = 'contacts';
	else result = null;
	return result;
}
			
