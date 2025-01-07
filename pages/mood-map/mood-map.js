// 获取应用实例
const app = getApp()
// 引入图表库
const wxCharts = require('../../utils/wxcharts.js');

Page({
  data: {
    currentMonth: '',
    calendarDays: [],
    moodTypes: [
      { label: '开心', value: 1, color: '#91d5ff', icon: '😊' },
      { label: '平静', value: 2, color: '#b7eb8f', icon: '😐' },
      { label: '低落', value: 3, color: '#ffd591', icon: '😢' },
      { label: '焦虑', value: 4, color: '#ffa39e', icon: '😰' },
      { label: '生气', value: 5, color: '#ff7875', icon: '😠' }
    ],
    moodStats: [],
    tagCloud: []
  },

  onLoad() {
    // 设置当前月份
    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    this.setData({ currentMonth });
    
    // 生成日历数据
    this.generateCalendar();
    // 加载数据并绘制图表
    this.loadMonthData();
  },

  // 切换月份
  changeMonth: function(e) {
    this.setData({
      currentMonth: e.detail.value
    });
    this.generateCalendar();
    this.loadMonthData();
  },

  // 生成日历数据
  generateCalendar: function() {
    const [year, month] = this.data.currentMonth.split('-').map(Number);
    const firstDay = new Date(year, month - 1, 1);
    const lastDay = new Date(year, month, 0);
    const totalDays = lastDay.getDate();
    
    // 获取上个月的天数
    const prevMonthDays = new Date(year, month - 1, 0).getDate();
    
    // 计算日历开始日期（上个月的日期）
    const startDay = firstDay.getDay();
    const calendarDays = [];
    
    // 添加上个月的日期
    for (let i = startDay - 1; i >= 0; i--) {
      const day = prevMonthDays - i;
      const prevMonth = month - 1;
      const prevYear = prevMonth === 0 ? year - 1 : year;
      const actualMonth = prevMonth === 0 ? 12 : prevMonth;
      calendarDays.push({
        day,
        date: `${prevYear}-${String(actualMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
        currentMonth: false
      });
    }
    
    // 添加当前月的日期
    for (let i = 1; i <= totalDays; i++) {
      calendarDays.push({
        day: i,
        date: `${year}-${String(month).padStart(2, '0')}-${String(i).padStart(2, '0')}`,
        currentMonth: true
      });
    }
    
    // 添加下个月的日期
    const remainingDays = 42 - calendarDays.length; // 保持6行
    for (let i = 1; i <= remainingDays; i++) {
      const nextMonth = month + 1;
      const nextYear = nextMonth === 13 ? year + 1 : year;
      const actualMonth = nextMonth === 13 ? 1 : nextMonth;
      calendarDays.push({
        day: i,
        date: `${nextYear}-${String(actualMonth).padStart(2, '0')}-${String(i).padStart(2, '0')}`,
        currentMonth: false
      });
    }
    
    this.setData({ calendarDays });
    
    // 加载每天的心情数据
    this.loadDailyMoods(calendarDays);
  },

  // 加载每天的心情数据
  loadDailyMoods: function(calendarDays) {
    const records = wx.getStorageSync('diary_records') || [];
    const moodMap = {};
    
    records.forEach(record => {
      const date = record.date.split(' ')[0]; // 只取日期部分
      moodMap[date] = {
        value: record.mood,
        icon: this.data.moodTypes.find(m => m.value === record.mood)?.icon
      };
    });
    
    calendarDays.forEach(day => {
      day.mood = moodMap[day.date];
    });
    
    this.setData({ calendarDays });
  },

  // 加载月度数据
  loadMonthData: function() {
    const records = wx.getStorageSync('diary_records') || [];
    
    // 过滤当月记录
    const monthRecords = this.filterMonthRecords(records);
    
    // 计算心情统计
    this.calculateMoodStats(monthRecords);
    
    // 生成标签云
    this.generateTagCloud(monthRecords);
    
    // 绘制趋势图表
    this.drawTrendChart(monthRecords);
  },

  // 过滤当月记录
  filterMonthRecords: function(records) {
    const [year, month] = this.data.currentMonth.split('-');
    return records.filter(record => {
      const recordDate = new Date(record.date);
      return recordDate.getFullYear() === parseInt(year) && 
             recordDate.getMonth() + 1 === parseInt(month);
    });
  },

  // 计算心情统计
  calculateMoodStats: function(records) {
    const moodStats = this.data.moodTypes.map(type => ({
      ...type,
      count: 0
    }));

    records.forEach(record => {
      const moodIndex = moodStats.findIndex(m => m.value === record.mood);
      if (moodIndex > -1) {
        moodStats[moodIndex].count++;
      }
    });

    this.setData({ moodStats });
  },

  // 生成标签云
  generateTagCloud: function(records) {
    const tagCount = {};
    records.forEach(record => {
      (record.tags || []).forEach(tag => {
        tagCount[tag] = (tagCount[tag] || 0) + 1;
      });
    });

    const maxCount = Math.max(...Object.values(tagCount), 1);
    const minSize = 24;
    const maxSize = 40;

    const tagCloud = Object.entries(tagCount)
      .map(([name, count]) => ({
        name,
        size: minSize + (count / maxCount) * (maxSize - minSize)
      }))
      .sort((a, b) => b.size - a.size)
      .slice(0, 20); // 最多显示20个标签

    this.setData({ tagCloud });
  },

  // 绘制趋势图表
  drawTrendChart: function(records) {
    if (records.length === 0) {
      // 如果没有记录，显示提示信息
      this.setData({
        trendChartEmpty: true
      });
      return;
    }

    this.setData({
      trendChartEmpty: false
    });

    const query = wx.createSelectorQuery();
    query.select('#trendChart')
      .fields({ node: true, size: true })
      .exec((res) => {
        const canvas = res[0].node;
        const ctx = canvas.getContext('2d');

        // 设置canvas尺寸
        const dpr = wx.getSystemInfoSync().pixelRatio;
        canvas.width = res[0].width * dpr;
        canvas.height = res[0].height * dpr;
        ctx.scale(dpr, dpr);

        // 按日期排序
        records.sort((a, b) => new Date(a.date) - new Date(b.date));

        // 准备图表数据
        const categories = records.map(r => r.date.split('-')[2]); // 日期
        const series = [{
          name: '心情指数',
          data: records.map(r => 6 - r.mood), // 转换心情值为指数：1->5, 2->4, 3->3, 4->2, 5->1
          color: '#91d5ff'
        }];

        try {
          // 创建图表
          new wxCharts({
            canvas: canvas,
            context: ctx,
            type: 'line',
            categories: categories,
            series: series,
            width: res[0].width,
            height: res[0].height,
            dataLabel: true,
            dataPointShape: true,
            extra: {
              lineStyle: 'curve',
              tooltip: {
                showBox: true,
                borderWidth: 1,
                borderRadius: 4
              }
            },
            xAxis: {
              disableGrid: true,
              gridColor: '#cccccc',
              fontColor: '#666666',
              rotateLabel: false,
              title: '日期',
              titleFontSize: 12
            },
            yAxis: {
              gridColor: '#cccccc',
              fontColor: '#666666',
              min: 1,
              max: 5,
              step: 1,
              format: function(val) {
                return ['糟糕', '低落', '一般', '不错', '很好'][val - 1];
              },
              title: '心情',
              titleFontSize: 12
            },
            legend: false,
            animation: true,
            background: '#ffffff',
            enableScroll: true,
            touchMoveLimit: 60
          });
        } catch (error) {
          console.error('绘制图表失败:', error);
          this.setData({
            trendChartError: true
          });
        }
      });
  },

  // 选择日期
  selectDay: function(e) {
    const date = e.currentTarget.dataset.date;
    wx.navigateTo({
      url: `/pages/diary/diary?date=${date}`
    });
  }
}) 