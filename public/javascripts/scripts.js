$(window).ready(function(){
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

	socket = io.connect('http://localhost');
	socket.on('message', function (data) {
		console.log(data);
		chatModel.messages.push(data);
	});

    // socket.on('new connection', function (user) {
    //     $('#userit ul').append('<li>' + user.username + '</li>');
    // });

    socket.on('update user list', function (users) {
        chatModel.onlineUsers(users);
    });
});

