// ==UserScript==
// @name        kusa5.mod
// @namespace   net.ghippos.kusa5
// @include     http://www.nicovideo.jp/watch/*
// @version     41
// @grant       none
// @description ニコ動html5表示（改造版）
// @license     MIT License
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

(() => {
  /*
  Class
  ******************************************************************************/
  class Config {
    static autoPlay() { return 'Kusa5_autoPlay'; }
    static baseFontSize() { return 'Kusa5_baseFontSize'; }
    static commentTransparency() { return 'Kusa5_commentTransparency'; }
    static debug() { return 'Kusa5_debug'; }
    static enhanceBrightness() { return 'Kusa5_enhanceBrightness'; }
    static enhanceContrast() { return 'Kusa5_enhanceContrast'; }
    static enhanceSatuate() { return 'Kusa5_enhanceSatuate'; }
    static fastInit() { return 'Kusa5_fastInit'; }
    static hidePlayList() { return 'Kusa5_hidePlaylist'; }
    static lastVersion() { return 'Kusa5_lastVersion'; }
    static monitorSizeFullScreen() { return 'Kusa5_monitorSizeFullScreen'; }
    static muted() { return 'Kusa5_muted'; }
    static ngKeyword() { return 'Kusa5_ngKeyword'; }
    static nicoRate() { return 'Kusa5_nicoRate'; }
    static nicoVolume() { return 'Kusa5_nicoVolume'; }
    static noLimit() { return 'Kusa5_noLimit'; }
    static playerFPS() { return 'Kusa5_playerFPS'; }
    static repeat() { return 'Kusa5_repeat'; }
    static showPageTop() { return 'Kusa5_showPageTop'; }
    static suppress0secComment() { return 'Kusa5_suppress0secComment'; }
    static throttleComment() { return 'Kusa5_throttleComment'; }
    static useEnhanceQuality() { return 'Kusa5_useEnhanceQuality'; }
    static useUserPlayerSize() { return 'Kusa5_useUserPlayerSize'; }
    static useUserPlayerWidth() { return 'Kusa5_useUserPlayerWidth'; }
    static useUserPlayerHeight() { return 'Kusa5_useUserPlayerHeight'; }
    
    static loadValue(item) {
      if(typeof item === 'function') {
        item = item();
      }
      return JSON.parse(localStorage.getItem(item));
    }

    static isValueExist(item, isAllowWhiteSpace) {
      isAllowWhiteSpace = !!isAllowWhiteSpace;
      var value = Config.loadValue(item);
      return !(value === null || (!isAllowWhiteSpace && value === ''));
    }
    
    static setValue(item, value, stringify) {
      stringify = !!stringify;
      if(typeof item === 'function') {
        item = item();
      }
      if(stringify) {
        localStorage.setItem(item, JSON.stringify(value));
      } else {
        localStorage.setItem(item, value);
      }
    }
    
    // 冷静に考えてこれ頭悪くないすか
    static initialize() {
      if(!Config.isValueExist(Config.autoPlay)) { Config.setValue(Config.autoPlay, false); }
      if(!Config.isValueExist(Config.baseFontSize)) { Config.setValue(Config.baseFontSize, 21); }
      if(!Config.isValueExist(Config.commentTransparency)) { Config.setValue(Config.commentTransparency, 0.8); }
      if(!Config.isValueExist(Config.debug)) { Config.setValue(Config.debug, false); }
      if(!Config.isValueExist(Config.enhanceBrightness)) { Config.setValue(Config.enhanceBrightness, 100); }
      if(!Config.isValueExist(Config.enhanceContrast)) { Config.setValue(Config.enhanceContrast, 100); }
      if(!Config.isValueExist(Config.enhanceSatuate)) { Config.setValue(Config.enhanceSatuate, 100); }
      if(!Config.isValueExist(Config.fastInit)) { Config.setValue(Config.fastInit, true); }
      if(!Config.isValueExist(Config.hidePlayList)) { Config.setValue(Config.hidePlaylist, false); }
      if(!Config.isValueExist(Config.lastVersion)) { Config.setValue(Config.lastVersion, GM_info.script.version); }
      if(!Config.isValueExist(Config.monitorSizeFullScreen)) { Config.setValue(Config.monitorSizeFullScreen, true); }
      if(!Config.isValueExist(Config.muted)) { Config.setValue(Config.muted, false); }
      if(!Config.isValueExist(Config.ngKeyword, true)) { Config.setValue(Config.ngKeyword, DEFAULT_NG(), true); }
      if(!Config.isValueExist(Config.nicoRate)) { Config.setValue(Config.nicoRate, 1); }
      if(!Config.isValueExist(Config.nicoVolume)) { Config.setValue(Config.nicoVolume, 50); }
      if(!Config.isValueExist(Config.noLimit)) { Config.setValue(Config.noLimit, false); }
      if(!Config.isValueExist(Config.playerFPS)) { Config.setValue(Config.playerFPS, 2); }
      if(!Config.isValueExist(Config.repeat)) { Config.setValue(Config.repeat, false); }
      if(!Config.isValueExist(Config.showPageTop)) { Config.setValue(Config.showPageTop, false); }
      if(!Config.isValueExist(Config.suppress0secComment)) { Config.setValue(Config.suppress0secComment, true); }
      if(!Config.isValueExist(Config.throttleComment)) { Config.setValue(Config.throttleComment, 100); }
      if(!Config.isValueExist(Config.useEnhanceQuality)) { Config.setValue(Config.useEnhanceQuality, false); }
      if(!Config.isValueExist(Config.useUserPlayerHeight)) { Config.setValue(Config.useUserPlayerHeight, 480); }
      if(!Config.isValueExist(Config.useUserPlayerSize)) { Config.setValue(Config.useUserPlayerSize, false); }
      if(!Config.isValueExist(Config.useUserPlayerWidth)) { Config.setValue(Config.useUserPlayerWidth, 854); }

    }
  }
  Config.initialize();
  
  class LineManager {
    constructor(lines) {
      this.allocatedLine = [];
      for (var i = 0; i < lines; i++){
        this.allocatedLine[i] = 0;
      }
    }
    
    count() {
      return this.allocatedLine.length;
    }
    
    getLine(index) {
      if (index === undefined) {
        return this.allocatedLine;
      } else {
        return this.allocatedLine[index];
      }
    }
    
    alloc(index) {
      if(index < this.allocatedLine.length) {
        this.allocatedLine[index]++;
        updateAllocatedLine();
      }
    }
    
    free(index) {
      if(index < this.allocatedLine.length) {
        this.allocatedLine[index]--;
        updateAllocatedLine();
      }
    }
  }
  
  var siteHeaderHeight = 0;
  class FullScreen {
    static isOpen() {
      document.mozFullScreen || document.webkitIsFullScreen ||
      (document.fullScreenElement && document.fullScreenElement !== null);
    }
    
    static req(e) {
      !!e.mozRequestFullScreen && e.mozRequestFullScreen() ||
      !!e.requestFullScreen && e.requestFullScreen() ||
      !!e.webkitRequestFullScreen && e.webkitRequestFullScreen();
    }
    
    static cancel() {
      !!document.mozCancelFullScreen && document.mozCancelFullScreen() ||
      !!document.cancelFullScreen && document.cancelFullScreen() ||
      !!document.webkitCancelFullScreen && document.webkitCancelFullScreen();
    }
    
    static toggle() {
      if((apidata.viewerInfo.isPremium || Config.loadValue(Config.noLimit)) && Config.loadValue(Config.monitorSizeFullScreen)) {
        FullScreen.monitorSize();
      } else {
        FullScreen.browserSize();
      }
    }
    
    static monitorSize() {
      // なんかisOpen()だけ動かなくなった
      // if(FullScreen.isOpen()) {
      if(document.mozFullScreen || document.webkitIsFullScreen ||
        (document.fullScreenElement && document.fullScreenElement !== null)) {
        FullScreen.cancel();
        
        if(this.controlPanelTimeout !== null || this.controlPanelTimeout !== undefined) {
          clearTimeout(this.controlPanelTimeout);
        }
        $('#kusa5 .control-panel.control-panel-show').removeClass('control-panel-show');
        this.mousePosition = null;
        this.controlPanelTimeout = null;
      } else {
        FullScreen.req($('#kusa5')[0]);
        
        $video.mousemove(e => {
          if(this.mousePosition === null || this.mousePosition === undefined) {
            this.mousePosition = e;
            return;
          }
          
          if(e.pageX !== this.mousePosition.pageX || e.pageY !== this.mousePosition.pageY) {
            if(this.controlPanelTimeout !== null || this.controlPanelTimeout !== undefined) {
              clearTimeout(this.controlPanelTimeout);
            }
            this.mousePosition = e;
            $('#kusa5 .control-panel').addClass('control-panel-show');
            this.controlPanelTimeout = setTimeout(() => {
              $('#kusa5 .control-panel.control-panel-show').removeClass('control-panel-show');
            }, 5000);
          }
        });
      }
    }
    
    static browserSize() {
      if($('#siteHeader').is(':visible')) {
          $('#siteHeader').hide();
          $('.btn_feedback').hide();
          $('.videoHeaderOuter').hide();
          $('#playlist').hide();
          $('#kusa5').addClass('browser-full-screen');
          $('body').addClass('browser-full-screen');
      } else {
          $('#siteHeader').show();
          $('.btn_feedback').show();
          $('.videoHeaderOuter').show();
          if(Config.loadValue(Config.hidePlayList) === true) {
            $('#playlist').hide();
          }
          $('#kusa5').removeClass('browser-full-screen');
          $('body').removeClass('browser-full-screen');
      }
    }
  }

  class Util {
    static sec2HHMMSS(sec) {
      var sec_num = parseInt(sec, 10); // don't forget the second param
      var hours = Math.floor(sec_num / 3600);
      var minutes = Math.floor((sec_num - (hours * 3600)) / 60);
      var seconds = sec_num - (hours * 3600) - (minutes * 60);

      if (hours   < 10) {hours   = "0"+hours;}
      if (minutes < 10) {minutes = "0"+minutes;}
      if (seconds < 10) {seconds = "0"+seconds;}
      return (hours > 0? hours+':' :'') + minutes+':'+seconds;
    }
    
    static paddingRight(value, char, n) {
      value += '';
      for (; value.length < n; value += char);
      return value;
    }
  }

  /*
  Update
  ******************************************************************************/
  if(Config.loadValue(Config.lastVersion) !== GM_info.script.version) {
    //TODO: どうしても互換性が無くなってしまったときのアップデート処理
  }
  
  /*
  Value
  ******************************************************************************/
  const ASKURL = 'http://flapi.nicovideo.jp/api/getflv?v=';
  const THREAD = 'http://flapi.nicovideo.jp/api/getthreadkey?thread=';
  const apidata = JSON.parse($('#watchAPIDataContainer').text());
  const launchID = apidata.videoDetail.v; // APIに与える識別子
  const commentLines = 21;
  const smallVirtualLines = commentLines;
  const mediumVirtualLines = (commentLines / 3) * 2;
  const largeVirtualLines = commentLines / 3;
  const smallMsgSize = Config.loadValue(Config.baseFontSize);
  const mediumMsgSize = (smallMsgSize / 3) * 2;
  const largeMsgSize = smallMsgSize / 3;

  var allLine = new LineManager(commentLines);
  var ueLine = new LineManager(commentLines);
  var shitaLine = new LineManager(commentLines);
  var ngArray = [];

  /*
  Debug
  ******************************************************************************/
  function updateAllocatedLine() {
    if (Config.loadValue(Config.debug)) {
      var normalizeNum = (n => {
        return Util.paddingRight(n, ' ', 2);
      });
      var log = '';
      log += 'all\n';
      for (var i = 0; i < allLine.count() / 3; i++) {
        log += Util.paddingRight('.l' + normalizeNum(i + 1) + ': ' + allLine.getLine(i), ' ', 9);
        log += Util.paddingRight('.l' + normalizeNum(i + 8) + ': ' + allLine.getLine(i + 7), ' ', 9);
        log += Util.paddingRight('.l' + normalizeNum(i + 15) + ': ' + allLine.getLine(i + 14), ' ', 9);
        log += '\n';
      }
      log += 'ue\n';
      for (var i = 0; i < ueLine.count() / 3; i++) {
        log += Util.paddingRight('.l' + normalizeNum(i + 1) + ': ' + ueLine.getLine(i), ' ', 9);
        log += Util.paddingRight('.l' + normalizeNum(i + 8) + ': ' + ueLine.getLine(i + 7), ' ', 9);
        log += Util.paddingRight('.l' + normalizeNum(i + 15) + ': ' + ueLine.getLine(i + 14), ' ', 9);
        log += '\n';
      }
      log += 'shita\n';
      for (var i = 0; i < shitaLine.count() / 3; i++) {
        log += Util.paddingRight('.l' + normalizeNum(i + 1) + ': ' + shitaLine.getLine(i), ' ', 9);
        log += Util.paddingRight('.l' + normalizeNum(i + 8) + ': ' + shitaLine.getLine(i + 7), ' ', 9);
        log += Util.paddingRight('.l' + normalizeNum(i + 15) + ': ' + shitaLine.getLine(i + 14), ' ', 9);
        log += '\n';
      }
      $('#kusa5_lallocInfo').html(log);
    }
  }

  /*
  Player
  ******************************************************************************/
  const $video = $(`<video type="video/mp4"'
        codecs="avc1.42E01E, mp4a.40.2"
        autoplay muted preload="auto" />`)
    .on('pause', ev => Config.setValue(Config.nicoRate, ev.target.playbackRate))
    .on('play',  ev => {
      // レート情報の記憶
      var nicoRate = Config.loadValue(Config.nicoRate);
      $('input[value="'+ nicoRate +'"]').click();
      ev.target.playbackRate = nicoRate;
      updateSlider();
    });
  $video.videoToggle = function() {
    var playPauseButton = document.getElementsByClassName('btn toggle play')[0];
    var v = $video[0];  
    if(v.paused === true) {
      v.play();
      playPauseButton.innerHTML = '<i class="fa fa-pause"></i>';
      $('#kusa5_playbutton').remove();
    } else {
      v.pause();
      playPauseButton.innerHTML = '<i class="fa fa-play"></i>';
    }
  };
  $video.click($video.videoToggle);

  function generateLines(height, lines, force) {
    var result = '';
    for (var i = lines; i > 0; i--) {
      result += '#kusa5 .msg.l'+ i +' { top: calc((' + height + 'px / '+ lines +') * '+ (i - 1) +')';
      if(force === true){
        result += ' !important; }\n';
      } else {
        result += '; }\n';
      }
    }
    return result;
  }

  /*
  Niconico API
  ******************************************************************************/
  function xml2chats(xml) {
    return _.chain($(xml).find('chat'))
      .map(ch => 
        ({ t: $(ch).attr('vpos') -0, //cast
          c: $(ch).text(),
          m: $(ch).attr('mail') || '' })) // コマンド
      .filter(ngfilter)
      .sortBy(c => c.t);
  }

  var lastCommentTime = 0;
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

      var updateInterval = 1000 / Config.loadValue(Config.playerFPS);
      
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
        
        // 次の動画への繊維などで複数回登録させるのでoff()
        $video.off('timeupdate').on('timeupdate', _.throttle(ev => {
          // chat.vpos is 1/100 sec.
          var v = ev.target;
          var t = Math.round(v.currentTime * 100);
          chats.filter(ch => lastCommentTime < ch.t && ch.t < t)
            .forEach(_.throttle(marqueeMsg, Config.loadValue(Config.throttleComment)));
          lastCommentTime = t;//更新
          // ついでに動画の進捗バーを更新
          var w = 100 * v.currentTime / v.duration; //in %
          $('.progressBar.seek .mainbar').css('width', w+'%');
          $('.control-panel .current')
            .text(Util.sec2HHMMSS(v.currentTime));
          $('.control-panel .duration')
            .text(Util.sec2HHMMSS(v.duration));
          
          if (v.buffered.length !== 0) {
            var bufTime = v.buffered.end(v.buffered.length - 1);
            var bw = 100 * bufTime / v.duration;
            $('.progressBar.seek .bufferbar').css('width', bw + '%');
          }
          
          // filter　仮実装　あとで移動させる
          var styleAttr = '';
          if(Config.loadValue(Config.useEnhanceQuality)) {
            var brightness = Config.loadValue(Config.enhanceBrightness);
            if(brightness != 100) {
              styleAttr += `filter: brightness(${brightness}%);`;
              styleAttr += `-webkit-filter: brightness(${brightness}%);`;
            }
            var contrast = Config.loadValue(Config.enhanceContrast);
            if(contrast != 100) {
              styleAttr += `filter: contrast(${contrast}%);`;
              styleAttr += `-webkit-filter: contrast(${contrast}%);`;
            }
            var satuate = Config.loadValue(Config.enhanceSatuate);
            if(satuate != 100) {
              styleAttr += `filter: satuate(${satuate}%);`;
              styleAttr += `-webkit-filter: satuate(${satuate}%);`;
            }
            $video.attr('style', styleAttr);
          } else {
            $video.removeAttr('style');
          }
        }, updateInterval));
      });
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

  /*
  Comment
  ******************************************************************************/
  const colorTable = {
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
  };

  const sizeTable = {
    small: 'small',
    medium: 'medium',
    big: 'big',
  };

  const msgsizeTable = {
    small: 1,
    medium: 2,
    big: 3,
  };

  const posTable = {
    ue: 'ue',
    naka: 'naka',
    shita: 'shita',
  };

  function marqueeMsg(ch) {
    setTimeout(() => {
      const baseW = $('#kusa5').width() + 10;
      //const hasMsg = $('#kusa5 .msg').size() > 0;
      
      var msgSize = msgsizeTable.medium;
      var msgPos = posTable.naka;
      var msgReturns = ch.c.split('\n').length;
      
      $m = $('<div class="msg"/>');
      $m.text(ch.c);
      $m.html($m.text().replace(/\n/, '<br>'));
      _.each(ch.m.split(' '), command => {
        if (command in colorTable) {
          $m.css('color', colorTable[command]);
        } else if (command[0] === '#') {
          $m.css('color', command);
        }
        if (command in sizeTable) {
          msgSize = msgsizeTable[command];
          $m.addClass(command);
        }
        if (command in posTable) {
          msgPos = posTable[command];
          $m.addClass(command);
        }
        if(command === 'invisible') {
          $m.hide();
        }
      });
      $video.after($m);
      
      if (msgPos === posTable.naka) {
        // 流すコメントは右画面外にセット
        $m.css('right', `-${$m.width() + 10}px`);
      }
      
      function hasRightSpace(l) {
        // 一番右端にあるmsgの右端の位置
        var bigwidth = _.max(_.map($('#kusa5').find(l),
            // offsetLeftだと0が返る
            l => $(l).position().left + l.scrollWidth));
        var rightSpace = baseW - bigwidth;
        // 比率係数は適当。文字が重なるようなら要調整
        // transition速度(つまりアニメーション再生時間)と関係
        return rightSpace > $m.width() * 0.75;
      }
      
      var line = (() => {
        switch (msgPos) {
          case posTable.ue:
            return (() => {
              var index = 0;
              var value = Math.max.apply(null, ueLine.getLine());
              for (var i = 0; i <= ueLine.count() - msgSize * msgReturns; i++) {
                if (ueLine.getLine(i) < value) {
                  value = ueLine.getLine(i);
                  index = i;
                }
              }
              return index + 1;
            })();
          case posTable.naka:
            return (() => {
              for (var i = 1; i <= allLine.count() - msgSize * msgReturns; i++) {
                if (hasRightSpace('.l' + i)) {
                  return i;
                }
              }
              var index = 0;
              var value = Math.max.apply(null, allLine.getLine());
              for (var i = 0; i <= allLine.count() - msgSize * msgReturns; i++) {
                if (allLine.getLine(i) < value) {
                  value = allLine.getLine(i);
                  index = i;
                }
              }
              return index + 1;
            })();
          case posTable.shita:
            return (() => {
              var index = 0;
              var value = Math.max.apply(null, shitaLine.getLine());
              if (value === 0) {
                return shitaLine.count() - msgSize * msgReturns + 1;
              }
              for (var i = 0; i <= shitaLine.count() - msgSize * msgReturns; i++) {
                if (shitaLine.getLine(i) <= value) {
                  var check = (() => {
                    for (var j = i; j < i + msgSize * msgReturns; j++) {
                      if (shitaLine.getLine(j) > shitaLine.getLine(i)) {
                        i = j;
                        return false;
                      }
                    }
                    return true;
                  });
                  
                  if (check()) {
                    value = shitaLine.getLine(i);
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
        allLine.alloc(i - 1);
        if (msgPos === posTable.ue) {
          ueLine.alloc(i - 1);
        }
        if (msgPos === posTable.shita) {
          shitaLine.alloc(i - 1);
        }
        $m.addClass('l' + i);
      }
      
      // free
      var free = (() => {
        for (var i = line; i < line + msgSize * msgReturns; i++) {
          allLine.free(i - 1);
          if (msgPos === posTable.ue) {
            ueLine.free(i - 1);
          }
          if (msgPos === posTable.shita) {
            shitaLine.free(i - 1);
          }
        }
      });
      
      $m.css('opacity', Config.loadValue(Config.commentTransparency));
      if (msgPos === posTable.naka) {
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
    }, 0);
  }

  /*
  NG comment
  ******************************************************************************/
  function DEFAULT_NG() {
    return `/[韓荒\[\]]/,
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
/^[\/／@＠※←↑↓]/,`;
  };

  function generateNGarray() {
    var regex = /\/(.*)\/(.*)\,/;
    var ng = Config.loadValue(Config.ngKeyword);
    _.each(ng.split('\n'), v => {
      var m = v.match(regex);
      if(m != null) {
        var a = m[1].replace('\/', '/').replace('//', '/');
        var b = m[2];
        if (b != '') {
          ngArray.push(new RegExp(a, b));
        } else {
          ngArray.push(new RegExp(a));
        }
      }
    });
  }

  function ngfilter(ch) {
    if (Config.loadValue(Config.suppress0secComment) && ch.t < 100) // 1秒以内。いわゆる0秒コメ
      return false;
    // NGワード
    if (Config.loadValue(Config.ngKeyword) === '') { return true; }
    var ng = Config.loadValue(Config.ngKeyword);
    return _.reduce(ngArray, (cary, re) => cary && !ch.c.match(re), true);
  }

  /*
  Control panel
  ******************************************************************************/
  const CONTROL_PANEL = `
  <div class="control-panel">
    <div class="progressBar seek">
      <span class="bufferbar"/>
      <span class="mainbar"/>
    </div>
    <button class="btn rewind"><i class="fa fa-fast-backward"></i></button>
    <button class="btn toggle play"><i class="fa fa-play"></i></button>
    ${rateForm()}
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

  function ctrPanel() {
    var $panel = $(CONTROL_PANEL);
    $panel.find('.btn.full').click(FullScreen.toggle);
    $panel.find('.btn.toggle').click($video.videoToggle);
    return $panel;
  }

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

  function updateSlider() {
    var volume = Config.loadValue(Config.nicoVolume);
    var slider = $('#volume-slider')[0];
    var bar = $('#volume-bar')[0];
    const range = slider.clientWidth;
    const max = slider.max;
    slider.value = volume;
    bar.style.width = ((range / max) * volume) +'px';
    $video.get(0).volume = volume * 0.01;
    $video.get(0).muted = false;
    $('#kusa5 button.mute').html('<i class="fa fa-volume-up"></i>');
  }

  //update Progress Bar control
  function updateBar(e) {
    var mainBar = $('.progressBar.seek .mainbar');
    var seekBar = $('.progressBar.seek');
    var buffBar = $('.progressBar.seek .bufferbar');
    var offset = e.pageX - seekBar.offset().left; //Click pos
    if (!(apidata.viewerInfo.isPremium || Config.loadValue(Config.noLimit)) && (offset > buffBar.width())) {
      offset = buffBar.width();
    }
    var ratio = Math.min(1, Math.max(0, offset / seekBar.width()));
    //Update bar and video currenttime
    mainBar.css('width', (ratio * 100)+'%');
    var t = $video[0].duration * ratio;
    $video[0].currentTime = t;
    lastCommentTime = Math.round((t + 1) * 100);
    return true;
  }

  function updateRepeat(oninit) {
    if(oninit) {
      var state = Config.loadValue(Config.repeat);
      if(state !== null)
        $video.get(0).loop = state;
    } else {
      $video.get(0).loop = !$video.get(0).loop;
      Config.setValue(Config.repeat, $video.get(0).loop);
    }
    if($video.get(0).loop)
      $('button.repeat').html('<i class="fa fa-repeat"></i>');
    else
      $('button.repeat').html('<i class="fa fa-arrow-right"></i>');
  }

  /*
  Comment panel (not implemented)
  ******************************************************************************/
  const COMMENT = `
  <div class="comment">
    <input type="text" class="l" /><button class="btn l">投稿</button>
  </div>`;

  /*
  Config panel
  ******************************************************************************/
  const CONFIG_OVERLAY = `
  <div id="kusa5_config">
    <button id="kusa5_config_close">✕</button>
    <p class="kusa5h1">Kusa5.mod <span style="font-size:0.66em;">v.${GM_info.script.version}</span> config</p>
    <p>一部の設定はページリロードで反映されます</p>
    <div class="kusa5box">
      <p>全般</p>
      <div><input type="checkbox" name="${Config.fastInit()}"> <span>Kusa5.modを高速に初期化する</span>（ページ読み込み直後のCPU使用率大）</div>
      <div><input type="checkbox" name="${Config.hidePlayList()}"> <span>再生リストを非表示にする</span></div>
    </div>
    <div class="kusa5box">
      <p>HTML5プレーヤー</p>
      <div class="mb1rem">
        <input type="checkbox" name="${Config.showPageTop()}"> <span>ページ上部に表示</span>　Flashプレーヤーには影響なし
      </div>
      <div class="mb1rem">
        <p>シークバーとか再生位置の更新フレームレート</p>
        <input type="number" name="${Config.playerFPS()}" min="1" max="120"> fps
      </div>
      <div class="mb1rem">
        <input type="checkbox" name="${Config.useUserPlayerSize()}"> <span>プレーヤーサイズを固定する</span>
        <div>幅 <input type="number" name="${Config.useUserPlayerWidth()}" min="0"> px</div>
        <div>高さ <input type="number" name="${Config.useUserPlayerHeight()}" min="0"> px</div>
      </div>
      <div>
        <input type="checkbox" name="${Config.useEnhanceQuality()}"> <span>画質を調整する</span>（Firefoxでは重いので非推奨・100で無効）
        <div>filter: brightness( <input type="number" name="${Config.enhanceBrightness()}" min="0"> %)</div>
        <div>filter: contrast( <input type="number" name="${Config.enhanceContrast()}" min="0"> %)</div>
        <div>filter: satuate( <input type="number" name="${Config.enhanceSatuate()}" min="0"> %)</div>
      </div>
    </div>
    <div class="kusa5box">
      <p>コメント</p>
      <div class="mb1rem">
        <p>コメントの相対フォントサイズ</p>
        <p>値を大きくするとコメントが小さくなる</p>
        ( プレーヤーの高さ ÷ <input type="number" name="${Config.baseFontSize()}" min="21"> ) px
      </div>
      <div class="mb1rem">
        <p>コメントの透明度</p>
        <div>opacity: <input type="number" name="${Config.commentTransparency()}" min="0" max="1" step="0.05"></div>
      </div>
      <div class="mb1rem">
        <p>コメントイベントの最短発火間隔</p>
        <input type="number" name="${Config.throttleComment()}" min="0"> ms
      </div>
    </div>
    <div class="kusa5box">
      <p>プレミアム会員専用</p>
      <div><input type="checkbox" name="${Config.autoPlay()}"> <span>動画を自動再生する</span></div>
      <div><input type="checkbox" name="${Config.monitorSizeFullScreen()}"> <span>モニターサイズでフルスクリーンにする</span></div>
    </div>
    <div class="kusa5box">
      <p>NGキーワード</p>
      <p style="display:inline-block;">正規表現が使用できます（行区切り）</p>
      <button id="Kusa5_regexReset"><i class="fa fa-repeat"></i> リセット</button>
      <div><textarea id="Kusa5_regex" name="${Config.ngKeyword()}"></textarea></div>
      <input type="checkbox" name="${Config.suppress0secComment()}"> <span>0秒コメントをNGにする</span>
    </div>
    <div class="kusa5box">
      <p>？？？？</p>
      <div><input type="checkbox" name="${Config.debug()}"> <span>デバッグモードを有効にする</span></div>
      <div><input type="checkbox" name="${Config.noLimit()}"> <span>人としての尊厳を捨てて全てを解き放つ</span></div>
    </div>
  </div>
  `;

  function configOverlay() {
    var $overlay = $(CONFIG_OVERLAY);
    $overlay.find('#Kusa5_regexReset').on('click', () => {
      $('#kusa5_config').find('#Kusa5_regex').each((i, e) => {
        $(e).prop('value', DEFAULT_NG());
      });
    });
    $overlay.find('#kusa5_config_close').on('click', () => {
      $('#kusa5_config').find('input').each((i, e) => {
        if ($(e).attr('type') === 'checkbox') {
          Config.setValue($(e).attr('name'), $(e).prop('checked'));
        }
        if ($(e).attr('type') === 'number') {
          Config.setValue($(e).attr('name'), $(e).prop('value'));
        }
      });
      $('#kusa5_config').find('textarea').each((i, e) => {
        Config.setValue($(e).attr('name'), JSON.stringify($(e).prop('value')));
      });
      $('#kusa5_config').hide();
      $('body').css('overflow', 'auto');
    });
    $overlay.hide();
    return $overlay;
  }

  /*
  Initialize
  ******************************************************************************/
  var initKusa5 = (() => {
    if (apidata.flashvars.movie_type !== 'mp4') {
      $('.videoDetailExpand').append('<p style="color: #333;font-size: 185%;z-index: 2;line-height: 1.2;display: table-cell;vertical-align: middle;word-break: break-all;word-wrap: break-word;max-width: 672px;margin-right: 10px;">（kusa5.mod.user.js 非対応）</p>')
      return;
    }
    
    generateNGarray();
    
    $('.notify_update_flash_player').hide();
    $('.playerContainer').hide();
    if (Config.loadValue(Config.hidePlaylist))
      $('#playlist').hide();
    $('#playerContainerSlideArea').attr('id', 'kusa5');
    if (Config.loadValue(Config.showPageTop))
      $('#playerContainerWrapper').insertBefore('.videoHeaderOuter'); // お好み
    if ((apidata.viewerInfo.isPremium || Config.loadValue(Config.noLimit)) && !Config.loadValue(Config.autoPlay)) {
      $video.removeAttr('autoplay');
      $video.attr({ poster: apidata.videoDetail.thumbnail });
      var $playButton = $('<div id="kusa5_playbutton"><div><i class="fa fa-play"></i></div></div>');
      $playButton.on('click', () => {
        $('#kusa5_playbutton').remove();
        $video.videoToggle();
      });
      $('#kusa5').append($playButton);
      $video.get(0).load();
    }

    const kusa5 = $('#kusa5')
      .append($video)
      .append(ctrPanel());

    if($video.get(0).autoplay) {
      var playPauseButton = document.getElementsByClassName('btn toggle play')[0];
      playPauseButton.innerHTML = '<i class="fa fa-pause"></i>';
    }

    $('#kusa5_config').find('input').each((i, e) => {
      if ($(e).attr('type') === 'checkbox') {
        $(e).prop('checked', Config.loadValue($(e).attr('name')));
      }
      if ($(e).attr('type') === 'number') {
        $(e).prop('value', Config.loadValue($(e).attr('name')));
      }
    });
    $('#kusa5_config').find('textarea').each((i, e) => {
      $(e).prop('value', Config.loadValue($(e).attr('name')));
    });

    if (Config.loadValue(Config.debug)) {
      $('#kusa5').append('<div id="kusa5_debug" style="font-family: monospace;" />');
      $('#kusa5_debug').append('<p style="color:#64FF64;">// DEBUG:</p>');
      $('#kusa5_debug').append('<p style="position:absolute;top:0;right:4px;color:#64FF64;">&#x23ec;</p>');
      $('#kusa5_debug').append('<pre id="kusa5_lallocInfo" />');
      updateAllocatedLine();
    }
    
    updateRepeat(true);
    
    updateSlider();
    var slider = $('#volume-slider')[0];
    var bar = $('#volume-bar')[0];
    var muted = Config.loadValue(Config.muted);
    $video.get(0).muted = muted;
    if (muted === true) {
      $('#kusa5 button.mute').html('<i class="fa fa-volume-off"></i>');
      slider.value = 0;
      bar.style.width = 0 + 'px';
    }

    $('#kusa5 button.rewind').click(ev => $video.get(0).currentTime = 0);
    $('input[name=nicorate]').change(ev => {
      var playbackRate = parseFloat($(ev.target).val());
      $video.get(0).playbackRate = playbackRate;
      Config.setValue(Config.nicoRate, playbackRate);
    });
    $('input[value="' + Config.loadValue(Config.nicoRate) + '"]').click();

    $('#kusa5 button.mute').on('click', ev => {
      if ($video.get(0).muted) {
        $video.get(0).muted = false;
        $('#kusa5 button.mute').html('<i class="fa fa-volume-up"></i>');
        var volume = Config.loadValue(Config.nicoVolume);
        const range = slider.clientWidth;
        const max = slider.max;
        slider.value = volume;
        bar.style.width = ((range / max) * volume) +'px';
      } else {
        $video.get(0).muted = true;
        $('#kusa5 button.mute').html('<i class="fa fa-volume-off"></i>');
        slider.value = 0;
        bar.style.width = 0 +'px';
      }
      Config.setValue(Config.muted, $video.get(0).muted);
    });

    $('#volume-slider').on('input', ev => {
      Config.setValue(Config.nicoVolume, ev.target.value);
      updateSlider();
    });

    $('#kusa5 button.comment-hidden').click(ev => kusa5.toggleClass('comment-hidden'));
    $('#kusa5 button.repeat').click(() => updateRepeat(false));
    $('#kusa5 button.config').click(ev => {
      $('#kusa5_config').show();
      $('body').css('overflow', 'hidden');
    });

    var promise = loadApiInfo(launchID).then(info => {
      $video.attr('src', info.url);
      $video.get(0).dataset.smid = launchID;
      return info;
    });
    
    var timeDrag = false;  /* Drag status */
    $('.progressBar.seek').mousedown(function (e) {
      timeDrag = true;
      updateBar(e);
    });
    $('.progressBar').mouseup(function (e) {
      if (!timeDrag)
        return;
      timeDrag = false;
      updateBar(e.pageX);
    }).mousemove(e=> {
      timeDrag && updateBar(e);
    });
      
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
  });
  
  /*
  Pre-Initialize
  ******************************************************************************/
  $('body').append($('<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/font-awesome/4.5.0/css/font-awesome.min.css">'))
           .append(configOverlay());
  if (Config.loadValue(Config.fastInit) !== false) {
    var timer = setInterval(() => {
      // jQueryとUnderscore.jsが読み込み終わってる必要がある
      // Nico.CommonNotificationHeaderにアクセスできる状態ならプレミアム会員かどうかのチェックも終わっている？
      if ($.isReady === true && _.VERSION !== '') {
        clearInterval(timer);
        setTimeout(initKusa5, 0);
      }
    }, 1);
  } else {
    window.addEventListener('load', initKusa5, false);
  }
  
  /*
  CSS
  ******************************************************************************/
  function addGlobalStyle(css) {
    var styleSeet = $('<style type="text/css">');
    styleSeet.text(css);
    $('head').append(styleSeet);
  }
  
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
  .control-panel {
    z-index: 9999;
    color: #fff;
    text-shadow: 2px 1px #000;
    position:absolute;
    bottom: 0;
    width: 100%;
    background: rgba(0, 0, 0, 0.9);
    transition: max-height .2s;
    height: 5px !important;
    opacity: 0.666 !important;
    transition: all 0.3s ease-out 2.7s; 
    overflow: hidden;
    cursor: default;
  }
  #kusa5:hover .control-panel {
    height: 46px !important; /* 表示 */
    opacity: 1 !important;
    transition: all 0.3s ease-out; 
  }
  
  .control-panel .btn,
  input+label {
    padding: 0;
    color: #fff;
    font-size: 18px;
    border: none;
    background-color: transparent;
  }
  .control-panel > .btn {
    width: 24px;
    float: left;
  }
  .control-panel .r {float: right;}

  .control-panel .progressBar {
    cursor: pointer;
    position: relative;
    height: 14px;
    background-color: #606060;
    width: 100%;
  }
  .control-panel .progressBar span {
    position: absolute;
    top: 0;
    left: 0;
    width: 0;
    height: 100%;
  }
  .control-panel .progressBar.seek .mainbar {
    background: #0078E7;
  }
  .control-panel .progressBar.seek .bufferbar {
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
    background: #0078E7;
    border: 0;
    height: 5px;
    width: 0px;
    display: block;
    position: absolute;
    left: 0px;
    top: 10px;
    pointer-events: none;
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
  .control-panel .playtime {
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
    transition-duration: 7s;
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
    width: 100% !important;
    height: 100% !important;
  }
  
  #kusa5:-moz-full-screen .control-panel {
    height: 5px !important;
    opacity: 0.666 !important;
    transition: all 0.3s ease-out !important;
  }
  #kusa5:-webkit-full-screen .control-panel {
    height: 5px !important;
    opacity: 0.666 !important;
    transition: all 0.3s ease-out !important;
  }
  #kusa5:-moz-full-screen .control-panel.control-panel-show {
    height: 46px !important; /* 表示 */
    opacity: 1 !important;
    transition: all 0.3s ease-out !important;
  }
  #kusa5:-webkit-full-screen .control-panel.control-panel-show {
    height: 46px !important; /* 表示 */
    opacity: 1 !important;
    transition: all 0.3s ease-out !important;
  }
  
  /* モニターサイズ */
  body.browser-full-screen {
    overflow: hidden !important;
  }
  
  #kusa5.browser-full-screen {
    height: 100vh !important;
    width: 100vw !important;
    position: fixed;
    left: 0px;
    top: 0px;
  }
  
  /*
  レスポンシブ
  ******************************************************************************/
  #kusa5 {
    width: 640px !important;
    height: 360px !important;
  }
  #kusa5 .msg {
    font-size: calc(360px / ${mediumMsgSize});
    height: calc(360px / ${mediumVirtualLines});
    line-height: ${360 / mediumVirtualLines}px;
  }
  #kusa5 .msg.small {
    font-size: calc(360px / ${smallMsgSize});
    height: calc(360px / ${smallVirtualLines});
    line-height: ${360 / smallVirtualLines}px;
  }
  #kusa5 .msg.big {
    font-size: calc(360px / ${largeMsgSize});
    height: calc(360px / ${largeVirtualLines});
    line-height: ${360 / largeVirtualLines}px;
  }
  ${generateLines(360, commentLines)}
  
  @media screen and (min-width: 820px) {
    #kusa5 {
      width: 800px !important;
      height: 450px !important;
    }
    #kusa5 .msg {
      font-size: calc(450px / ${mediumMsgSize});
      height: calc(450px / ${mediumVirtualLines});
      line-height: ${450 / mediumVirtualLines}px;
    }
    #kusa5 .msg.small {
      font-size: calc(450px / ${smallMsgSize});
      height: calc(450px / ${smallVirtualLines});
      line-height: ${450 / smallVirtualLines}px;
    }
    #kusa5 .msg.big {
      font-size: calc(450px / ${largeMsgSize});
      height: calc(450px / ${largeVirtualLines});
      line-height: ${450 / largeVirtualLines}px;
    }
    ${generateLines(450, commentLines)}
  }
  
  @media screen and (min-width: 980px) {
    #kusa5 {
      width: 960px !important;
      height: 540px !important;
    }
    #kusa5 .msg {
      font-size: calc(540px / ${mediumMsgSize});
      height: calc(540px / ${mediumVirtualLines});
      line-height: ${540 / mediumVirtualLines}px;
    }
    #kusa5 .msg.small {
      font-size: calc(540px / ${smallMsgSize});
      height: calc(540px / ${smallVirtualLines});
      line-height: ${540 / smallVirtualLines}px;
    }
    #kusa5 .msg.big {
      font-size: calc(540px / ${largeMsgSize});
      height: calc(540px / ${largeVirtualLines});
      line-height: ${540 / largeVirtualLines}px;
    }
    ${generateLines(540, commentLines)}
  }

  @media screen and (min-width: 1300px) {
    #kusa5 {
      width: 1280px !important;
      height: 720px !important;
    }
    #kusa5 .msg {
      font-size: calc(720px / ${mediumMsgSize});
      height: calc(720px / ${mediumVirtualLines});
      line-height: ${720 / mediumVirtualLines}px;
    }
    #kusa5 .msg.small {
      font-size: calc(720px / ${smallMsgSize});
      height: calc(720px / ${smallVirtualLines});
      line-height: ${720 / smallVirtualLines}px;
    }
    #kusa5 .msg.big {
      font-size: calc(720px / ${largeMsgSize});
      height: calc(720px / ${largeVirtualLines});
      line-height: ${720 / largeVirtualLines}px;
    }
    ${generateLines(720, commentLines)}
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
    position: fixed;
    z-index: 9999;
    color: white;
    background: rgba(0, 0, 0, 0.9);
    padding: 8px;
    width: calc(100% - 16px);
    height: calc(100% - 16px);
    top: 0;
    overflow-y: scroll;
  }
  
  #kusa5_config > .kusa5h1 {
    display: inline-block;
    position: relative;
    font-size: 3rem;
  }
  
  #kusa5_config > #kusa5_config_close {
    position: fixed;
    top: 12px;
    right: 32px;
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
  
  #kusa5_config > .kusa5box > p:first-of-type {
    font-size: 1.3rem;
    margin: 0;
    padding-left: 8px;
    border-left: 8px solid white;
    border-bottom: 1px solid white;
  }
  
  #kusa5_config > .kusa5box > div.mb1rem {
    margin-bottom: 1rem;
  }
  
  #kusa5_config > .kusa5box > div > p:first-of-type,
  #kusa5_config > .kusa5box > div > span:first-of-type {
    font-weight: bold;
  }
  
  #kusa5_config > .kusa5box > div > p {
    padding: 0;
    margin: 0;
  }
  
  #kusa5_config > .kusa5box > div > input[type="number"],
  #kusa5_config > .kusa5box > div > div > input[type="number"] {
    width: 4rem;
  }
  
  #kusa5_config > .kusa5box > div > textarea {
    width: 100%;
    max-width: 100%;
    height: 12rem;
  }
  
  #kusa5_config > .kusa5box > #Kusa5_regexReset {
    float: right;
    background: white;
    border: none;
  }
  
  /*
  ニコニコ本家の軽微な修正
  ******************************************************************************/
  #videoHeader.menuOpened {
    position: relative !important;
    z-index: 1 !important;
  }
  `);
  
  // ユーザー定義CSS
  // プレーヤーサイズ
  if(Config.loadValue(Config.useUserPlayerSize)) {
    const width = Config.loadValue(Config.useUserPlayerWidth);
    const height = Config.loadValue(Config.useUserPlayerHeight);
    addGlobalStyle(`
    #kusa5 {
      width: ${width}px !important;
      height: ${height}px !important;
    }
    #kusa5 .msg {
      font-size: calc(${height}px / ${mediumMsgSize}) !important;
      height: calc(${height}px / ${mediumVirtualLines}) !important;
      line-height: ${height / mediumVirtualLines}px !important;
    }
    #kusa5 .msg.small {
      font-size: calc(${height}px / ${smallMsgSize}) !important;
      height: calc(${height}px / ${smallVirtualLines}) !important;
      line-height: ${height / smallVirtualLines}px !important;
    }
    #kusa5 .msg.big {
      font-size: calc(${height}px / ${largeMsgSize}) !important;
      height: calc(${height}px / ${largeVirtualLines}) !important;
      line-height: ${height / largeVirtualLines}px !important;
    }
    ${generateLines(height, commentLines, true)}
    `);
  }
})();