<template>
  <div class="tips-container">
    <a-alert
      v-if="showTip"
      :message="tipTitle"
      :description="tipContent"
      :type="tipType"
      show-icon
      class="game-tip"
      @close="closeTip"
      closable
    />
    
    <a-popover
      v-if="showNextMoveTip"
      placement="right"
      trigger="hover"
      :open="showHint"
    >
      <template #content>
        <div class="hint-content">
          <div class="hint-title">{{ nextMoveTip }}</div>
          <div v-if="dangerLevel > 0" class="danger-indicator">
            <span>危险程度：</span>
            <a-rate 
              :value="dangerLevel" 
              :count="3" 
              disabled 
              class="danger-rate"
            />
          </div>
          <div v-if="suggestion" class="move-suggestion">
            <CheckCircleOutlined class="suggestion-icon" />
            {{ suggestion }}
          </div>
        </div>
      </template>
      <QuestionCircleOutlined 
        class="help-icon"
        :class="{ 'warning': dangerLevel > 0 }"
      />
    </a-popover>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { QuestionCircleOutlined, CheckCircleOutlined } from '@ant-design/icons-vue';

const props = defineProps({
  currentPlayer: Number,
  moveCount: Number,
  lastMove: Object,
  isWinningPattern: Boolean,
  patternName: String,
  board: Array,
  moveHistory: Array
});

const showTip = ref(false);
const tipType = ref('info');
const tipTitle = ref('');
const tipContent = ref('');
const showHint = ref(false);
const dangerLevel = ref(0);
const suggestion = ref('');

// 显示提示的条件
const showNextMoveTip = computed(() => {
  return props.moveCount > 0 && (
    props.moveCount < 5 || // 开局阶段
    dangerLevel.value > 0 || // 有危险
    props.isWinningPattern // 形成必胜型
  );
});

// 计算提示内容
const nextMoveTip = computed(() => {
  if (props.isWinningPattern) {
    return `当前局面形成${props.patternName}，黑方占优`;
  }
  if (dangerLevel.value > 0) {
    return `警告：${props.currentPlayer === 1 ? '黑' : '白'}方面临威胁`;
  }
  if (props.moveCount < 5) {
    return `开局阶段：轮到${props.currentPlayer === 1 ? '黑' : '白'}方落子`;
  }
  return `轮到${props.currentPlayer === 1 ? '黑' : '白'}方落子`;
});

// 分析局面
const analyzeSituation = () => {
  if (!props.board || !props.moveHistory) return;
  
  // 重置状态
  dangerLevel.value = 0;
  suggestion.value = '';
  
  // 检查连子情况
  const threats = findThreats();
  if (threats.length > 0) {
    dangerLevel.value = threats[0].level;
    suggestion.value = generateSuggestion(threats[0]);
    showHint.value = true;
  } else {
    showHint.value = false;
  }
};

// 寻找威胁
const findThreats = () => {
  const threats = [];
  const directions = [
    [1, 0], [0, 1], [1, 1], [1, -1] // 横、竖、正斜、反斜
  ];
  
  for (let row = 0; row < props.board.length; row++) {
    for (let col = 0; col < props.board[row].length; col++) {
      if (props.board[row][col] === 0) { // 空位
        directions.forEach(([dx, dy]) => {
          const count = checkDirection(row, col, dx, dy);
          if (count.consecutive >= 3) {
            threats.push({
              position: { row, col },
              count: count.consecutive,
              level: count.consecutive - 2,
              direction: getDirectionName(dx, dy)
            });
          }
        });
      }
    }
  }
  
  return threats.sort((a, b) => b.count - a.count);
};

// 检查某个方向的连子数
const checkDirection = (row, col, dx, dy) => {
  const opponent = props.currentPlayer === 1 ? 2 : 1;
  let consecutive = 0;
  let spaces = 0;
  
  // 正向检查
  for (let i = 1; i <= 4; i++) {
    const newRow = row + dy * i;
    const newCol = col + dx * i;
    if (!isValidPosition(newRow, newCol)) break;
    if (props.board[newRow][newCol] === opponent) {
      consecutive++;
    } else if (props.board[newRow][newCol] === 0) {
      spaces++;
      break;
    } else {
      break;
    }
  }
  
  // 反向检查
  for (let i = 1; i <= 4; i++) {
    const newRow = row - dy * i;
    const newCol = col - dx * i;
    if (!isValidPosition(newRow, newCol)) break;
    if (props.board[newRow][newCol] === opponent) {
      consecutive++;
    } else if (props.board[newRow][newCol] === 0) {
      spaces++;
      break;
    } else {
      break;
    }
  }
  
  return { consecutive, spaces };
};

// 生成建议
const generateSuggestion = (threat) => {
  const position = `${String.fromCharCode(65 + threat.position.col)}${15 - threat.position.row}`;
  return `建议在${position}位置落子，防止对手在${threat.direction}方向形成优势`;
};

// 辅助函数
const isValidPosition = (row, col) => {
  return row >= 0 && row < props.board.length && 
         col >= 0 && col < props.board.length;
};

const getDirectionName = (dx, dy) => {
  if (dx === 1 && dy === 0) return '横向';
  if (dx === 0 && dy === 1) return '纵向';
  if (dx === 1 && dy === 1) return '右斜';
  return '左斜';
};

// 监听局面变化
watch(
  [() => props.moveCount, () => props.lastMove],
  () => {
    analyzeSituation();
  }
);

const showGameTip = (title, content, type = 'info') => {
  tipTitle.value = title;
  tipContent.value = content;
  tipType.value = type;
  showTip.value = true;
};

const closeTip = () => {
  showTip.value = false;
};

defineExpose({ showGameTip });
</script>

<style scoped>
.tips-container {
  position: relative;
}

.game-tip {
  position: fixed;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 1000;
  min-width: 300px;
  animation: slideDown 0.3s ease-out;
}

.help-icon {
  position: fixed;
  right: 20px;
  bottom: 20px;
  font-size: 24px;
  color: #1890ff;
  cursor: pointer;
  transition: all 0.3s;
}

.help-icon.warning {
  color: #faad14;
  animation: pulse 2s infinite;
}

.hint-content {
  max-width: 300px;
  padding: 8px;
}

.hint-title {
  font-weight: 600;
  margin-bottom: 8px;
}

.danger-indicator {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 8px 0;
}

.danger-rate {
  color: #ff4d4f;
}

.move-suggestion {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 8px;
  padding: 8px;
  background: #f6ffed;
  border-radius: 4px;
}

.suggestion-icon {
  color: #52c41a;
}

@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.1); }
  100% { transform: scale(1); }
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translate(-50%, -20px);
  }
  to {
    opacity: 1;
    transform: translate(-50%, 0);
  }
}
</style> 