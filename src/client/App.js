import React, { Component } from 'react';
import io from 'socket.io-client';
import _ from 'underscore';
import './App.css';
import Grid from './grid.jsx';
import SkinCss from './skinCss';
import SkinSelector from './skinSelector';
import generateShips from './ships';
import SeamlessLoop from './js/seamlessloop.js';
import GameOutcome from './gameOutcome';
import Chat from './chat';
import Start from './Start';

class App extends Component {
  constructor() {
    super();

    this.state = {
      usersOnline: 0,
      userName: null,
      opponentName: null,
      inGame: false,
      gameOutcome: false,
      ships: generateShips(),
      chatMessages: [],
      skins: [],
      currentSkin: '',
      currentX: null,
      currentY: null,
      bombs: [],
      turn: null,
      socketId: null,
      config: null,
      backgroundLoop: null,
      backgroundLoopLoaded: false,
      backgroundLoopPlaying: false,
      fx_welcome: null,
      fx_background: null,
      fx_start: null,
      fx_bomb: null,
      fx_hit: null,
      fx_miss: null,
      fx_win: null,
      user: null
    }
    this.defaultUserName = "Poseidon";
    this.defaultOpponentName = "Warlord";
  }

  resetState() {
    this.setState({
      opponentName: null,
      inGame: false,
      gameOutcome: false,
      ships: generateShips(),
      skins: [],
      currentX: null,
      currentY: null,
      bombs: [],
      turn: null
    });
  }

  resetGame = () => {
    this.resetState();
  }

  isMyTurn(id) {
    return this.state.socket.id === id;
  }

  initSkin() {
    var that = this;

    var skin = this.currentSkin();
    this.setSkinCss();

    var backgroundLoop = new SeamlessLoop();
    backgroundLoop.addUri('../skins/'+this.state.currentSkin+'/'+skin.sounds.background, parseInt(skin.sounds.backgroundLength), "background");
    backgroundLoop.callback( function() {
      that.setState({backgroundLoopLoaded:true});
    });
    this.setState({backgroundLoop:backgroundLoop});

    this.fx_welcome = new Audio('../skins/' + this.state.currentSkin + '/' + '/welcome.ogg');
    this.fx_start = new Audio('../skins/' + this.state.currentSkin + '/' + '/start.ogg');
    this.fx_bomb = new Audio('../skins/' + this.state.currentSkin + '/' + '/bomb.ogg');
    this.fx_hit = new Audio('../skins/' + this.state.currentSkin + '/' + '/hit.ogg');
    this.fx_miss = new Audio('../skins/' + this.state.currentSkin + '/' + '/miss.ogg');
    this.fx_win = new Audio('../skins/' + this.state.currentSkin + '/' + '/win.ogg');

    this.fx_welcome.volume = 0.1;
    this.fx_start.volume = 0.1;
    this.fx_bomb.volume = 0.1;
    this.fx_hit.volume = 0.04;
    this.fx_miss.volume = 0.06;
    this.fx_win.volume = 0.1;
  }

  playSound(sound) {
    sound.currentTime = 0;
    sound.play();
  }

  setSkinCss() {
    var skin = this.currentSkin();
    var style = document.createElement('style');
    style.type = 'text/css';
    var skinStyle = 'body{color:' + skin.graphics.color + '}';
    if (style.styleSheet) {
        style.styleSheet.cssText = skinStyle;
    } else {
        style.appendChild(document.createTextNode(skinStyle));
    }
    document.getElementsByTagName('head')[0].appendChild(style);
  }

  setupSockets = () => {

    const serverConnection = {ip: 'localhost', port: '8080'};
    const endpoint = 'http://'+ serverConnection.ip +':'+ serverConnection.port;

    const socket = io.connect(endpoint, {
      query: {token: this.state.user.token}
    });
    this.setState({socket: socket});

    socket.on('connect', () => {

      this.setState({socketId: socket.id});

      socket.emit('newUser', {username:this.state.user.username, ships:this.state.ships});

      socket.on('online', data => {
        this.setState({
          usersOnline: data.usersOnline,
          config: data.config,
          skins: data.skins,
          currentSkin: data.config.default_skin
        }, () => {
          this.initSkin();
        });
      });

      socket.on('startGame', (opponentName,startsGame) => {
        this.playSound(this.fx_start);
        if (opponentName === this.defaultUserName) {
            opponentName = this.defaultOpponentName;
        }
        this.setState({opponentName: opponentName, turn: startsGame});
      });
      socket.on('bomb_result', result => {

        console.log('bomb_result',result);

        this.doWehaveAwinner(result);
        this.playHitOrMiss(result.result)
        let _bombs = this.state.bombs;
        _bombs.push({x: result.x,y: result.y, result:result.result, socketId: result.socketId});
        this.setState({bombs: _bombs, turn: this.isMyTurn(result.game.turn)});
      });
      socket.on('newChatMessage', message => {
        var message = {userName: this.state.opponentName, message:message, who:'you'};
        var chatMessages = this.state.chatMessages;
        chatMessages.push(message);
        this.setState({chatMessages:chatMessages});
      });
      socket.on('userDisconnected', onlineUsers => {
        this.setState({usersOnline: onlineUsers});
      });
    });
  }

  componentDidMount() {
    var that = this;
  }

  sendChatMessage = (message) => {
    console.log(message);
    var _message = {userName: this.state.userName, message:message, who:'me'};
    var chatMessages = this.state.chatMessages;
    chatMessages.push(_message);
    this.setState({chatMessages:chatMessages});
    socket.emit('chatMessage', message, this.state.socketId);
  }

  doWehaveAwinner(result) {
    if (result.winner !== null && result.winner === this.state.socketId) {
      this.setState({gameOutcome:'won'});
    }
    if (result.winner !== null && result.winner !== this.state.socketId) {
      this.setState({gameOutcome:'lost'});
    }
  }

  playHitOrMiss(result) {
    if (result === 'miss') {
      this.playSound(this.fx_miss);
    } else {
      this.playSound(this.fx_hit);
    }
  }

  onJoinGame = () => (event) => {
    if (this.state.usersOnline < 2) { alert('NOt enough users');  return false; }
    this.setState({inGame: true});
    this.state.socket.emit('joinGame',this.state.ships);
  }

  bomb = (x,y) => {
    if (this.state.turn === false) { return false; }
    this.playSound(this.fx_bomb);
    this.setState({currentX: x, currentY: y});
    this.state.socket.emit('bomb', x, y);
  }

  whoseTurn() {
    return this.state.turn === true ? <div className="status">my turn</div> : '';
  }

  currentSkin() {
    var that = this;
    return _.find(this.state.skins, function(skin) { return skin.name === that.state.currentSkin });
  }

  backgroundImage() {
    if (this.state.config === null) { return ''}
    return './skins/'+this.state.currentSkin+'/'+this.currentSkin().graphics.background;
  }

  startStopBackground = (event) => {
    if (this.state.backgroundLoopPlaying === false) {
      this.state.backgroundLoop.start('background');
      this.setState({backgroundLoopPlaying:true});
    } else {
      this.state.backgroundLoop.stop('background');
      this.setState({backgroundLoopPlaying:false});
    }
  }

  skinChange = (target) => {
    var that = this;
    this.setState({currentSkin:target.value}, function() {
      that.initSkin();
    });
  }

  setUser(user,callback) {
    this.setState({user:user}, () => {
      callback();
    });
  }

  render() {

    if (this.state.user === null) {
      return (
        <Start setUser={this.setUser.bind(this)} setupSockets={this.setupSockets.bind(this)} />
      );     
    }
    if (this.state.inGame === false) {
      var joinGame = <div className="right"><button onClick={this.onJoinGame(this.state.inGame)}>Join Game</button></div>
    }
    if (this.state.inGame === true && this.state.opponentName === null) {
      var waitingForGame = <div className="status">Waiting for another player...</div>
    }
    if (this.state.opponentName !== null) {
      var opponent = <div className="status">Opponent: {this.state.opponentName}</div>
    }

    var _skin = this.currentSkin();
    if (_skin) {
      var SkinCssModule = <SkinCss skin={_skin} />
    } else {
      SkinCssModule = '';
    }

    if (this.state.backgroundLoopLoaded === true) {
      var text = this.state.backgroundLoopPlaying === true ? 'Pause background loop' : 'Play background loop'; 
      var playBackground = <div onClick={this.startStopBackground} className="playBackground">{text}</div>;
    } else {
      playBackground = '';
    }

    const playerStatus = '';
    if (this.state.userName !== null) {
      playerStatus = <div>Player: {this.state.userName}</div>;
    }

    return (
      <div>
        <div className="scene" style={{backgroundImage: 'url('+this.backgroundImage()+')'}}>

          <GameOutcome gameOutcome={this.state.gameOutcome} resetGame={this.resetGame} />

          {SkinCssModule}

          <div className="statusbar">
            {this.whoseTurn()}<div className="right">Online: {this.state.usersOnline}</div>
            {joinGame}
            {playerStatus}
            {opponent}
            {waitingForGame}
            <SkinSelector skinChange={this.skinChange} skins={this.state.skins} currentSkin={this.state.currentSkin} />
          </div>
          
          <div>
            <Grid id="player" ships={this.state.ships} socketId={this.state.socketId} />
            <Grid id="enemy" turn={this.state.turn} bomb={this.bomb} bombs={this.state.bombs} socketId={this.state.socketId} /> 
          </div>

          {playBackground}
        </div>

        <Chat messages={this.state.chatMessages} sendChatMessage={this.sendChatMessage} />
      </div>
    );

  }
}

export default App;
