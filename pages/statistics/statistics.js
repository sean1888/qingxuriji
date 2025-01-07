// 获取应用实例
const app = getApp()
const Charts = require('../../utils/wxcharts.js')

Page({
  data: {
    timeRanges: ['最近7天', '最近30天', '最近90天', '全部'],
    currentRangeIndex: 0,
    moodDistribution: [],
    tagStats: [],
    habitStats: {
      mostFrequentTime: '',
      longestStreak: 0,
      completionRate: 0
    }
  },

  onLoad() {
    this.calculateStats()
  },

  // 时间范围切换
  timeRangeChange(e) {
    this.setData({
      currentRangeIndex: e.detail.value
    })
    this.calculateStats()
  },

  // 计算统计数据
  calculateStats() {
    const days = this.getDaysFromRange()
    const endDate = new Date()
    const startDate = new Date(endDate - days * 24 * 60 * 60 * 1000)

    // 初始化心情分布数据
    const moodDistribution = app.globalData.moodList.map(mood => ({
      ...mood,
      count: 0,
      percentage: 0
    }))

    // 初始化标签统计
    const tagCounts = {}
    let totalRecords = 0
    let recordTimes = []
    let streakDays = 0
    let maxStreakDays = 0
    let lastDate = null

    // 用于趋势图的数据
    const trendData = {
      categories: [],
      series: [{
        name: '心情指数',
        data: []
      }]
    }

    // 获取日记数据
    wx.getStorageInfo({
      success: res => {
        const keys = res.keys
        const diaryKeys = keys.filter(key => key.startsWith('diary_'))
        
        // 按日期排序
        diaryKeys.sort()
        
        diaryKeys.forEach(key => {
          wx.getStorage({
            key: key,
            success: res => {
              const data = res.data
              const recordDate = new Date(data.date)
              
              // 检查是否在选定时间范围内
              if (recordDate >= startDate && recordDate <= endDate) {
                totalRecords++

                // 统计心情分布
                const distributionIndex = moodDistribution.findIndex(m => m.value === data.mood.value)
                if (distributionIndex > -1) {
                  moodDistribution[distributionIndex].count++
                }

                // 统计标签
                data.tags.forEach(tag => {
                  tagCounts[tag] = (tagCounts[tag] || 0) + 1
                })

                // 记录时间统计
                const recordTime = new Date(data.timestamp)
                recordTimes.push(recordTime.getHours())

                // 计算连续天数
                if (lastDate) {
                  const diffDays = Math.floor((recordDate - lastDate) / (24 * 60 * 60 * 1000))
                  if (diffDays === 1) {
                    streakDays++
                    maxStreakDays = Math.max(maxStreakDays, streakDays)
                  } else {
                    streakDays = 0
                  }
                }
                lastDate = recordDate

                // 添加趋势图数据
                const dateStr = `${recordDate.getMonth() + 1}/${recordDate.getDate()}`
                trendData.categories.push(dateStr)
                // 计算心情指数：1-5转换为0-100
                const moodScore = (6 - data.mood.value) * 20
                trendData.series[0].data.push(moodScore)
              }

              // 计算百分比
              if (totalRecords > 0) {
                moodDistribution.forEach(mood => {
                  mood.percentage = Math.round(mood.count / totalRecords * 100)
                })
              }

              // 计算最常记录时间
              const mostFrequentTime = this.calculateMostFrequentTime(recordTimes)

              // 计算完成率
              const completionRate = Math.round(totalRecords / days * 100)

              // 更新统计数据
              this.setData({
                moodDistribution,
                tagStats: Object.entries(tagCounts).map(([tag, count]) => ({
                  tag,
                  count,
                  percentage: Math.round(count / totalRecords * 100)
                })).sort((a, b) => b.count - a.count),
                habitStats: {
                  mostFrequentTime,
                  longestStreak: maxStreakDays,
                  completionRate
                }
              })

              // 绘制趋势图
              this.drawTrendChart(trendData)
            }
          })
        })
      }
    })
  },

  // 根据时间范围获取天数
  getDaysFromRange() {
    const ranges = [7, 30, 90, 999999] // 999999表示全部
    return ranges[this.data.currentRangeIndex]
  },

  // 计算最常记录时间
  calculateMostFrequentTime(times) {
    if (times.length === 0) return '暂无数据'
    
    const hourCounts = new Array(24).fill(0)
    times.forEach(hour => hourCounts[hour]++)
    
    let maxCount = 0
    let maxHour = 0
    hourCounts.forEach((count, hour) => {
      if (count > maxCount) {
        maxCount = count
        maxHour = hour
      }
    })

    return `${maxHour}:00-${maxHour + 1}:00`
  },

  // 绘制趋势图表
  drawTrendChart(chartData) {
    const windowWidth = wx.getSystemInfoSync().windowWidth
    new Charts({
      canvasId: 'trendChart',
      type: 'line',
      categories: chartData.categories,
      series: chartData.series,
      width: windowWidth - 40, // 考虑容器padding
      height: 200,
      showLegend: true
    })
  },

  // 导出统计数据
  exportData() {
    const data = {
      timeRange: this.data.timeRanges[this.data.currentRangeIndex],
      moodDistribution: this.data.moodDistribution,
      tagStats: this.data.tagStats,
      habitStats: this.data.habitStats
    }

    // 转换为CSV格式
    let csv = '情绪统计报告\n\n'
    csv += `时间范围,${data.timeRange}\n\n`
    
    csv += '情绪分布\n'
    csv += '心情,次数,占比\n'
    data.moodDistribution.forEach(mood => {
      csv += `${mood.label},${mood.count},${mood.percentage}%\n`
    })
    
    csv += '\n标签统计\n'
    csv += '标签,次数,占比\n'
    data.tagStats.forEach(tag => {
      csv += `${tag.tag},${tag.count},${tag.percentage}%\n`
    })
    
    csv += '\n记录习惯\n'
    csv += `最常记录时间,${data.habitStats.mostFrequentTime}\n`
    csv += `最长连续记录,${data.habitStats.longestStreak}天\n`
    csv += `记录完成率,${data.habitStats.completionRate}%\n`

    // 保存文件
    wx.showModal({
      title: '导出成功',
      content: '统计数据已导出到剪贴板',
      showCancel: false
    })

    wx.setClipboardData({
      data: csv,
      success: () => {
        wx.showToast({
          title: '已复制到剪贴板',
          icon: 'success'
        })
      }
    })
  }
}) 