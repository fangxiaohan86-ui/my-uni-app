<script setup>
import { onMounted } from "vue"
import { supabase } from "./supabase"

onMounted(async () => {
  const { data } = await supabase.auth.getSession()

  if (!data.session) {
    await supabase.auth.signInAnonymously()
  }
})
</script>

<template>
  <slot />
</template>