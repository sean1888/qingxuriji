// pages/mine/mine.js
// 获取应用实例
const app = getApp()

Page({
  data: {
    userInfo: {},
    hasUserInfo: false
  },

  onLoad() {
    if (app.globalData.userInfo) {
      this.setData({
        userInfo: app.globalData.userInfo,
        hasUserInfo: true
      })
    }
  },

  // 跳转到数据统计
  navigateToStatistics() {
    wx.showToast({
      title: '功能开发中...',
      icon: 'none'
    })
  },

  // 跳转到设置
  navigateToSettings() {
    wx.showToast({
      title: '功能开发中...',
      icon: 'none'
    })
  },

  // 跳转到关于
  navigateToAbout() {
    wx.showToast({
      title: '功能开发中...',
      icon: 'none'
    })
  }
})