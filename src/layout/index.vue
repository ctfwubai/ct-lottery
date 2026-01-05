<script setup lang="ts">
import ToTop from '@/components/ToTop/index.vue'
import { useScroll } from '@vueuse/core'
import { useRouter } from 'vue-router'
import { ref } from 'vue'

const router = useRouter()
const mainContainer = ref<HTMLElement | null>(null)

const { y } = useScroll(mainContainer)

function scrollToTop() {
  y.value = 0
}

// 登出
function handleLogout() {
  if (confirm('确定要退出登录吗？')) {
    localStorage.removeItem('isLoggedIn')
    localStorage.removeItem('loginTime')
    router.push('/login')
  }
}
</script>

<template>
  <div class="w-screen">
    <!-- 登出按钮（右上角） -->
    <button class="logout-button" @click="handleLogout" title="退出登录">
      <span class="logout-icon">🚪</span>
    </button>

    <!-- <header class="shadow-2xl head-container h-14">
      <Header></Header>
    </header> -->
    <ToTop v-if="y > 400" @click="scrollToTop" />
    <main ref="mainContainer" class="box-content w-screen h-screen overflow-x-hidden overflow-y-auto main-container">
      <router-view class="h-full main-container-content" />
    </main>
    <!-- <footer class="w-screen footer-container">
      <Footer></Footer>
    </footer> -->
  </div>
</template>

<style scoped lang="scss">
.logout-button {
  position: fixed;
  top: 320px;
  right: 30px;
  z-index: 9999;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.9) 0%, rgba(118, 75, 162, 0.9) 100%);
  border: 2px solid #FFD700;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 0 15px rgba(255, 215, 0, 0.5);
  outline: none;
  animation: shimmer 2s ease-in-out infinite;
}

.logout-button:hover {
  transform: scale(1.1);
  box-shadow: 0 0 25px rgba(255, 215, 0, 0.8);
}

.logout-button:active {
  transform: scale(0.95);
}

.logout-icon {
  font-size: 24px;
  color: #FFD700;
  text-shadow: 0 0 10px rgba(255, 215, 0, 0.5);
}

@keyframes shimmer {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.85;
  }
}
</style>
