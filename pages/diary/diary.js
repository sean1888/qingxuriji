// 获取应用实例
const app = getApp()

Page({
  data: {
    date: '',
    moodList: [],
    selectedMood: null,
    intensity: 3,
    content: '',
    tags: ['工作', '学习', '家庭', '社交', '运动', '娱乐'],
    selectedTags: [],
    images: []
  },

  onLoad(options) {
    // 设置当前日期
    const today = new Date()
    const date = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
    
    this.setData({
      date,
      moodList: app.globalData.moodList
    })

    // 如果是编辑模式，加载已有数据
    if (options.date) {
      this.loadDiaryData(options.date)
    }
  },

  // 日期选择
  dateChange(e) {
    this.setData({
      date: e.detail.value
    })
    this.loadDiaryData(e.detail.value)
  },

  // 选择心情
  selectMood(e) {
    const mood = e.currentTarget.dataset.mood
    this.setData({
      selectedMood: mood
    })
  },

  // 心情强度变化
  intensityChange(e) {
    this.setData({
      intensity: e.detail.value
    })
  },

  // 日记内容输入
  contentInput(e) {
    this.setData({
      content: e.detail.value
    })
  },

  // 切换标签
  toggleTag(e) {
    const tag = e.currentTarget.dataset.tag
    const selectedTags = [...this.data.selectedTags]
    const index = selectedTags.indexOf(tag)
    
    if (index > -1) {
      selectedTags.splice(index, 1)
    } else {
      selectedTags.push(tag)
    }
    
    this.setData({
      selectedTags
    })
  },

  // 显示添加标签输入框
  showAddTag() {
    wx.showModal({
      title: '添加标签',
      placeholderText: '请输入标签名称',
      editable: true,
      success: res => {
        if (res.confirm && res.content) {
          const tags = [...this.data.tags]
          if (!tags.includes(res.content)) {
            tags.push(res.content)
            this.setData({ tags })
          }
        }
      }
    })
  },

  // 选择图片
  chooseImage() {
    wx.chooseImage({
      count: 9 - this.data.images.length,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: res => {
        const images = [...this.data.images, ...res.tempFilePaths]
        this.setData({ images })
      }
    })
  },

  // 预览图片
  previewImage(e) {
    const current = e.currentTarget.dataset.url
    wx.previewImage({
      current,
      urls: this.data.images
    })
  },

  // 删除图片
  deleteImage(e) {
    const index = e.currentTarget.dataset.index
    const images = [...this.data.images]
    images.splice(index, 1)
    this.setData({ images })
  },

  // 加载日记数据
  loadDiaryData(date) {
    wx.getStorage({
      key: `diary_${date}`,
      success: res => {
        const data = res.data
        this.setData({
          selectedMood: data.mood,
          intensity: data.intensity,
          content: data.content,
          selectedTags: data.tags,
          images: data.images || []
        })
      }
    })
  },

  // 保存日记
  saveDiary() {
    if (!this.data.selectedMood) {
      wx.showToast({
        title: '请选择心情',
        icon: 'none'
      })
      return
    }

    const diaryData = {
      date: this.data.date,
      mood: this.data.selectedMood,
      intensity: this.data.intensity,
      content: this.data.content,
      tags: this.data.selectedTags,
      images: this.data.images,
      timestamp: new Date().getTime()
    }

    wx.setStorage({
      key: `diary_${this.data.date}`,
      data: diaryData,
      success: () => {
        wx.showToast({
          title: '保存成功',
          icon: 'success'
        })
        // 延迟返回上一页
        setTimeout(() => {
          wx.navigateBack()
        }, 1500)
      }
    })
  }
}) 