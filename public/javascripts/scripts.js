$(window).ready(function(){
	var socket = io.connect('http://localhost');
    var nameset = false;
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
		if (e.keyCode == '13' && !nameset){
			socket.emit('username', {'username': $(this).val()});
			$(this).hide();
			$('#msgbox').show();
            nameset = true;
		}
	});

	socket.on('message', function (data) {
		console.log(data);
		chatModel.messages.push(data);
        $("#viestit").animate({ scrollTop: $('#viestit')[0].scrollHeight}, 500);
	});

    socket.on('update user list', function (users) {
        chatModel.onlineUsers(users);
    });
});

