// app.js
App({
  globalData: {
    userInfo: null,
    moodList: [
      { value: 1, label: '开心', icon: '😊' },
      { value: 2, label: '平静', icon: '😐' },
      { value: 3, label: '低落', icon: '😢' },
      { value: 4, label: '焦虑', icon: '😰' },
      { value: 5, label: '生气', icon: '😠' }
    ]
  },
  
  onLaunch() {
    // 获取用户信息
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          wx.getUserInfo({
            success: res => {
              this.globalData.userInfo = res.userInfo
            }
          })
        }
      }
    })
  }
}) 