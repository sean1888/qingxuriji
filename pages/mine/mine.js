// pages/mine/mine.js
// 获取应用实例
const app = getApp()

Page({
  data: {
    userInfo: {},
    hasUserInfo: false,
    totalDays: 0,    // 总记录天数
    moodCount: 0,    // 心情记录数
    streakDays: 0    // 连续记录天数
  },

  onLoad() {
    if (app.globalData.userInfo) {
      this.setData({
        userInfo: app.globalData.userInfo,
        hasUserInfo: true
      })
    }
    this.calculateStats()
  },

  // 获取用户信息
  getUserProfile() {
    wx.getUserProfile({
      desc: '用于完善用户资料',
      success: (res) => {
        app.globalData.userInfo = res.userInfo
        this.setData({
          userInfo: res.userInfo,
          hasUserInfo: true
        })
        // 保存用户信息到本地
        wx.setStorage({
          key: 'userInfo',
          data: res.userInfo
        })
      }
    })
  },

  // 计算统计数据
  calculateStats() {
    const now = new Date()
    const today = now.toLocaleDateString()
    let totalDays = 0
    let moodCount = 0
    let streakDays = 0
    let lastDate = null

    // 获取所有日记记录
    wx.getStorageInfo({
      success: res => {
        const keys = res.keys
        const diaryKeys = keys.filter(key => key.startsWith('diary_'))
        
        diaryKeys.forEach(key => {
          wx.getStorage({
            key: key,
            success: res => {
              const data = res.data
              totalDays++
              moodCount += data.mood ? 1 : 0

              // 计算连续天数
              const currentDate = new Date(data.date)
              if (lastDate) {
                const diffDays = Math.floor((currentDate - lastDate) / (24 * 60 * 60 * 1000))
                if (diffDays === 1) {
                  streakDays++
                }
              }
              lastDate = currentDate

              // 更新统计数据
              this.setData({
                totalDays,
                moodCount,
                streakDays
              })
            }
          })
        })
      }
    })
  },

  // 跳转到数据统计
  navigateToStatistics() {
    wx.navigateTo({
      url: '/pages/statistics/statistics'
    })
  },

  // 跳转到设置
  navigateToSettings() {
    wx.navigateTo({
      url: '/pages/settings/settings'
    })
  },

  // 跳转到关于
  navigateToAbout() {
    wx.navigateTo({
      url: '/pages/about/about'
    })
  },

  onShow() {
    // 每次显示页面时重新计算统计数据
    this.calculateStats()
  }
})