import {
  HTTP
} from '../../utils/http.js'
import Util from '../../utils/util.js';
import danmuResponse from '../../mockdata/danmu.js'
const QQMapWX = require('../../utils/qqmap-wx-jssdk.min.js')
const app = getApp()
const http = new HTTP()
let audio = wx.createInnerAudioContext()
let timer;

Page({
  data: {
    num: 1,
    city: '这里',
    isPlay: true,
    userInfo: {},
    content: '',
    showPoster: false,
    poster: '',
    danmus: [],
    pageNum: 1,
    pageSize: 10,
    total: 0
  },
  onLoad() {
    this.playAudio();
    this.getCityName();
    this.wxLogin();
    this.setDanmus();
    timer = setInterval(() => {
      this.setIntervalDanmus();
    }, 25000);
  },
  onShareAppMessage() {
    let nickName = this.data.userInfo.nickName ? this.data.userInfo.nickName : '中大人';
    let num = this.data.num;
    return {
      title: `我是${nickName}，第${num}位为中大94周年校庆接力…`
    }
  },
  // 微信登录
  wxLogin() {
    wx.login({
      success: res => {
        let code = res.code;
        let rqParams = {
          url: `/auth/wxlogin/${code}`
        };
        http.request(rqParams).then(res => {
          wx.setStorageSync('openid', res.data.openid);
          this.setData({
            num: res.data.num
          });
        });
      }
    });
  },
  // 微信授权
  wxAuthorize(e) {
    if (e.detail.userInfo) {
      let openid = wx.getStorageSync('openid');
      this.setData({
        userInfo: e.detail.userInfo
      });
      let postData = {
        nickname: e.detail.userInfo.nickName,
        avatar: e.detail.userInfo.avatarUrl,
        gender: e.detail.userInfo.gender,
        province: e.detail.userInfo.province,
        city: e.detail.userInfo.city,
        country: e.detail.userInfo.country,
        openid: openid
      };
      let rqParams = {
        url: '/oauth',
        data: postData,
        method: 'post'
      }
      http.request(rqParams);
      this.blessingCommit();
    }
  },
  // 获取用户当前城市名
  getCityName() {
    let self = this;
    let city = wx.getStorageSync('city');
    if (city) {
      self.setData({
        city: city
      });
      return;
    }
    wx.getLocation({
      success: (res) => {
        let {
          latitude,
          longitude
        } = res;
        let qqmapsdk = new QQMapWX({
          key: 'MHFBZ-QVU3J-VX3FW-F2NNI-LIP3Z-NIB2F'
        });
        qqmapsdk.reverseGeocoder({
          location: {
            latitude: latitude,
            longitude: longitude
          },
          success: function(res) {
            // let province = res.result.ad_info.province;
            let city = res.result.ad_info.city;
            wx.setStorageSync('city', city);
            self.setData({
              city: city
            });
          },
          fail: function(res) {
            console.warn('获取位置失败： ', res);
          }
        });
      }
    });
  },
  // 播放校庆歌曲
  playAudio() {
    audio.src = 'https://m10.music.126.net/20181109155256/a52760af9c91619cbc6d0e1c40ebc9f1/ymusic/8b5d/47b5/b98b/fd890bf0b628f72f2b530886d6529d4d.mp3';
    // audio.autoplay = true;
  },
  // 点击播放暂停背景音乐
  musicAction() {
    let self = this;
    let isPlay = self.data.isPlay;
    if (isPlay) {
      audio.pause();
      self.setData({
        isPlay: false
      });
    } else {
      audio.play();
      self.setData({
        isPlay: true
      });
    }
  },
  // 留言
  blessing(e) {
    let openid = wx.getStorageSync('openid');
    this.content = e.detail.value.content;
  },
  // 留言提交请求
  blessingCommit() {
    if (!this.data.userInfo) return;
    if (!this.content) {
      wx.showToast({
        title: '请输入留言内容哦 ~',
        icon: 'none'
      });
      return;
    }
    let openid = wx.getStorageSync('openid');
    let rqParams = {
      url: `/blessing/commit`,
      data: {
        openid: openid,
        content: this.content
      },
      method: 'post'
    };
    http.request(rqParams).then(res => {
      wx.showToast({
        title: '留言成功！',
        icon: 'success'
      });
      let danmuItem = {
        nickname: this.data.userInfo.nickName,
        avatar: this.data.userInfo.avatarUrl,
        content: this.content,
        time: Date.now()
      };
      Util.setDanmuEffect(danmuItem);
      this.setData({
        danmus: [...this.data.danmus, danmuItem]
      });
      this.content = '';
    });
  },
  // 生成海报
  createImage(e) {
    if (e.detail.userInfo) {
      let openid = wx.getStorageSync('openid');
      this.setData({
        userInfo: e.detail.userInfo
      });
      let postData = {
        nickname: e.detail.userInfo.nickName,
        avatar: e.detail.userInfo.avatarUrl,
        gender: e.detail.userInfo.gender,
        province: e.detail.userInfo.province,
        city: e.detail.userInfo.city,
        country: e.detail.userInfo.country,
        openid: openid
      };
      let rqParams = {
        url: '/oauth',
        data: postData,
        method: 'post'
      }
      wx.showLoading({
        title: '正在生成中..'
      });
      http.request(rqParams).then(() => {
        this.posterCreate();
      });
    } else {
      wx.showToast({
        title: '需要微信授权以后才能生成海报哦 ~',
        icon: 'none'
      });
    }
  },
  // 生成海报请求
  posterCreate() {
    let openid = wx.getStorageSync('openid');
    let path = 'pages/index/index';
    let rqParams = {
      url: '/poster/create',
      data: {
        openid: openid,
        path: path
      },
      method: 'post'
    }
    http.request(rqParams).then(res => {
      let poster = res.data.poster;
      this.setData({
        poster: poster,
        showPoster: true
      });
      wx.hideLoading();
    });
  },
  // 保存图片至相册
  saveImage() {
    let poster = this.data.poster;
    Util.saveImage(poster);
  },
  // 关闭海报模态窗
  closePoster() {
    this.setData({
      showPoster: false
    });
  },
  // 设置弹幕
  setDanmus() {
    let rqParams = {
      url: `/bullet/${this.data.pageNum}`
    };
    http.request(rqParams).then(res => {
      let {
        list,
        total,
        pageNum
      } = res.data;
      for (let danmu of list) {
        Util.setDanmuEffect(danmu);
      }
      this.setData({
        danmus: list,
        total,
        pageNum
      });
    });
  },
  // 定时读取留言所有数据
  setIntervalDanmus() {
    this.setData({
      pageNum: Number(this.data.pageNum) + 1
    });
    let pageCount = Util.pageCount(this.data.total, this.data.pageSize);
    if (this.data.pageNum <= pageCount) {
      let rqParams = {
        url: `/bullet/${this.data.pageNum}`
      };
      http.request(rqParams).then(res => {
        let {
          list,
          total,
          pageNum
        } = res.data;
        for (let danmu of list) {
          Util.setDanmuEffect(danmu);
        }
        this.setData({
          danmus: [...this.data.danmus, ...list]
        });
      });
    } else {
      clearInterval(timer);
    }
  },
})