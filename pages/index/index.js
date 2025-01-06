// 获取应用实例
const app = getApp()

Page({
  data: {
    userInfo: {},
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    moodList: [],
    todayMood: null,
    dailyTip: ''
  },

  onLoad() {
    // 获取全局的心情列表
    this.setData({
      moodList: app.globalData.moodList
    })
    
    // 获取用户信息
    if (app.globalData.userInfo) {
      this.setData({
        userInfo: app.globalData.userInfo,
        hasUserInfo: true
      })
    }
    
    // 获取今日心情
    this.getTodayMood()
    
    // 获取每日提示
    this.getDailyTip()
  },

  // 获取今日心情
  getTodayMood() {
    // TODO: 从本地存储或服务器获取今日心情
    const today = new Date().toLocaleDateString()
    wx.getStorage({
      key: `mood_${today}`,
      success: (res) => {
        this.setData({
          todayMood: res.data
        })
      }
    })
  },

  // 获取每日提示
  getDailyTip() {
    const tips = [
      '记录心情，让每一天都充满阳光~',
      '倾听内心的声音，关注自己的情绪变化',
      '心情不好时，试试深呼吸，让心情平静下来',
      '保持积极乐观的心态，温暖自己也温暖他人'
    ]
    const randomTip = tips[Math.floor(Math.random() * tips.length)]
    this.setData({
      dailyTip: randomTip
    })
  },

  // 选择心情
  selectMood(e) {
    const mood = e.currentTarget.dataset.mood
    const today = new Date().toLocaleDateString()
    
    // 保存心情
    wx.setStorage({
      key: `mood_${today}`,
      data: mood,
      success: () => {
        this.setData({
          todayMood: mood
        })
        wx.showToast({
          title: '记录成功',
          icon: 'success'
        })
      }
    })
  },

  // 跳转到详细记录页
  goToRecord() {
    wx.navigateTo({
      url: '/pages/diary/diary'
    })
  },

  getUserInfo(e) {
    if (e.detail.userInfo) {
      app.globalData.userInfo = e.detail.userInfo
      this.setData({
        userInfo: e.detail.userInfo,
        hasUserInfo: true
      })
    }
  }
}) 