var app = require('express')(); //express 모듈 사용
var http = require('http').createServer(app); //http라는 이름의 express 모듈 기반 http web server 객체 생성
var io = require('socket.io')(http);  //http web server에 socket.io 모듈 사용 (웹 서버에 소켓이 부착되는 느낌으로)
var userList = new Array();

http.listen(3000, () => { //3000번 포트에서 대기 중인 http 웹 서버 생성
  console.log('listening on *:3000');
});

app.get('/', (req, res) => {
  //객체 app(web server)가 request(get method)를 받았을 경우
  //3000번 포트에 "누군가 들어온 경우 (=웹페이지에 누가 접속함)"
  res.sendFile(__dirname + '/client.html');  //index.html을 response(웹 브라우저가 이를 받아서 화면에 렌더링)
});
//-------------------위: http 일방향 통신 / 아래: 소켓 양방향 통신
io.on('connection', (socket) => { //소켓이 붙어있는 http web server에 connection 발생
  io.to(socket.id).emit('create user'); //id는 Socket.IO의 고유 속성(socket.id)
  socket.on('create user', function(userName) { //"소켓 하나 = 웹페이지에 들어온 유저 한 명" 이라 생각하면 좋다.
    socket.userName = userName;
    userList.push(socket.userName);
  });
  socket.on('send userList', () => {
    io.emit('send userList', userList);
  });
  socket.on('user typing', (lengthOfMsg) => {
    var isTyping = false;
    if (lengthOfMsg > 0) {
      isTyping = true;
    }
    io.emit('user typing', isTyping, socket.userName);
  });
  socket.on('chat message', (msg) => {
    //client가 'chat message'라는 이름의 이벤트를 보낸 경우(발생시킨 경우)
    //msg(해당 이벤트의 결과물)라는 데이터를 받아온다
    var date = new Date();
    msg = socket.userName + ': ' + msg + ' ' + date.getHours() + ':' + date.getMinutes();
    io.emit('chat message', msg); //client에게 'chat message'라는 이름의 이벤트를 보낸다
  });
  // socket.on('check name', (newName) => {
  //   var index;
  //   var isAbleToChange = false;
  //   for (index = 0; index < userList.length; index++) {
  //     if (userList[index] newName) {
  //       break;
  //     }
  //   }
  //   if (index >= userList.length) {
  //     userList[userList.indexOf(socket.userName)] = newName;
  //     socket.userName = newName;
  //     isAbleToChange = true;
  //   }
  //   io.emit('check name', isAbleToChange);
  // }
  socket.on('disconnect', () => {
    userList.splice(userList.indexOf(socket.userName), 1);
    io.emit('delete user', socket.userName);
  });
});
