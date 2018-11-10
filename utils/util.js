let numArr = [-5, -4, -3, -2, -1, 0]; // 设置弹幕数组航道记录数量
let count = 0;

export default class Util {
  // 保存图片到本地
  static saveImage(imgSrc) {
    wx.downloadFile({
      url: imgSrc,
      success: function(res) {
        console.log(res);
        //图片保存到本地
        wx.saveImageToPhotosAlbum({
          filePath: res.tempFilePath,
          success: function(data) {
            wx.showToast({
              title: '保存成功',
              icon: 'success',
              duration: 2000
            })
          },
          fail: function(err) {
            console.log(err);
            if (err.errMsg === "saveImageToPhotosAlbum:fail auth deny") {
              console.log("当初用户拒绝，再次发起授权")
              wx.openSetting({
                success(settingdata) {
                  console.log(settingdata)
                  if (settingdata.authSetting['scope.writePhotosAlbum']) {
                    console.log('获取权限成功，给出再次点击图片保存到相册的提示。')
                  } else {
                    console.log('获取权限失败，给出不给权限就无法正常使用的提示')
                  }
                }
              })
            }
          },
          complete(res) {
            console.log(res);
          }
        })
      }
    })
  }

  // 随机获取一个值 作为弹幕在第几行  每条弹幕与 前面 numArr.length 条弹幕不在同一行 避免出现覆盖
  static getRandomLineNum() {
    let lineNum;
    for (let i = 0; i > -1; i++) {
      lineNum = Math.floor(Math.random() * 10);
      if (numArr.every(num => num !== lineNum)) { // 当前获取的值 与之前的numArr.length个值都不重复
        numArr.splice(0, 1); // 更新之前保存的 numArr.length个值
        numArr.push(lineNum);
        break;
      }
    }
    return lineNum;
  }

  // 获取动画延迟触发的时间 每条弹幕的动画开始时间都比前一条弹幕出现时间慢 countDelay ~ countDelay+1 秒
  static getAnimationDelay(pageNum = 10, countDelay = 3) {
    if (count === pageNum * countDelay) {
      count = 0;
    } // 
    let delay = parseFloat(String(Math.random()).replace(/^0/, count + '').slice(0, 3));
    count += countDelay;
    console.log('count:', count);
    return delay;
  }

  static setDanmuEffect(danmu) {
    danmu.txt = `${danmu.nickname}: ${danmu.content}`;
    danmu.width = danmu.txt.length * 50; // rpx  获取弹幕的内容宽度 单位为rpx 字数*每个字的宽度
    danmu.lineNum = this.getRandomLineNum(); // 设置弹幕的
    danmu.animationDelay = this.getAnimationDelay(); // 设置弹幕动画的延时时间 秒为单位
  }

  // 计算页数
  static pageCount (totalnum, limit) {
    return totalnum > 0 ? ((totalnum < limit) ? 1 : ((totalnum % limit) ? (parseInt(totalnum / limit) + 1) : (totalnum / limit))) : 0;
  }

}