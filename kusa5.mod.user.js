// ==UserScript==
// @name        kusa5.mod
// @namespace   net.ghippos.kusa5
// @include     http://www.nicovideo.jp/watch/*
// @version     28
// @grant       none
// @description ニコ動html5表示（改造版）
// ==/UserScript==

//----------------------------------------------------------

// オリジナル
// ==UserScript==
// @name        kusa5
// @namespace   net.buhoho.kusa5
// @include     http://www.nicovideo.jp/watch/*
// @version     1
// @grant       none
// @description ニコ動html5表示
// ==/UserScript==

(function () {
  loadConfig();
  
  const ASKURL = 'http://flapi.nicovideo.jp/api/getflv?v=';
  const THUMB = 'http://tn-skr3.smilevideo.jp/smile?i=';
  const WATCH = 'http://www.nicovideo.jp/watch/';
  const THREAD = 'http://flapi.nicovideo.jp/api/getthreadkey?thread=';
  const INFO = 'http://ext.nicovideo.jp/api/getthumbinfo/';
  const VITAAPI = 'http://api.ce.nicovideo.jp';
  const apidata = JSON.parse($('#watchAPIDataContainer').text());
  const launchID = apidata.videoDetail.v; // APIに与える識別子
  const isIframe = window != parent;
  const commentLines = 21;
  const smallVirtualLines = commentLines;
  const mediumVirtualLines = (commentLines / 3) * 2;
  const largeVirtualLines = commentLines / 3;
  const smallMsgSize = localStorage.Kusa5_baseFontSize;
  const mediumMsgSize = (localStorage.Kusa5_baseFontSize / 3) * 2;
  const largeMsgSize = localStorage.Kusa5_baseFontSize / 3;
  
  var isPremium = false;
  var allocatedLine = [];
  var allocatedUeLine = [];
  var allocatedShitaLine = [];

  var updateallocatedLine = (() => {
    if (localStorage.Kusa5_debug) {
      var normalizeNum = (n => {
        return UTIL.paddingRight(n, ' ', 2);
      });
      var log = '';
      log += 'all\n';
      for (var i = 0; i < commentLines / 3; i++) {
        log += UTIL.paddingRight('.l' + normalizeNum(i + 1) + ': ' + allocatedLine[i], ' ', 9);
        log += UTIL.paddingRight('.l' + normalizeNum(i + 8) + ': ' + allocatedLine[i + 7], ' ', 9);
        log += UTIL.paddingRight('.l' + normalizeNum(i + 15) + ': ' + allocatedLine[i + 14], ' ', 9);
        log += '\n';
      }
      
      log += 'ue\n';
      for (var i = 0; i < commentLines / 3; i++) {
        log += UTIL.paddingRight('.l' + normalizeNum(i + 1) + ': ' + allocatedUeLine[i], ' ', 9);
        log += UTIL.paddingRight('.l' + normalizeNum(i + 8) + ': ' + allocatedUeLine[i + 7], ' ', 9);
        log += UTIL.paddingRight('.l' + normalizeNum(i + 15) + ': ' + allocatedUeLine[i + 14], ' ', 9);
        log += '\n';
      }
      
      log += 'shita\n';
      for (var i = 0; i < commentLines / 3; i++) {
        log += UTIL.paddingRight('.l' + normalizeNum(i + 1) + ': ' + allocatedShitaLine[i], ' ', 9);
        log += UTIL.paddingRight('.l' + normalizeNum(i + 8) + ': ' + allocatedShitaLine[i + 7], ' ', 9);
        log += UTIL.paddingRight('.l' + normalizeNum(i + 15) + ': ' + allocatedShitaLine[i + 14], ' ', 9);
        log += '\n';
      }
      $('#kusa5_lallocInfo').html(log);
    }
  });

  var lalloc = function (l) {
    allocatedLine[l] += 1;
    updateallocatedLine();
  };
  var lfree = function (l) {
    allocatedLine[l] -= 1;
    updateallocatedLine();
  };
  
  var ulalloc = function (l) {
    allocatedUeLine[l] += 1;
    updateallocatedLine();
  };
  var ulfree = function (l) {
    allocatedUeLine[l] -= 1;
    updateallocatedLine();
  };
  
  var slalloc = function (l) {
    allocatedShitaLine[l] += 1;
    updateallocatedLine();
  };
  var slfree = function (l) {
    allocatedShitaLine[l] -= 1;
    updateallocatedLine();
  };

  function generateLines(height, lines) {
    var result = '';
    for (var i = lines; i > 0; i--) {
      result += '#kusa5 .msg.l'+ i +' { top: calc((' + height + 'px / '+ lines +') * '+ (i - 1) +'); }\n';
    }
    return result;
  };

  addGlobalStyle(`
  * {
    min-width: auto !important;
  }

  #kusa5 {
    position: relative;
    /*background-color: hsla(180, 10%, 0%, 0.8);*/
    background-color: #000;
    overflow: hidden;
    margin: 0 auto;
  }

  #kusa5_debug {
    z-index: 9998;
    position: absolute;
    top: 0;
    left: 0;
    height: 1.666em;
    min-width: 180px !important;
    background-color: rgba(0, 0, 0, 0.8);
    color: white;
    overflow: hidden;
    transition: all 0.3s ease-out; 
    opacity: 0.3;
  }
  
  #kusa5_debug:hover {
    height: 100%;
    opacity: 1;
    transition: all 0.3s ease-out; 
  }

  #kusa5 video {
    display: block;
    background-color: #000;
    height: 100%;
    max-width: 100%; /* 画面外にはみ出ないように */
    margin: 0 auto;
  }
  
  #kusa5 #kusa5_playbutton {
    position: absolute;
    left: 50%;
    top: 50%;
    z-index: 9998;
    width: 100%;
    height: 100%;
    margin-left: -8rem;
    margin-top: -4rem;
    padding: 1rem 6rem;
    font-size: 4rem;
    background: rgba(0, 0, 0, 0.8);
    border: white 2px solid;
    color: white;
    width: auto;
    height: auto;
    cursor: pointer;
  }
  #kusa5 #kusa5_playbutton > div {
    cursor: pointer;
  }
  
  #wallImageContainer .wallImageCenteringArea .wallAlignmentArea.image2{
    z-index: 3;
    background-color: #272727;
  }
  #playerContainerWrapper {
    padding: 24px 0;
  }
  
  input, button {
    outline: 0;
  }
  input::-moz-focus-inner, button::-moz-focus-inner {
    border: 0;
  }
  
  /*
  コントロールパネル関係
  ******************************************************************************/
  .controle-panel {
    z-index: 9999;
    color: #fff;
    text-shadow: 2px 1px #000;
    position:absolute;
    bottom: 0;
    width: 100%;
    background: linear-gradient(to bottom, 
                                rgba(0,0,0,0.24) 0%,
                                rgba(0,0,0,0.63) 50%,
                                rgba(0,0,0,1) 100%);
    transition: max-height .2s;
    height: 5px !important;
    opacity: 0.666 !important;
    transition: all 0.3s ease-out 2.7s; 
    overflow: hidden;
    cursor: default;
  }
  #kusa5:hover .controle-panel {
    height: 46px !important; /* 表示 */
    opacity: 1 !important;
    transition: all 0.3s ease-out; 
  }
  .controle-panel .btn,
  input+label {
    padding: 0;
    color: #fff;
    font-size: 18px;
    border: none;
    background-color: transparent;
  }
  .controle-panel > .btn {
    width: 24px;
    float: left;
  }
  .controle-panel .r {float: right;}

  .controle-panel .progressBar {
    cursor: pointer;
    position: relative;
    height: 14px;
    background-color: #606060;
    width: 100%;
  }
  .controle-panel .progressBar span {
    position: absolute;
    top: 0;
    left: 0;
    width: 0;
    height: 100%;
  }
  .controle-panel .progressBar.seek .mainbar {
    background: #0078E7;
  }
  .controle-panel .progressBar.seek .bufferbar {
    background: hsla(0, 100%, 100%, 0.33);
  }
  .volume-slider {
    position: relative;
    float: right;
    width: 100px;
    height: 24px;
    margin: 2px 4px;
  }

  #volume-bar {
    -webkit-appearance: none;
    background: #008ee0;
    border: 0;
    height: 5px;
    width: 0px;
    display: block;
    position: absolute;
    left: 0px;
    top:  10px;
  }

  .volume-slider input[type="range"] {
    -webkit-appearance: none;
    appearance: none;
    padding: 0;
    margin: 0;
    height: 5px;
    width: 100%;
    position: absolute;
    left: 0;
    top: 10px;
  }
  .volume-slider input[type="range"]:focus {
    outline: none;
  }
  .volume-slider input[type="range"]::-moz-range-thumb {
    -moz-appearance: none;
    appearance: none;
    border: none;
    background: #0078E7;
    opacity: 1;
    width: 8px;
    height: 16px;
    border-radius: 0;
    cursor: pointer;
    box-sizing: border-box;
  }
  .volume-slider input[type="range"]::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    background: #0078E7;
    opacity: 1;
    width: 8px;
    height: 16px;
    border-radius: 0;
    cursor: pointer;
    -webkit-box-sizing: border-box;
    box-sizing: border-box;
  }
  button.btn.volume {
    position:relative;
  }
  .controle-panel .playtime {
    line-height: 30px;
    margin: 0 6px;
  }

  input.btn {
    display: none;
  }
  input.btn+label {
    color: #999;
    display: inline-block;
    background-color: hsla(0. 0%, 0%, 0.3);
    text-align: center;
  }
  input.btn+label:hover,
  input.btn:checked+label {
    color: #fff;
    text-decoration-line: underline;
    transform: scale(.98);
  }
  input.btn+label span{
    font-size:0.5em;
  }
  div.ratepanel {
    display: inline-block;
    text-align: center;
  }


  /*
  コメント要素関連
  ******************************************************************************/
  #kusa5 .msg {
    z-index: 999;
    display: inline-block;
    word-break: keep-all;
    white-space: pre;
    font-family: "Arial", "sans-serif"; /* 確か元のFlashプレーヤーはArial指定になっていたはず　要するにブラウザ任せ */
    color: white;
    padding: 0 .5em;
    position: absolute;
    transition-duration: 8s;
    transition-timing-function: linear;
    transition-property: transform;
    text-align: center;
    text-shadow: 1px 2px 0px #000;
    top: 0;
  } 
  
  #kusa5 .ue,
  #kusa5 .shita
  {
    left: 50% !important;
  }

  /* 非表示状態 */
  #kusa5.comment-hidden .msg { opacity: 0;}
  button.comment-hidden {
    opacity: 1;
  }
  #kusa5.comment-hidden button.comment-hidden {
    opacity: .3;
  }

  /*
  フルスクリーン関連
  ******************************************************************************/
  /* 何故か一つづつfont-size指定しないと効かない */
  #kusa5:-moz-full-screen .msg {font-size: 4em; }
  #kusa5:-webkit-full-screen .msg {font-size: 4em; } 
  #kusa5:-webkit-full-screen {
    width: 100%;
    height: 100%;
  }
  /*
  レスポンシブ
  ******************************************************************************/
  #kusa5 {
    width: 640px !important;
    height: 360px !important;
  }
  #kusa5 .msg {
    font-size: calc(360px / `+ mediumMsgSize +`);
    height: calc(360px / `+ mediumVirtualLines +`);
    line-height: ` + (360 / mediumVirtualLines) + `px;
  }
  #kusa5 .msg.small {
    font-size: calc(360px / `+ smallMsgSize +`);
    height: calc(360px / `+ smallVirtualLines +`);
    line-height: ` + (360 / smallVirtualLines) + `px;
  }
  #kusa5 .msg.big {
    font-size: calc(360px / `+ largeMsgSize +`);
    height: calc(360px / `+ largeVirtualLines +`);
    line-height: ` + (360 / largeVirtualLines) + `px;
  }
  ` + generateLines(360, commentLines) + `

  @media screen and (min-width: 820px) {
    #kusa5 {
      width: 800px !important;
      height: 450px !important;
    }
    #kusa5 .msg {
      font-size: calc(450px / `+ mediumMsgSize +`);
      height: calc(450px / `+ mediumVirtualLines +`);
      line-height: ` + (450 / mediumVirtualLines) + `px;
    }
    #kusa5 .msg.small {
      font-size: calc(450px / `+ smallMsgSize +`);
      height: calc(450px / `+ smallVirtualLines +`);
      line-height: ` + (450 / smallVirtualLines) + `px;
    }
    #kusa5 .msg.big {
      font-size: calc(450px / `+ largeMsgSize +`);
      height: calc(450px / `+ largeVirtualLines +`);
      line-height: ` + (450 / largeVirtualLines) + `px;
    }
    ` + generateLines(450, commentLines) + `
  }

  @media screen and (min-width: 980px) {
    #kusa5 {
      width: 960px !important;
      height: 540px !important;
    }
    #kusa5 .msg {
      font-size: calc(540px / `+ mediumMsgSize +`);
      height: calc(540px / `+ mediumVirtualLines +`);
      line-height: ` + (540 / mediumVirtualLines) + `px;
    }
    #kusa5 .msg.small {
      font-size: calc(540px / `+ smallMsgSize +`);
      height: calc(540px / `+ smallVirtualLines +`);
      line-height: ` + (540 / smallVirtualLines) + `px;
    }
    #kusa5 .msg.big {
      font-size: calc(540px / `+ largeMsgSize +`);
      height: calc(540px / `+ largeVirtualLines +`);
      line-height: ` + (540 / largeVirtualLines) + `px;
    }
    ` + generateLines(540, commentLines) + `
  }

  @media screen and (min-width: 1300px) {
    #kusa5 {
      width: 1280px !important;
      height: 720px !important;
    }
    #kusa5 .msg {
      font-size: calc(720px / `+ mediumMsgSize +`);
      height: calc(720px / `+ mediumVirtualLines +`);
      line-height: ` + (720 / mediumVirtualLines) + `px;
    }
    #kusa5 .msg.small {
      font-size: calc(720px / `+ smallMsgSize +`);
      height: calc(720px / `+ smallVirtualLines +`);
      line-height: ` + (720 / smallVirtualLines) + `px;
    }
    #kusa5 .msg.big {
      font-size: calc(720px / `+ largeMsgSize +`);
      height: calc(720px / `+ largeVirtualLines +`);
      line-height: ` + (720 / largeVirtualLines) + `px;
    }
    ` + generateLines(720, commentLines) + `
  }

  #kusa5 video {
    height: 100% !important;
    width: 100% !important;
    max-width: 100% !important;
    min-width: 100% !important;
    min-height: 100% !important;
    max-height: 1200px !important;
  }
  /*
  左上に縮小表示中
  ******************************************************************************/
  body.size_small.no_setting_panel.videoExplorer #kusa5 {
    height: 144px !important;
    width: 300px !important;
    margin: 0;
  }
  body.size_small.no_setting_panel.videoExplorer #kusa5 .msg{
    font-size: 12px;
  }
  
  /*
  設定オーバーレイ
  ******************************************************************************/
  #kusa5_config {
    position: absolute;
    z-index: 9999;
    color: white;
    background: rgba(0, 0, 0, 0.9);
    padding: 8px;
    width: calc(100% - 16px);
    height: calc(100% - 16px);
    top: 0;
  }
  
  #kusa5_config > .kusa5h1 {
    display: inline-block;
    position: relative;
    font-size: 3rem;
  }
  
  #kusa5_config > #kusa5_config_close {
    position: absolute;
    top: 8px;
    right: 8px;
    padding: 4px;
    color: black;
    background: white;
    border: 1px solid white;
    font-size: 1.3rem;
    font-family: monospace;
    font-weight: bold;
  }
  #kusa5_config > #kusa5_config_close:hover {
    background: #E0E0E0;
  }
  
  #kusa5_config > .kusa5box {
    display: inline-block;
    padding-bottom: 1rem;
    vertical-align: top;
    width: 48%;
    box-sizing: border-box;
  }
  
  #kusa5_config > .kusa5box > p {
    font-size: 1.3rem;
    margin: 0;
    padding-left: 8px;
    border-left: 8px solid white;
    border-bottom: 1px solid white;
  }
  
  #kusa5_config > .kusa5box > div > input[type="number"] {
    width: 4rem;
  }
  `);

  const $video = $(`<video type="video/mp4"'
        codecs="avc1.42E01E, mp4a.40.2"
        autoplay />`)
    .on('load', updateSlider)
    .on('pause', ev => localStorage.Kusa5_nicoRate = ev.target.playbackRate)
    .on('play',  ev => {
      // レート情報の記憶
      $('input[value="'+ localStorage.Kusa5_nicoRate +'"]').click();
      ev.target.playbackRate = localStorage.Kusa5_nicoRate;
      if (!isIframe)
        return;
      // バッファー再生用のプレーヤーは処理を重くしないためにrata1
      ev.target.playbackRate = 1;
      $(ev.target).off().prop('muted', true);
    });

  $video.videoToggle = function() {
    var playPauseButton = document.getElementsByClassName('btn toggle play')[0];
    var v = $video[0];  
    if(v.paused === true) {
      v.play();
      playPauseButton.innerHTML = '<i class="fa fa-play"></i>';
      $('#kusa5_playbutton').remove();
    }else {
      v.pause();
      playPauseButton.innerHTML = '<i class="fa fa-pause"></i>';
    }
  };

  $video.click($video.videoToggle);

  function addGlobalStyle(css) {
    var styleSeet = $('<style type="text/css">');
    styleSeet.text(css);
    $('head').append(styleSeet);
  }

  const FullScreen = {};
  FullScreen.isOpen = () =>
    document.mozFullScreen || document.webkitIsFullScreen ||
    (document.fullScreenElement && document.fullScreenElement !== null);
  FullScreen.req = (e) =>
    !!e.mozRequestFullScreen && e.mozRequestFullScreen() ||
    !!e.requestFullScreen && e.requestFullScreen() ||
    !!e.webkitRequestFullScreen && e.webkitRequestFullScreen();
  FullScreen.cancel = () =>
    !!document.mozCancelFullScreen && document.mozCancelFullScreen() ||
    !!document.cancelFullScreen && document.cancelFullScreen() ||
    !!document.webkitCancelFullScreen && document.webkitCancelFullScreen();
  FullScreen.toggle = () =>
    FullScreen.isOpen() ?
      FullScreen.cancel() :
      FullScreen.req($('#kusa5')[0]);

  function ngfilter(ch) {
    if (ch.t < 100) // 1秒以内。いわゆる0秒コメ
      return false;
    // NGワード
    return _.reduce([
        /[韓荒\[\]]/,
        /(くない|くせえ|アンチ|びみょ|チョン)/,
        /(イライラ|いらいら)/,
        /(キモ|きも|パク|ぱく|エミュ|ウザ|うざ)/,
        /(うぜ|ウゼ)[えぇエェ]/,
        /(推奨|注意|NG|ＮＧ|自演)/,
        /(朝鮮|創価|在日)/,
        /(イラ|いら)[イいつ]?/,
        /(嫌|いや|イヤ)なら/,
        /(ゆとり|信者|名人様|赤字|水色|餓鬼)/,
        /(萎え|挙手)/,
        /(つま|ツマ)[ラら]?[なねんナネン]/,
        /(eco|ｅｃｏ|エコノミ|画質|時報|3DS|倍速)/,
        /^[ノﾉ]$/,
        /^[\/／@＠※←↑↓]/,
      ], (cary, re) => cary && !ch.c.match(re), true);
  }

  function xml2chats(xml) {
    return _.chain($(xml).find('chat'))
      .map(ch => 
        ({ t: $(ch).attr('vpos') -0, //cast
          c: $(ch).text(),
          m: $(ch).attr('mail') || '' })) // コマンド
      .filter(ngfilter)
      .sortBy(c => c.t);
  }

  function loadMsg(info) {
    return $.ajax({
      type: 'GET',
      url: THREAD + info.thread_id,
      dataType: 'text',
      crossDomain: true,
      cache: false,
      xhrFields: {'withCredentials': true},
    }).then(threadinfo => {
      var threadkey = '';
      var force184 = '';
      _.each(threadinfo.split('&'), info => {
        if(info.includes('threadkey')) {
          threadkey = info.split('=')[1];
        } else if(info.includes('force_184')) {
          force184 = info.split('=')[1];
        }
      });
      
      var data = '';
      if(threadkey !== '' && force184 !== ''){
        data = `<packet><thread thread="${info.thread_id}"
          version="20061206" res_from="-1000" scores="1" user_id="${info.user_id}"
          threadkey="${threadkey}" force_184="${force184}" />
          </packet>`;
      } else if(force184 !== ''){
        data = `<packet><thread thread="${info.thread_id}"
          version="20061206" res_from="-1000" scores="1" user_id="${info.user_id}"
          force_184="${force184}" />
          </packet>`;
      } else {
        data = `<packet><thread thread="${info.thread_id}"
          version="20061206" res_from="-1000" scores="1" />
          </packet>`;
      }

      var updateInterval = 1000 / loadValue('Kusa5_playerFPS');
      
      $.ajax({
        type: 'POST',
        url: info.ms,
        // サーバーによってCORSで弾かれたりバッドリクエスト判定されたり
        // するので application/xmlでもなくtext/xmlでもなく
        // この値に落ち着いた
        contentType: "text/plain",
        dataType: 'xml',
        data: data,
        crossDomain: true,
        cache: false,
      }).then(xml2chats,
        data => console.log('メッセージロード失敗', data)
      ).done(chats => {
        // 時間イベントの発火で、対象メッセージがあれば流す
        var lastT = 0;
        // 次の動画への繊維などで複数回登録させるのでoff()
        $video.off('timeupdate').on('timeupdate', _.throttle(ev => {
          // chat.vpos is 1/100 sec.
          var v = ev.target;
          var t = Math.round(v.currentTime * 100);
          chats.filter(ch => lastT < ch.t && ch.t < t)
            .forEach(_.throttle(marqueeMsg, 250));
          lastT = t;//更新

          // ついでに動画の進捗バーを更新
          var w = 100 * v.currentTime / v.duration; //in %
          $('.progressBar.seek .mainbar').css('width', w+'%');
          $('.controle-panel .current')
            .text(UTIL.sec2HHMMSS(v.currentTime));
          $('.controle-panel .duration')
            .text(UTIL.sec2HHMMSS(v.duration));
          
          if (v.buffered.length != 0) {
            var bufTime = v.buffered.end(v.buffered.length - 1);
            var bw = 100 * bufTime / v.duration;
            $('.progressBar.seek .bufferbar').css('width', bw + '%');
          }
          
        }, updateInterval));
      })
    });
  }

  /** 動画URLなどの情報を取得してPromiseを返す。
   * キャリーされる値はクエリストリングをオブジェクトにした奴
   */
  function loadApiInfo(id) {
    return $.ajax({
      'type': 'GET',
      'url': ASKURL + id,
      'crossDomain': true,
      'cache': false,
      'xhrFields': {'withCredentials': true} // Cookie認証が必要
    }).then(qs => _.reduce(qs.split('&'), (o, k_v)=>{
      var a = _.map(k_v.split('='), decodeURIComponent);
      o[a[0]] = a[1];
      return o; // クエリストリングをオブジェクトにした奴
    },{}));
  }

  const colortable = {
    white:   '#FFFFFF',
    red:     '#FF0000',
    pink:    '#FF8080',
    orange:  '#FFC000',
    yellow:  '#FFFF00',
    green:   '#00FF00',
    cyan:    '#00FFFF',
    blue:    '#0000FF',
    purple:  '#C000FF',
    black:   '#000000',
    white2:  '#CCCC99',
    niconicowhite: '#CCCC99',
    red2:    '#CC0033',
    truered: '#CC0033',
    pink2:   '#FF33CC',
    orange2: '#FF6600',
    passionorange: '#FF6600',
    yellow2: '#999900',
    madyellow: '#999900',
    green2:  '#00CC66',
    elementalgreen: '#00CC66',
    cyan2:   '#00CCCC',
    blue2:   '#3399FF',
    marineblue: '#3399FF',
    purple2: '#6633CC',
    nobleviolet: '#6633CC',
    black2:  '#666666',
  }

  const sizetable = {
    small: 'small',
    medium: 'medium',
    big: 'big',
  }

  const msgsizetable = {
    small: 1,
    medium: 2,
    big: 3,
  }

  const postable = {
    ue: 'ue',
    naka: 'naka',
    shita: 'shita',
  }

  function marqueeMsg(ch) {
    const baseW = $('#kusa5').width() + 10;
    //const hasMsg = $('#kusa5 .msg').size() > 0;
    
    var msgSize = msgsizetable.medium;
    var msgPos = postable.naka;
    var msgReturns = ch.c.split('\n').length;
    
    $m = $('<div class="msg"/>');
    $m.text(ch.c);
    $m.html($m.text().replace(/\n/, '<br>'));
    _.each(ch.m.split(' '), command => {
      if (command in colortable) {
        $m.css('color', colortable[command]);
      } else if (command[0] === '#') {
        $m.css('color', command);
      }
      if (command in sizetable) {
        msgSize = msgsizetable[command];
        $m.addClass(command);
      }
      if (command in postable) {
        msgPos = postable[command];
        $m.addClass(command);
      }
      if(command === 'invisible') {
        $m.hide();
      }
    });
    $video.after($m);
    
    if (msgPos === postable.naka) {
      // 流すコメントは右画面外にセット
      $m.css('right', `-${$m.width() + 10}px`);
    }
    
    function hasRightSpace(l) {
      // 一番右端にあるmsgの右端の位置
      var bigwidth = _.max(_.map($('#kusa5').find(l),
          // offsetLeftだと0が返る
          l => $(l).position().left + l.scrollWidth));
      var rigthSpace = baseW - bigwidth;
      // 比率係数は適当。文字が重なるようなら要調整
      // transition速度(つまりアニメーション再生時間)と関係
      return rigthSpace > $m.width() * 0.45;
    }
    
    var line = (() => {
      switch (msgPos) {
        case postable.ue:
          return (() => {
            var index = 0;
            var value = Math.max.apply(null, allocatedUeLine);
            for (var i = 0; i <= allocatedUeLine.length - msgSize * msgReturns; i++) {
              if (allocatedUeLine[i] < value) {
                value = allocatedUeLine[i];
                index = i;
              }
            }
            return index + 1;
          })();
        case postable.naka:
          return (() => {
            for (var i = 1; i <= 21 - msgSize * msgReturns; i++) {
              if (hasRightSpace('.l' + i)) {
                return i;
              }
            }
            var index = 0;
            var value = Math.max.apply(null, allocatedLine);
            for (var i = 0; i <= allocatedLine.length - msgSize * msgReturns; i++) {
              if (allocatedLine[i] < value) {
                value = allocatedLine[i];
                index = i;
              }
            }
            return index + 1;
          })();
        case postable.shita:
          return (() => {
            var index = 0;
            var value = Math.max.apply(null, allocatedShitaLine);
            if (value === 0) {
              return allocatedShitaLine.length - msgSize * msgReturns + 1;
            }
            for (var i = 0; i <= allocatedShitaLine.length - msgSize * msgReturns; i++) {
              if (allocatedShitaLine[i] <= value) {
                var check = (() => {
                  for (var j = i; j < i + msgSize * msgReturns; j++) {
                    if (allocatedShitaLine[j] > allocatedShitaLine[i]) {
                      i = j;
                      return false;
                    }
                  }
                  return true;
                });
                
                if (check()) {
                  value = allocatedShitaLine[i];
                  index = i;
                }
              }
            }
            return index + 1;
          })();
      }
    })();
    
    // alloc
    for (var i = line; i < line + msgSize * msgReturns; i++) {
      lalloc(i - 1);
      if (msgPos === postable.ue) {
        ulalloc(i - 1);
      }
      if (msgPos === postable.shita) {
        slalloc(i - 1);
      }
      $m.addClass('l' + i);
    }
    
    // free
    var free = (() => {
      for (var i = line; i < line + msgSize * msgReturns; i++) {
        lfree(i - 1);
        if (msgPos === postable.ue) {
          ulfree(i - 1);
        }
        if (msgPos === postable.shita) {
          slfree(i - 1);
        }
      }
    });
    
    if (msgPos === postable.naka) {
      //オーバーシュート
      $m.css('transform', `translate3d(-${baseW + $m.width()*2 + 10}px, 0, 0)`);
    } else {
      // 静止
      $m.css('transform', `translate3d(0, 0, 0)`)
        .css('padding', 0)
        .css('margin-left', `-${$m.width() / 2}px`);
      setTimeout(msg => {
        msg.remove();
        free();
      }, 5000, $m);
    }
    //アニメ停止で自動削除
    $m.on('transitionend', ev => {
      $(ev.target).remove();
      free();
    });
  }

  var UTIL = {};
  UTIL.sec2HHMMSS = function (sec) {
      var sec_num = parseInt(sec, 10); // don't forget the second param
      var hours = Math.floor(sec_num / 3600);
      var minutes = Math.floor((sec_num - (hours * 3600)) / 60);
      var seconds = sec_num - (hours * 3600) - (minutes * 60);

      if (hours   < 10) {hours   = "0"+hours;}
      if (minutes < 10) {minutes = "0"+minutes;}
      if (seconds < 10) {seconds = "0"+seconds;}
      return (hours > 0? hours+':' :'') + minutes+':'+seconds;
  };
  UTIL.paddingRight = function (value, char, n) {
    value += '';
    for (; value.length < n; value += char);
    return value;
  };

  function rateForm() {

    //var rd = [1, 1.2, 1.5, 2, 2.2, 2.5, 3]
    var rd = [1, 1.3463246851125779, 1.6678900230322302,
      1.9680012082762555, 2.249342814692259, 2.514125064795459,
      2.764189394992108, 3.001086195676507 ]
      .map(v=>
        `<input name="nicorate" type="radio" id="rd${v}"
          class="btn" value="${v}">
        <label for="rd${v}">${v.toFixed(1)}<span>x</span></label>`);
    return `<div class="ratepanel">${rd.join('')}</div>`;
  }

  const COMMENT = `
  <div class="comment">
    <input type="text" class="l" /><button class="btn l">投稿</button>
  </div>`;

  const CONTROLE_PANEL = `
  <div class="controle-panel">
    <div class="progressBar seek">
      <span class="bufferbar"/>
      <span class="mainbar"/>
    </div>
    <button class="btn rewind"><i class="fa fa-fast-backward"></i></button>
    <button class="btn toggle play"><i class="fa fa-play"></i></button>
    ${rateForm() }
    <button class="btn full r"><i class="fa fa-arrows-alt"></i></button>
    <button class="btn config r"><i class="fa fa-cog"></i></button>
    <button class="btn comment-hidden r"><i class="fa fa-comment"></i></button>
    <div class="volume-slider r">
      <input type="range" name="bar"  id="volume-slider" step="1" min="0" max="100" value="0" />
      <span id="volume-bar"></span>
    </div>
    <button class="btn mute r"><i class="fa fa-volume-up"></i></button>
    <button class="btn repeat r"><i class="fa fa-arrow-right"></i></button>
    <div class="playtime r">
      <span class="current"></span>
      /
      <span class="duration"></span>
    </div>
  </div>`;
  
  const CONFIG_OVERLAY = `
  <div id="kusa5_config">
    <button id="kusa5_config_close">✕</button>
    <p class="kusa5h1">Kusa5.mod config</p>
    <p>一部の設定はページリロードで反映されます</p>
    <div class="kusa5box">
      <p>全般</p>
      <div><input type="checkbox" name="Kusa5_fastInit"> Kusa5.modを高速に初期化する（ページ読み込み直後のCPU使用率大）</div>
      <div><input type="checkbox" name="Kusa5_hidePlaylist"> 再生リストを非表示にする</div>
    </div>
    <div class="kusa5box">
      <p>HTML5プレーヤー</p>
      <div><input type="checkbox" name="Kusa5_showPageTop"> ページ上部に表示　Flashプレーヤーには影響なし</div>
      <div>シークバーとか再生位置の更新フレームレート<br><input type="number" name="Kusa5_playerFPS"> fps</div>
      <div>コメントの相対フォントサイズ　値を大きくするとコメントが小さくなる<br><input type="number" name="Kusa5_baseFontSize"></div>
    </div>
    <div class="kusa5box">
      <p>プレミアム会員専用</p>
      <div><input type="checkbox" name="Kusa5_autoPlay"> 動画を自動再生する</div>
    </div>
    <div class="kusa5box">
      <p>？？？？</p>
      <div><input type="checkbox" name="Kusa5_debug"> デバッグモードを有効にする</div>
      <div><input type="checkbox" name="Kusa5_noLimit"> 人としての尊厳を捨てて全てを解き放つ</div>
    </div>
  </div>
  `;

  function ctrPanel() {
    var $panel = $(CONTROLE_PANEL);
    $panel.find('.btn.full').click(FullScreen.toggle);
    $panel.find('.btn.toggle').click($video.videoToggle);
    return $panel;
  }

  function configOverlay() {
    var $overlay = $(CONFIG_OVERLAY);
    $overlay.find('#kusa5_config_close').on('click', () => {
      $('#kusa5_config').find('input').each((i, e) => {
        if ($(e).attr('type') === 'checkbox') {
          localStorage.setItem($(e).attr('name'), $(e).prop('checked'));
        }
        if ($(e).attr('type') === 'number') {
          localStorage.setItem($(e).attr('name'), $(e).prop('value'));
        }
      });
      $('#kusa5_config').hide();
    });
    $overlay.hide();
    return $overlay;
  }

  function loadValue(v) {
      return JSON.parse(localStorage.getItem(v));
  };

  function loadConfig() {
    var tryLoadValue = ((v) => {
      var val = JSON.parse(localStorage.getItem(v));
      if (val === null || val == '') {
        return false;
      } else {
        return true;
      }
    });
    if (!tryLoadValue('Kusa5_nicoVolume')) { localStorage.Kusa5_nicoVolume = 50; }
    if (!tryLoadValue('Kusa5_nicoRate')) {localStorage.Kusa5_nicoRate = 1;}
    
    if (!tryLoadValue('Kusa5_fastInit')) {localStorage.Kusa5_fastInit = true;}
    if (!tryLoadValue('Kusa5_hidePlaylist')) {localStorage.Kusa5_hidePlaylist = false;}
    if (!tryLoadValue('Kusa5_showPageTop')) {localStorage.Kusa5_showPageTop = false;}
    if (!tryLoadValue('Kusa5_playerFPS')) {localStorage.Kusa5_playerFPS = 2;}
    if (!tryLoadValue('Kusa5_baseFontSize')) {localStorage.Kusa5_baseFontSize = 21;}
    if (!tryLoadValue('Kusa5_autoPlay')) {localStorage.Kusa5_autoPlay = false;}
    if (!tryLoadValue('Kusa5_debug')) {localStorage.Kusa5_debug = false;}
    if (!tryLoadValue('Kusa5_noLimit')) {localStorage.Kusa5_noLimit = false;}
  }
  
  function updateSlider() {
    var volume = localStorage.getItem('Kusa5_nicoVolume');
    var slider = $('#volume-slider')[0];
    var bar = $('#volume-bar')[0];
    const range = slider.clientWidth;
    const max = slider.max;
    slider.value = volume;
    bar.style.width = ((range / max) * volume) +'px';
    $video[0].volume = volume * 0.01;
  }

  //update Progress Bar control
  var updatebar = function(e) {
    var mainBar = $('.progressBar.seek .mainbar');
    var seekBar = $('.progressBar.seek');
    var buffBar = $('.progressBar.seek .bufferbar');
    var offset = e.pageX - seekBar.offset().left; //Click pos
    if (!(isPremium || loadValue('Kusa5_noLimit')) && (offset > buffBar.width())) {
      offset = buffBar.width();
    }
    var ratio = Math.min(1, Math.max(0, offset / seekBar.width()));
    //Update bar and video currenttime
    mainBar.css('width', (ratio * 100)+'%');
    $video[0].currentTime = $video[0].duration * ratio;
    return true;
  }

  function updateRepeat(oninit) {
    if(oninit) {
      var state = localStorage.getItem('repeat');
      if(state !== null)
        $video.get(0).loop = state;
    } else {
      $video.get(0).loop = !$video.get(0).loop;
      localStorage.repeat = $video.get(0).loop;
    }
    if($video.get(0).loop)
      $('button.repeat').html('<i class="fa fa-repeat"></i>');
    else
      $('button.repeat').html('<i class="fa fa-arrow-right"></i>');
  }

  // 対応外（ニコニコムービーメーカーとか）のURLを弾く
  function getMovieInfo() {
    var uri = location.href;
    var uriArray = uri.split('/');
    var movieId = "";
    if (uri.endsWith('/'))
      movieId = uriArray[uriArray.length - 2];
    else
      movieId = uriArray[uriArray.length - 1];
    
    // http://ext.nicovideo.jp/api/getthumbinfo/ がCORSで殺されるのクソすぎじゃないですか
    return $.ajax({
      type: 'GET',
      url: 'http://crossorigin.me/' + INFO + movieId, // crossorigin.meが遅い…　ghippos.netでCORS proxyを立てるまである
      crossDomain: true,
      cache: false,
      dataType: 'xml',
    });
  }
  
  /** main というかエントリーポイント */
  var initKusa5 = function () {
    for (var i = 0; i < commentLines; i++) {
      allocatedLine[i] = 0;
      allocatedUeLine[i] = 0;
      allocatedShitaLine[i] = 0;
    }
    updateallocatedLine();
    
    getMovieInfo().then(xml => {
      var pack = [];
      pack[0] = xml;
      $(xml).find('movie_type').each(function (type) {
        pack[1] = ($(this).text() === 'mp4');
      });
      $(xml).find('thumbnail_url').each(function (type) {
        pack[2] = $(this).text();
      });
      return pack;
    }).then(pack => {
      var isMP4 = pack[1];
      if (!isMP4) {
        $('.videoDetailExpand').append('<p style="color: #333;font-size: 185%;z-index: 2;line-height: 1.2;display: table-cell;vertical-align: middle;word-break: break-all;word-wrap: break-word;max-width: 672px;margin-right: 10px;">（kusa5.mod.user.js 非対応)</p>')
        return;
      } else {
        // プレミアム会員かどうか
        // 本当はVita APIを使うべきなんだけどCORSで弾かれるんだよな
        // まじでCORS死んでくれ頼む後生だから
        if ($('#siteHeaderNotificationPremium').is(':hidden')) {
          isPremium = true;
        }
        else {
          if (!loadValue('Kusa5_fastInit') && !loadValue('Kusa5_noLimit')) {
            // ニコニコ側のJSの反映が遅いときにうまく判定できないため
            var mo = new MutationObserver(function () {
              if ($('#siteHeaderNotificationPremium').is(':hidden')) {
                isPremium = true;
              }
            });
            var siteHeaderNotification = document.getElementById("siteHeaderNotification")
            var options = { childList: true, subtree: true };
            mo.observe(siteHeaderNotification, options);
          }
        }
        
        $('.notify_update_flash_player').hide();
        $('.playerContainer').hide();
        if (loadValue('Kusa5_hidePlaylist'))
          $('#playlist').hide();
        $('#playerContainerSlideArea').attr('id', 'kusa5');
        if (loadValue('Kusa5_showPageTop'))
          $('#playerContainerWrapper').insertBefore('.videoHeaderOuter'); // お好み
        if ((isPremium || loadValue('Kusa5_noLimit')) && !loadValue('Kusa5_autoPlay')) {
          $video.removeAttr('autoplay');
          $video.attr({ poster: pack[2] });
          var $playButton = $('<div id="kusa5_playbutton"><div><i class="fa fa-play"></i></div></div>');
          $playButton.on('click', () => {
            $video.get(0).play();
            $('#kusa5_playbutton').remove();
          });
          $('#kusa5').append($playButton);
          $video.get(0).load();
        }
        
        const kusa5 = $('#kusa5')
          .append($video)
          .append(ctrPanel())
          .after(configOverlay());
        
        $('#kusa5_config').find('input').each((i, e) => {
          if ($(e).attr('type') === 'checkbox') {
            $(e).prop('checked', loadValue($(e).attr('name')));
          }
          if ($(e).attr('type') === 'number') {
            $(e).prop('value', loadValue($(e).attr('name')));
          }
        });
        
        if (loadValue('Kusa5_debug')) {
          $('#kusa5').append('<div id="kusa5_debug" style="font-family: monospace;" />');
          $('#kusa5_debug').append('<p style="color:#64FF64;">// DEBUG:</p>');
          $('#kusa5_debug').append('<p style="position:absolute;top:0;right:4px;color:#64FF64;">&#x23ec;</p>');
          $('#kusa5_debug').append('<pre id="kusa5_lallocInfo" />');
        }
        
        updateRepeat(true);
        
        $('#kusa5 button.rewind').click(ev => $video.get(0).currentTime = 0);
        $('input[name=nicorate]').change(ev => {
          localStorage.Kusa5_nicoRate =
          $video.get(0).playbackRate = parseFloat($(ev.target).val());
        });
        $('input[value="' + localStorage.Kusa5_nicoRate + '"]').click();
        
        $('#kusa5 button.mute').on('click', ev => {
          if ($video.get(0).muted) {
            $video.get(0).muted = false;
            $('#kusa5 button.mute').html('<i class="fa fa-volume-up"></i>');
          } else {
            $video.get(0).muted = true;
            $('#kusa5 button.mute').html('<i class="fa fa-volume-off"></i>');
          }
        });
        
        $('#volume-slider').on('input', ev => {
          localStorage.setItem('Kusa5_nicoVolume', ev.target.value);
          updateSlider();
        });
        
        $('#kusa5 button.comment-hidden').click(ev => kusa5.toggleClass('comment-hidden'));
        $('#kusa5 button.repeat').click(() => updateRepeat(false));
        $('#kusa5 button.config').click(ev => $('#kusa5_config').show());
        
        var promise = loadApiInfo(launchID).then(info => {
          $video.attr('src', info.url);
          $video.get(0).dataset.smid = launchID;
          return info;
        });
        
        if (isIframe)
          return; // 以降はフォワードページのみの処理
        
        var timeDrag = false;  /* Drag status */
        $('.progressBar.seek').mousedown(function (e) {
          timeDrag = true;
          updatebar(e);
        });
        $('.progressBar').mouseup(function (e) {
          if (!timeDrag)
            return;
          timeDrag = false;
          updatebar(e.pageX);
        }).mousemove(e=> timeDrag && updatebar(e));
        
        // ボタン押された時の動作登録
        var keyTbl = [];
        keyTbl[32] = $video.videoToggle; //スペースキー
        kusa5.keyup(e => {
          if (!keyTbl[e.keyCode])
            return;
          keyTbl[e.keyCode]();
          e.preventDefault();
        });
        kusa5.keydown(e => {
          //ボタンの処理が登録されてたらブラウザの動作をうちけす
          if (keyTbl[e.keyCode])
            e.preventDefault();
        });
        
        //メッセージ取得、文字流しとかのループイベント登録
        promise.then(loadMsg);
      }
    });
  };
  
  // init
  $('body').append($('<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/font-awesome/4.5.0/css/font-awesome.min.css">'));
  if (loadValue('Kusa5_fastInit') !== false) {
    var timer = setInterval(() => {
      // jQueryとUnderscore.jsが読み込み終わってる必要がある
      // Nico.CommonNotificationHeaderにアクセスできる状態ならプレミアム会員かどうかのチェックも終わっている？
      if ($.isReady && _.VERSION !== '' && Nico.CommonNotificationHeader.userId !== '') {
        clearInterval(timer);
        initKusa5();
      }
    }, 1);
  } else {
    window.addEventListener('load', initKusa5, false);
  }
})();