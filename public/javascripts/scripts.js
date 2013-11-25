$(window).ready(function(){
	var socket = io.connect('http://localhost');

	var chatModel = {
		messages : ko.observableArray(),
        onlineUsers : ko.observableArray()
	};
	
	ko.applyBindings(chatModel);

	$('#msgbox').keypress(function (e) {
		if (e.keyCode == '13') {
			socket.emit('message', {'text': $(this).val()});
			$(this).val('');
		}
	});

	$('#loginbox').keypress(function (e) {
		if (e.keyCode == '13'){
			socket.emit('username', {'username': $(this).val()});
			$(this).hide();
			$('#msgbox').show();
		}
	});

	socket.on('message', function (data) {
		console.log(data);
		chatModel.messages.push(data);
	});

    socket.on('update user list', function (users) {
        chatModel.onlineUsers(users);
    });
});

