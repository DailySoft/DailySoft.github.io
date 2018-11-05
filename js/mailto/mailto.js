/* Класс MailTo создаёт объект отправителя рассылки с полями - имя, почта оправителя, письмо.
   Каждый раз вызывая метод send текущего объекта, вы можете рассылать письмо по новым адресам.
   Класс использует сервис sendinblue для почтовых рассылок.
   @autor: mr.gifo */


// Конструктор
function MailTo(sender_name, sender_email, message) {
	this.sender = sender_name;
	this.email = sender_email;
	this.message = message;
}


// Метод отправки письма получателю
// Поля - email получателя, имя (название организации) получателя, тема (заголовок) письма
MailTo.prototype.send = function(target_email, target_addressee, title_message) {
	var xmlhttp = (window.XMLHttpRequest) ? new XMLHttpRequest() : new ActiveXObject("Microsoft.XMLHTTP");
	xmlhttp.open('POST', 'https://api.sendinblue.com/v3/smtp/email');
	xmlhttp.setRequestHeader('Content-Type', 'application/json');
	xmlhttp.setRequestHeader('api-key', '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');
	xmlhttp.onreadystatechange = function() {
		if (xmlhttp.readyState == 4) {
			var is_send = (xmlhttp.status == 201) ? true : false;
			callbackToSend(is_send);
		}
	}
	xmlhttp.send(JSON.stringify({
		"sender": {
			"name": this.sender,
			"email": this.email
		},
		"htmlContent": "<p> " + this.message + " </p>",
		"subject": title_message,
		"replyTo": {
			"email": this.email,
			"name": this.sender
		},
		"to": [{
			"email": target_email,
			"name": target_addressee
		}]
	}));
}


MailTo.prototype.callbackToSend = function() {}


// Callback метод - позволяет получить статус отправки текущего письма (true/false)
MailTo.prototype.response = function(callback) {
	callbackToSend = callback;
}
