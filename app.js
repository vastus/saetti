var express = require('express');
var routes = require('./routes');
var user = require('./routes/user');
var http = require('http');
var path = require('path');
var app = express();
var server = app.listen(3000);
var io = require('socket.io').listen(server);

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(express.cookieParser('your secret here'));
app.use(express.bodyParser());
app.use(express.session());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

var users = [];

io.sockets.on('connection', function (socket) {
	socket.emit('message', { username:'server',text: 'welcome', timestamp : getTimestamp() });
	
	socket.on('message', function (msg){
 		console.log(msg);
		//if username is set
      	socket.get('username', function (err, name) {
			if (name) {
				io.sockets.emit('message', {'username' : name, 'text' : msg.text, timestamp : getTimestamp()});
			}
		});
	});

	socket.on('username', function (data) {
        io.sockets.emit('new connection', {'username': data.username});
		socket.set('username', data.username);
        socket.set('users', users.push(data.username));
        io.sockets.emit('update user list', users);
	});	

    // Poista useri listasta tää ei toimi koska data on undefined
    // socket.on('disconnect', function (data) {
    //     var idx = users.indexOf(data.username);
    //     users.pop(idx);
    //     io.sockets.emit('update user list', users);
    // });
    socket.on('disconnect', function (data) {
        console.log('disconnected. data: ' + data);
    });
});

app.get('/', routes.index);
app.get('/users', user.list);

var getTimestamp = function(){
	var today = new Date();
	return today.getHours()+":"+today.getMinutes();
}
//http.createServer(app).listen(app.get('port'), function(){
//  console.log('Express server listening on port ' + app.get('port'));
//});
