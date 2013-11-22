$(window).ready(function(){
	var chatModel = {
		messages : ko.observableArray()
	};
	
	ko.applyBindings(chatModel);
	$("#msgbox").keypress(function(e){
		if(e.keyCode == '13'){
			socket.emit("message",{text: $(this).val()});
			$(this).val("");
		}
	});


	socket = io.connect('http://localhost');

	socket.on('message', function (data) {
		console.log(data);
		chatModel.messages.push(data);
		console.log(chatModel.messages.length);
	});
});

