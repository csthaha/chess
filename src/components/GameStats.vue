<template>
  <a-card class="stats-card" :bordered="false">
    <template #title>
      <span class="stats-title">
        <TrophyOutlined class="stats-icon" />
        对局统计
      </span>
    </template>
    <a-row :gutter="[16, 16]">
      <a-col :span="12">
        <a-statistic
          title="黑方胜场"
          :value="stats.blackWins"
          :value-style="{ color: '#000' }"
        >
          <template #prefix>
            <CrownOutlined />
          </template>
        </a-statistic>
      </a-col>
      <a-col :span="12">
        <a-statistic
          title="白方胜场"
          :value="stats.whiteWins"
          :value-style="{ color: '#666' }"
        >
          <template #prefix>
            <CrownOutlined />
          </template>
        </a-statistic>
      </a-col>
      <a-col :span="12">
        <a-statistic
          title="平均用时"
          :value="formatTime(stats.averageTime)"
          :precision="1"
        >
          <template #prefix>
            <ClockCircleOutlined />
          </template>
        </a-statistic>
      </a-col>
      <a-col :span="12">
        <a-statistic
          title="最长对局"
          :value="formatTime(stats.longestGame)"
        >
          <template #prefix>
            <FieldTimeOutlined />
          </template>
        </a-statistic>
      </a-col>
    </a-row>
    <a-progress 
      :percent="winRate" 
      :stroke-color="{'0%': '#000', '100%': '#666'}"
      class="win-rate-progress"
    />
    <div class="win-rate-label">胜率分布</div>
  </a-card>
</template>

<script setup>
import { ref, computed } from 'vue';
import { 
  TrophyOutlined, 
  CrownOutlined, 
  ClockCircleOutlined,
  FieldTimeOutlined 
} from '@ant-design/icons-vue';

const stats = ref({
  blackWins: 0,
  whiteWins: 0,
  averageTime: 0,
  longestGame: 0
});

const winRate = computed(() => {
  const total = stats.value.blackWins + stats.value.whiteWins;
  return total ? Math.round((stats.value.blackWins / total) * 100) : 50;
});

const formatTime = (seconds) => {
  const minutes = Math.floor(seconds / 60);
  return `${minutes}'${seconds % 60}"`; 
};

// 导出更新统计的方法
const updateStats = (winner, gameTime) => {
  if (winner === 1) stats.value.blackWins++;
  else if (winner === 2) stats.value.whiteWins++;
  
  stats.value.averageTime = Math.round(
    (stats.value.averageTime * (stats.value.blackWins + stats.value.whiteWins - 1) + gameTime) / 
    (stats.value.blackWins + stats.value.whiteWins)
  );
  
  if (gameTime > stats.value.longestGame) {
    stats.value.longestGame = gameTime;
  }
};

defineExpose({ updateStats });
</script>

<style scoped>
.stats-card {
  margin: 20px 0;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.stats-title {
  display: flex;
  align-items: center;
  font-size: 16px;
  font-weight: 600;
}

.stats-icon {
  margin-right: 8px;
  color: #faad14;
}

.win-rate-progress {
  margin-top: 24px;
}

.win-rate-label {
  text-align: center;
  color: #666;
  margin-top: 8px;
  font-size: 14px;
}

:deep(.ant-statistic-title) {
  font-size: 14px;
  margin-bottom: 8px;
}

:deep(.ant-statistic-content) {
  font-size: 20px;
}
</style> 