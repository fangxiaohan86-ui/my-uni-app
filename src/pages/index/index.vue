<template>
  <view>

    <!-- 首次填写信息 -->
    <view v-if="!profileCompleted" class="profile-box">
      <view class="title">请填写您的信息</view>

      <input v-model="name" placeholder="请输入姓名" />
      <input v-model="phone" placeholder="请输入联系电话" />

      <button @click="saveProfile">保存信息</button>
    </view>

    <!-- 正常页面 -->
    <view v-else class="container">

      <view class="title">今日饮食打卡</view>

      <!-- 上传图片 -->
      <button @click="chooseImage">上传照片（最多3张）</button>

      <!-- 多图预览 -->
      <view v-if="imageUrl.length">
        <image
          v-for="(img, index) in imageUrl"
          :key="index"
          :src="img"
          class="preview"
          mode="aspectFill"
        />
      </view>

      <!-- 输入内容 -->
      <textarea
        v-model="note"
        placeholder="今天吃了什么..."
      />

      <button @click="saveRecord">保存打卡</button>

      <button @click="goHistory">查看历史记录</button>

      <button @click="goStats">查看统计</button>

    </view>

  </view>
</template>

<script setup>
import { ref, onMounted } from "vue"
import { supabase } from "../../supabase"

const name = ref("")
const phone = ref("")
const note = ref("")
const imageUrl = ref([])
const records = ref([])
const profileCompleted = ref(false)

// 页面加载
onMounted(async () => {
  // 匿名登录
  const { data } = await supabase.auth.getSession()

  if (!data.session) {
    await supabase.auth.signInAnonymously()
  }

  // 检查是否已填写信息
  const savedName = localStorage.getItem("user_name")
  const savedPhone = localStorage.getItem("user_phone")

  if (savedName && savedPhone) {
    name.value = savedName
    phone.value = savedPhone
    profileCompleted.value = true
  }

  loadRecords()
})

// 保存用户信息
const saveProfile = () => {
  if (!name.value || !phone.value) {
    uni.showToast({
      title: "请填写完整信息",
      icon: "none"
    })
    return
  }

  localStorage.setItem("user_name", name.value)
  localStorage.setItem("user_phone", phone.value)

  profileCompleted.value = true
}

// 选择图片（最多3张）
const chooseImage = () => {
  uni.chooseImage({
    count: 3,
    success: (res) => {
      imageUrl.value = res.tempFilePaths
    }
  })
}
const saveRecord = async () => {

  const { data: sessionData } = await supabase.auth.getSession()

  if (!sessionData.session) {
    uni.showToast({ title: "未登录", icon: "none" })
    return
  }

  const userId = sessionData.session.user.id

  let uploadedUrls = []

  for (let i = 0; i < imageUrl.value.length; i++) {

    const file = imageUrl.value[i]
    const response = await fetch(file)
    const blob = await response.blob()

    const fileName = `${userId}/${Date.now()}-${i}.jpg`

    const { error } = await supabase.storage
      .from("images")
      .upload(fileName, blob)

    if (error) {
      console.log("上传失败:", error)
      continue
    }

    uploadedUrls.push(fileName)
  }

  const { error: insertError } = await supabase
    .from("diet_records")
    .insert([{
      note: note.value,
      image: JSON.stringify(uploadedUrls),
      time: new Date().toISOString(),
      user_id: userId,
      name: name.value,
      phone: phone.value
    }])

  if (insertError) {
    console.log(insertError)
    uni.showToast({ title: "保存失败", icon: "none" })
    return
  }

  uni.showToast({ title: "✅ 打卡成功", icon: "success" })

  note.value = ""
  imageUrl.value = []
}
// 加载记录
const loadRecords = async () => {
  const { data } = await supabase
    .from("diet_records")
    .select("*")
    .order("id", { ascending: false })

  if (data) {
    records.value = data
  }
}

// 跳转
const goHistory = () => {
  uni.navigateTo({ url: "/pages/history/history" })
}

const goStats = () => {
  uni.navigateTo({ url: "/pages/stats/stats" })
}
</script>

<style>
.container {
  padding: 20px;
  font-size: 20px;
  background: #f5f7fa;
  min-height: 100vh;
}

.title {
  font-size: 28px;
  font-weight: bold;
  margin-bottom: 20px;
}

textarea {
  font-size: 20px;
  padding: 15px;
  border-radius: 8px;
  border: 1px solid #ccc;
  width: 100%;
  margin-top: 10px;
}

button {
  font-size: 22px;
  padding: 18px;
  border-radius: 12px;
  margin-top: 14px;
  font-weight: bold;
  color: white;
  border: none;
  background: #43a047;
}

.preview {
  width: 100%;
  height: 150px;
  margin-top: 8px;
  border-radius: 8px;
}
.profile-box {
  padding: 20px;
}
</style>
