'use strict';
require.config({
  baseUrl: './bower_components/',
  paths: {
    'zepto': 'zepto/zepto',
    'util': 'wechat-util/index',
    'anim': 'anim/anim',
  },
  shim: {
    'zepto': {
      'exports': '$'
    },
    'anim': {
      'exports': '$'
    }
  }
});

define(function(require) {
  var App = require('./lib/slider.js');

  var anims = {
    'fade': {
      'upOut': 'fadeOutUp',
      'downOut': 'fadeOutDown',
      'upIn': 'fadeInUp',
      'downIn': 'fadeInDown',
    },
    'bounce': {
      'upOut': 'bounceOutUp',
      'downOut': 'bounceOutDown',
      'upIn': 'bounceInUp',
      'downIn': 'bounceInDown',
    },
    'rotate': {
      'upOut': 'rotateOutUpLeft',
      'downOut': 'rotateOutDownLeft',
      'upIn': 'rotateInUpLeft',
      'downIn': 'rotateInDownLeft'
    },
  };
  return new App({
    'showIndex': 0,//默认显示第几页
    'circular': 1,//是否循环
    'help': 'up',//提示下翻的按钮
    'anims': anims.rotate,
    'changeTime': 0.4, //换页的时间
    'pages': [{
      'backgroundColor': '#930'
    }, {
      'backgroundColor': '#390'
    }, {
      'backgroundColor': '#039'
    }]
  });
});
