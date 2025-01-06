// 获取应用实例
const app = getApp()

Page({
  data: {
    currentMonth: '',
    calendarDays: [],
    moodStats: [],
    tagStats: []
  },

  onLoad() {
    // 设置当前月份
    const today = new Date()
    const currentMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`
    
    this.setData({ currentMonth })
    this.generateCalendar(currentMonth)
    this.calculateStats(currentMonth)
  },

  // 生成日历数据
  generateCalendar(monthStr) {
    const [year, month] = monthStr.split('-').map(Number)
    const firstDay = new Date(year, month - 1, 1)
    const lastDay = new Date(year, month, 0)
    
    // 获取上个月的天数
    const prevMonthDays = new Date(year, month - 1, 0).getDate()
    
    // 计算日历开始日期（上个月的日期）
    const startDay = firstDay.getDay()
    const calendarDays = []
    
    // 添加上个月的日期
    for (let i = startDay - 1; i >= 0; i--) {
      calendarDays.push({
        day: prevMonthDays - i,
        date: `${year}-${String(month-1).padStart(2, '0')}-${String(prevMonthDays - i).padStart(2, '0')}`,
        currentMonth: false
      })
    }
    
    // 添加当前月的日期
    for (let i = 1; i <= lastDay.getDate(); i++) {
      calendarDays.push({
        day: i,
        date: `${year}-${String(month).padStart(2, '0')}-${String(i).padStart(2, '0')}`,
        currentMonth: true
      })
    }
    
    // 添加下个月的日期
    const remainingDays = 42 - calendarDays.length // 保持6行
    for (let i = 1; i <= remainingDays; i++) {
      calendarDays.push({
        day: i,
        date: `${year}-${String(month+1).padStart(2, '0')}-${String(i).padStart(2, '0')}`,
        currentMonth: false
      })
    }
    
    // 获取每天的心情数据
    calendarDays.forEach(day => {
      wx.getStorage({
        key: `diary_${day.date}`,
        success: res => {
          day.mood = res.data.mood
        }
      })
    })
    
    this.setData({ calendarDays })
  },

  // 计算统计数据
  calculateStats(month) {
    const moodStats = app.globalData.moodList.map(mood => ({
      ...mood,
      count: 0
    }))
    
    const tagCounts = {}
    
    // 获取当月所有日记
    const [year, monthNum] = month.split('-')
    const lastDay = new Date(year, monthNum, 0).getDate()
    
    for (let day = 1; day <= lastDay; day++) {
      const date = `${month}-${String(day).padStart(2, '0')}`
      wx.getStorage({
        key: `diary_${date}`,
        success: res => {
          const data = res.data
          
          // 统计心情
          const moodIndex = moodStats.findIndex(m => m.value === data.mood.value)
          if (moodIndex > -1) {
            moodStats[moodIndex].count++
          }
          
          // 统计标签
          data.tags.forEach(tag => {
            tagCounts[tag] = (tagCounts[tag] || 0) + 1
          })
          
          // 更新统计数据
          this.setData({ 
            moodStats,
            tagStats: Object.entries(tagCounts).map(([tag, count]) => ({
              tag,
              weight: Math.min(40 + count * 5, 60) // 字体大小范围：40-60rpx
            }))
          })
        }
      })
    }
  },

  // 月份切换
  monthChange(e) {
    const month = e.detail.value
    this.setData({ currentMonth: month })
    this.generateCalendar(month)
    this.calculateStats(month)
  },

  // 选择某一天
  selectDay(e) {
    const date = e.currentTarget.dataset.date
    wx.navigateTo({
      url: `/pages/diary/diary?date=${date}`
    })
  }
}) 