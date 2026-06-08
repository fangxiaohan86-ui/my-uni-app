<template>
 <view v-for="item in records" :key="item.id">

  <image
    v-if="item.image_url"
    :src="item.image_url"
    mode="widthFix"
    style="width: 100%;"
  />

  <view>{{ item.note }}</view>

</view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from '@/supabase.js'

const records = ref([])

/* ✅ 获取历史记录 */
const loadRecords = async () => {

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return

  const { data, error } = await supabase
    .from('diet_records')
    .select('*')
    .eq('user_id', user.id)   // ✅ 只查自己的
    .order('time', { ascending: false })

  if (error) {
    console.log(error)
    return
  }

  for (let item of data) {

    if (!item.image) continue

    const images = JSON.parse(item.image)

    if (images.length > 0) {

      const { data: urlData } = await supabase.storage
        .from('images')
        .createSignedUrl(images[0], 60)

      item.image_url = urlData?.signedUrl
    }
  }

  records.value = data
}


onMounted(() => {
  loadRecords()
})
</script>

<style>
.container {
  padding: 20px;
}
.title {
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 15px;
}
.record {
  margin-bottom: 20px;
  border-bottom: 1px solid #eee;
  padding-bottom: 10px;
}
.img {
  width: 100%;
  height: 150px;
}
.note {
  margin-top: 5px;
}
.time {
  font-size: 12px;
  color: gray;
}
</style>