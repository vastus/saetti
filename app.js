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
function validateAndSendMsg(socket,msg){
    socket.get('username', function(err,username){
        if(err){
            sendError(socket,'You must set username first');
        }else if(msg.text.length<1){
            sendError(socket,'You can\'t send empty message');
        }else if(msg.text.length>500){
            sendError(socket,'Too long message'); 
        }else{
            socket.emit('message',{username:username, text: msg.text, timestamp: getTimestamp()}); 
        }
    });
}

function validateAndSetUsername(socket,username){
    if(users.indexOf(username)!=-1){
        sendError(socket,'Username already in use');
    }else if(username == undefined || username.length<1){
        sendError(socket,'Too short username');
    }else if(username.length > 15){
        sendError(socket, 'Too long username');
    }else{
        io.sockets.emit('new connection', {'username': username});
        socket.set('username', username);
        socket.emit('usernameOK',true);
        io.sockets.emit('update user list', users);
    }
}

function sendError(socket,error){
    saettiSays(error,socket);
}

function saettiSays(text,socket) {
    var obi = {
        username: 'Saetti',
        text: text,
        timestamp: getTimestamp()
    };
    if(socket==null){
        io.sockets.emit('message', obi);
    }else{
        socket.emit('message',obi);
    
    }
}

io.sockets.on('connection', function (socket) {
	socket.emit('message', {username: 'Saetti',text: 'Welcome to Saetti', timestamp: getTimestamp()});

	socket.on('message', function (msg){
        console.log(msg);
        validateAndSendMsg(socket,msg);
	});

	socket.on('username', function (data) {
        validateAndSetUsername(socket,data.username);
	});	
    
    socket.on('disconnect', function () {
        socket.get('username', function (err, username) {
            if (err) console.log(err); // logataan ensisijaisesti
            users.pop(users.indexOf(username));
            saettiSays(username + ' has left');
            io.sockets.emit('update user list', users);
        });
    });
});

app.get('/', routes.index);
app.get('/users', user.list);

var getTimestamp = function(){
	var today = new Date();
	return today.getHours()+":"+today.getMinutes();
}

