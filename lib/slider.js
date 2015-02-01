'use strict';
define(function(require) {
  var $ = require('zepto');
  require('anim');

  var thisIndex; //正在激活的页面
  var startY = null; // 开始移动Y值
  var isMoving = false;
  var movingDirect = ''; // 移动方向，up：向上；down：向下
  var pageHeight;
  var minDeltaY = 5; // 触发翻页的最小高度
  var minAbortDeltaY = 40; // 如果滑动距离小于此值，则放弃翻页
  var isAbort = false; // 是否放弃翻页
  var deltaY = 0; //移动的距离
  var nextPage;
  var thisPage;
  var pageN; //一共有几页
  var upOut, downOut, downIn, upIn; //几种翻页动效
  var sliderContainer,controlContainer;
  var body = $('body');
  var pages;

  function Slider(opt) {
    opt = this.opt = opt || {};

    controlContainer = $('.control-container');
    sliderContainer = $('.slider-container');
    pageHeight = sliderContainer.height();
    // canvasContainer = $('.canvas-container');
    //初始化
    pageN = opt.pages.length;
    if (opt.pages) this.pages(opt);
    if (opt.help) this.help(opt);

    var anims = opt.anims || {};
    upOut = anims.upOut || 'fadeOutUp';
    downOut = anims.downOut || 'fadeOutDown';
    downIn = anims.downIn || 'fadeInDown';
    upIn = anims.upIn || 'fadeInUp';

    //绑定事件
    pages = $('.slide-page');
    this.events();

    return pages;
  }

  ////////////////////////////////////////////////////////////////////////////////
  ////////////////////生成dom (页面、音乐播放开关、翻页提示等）///////////////////////
  ////////////////////////////////////////////////////////////////////////////////
  Slider.prototype.pages = function(opt) {
    //生成配置
    opt = opt || {};
    var pages = opt.pages;
    thisIndex = opt.thisIndex || 0;
    //生成dom
    var className, page, pageNode, css;
    for (var i = 0; i < pages.length; i++) {
      page = pages[i];
      css = {}; //根据配置生成css
      if (page.backgroundColor) css.backgroundColor = page.backgroundColor; //生成节点
      className = (i === thisIndex) ? 'show' : 'hide';
      pageNode = $('<div class="slide-page ' + className + ' transition" id="id' + i + '"></div>')
        .css(css);
      sliderContainer.append(pageNode);
    }
  };

  Slider.prototype.help = function(opt) {
    var upSymbol;
    var type = opt.help;
    if (type === 'up') {
      upSymbol = $('<img src="http://open-wedding.qiniudn.com/up.png" class="upSymbol up up-help"></img>');
    }
    controlContainer.append(upSymbol);
  };

  ////////////////////////////////////////////////////////////////////////////////
  /////////////////////////////////////   交互事件     ////////////////////////////
  ////////////////////////////////////////////////////////////////////////////////
  Slider.prototype.events = function() { //绑定事件
    pages.on('mousedown touchstart', this.touchstart.bind(this))
      .on('mousemove touchmove', this.touchmove.bind(this))
      .on('mouseup touchend mouseout', this.touchend.bind(this));
  };

  Slider.prototype.getPage = function(vars) { //取编号为vars | 此前一页 | 此后一页的 page node
    var circular = this.opt.circular;
    var index;

    if (vars === 'down') vars = thisIndex + 1;
    if (vars === 'up') vars = thisIndex - 1;
    if (isNaN(vars)) return;

    if (circular) {
      index = (vars + pageN) % pageN;
    } else if (vars > pageN - 1 || vars < 0) {
      return;
    } else {
      index = vars;
    }

    thisIndex = index;
    return pages.eq(index);
  };

  function getPosY(e) { //此时mouseY的值
    if (e.type.indexOf('mouse') !== -1) return e.y || e.pageY;
    return window.event.touches[0].pageY;
  }

  function prevant(e) { //清除默认事件
    e.preventDefault();
    e.stopPropagation();
  }

  //触摸（鼠标按下）开始函数
  Slider.prototype.touchstart = function(e) {
    prevant(e);
    startY = getPosY(e);
    thisPage = pages.filter('.show');
  };


  Slider.prototype.draggstart = function(deltaY) {
    var start = false;
    var nextTop = null;
    if (deltaY < -minDeltaY) { //往下翻
      start = true;
      movingDirect = 'down';
      nextTop = pageHeight;
    } else if (deltaY > minDeltaY) { //往上翻
      start = true;
      movingDirect = 'up';
      nextTop = -pageHeight;
    }

    if (start) {
      nextPage = this.getPage(movingDirect);
      if (nextPage) {
        nextPage.clearKeyAnim();
        nextPage.removeClass('hide').removeClass('show'); //.removeClass('')
        nextPage.addClass('active').css('top', nextTop);
        return true;
      }else{
        return false;
      }
    }
  };

  Slider.prototype.dragging = function(deltaY) { //超过阈值后 被拖拽的效果
    thisPage.css('top', deltaY * 0.6);
    if (nextPage) {
      var nextTop = (movingDirect == 'down') ? pageHeight : -pageHeight;
      nextPage.css('top', nextTop + deltaY);
    }
  };

  Slider.prototype.touchmove = function(e) {
    prevant(e);
    deltaY = getPosY(e) - startY;
    if (!isMoving) isMoving = this.draggstart(deltaY);
    if (isMoving) this.dragging(deltaY);
  };


  Slider.prototype.touchend = function(e) {
    prevant(e);
    isAbort = this.isAbort();
    if (isAbort) {
      this.abort();
    } else {
      this.next();
    }
    // 恢复初始值
    isMoving = false;
    isAbort = false;
    movingDirect = '';
  };

  Slider.prototype.isAbort = function() {
    if (!nextPage) {
      return true;
    } else if (movingDirect === 'down' && deltaY > -minAbortDeltaY) {
      return true;
    } else if (movingDirect === 'up' && deltaY < minAbortDeltaY) {
      return true;
    }
  };

  //翻页终止 返回
  Slider.prototype.abort = function() {
    thisPage.css('top', 0);
    if (nextPage) nextPage.removeClass('active').addClass('hide');
  };

  function noEvents() {
    body.css('pointerEvents', 'none');
  }

  function events() {
    body.css('pointerEvents', 'auto');
  }
  //顺利翻页
  Slider.prototype.next = function() {
    var opt = this.opt;
    var changeTime = opt.changeTime || 1;
    var thisAnim = (movingDirect === 'down') ? upOut : downOut;
    var nextAnim = (movingDirect === 'up') ? downIn : upIn;
    noEvents();

    thisPage.clearKeyAnim();
    thisPage.keyAnim(thisAnim, {
      time: changeTime,
      cb: function() {
        events();
        thisPage.removeClass('show').addClass('hide');
        thisPage = null;
        nextPage = null;
      }
    });

    if (nextPage) {
      nextPage.css('top', 0);
      nextPage.removeClass('active').addClass('show');
      nextPage.keyAnim(nextAnim, {
        time: changeTime*0.8
      });
    }
  };

  return Slider;
});
