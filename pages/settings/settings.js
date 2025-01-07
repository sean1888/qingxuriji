// pages/settings/settings.js
Page({
  data: {
    // 通知设置
    dailyReminder: false,
    reminderTime: '20:00',
    
    // 隐私设置
    dataEncryption: false,
    fingerprintLock: false,
    
    // 存储信息
    usedStorage: 0,
    totalStorage: 1024,
    cacheSize: 0
  },

  onLoad: function() {
    // 加载设置
    this.loadSettings();
    // 获取存储信息
    this.getStorageInfo();
  },

  // 加载设置
  loadSettings: function() {
    const settings = wx.getStorageSync('settings') || {};
    this.setData({
      dailyReminder: settings.dailyReminder || false,
      reminderTime: settings.reminderTime || '20:00',
      dataEncryption: settings.dataEncryption || false,
      fingerprintLock: settings.fingerprintLock || false
    });
  },

  // 获取存储信息
  getStorageInfo: function() {
    wx.getStorageInfo({
      success: (res) => {
        this.setData({
          usedStorage: (res.currentSize / 1024).toFixed(2),
          totalStorage: (res.limitSize / 1024).toFixed(2),
          cacheSize: (res.currentSize / 1024).toFixed(2)
        });
      }
    });
  },

  // 切换每日提醒
  toggleDailyReminder: function(e) {
    const checked = e.detail.value;
    this.setData({ dailyReminder: checked });
    this.saveSettings();
    
    if (checked) {
      this.requestNotificationPermission();
    }
  },

  // 修改提醒时间
  changeReminderTime: function(e) {
    this.setData({ reminderTime: e.detail.value });
    this.saveSettings();
    
    if (this.data.dailyReminder) {
      this.updateReminder();
    }
  },

  // 切换数据加密
  toggleDataEncryption: function(e) {
    this.setData({ dataEncryption: e.detail.value });
    this.saveSettings();
  },

  // 切换指纹解锁
  toggleFingerprintLock: function(e) {
    this.setData({ fingerprintLock: e.detail.value });
    this.saveSettings();
    
    if (e.detail.value) {
      this.checkBiometricSupport();
    }
  },

  // 保存设置
  saveSettings: function() {
    const settings = {
      dailyReminder: this.data.dailyReminder,
      reminderTime: this.data.reminderTime,
      dataEncryption: this.data.dataEncryption,
      fingerprintLock: this.data.fingerprintLock
    };
    wx.setStorageSync('settings', settings);
  },

  // 请求通知权限
  requestNotificationPermission: function() {
    wx.requestSubscribeMessage({
      tmplIds: ['your-template-id'], // 替换为你的模板ID
      success: (res) => {
        if (res['your-template-id'] === 'accept') {
          wx.showToast({
            title: '已开启提醒',
            icon: 'success'
          });
        }
      }
    });
  },

  // 更新提醒设置
  updateReminder: function() {
    // 实现定时提醒逻辑
  },

  // 检查生物识别支持
  checkBiometricSupport: function() {
    wx.checkIsSoterEnrolled({
      checkAuthMode: 'fingerPrint',
      success: (res) => {
        if (!res.isEnrolled) {
          wx.showModal({
            title: '提示',
            content: '请先在系统设置中录入指纹',
            showCancel: false
          });
          this.setData({ fingerprintLock: false });
          this.saveSettings();
        }
      },
      fail: () => {
        wx.showModal({
          title: '提示',
          content: '您的设备不支持指纹解锁',
          showCancel: false
        });
        this.setData({ fingerprintLock: false });
        this.saveSettings();
      }
    });
  },

  // 清理缓存
  clearCache: function() {
    wx.showModal({
      title: '提示',
      content: '确定要清理缓存吗？',
      success: (res) => {
        if (res.confirm) {
          wx.clearStorage({
            success: () => {
              wx.showToast({
                title: '清理成功',
                icon: 'success'
              });
              this.getStorageInfo();
            }
          });
        }
      }
    });
  },

  // 退出登录
  logout: function() {
    wx.showModal({
      title: '提示',
      content: '确定要退出登录吗？',
      success: (res) => {
        if (res.confirm) {
          // 清除用户信息
          wx.removeStorageSync('userInfo');
          // 跳转到登录页
          wx.reLaunch({
            url: '/pages/login/login'
          });
        }
      }
    });
  }
});