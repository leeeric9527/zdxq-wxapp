import {
  HTTP
} from '../../utils/http.js'
import Util from '../../utils/util.js';
const QQMapWX = require('../../utils/qqmap-wx-jssdk.min.js');
const app = getApp()
const http = new HTTP()

Page({
  data: {
    num: 0,
    city: ''
  },
  onLoad() {
    this.playAudio();
    this.getCityName();
    // this.wxLogin();
    // Util.saveImage();
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
    let audio = wx.createInnerAudioContext();
    audio.src = 'https://m10.music.126.net/20181109155256/a52760af9c91619cbc6d0e1c40ebc9f1/ymusic/8b5d/47b5/b98b/fd890bf0b628f72f2b530886d6529d4d.mp3';
    setTimeout(() => {
      audio.play();
    }, 3000);
    setTimeout(() => {
      audio.pause();
    }, 20000);
  }
})