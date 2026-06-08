<template>
  <view class="container">
    <view class="title">📊 打卡统计</view>

    <view class="card">
      <view>总打卡次数：</view>
      <view class="big">{{ total }}</view>
    </view>

    <view class="card">
      <view>连续打卡天数：</view>
      <view class="big">{{ streak }}</view>
    </view>

    <view class="card">
      <view>今日是否已打卡：</view>
      <view class="big">
        {{ todayChecked ? "✅ 已打卡" : "❌ 未打卡" }}
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from "vue"
import { supabase } from "../../supabase"

const total = ref(0)
const streak = ref(0)
const todayChecked = ref(false)

const loadStats = async () => {
  const { data } = await supabase
    .from("diet_records")
    .select("*")
    .order("time", { ascending: false })

  if (!data) return

  total.value = data.length

  const today = new Date().toLocaleDateString()

  const dates = data.map(item =>
    new Date(item.time).toLocaleDateString()
  )

  todayChecked.value = dates.includes(today)

  let count = 0
  let currentDate = new Date()

  while (true) {
    const checkDate = currentDate.toLocaleDateString()
    if (dates.includes(checkDate)) {
      count++
      currentDate.setDate(currentDate.getDate() - 1)
    } else {
      break
    }
  }

  streak.value = count
}

onMounted(() => {
  loadStats()
})
</script>

<style>
.container {
  padding: 20px;
}
.title {
  font-size: 20px;
  font-weight: bold;
}
.card {
  margin-top: 20px;
  padding: 15px;
  border: 1px solid #eee;
  border-radius: 8px;
}
.big {
  font-size: 28px;
  font-weight: bold;
}
</style>