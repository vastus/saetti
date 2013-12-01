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

var users = []; // Avaimena serverillä olevat usernamet, arvona kanavat joilla käyttäjä on
var channels = []; // Avaimena serverin kanavat, arvona kanava oliot, joilta löytyy lista socketeista ja usernameista

function Channel(){}
Channel.prototype.usernames = [];
Channel.prototype.sockets = [];

function sendMsg(socket,msg){
    if(msg.channel == undefined){  // mikäli viestiä ei ole kohdistettu tietylle kanavalle, se menee aina mainiin
        msg.channel = "main";
    }
    socket.get('username', function(err,username){
        if(err){
            sendError(socket,'You must set username first');
        }else if(msg.text.length<1){
            sendError(socket,'You can\'t send empty message');
        }else if(msg.text.length>500){
            sendError(socket,'Too long message'); 
        }else{
            var chan = msg.channel;
            console.log(chan);
            channels[msg.channel].sockets.forEach(
                function(socket){
                    socket.emit("message",{text : msg.text, timestamp : getTimestamp(), username: username, channel: msg.channel });
            });
        }
    });
}

function setUsername(socket,username){
    if(username in users){
        sendError(socket,'Username already in use');
    }else if(username == undefined || username.length<1){
        sendError(socket,'Too short username');
    }else if(username.length > 15){
        sendError(socket, 'Too long username');
    }else{        
        addUserToChannel(socket,'main',username);
        socket.set('username', username);
        socket.emit('usernameOK',true);
    }
}

// funktio ylläpitää tietoja molemmin päin, sekä channelilla olevat socketit, että userilla olevat kanavat
function addUserToChannel(socket,channel,username){
    if(!channels[channel]){
        channels[channel] = new Channel();
    }

    channels[channel].usernames.push(username);
    channels[channel].sockets.push(socket);

    if(!users[username]){
        users[username] = [];
    }

    users[username].push(channel);
    channels[channel].sockets.forEach(
        function(socket){
            socket.emit('update user list', channels[channel].usernames);
       });
}

function disconnectUser(socket){
    console.log("rip socketti discos");
    socket.get('username',function(err,username){
        console.log(username);
        if(username == null){
            return;
        }
        console.log('sit mentii');
        users[username].forEach(
            function deleteFromChannelAndSendDisconnectMessage(channel){
                console.log('voi pojat');
                channels[channel].sockets.pop(socket);
                channels[channel].usernames.pop(username);
                channels[channel].sockets.forEach(
                    function(socket){
                        saettiSays(username+" left from channel", socket, channel);

                        socket.emit('update user list', channels[channel].usernames);
                    });
            }
        );
        delete users[username];

    });

}

function sendError(socket,error){
    saettiSays(error,socket);
}

function saettiSays(text,socket,channel) {
    var obi = {
        username: 'Saetti',
        text: text,
        timestamp: getTimestamp(),
    };
    if(channel == null){
        obi.channel = 'main';
    }
    if(socket==null){
        io.sockets.emit('message', obi);
    }else{
        socket.emit('message',obi);
    
    }
}


io.sockets.on('connection', function (socket) {
	saettiSays('Welcome to Saetti',socket);

	socket.on('message', function (msg){
       console.log(msg);
       sendMsg(socket,msg);
	});

	socket.on('username', function (data) {  
       setUsername(socket,data.username);
	});	
    
    socket.on('disconnect', function () {
        disconnectUser(socket);
    });

    socket.on('join channel', function(channel){
        socket.get('username',function(err,username){
            if(!err && username != null){
                addUserToChannel(socket,channel,username);

             }
        });
    });
    socket.on('leave channel', function(channel){
        socket.get('username', function(err,username){
            if(!err&&username !=null){
                // todo
            }
        });
    });
});


app.get('/', routes.index);
app.get('/users', user.list);

var getTimestamp = function(){
	var today = new Date();
	return today.getHours()+":"+today.getMinutes();
}

