$(window).ready(function(){
	var chatModel = {
		messages : ko.observableArray([])
	};
	
	ko.applyBindings(chatModel);
	$("#msgbox").keypress(function(e){
		if(e.keyCode == '13'){
			socket.emit("message",{message: $(this).val()});
			$(this).val("");
		}
	});


	socket = io.connect('http://localhost');
	socket.on('news', function (data) {
		console.log(data);
		socket.emit('my other event', { my: 'data' });
	});

	socket.on('message', function (data) {
		chatModel.messages.push(data);
	});
});

