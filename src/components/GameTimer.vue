<template>
  <div class="timer-container">
    <div class="timer-card">
      <div class="timer-header">
        <span class="timer-icon">⏱</span>
        <span class="timer-title">对局计时</span>
      </div>
      <div class="timer-display">
        <div class="time-block">
          <span class="time-value">{{ formatTime(minutes) }}</span>
          <span class="time-label">分</span>
        </div>
        <div class="time-separator">:</div>
        <div class="time-block">
          <span class="time-value">{{ formatTime(seconds) }}</span>
          <span class="time-label">秒</span>
        </div>
      </div>
      <div class="player-times">
        <div class="player-time" :class="{ active: currentPlayer === 1 }">
          <span class="player-icon">⚫</span>
          <span class="player-label">黑方思考时间</span>
          <span class="player-timer">{{ formatPlayerTime(blackTime) }}</span>
        </div>
        <div class="player-time" :class="{ active: currentPlayer === 2 }">
          <span class="player-icon">⚪</span>
          <span class="player-label">白方思考时间</span>
          <span class="player-timer">{{ formatPlayerTime(whiteTime) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue';

const props = defineProps({
  currentPlayer: {
    type: Number,
    required: true
  }
});

const minutes = ref(0);
const seconds = ref(0);
const blackTime = ref(0);
const whiteTime = ref(0);
let intervalId = null;

const formatTime = (value) => {
  return value.toString().padStart(2, '0');
};

const formatPlayerTime = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${formatTime(mins)}:${formatTime(secs)}`;
};

const updateTime = () => {
  seconds.value++;
  if (seconds.value >= 60) {
    minutes.value++;
    seconds.value = 0;
  }
  
  // 更新当前玩家的思考时间
  if (props.currentPlayer === 1) {
    blackTime.value++;
  } else {
    whiteTime.value++;
  }
};

// 监听玩家变化，添加过渡动画
watch(() => props.currentPlayer, (newPlayer, oldPlayer) => {
  if (newPlayer !== oldPlayer) {
    // 可以在这里添加额外的动画逻辑
  }
});

onMounted(() => {
  intervalId = setInterval(updateTime, 1000);
});

onUnmounted(() => {
  if (intervalId) {
    clearInterval(intervalId);
  }
});
</script>

<style scoped>
.timer-container {
  margin: 20px 0;
}

.timer-card {
  background: white;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  min-width: 240px;
}

.timer-header {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
  color: #2c3e50;
}

.timer-icon {
  font-size: 24px;
  margin-right: 8px;
}

.timer-title {
  font-size: 18px;
  font-weight: 600;
}

.timer-display {
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 20px 0;
  padding: 16px;
  background: linear-gradient(145deg, #f0f0f0, #ffffff);
  border-radius: 12px;
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.05);
}

.time-block {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.time-value {
  font-size: 32px;
  font-weight: 700;
  font-family: 'Monaco', monospace;
  color: #2c3e50;
  text-shadow: 1px 1px 0 rgba(255, 255, 255, 0.5);
}

.time-label {
  font-size: 12px;
  color: #666;
  margin-top: 4px;
}

.time-separator {
  font-size: 32px;
  font-weight: 700;
  margin: 0 12px;
  color: #2c3e50;
  animation: blink 1s infinite;
}

.player-times {
  margin-top: 16px;
}

.player-time {
  display: flex;
  align-items: center;
  padding: 12px;
  margin: 8px 0;
  border-radius: 8px;
  transition: all 0.3s ease;
  background: rgba(0, 0, 0, 0.02);
}

.player-time.active {
  background: rgba(52, 152, 219, 0.1);
  transform: translateX(8px);
  box-shadow: 0 2px 8px rgba(52, 152, 219, 0.1);
}

.player-icon {
  font-size: 16px;
  margin-right: 8px;
}

.player-label {
  flex: 1;
  font-size: 14px;
  color: #666;
}

.player-timer {
  font-family: 'Monaco', monospace;
  font-weight: 600;
  color: #2c3e50;
}

@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

/* 添加响应式设计 */
@media (max-width: 768px) {
  .timer-card {
    min-width: 200px;
  }

  .time-value {
    font-size: 28px;
  }

  .player-label {
    font-size: 12px;
  }
}
</style> 