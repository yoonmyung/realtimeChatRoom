var app = require('express')(); //express 모듈 사용
var http = require('http').createServer(app); //http라는 이름의 express 모듈 기반 http web server 객체 생성
var io = require('socket.io')(http);  //http web server에 socket.io 모듈 사용 (웹 서버에 소켓이 부착되는 느낌으로)

http.listen(3000, () => { //3000번 포트에서 대기 중인 http 웹 서버 생성
  console.log('listening on *:3000');
});

app.get('/', (req, res) => {
  //객체 app(web server)가 request(get method)를 받았을 경우
  //3000번 포트에 "누군가 들어온 경우 (=웹페이지에 누가 접속함)"
  res.sendFile(__dirname + '/index.html');  //index.html을 response(웹 브라우저가 이를 받아서 화면에 렌더링)
});

io.on('connection', (socket) => { //소켓이 붙어있는 http web server에 connection 발생
  io.emit('user entered');
  socket.on('chat message', (msg) => {
    //client가 'chat message'라는 이름의 이벤트를 보낸 경우(발생시킨 경우)
    //msg(해당 이벤트의 결과물)라는 데이터를 받아온다
    io.emit('chat message', msg); //client에게 'chat message'라는 이름의 이벤트를 보낸다
  });
  socket.on('disconnect', () => {
    io.emit('user leaved');
  });
});
