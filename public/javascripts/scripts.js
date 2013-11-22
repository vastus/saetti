socket = io.connect('http://localhost');
socket.on('news', function (data) {
    console.log(data);
    socket.emit('my other event', { my: 'data' });
});
$(window).ready(function(){
	$("#msgbox").keypress(function(e){
		if(e.keyCode == '13'){
			socket.emit("message",{message: $(this).val()});
			$(this).val("");
		}
	});
});

