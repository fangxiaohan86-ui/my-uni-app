<template>
  <view class="container">

    <view class="title">👑 管理后台</view>

    <view class="summary">
      总记录数：{{ records.length }}
    </view>

    <!-- 每人打卡次数 -->
    <view class="section">
      <view class="section-title">📊 每人打卡次数</view>

      <view v-for="user in sortedCountList" :key="user.name">
        {{ user.name }}：{{ user.count }} 次
      </view>
    </view>

    <!-- 打卡天数排行榜 -->
    <view class="section">
      <view class="section-title">🏆 打卡排行榜</view>

      <view v-for="user in sortedDayList" :key="user.name">
        {{ user.name }}：{{ user.days }} 天
      </view>
    </view>

    <!-- 所有记录 -->
    <view class="section">
      <view class="section-title">📋 所有记录</view>

      <view v-for="item in records" :key="item.id" class="record">

        <view><b>姓名：</b>{{ item.name || "未填写" }}</view>
        <view><b>电话：</b>{{ item.phone || "未填写" }}</view>
        <view><b>内容：</b>{{ item.note }}</view>
        <view><b>时间：</b>{{ item.time }}</view>
<view v-if="item.image">
  <image
    v-for="(img, index) in parseImages(item.image)"
    :key="index"
    :src="img"
    class="preview"
  />
</view>
        <!-- 多图显示 -->
        <view v-if="item.image">
          <image
            v-for="(img, index) in parseImages(item.image)"
            :key="index"
            :src="img"
            class="preview"
          />
        </view>

      </view>
    </view>

  </view>
</template>

<script setup>
import { ref, onMounted, computed } from "vue"
import { supabase } from "../../supabase"

const records = ref([])

// 加载数据
const loadData = async () => {
  const { data } = await supabase
    .from("diet_records")
    .select("*")
    .order("id", { ascending: false })

  if (data) {
    records.value = data
  }
}

onMounted(() => {
  loadData()
})

/* ✅ 统计每人打卡次数 */
const sortedCountList = computed(() => {
  const map = {}

  records.value.forEach(item => {
    const name = item.name || "未填写"

    if (!map[name]) {
      map[name] = 1
    } else {
      map[name]++
    }
  })

  return Object.keys(map)
    .map(name => ({
      name,
      count: map[name]
    }))
    .sort((a, b) => b.count - a.count)
})

/* ✅ 统计每人打卡天数 */
const sortedDayList = computed(() => {
  const map = {}

  records.value.forEach(item => {
    const name = item.name || "未填写"
    const date = new Date(item.time).toLocaleDateString()

    if (!map[name]) {
      map[name] = new Set()
    }

    map[name].add(date)
  })

  const result = Object.keys(map).map(name => ({
    name,
    days: map[name].size
  }))

  return result.sort((a, b) => b.days - a.days)
})

/* ✅ 解析图片 */
const parseImages = (imageField) => {
  try {
    return JSON.parse(imageField)
  } catch {
    return []
  }
}
</script>

<style>
.container {
  padding: 20px;
}

.title {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 15px;
}

.section {
  margin-top: 25px;
}

.section-title {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 10px;
}

.record {
  margin-top: 15px;
  padding: 10px;
  border: 1px solid #eee;
  border-radius: 8px;
}

.preview {
  width: 100%;
  height: 150px;
  margin-top: 8px;
  border-radius: 8px;
  object-fit: cover;
}

.summary {
  font-size: 18px;
}
</style>