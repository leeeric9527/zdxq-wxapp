const api_base_url = 'https://celeb.xinzhibang168.com';

const tips = {
  1: "抱歉出现一个错误,请联系开发小哥"
}

class HTTP {
  /**
   * 封装一层的HTTP请求
   */
  request({
    url,
    data = {},
    method = "GET"
  }) {
    return new Promise((resolve, reject) => {
      this._request(url, resolve, reject, data, method)
    })
  }

  _request(url, resolve, reject, data, method) {
    wx.request({
      url: api_base_url + url,
      data: data,
      method: method,
      header: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      success: res => {
        const code = res.statusCode.toString()
        if (code.startsWith("2")) {
          resolve(res.data)
        } else {
          const errorCode = res.data.error_code
          this._showError(errorCode)
          reject(res)
        }
      },
      fail: error => {
        reject(error)
        this._showError(1)
      }
    })
  }
  /**
   * 显示错误提示
   */
  _showError(errorCode) {
    if (!errorCode) {
      errorCode = 1
    }
    const tip = tips[errorCode];
    wx.showToast({
      title: tip ? tip : tips[1],
      icon: "none",
      duration: 2000
    })
  }
}

export {
  HTTP
}