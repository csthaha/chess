<template>
  <a-card class="record-card" :bordered="false">
    <template #title>
      <span class="record-title">
        <FileTextOutlined class="record-icon" />
        对局记录
      </span>
    </template>
    
    <div class="moves-list">
      <a-timeline>
        <a-timeline-item 
          v-for="(move, index) in moveHistory" 
          :key="index"
          :color="move.player === 1 ? 'black' : 'gray'"
        >
          <template #dot>
            <span class="piece-dot">{{ move.player === 1 ? '⚫' : '⚪' }}</span>
          </template>
          第{{ index + 1 }}手: {{ formatPosition(move) }}
        </a-timeline-item>
      </a-timeline>
    </div>

    <div class="record-actions">
      <a-button-group>
        <a-button 
          type="primary" 
          @click="exportPGN"
          :icon="h(FileOutlined)"
        >
          导出棋谱
        </a-button>
        <a-button 
          @click="copyToClipboard"
          :icon="h(CopyOutlined)"
        >
          复制坐标
        </a-button>
      </a-button-group>
    </div>
  </a-card>
</template>

<script setup>
import { computed, h } from 'vue';
import { message } from 'ant-design-vue';
import { 
  FileTextOutlined, 
  FileOutlined, 
  CopyOutlined 
} from '@ant-design/icons-vue';

const props = defineProps({
  moveHistory: {
    type: Array,
    required: true
  },
  boardSize: {
    type: Number,
    default: 15
  }
});

// 将坐标转换为字母+数字格式（类似象棋记谱）
const formatPosition = (move) => {
  const col = String.fromCharCode(65 + move.col); // A-O
  const row = props.boardSize - move.row; // 15-1
  return `${col}${row}`;
};

// 生成PGN格式棋谱
const generatePGN = () => {
  const date = new Date().toISOString().split('T')[0];
  let pgn = [
    '[Event "五子棋对局"]',
    `[Date "${date}"]`,
    '[Black "黑方"]',
    '[White "白方"]',
    '[Board "15x15"]',
    '',
    ''
  ];

  props.moveHistory.forEach((move, index) => {
    const moveNum = Math.floor(index / 2) + 1;
    const position = formatPosition(move);
    
    if (index % 2 === 0) {
      pgn.push(`${moveNum}. ${position}`);
    } else {
      pgn[pgn.length - 1] += ` ${position}`;
    }
  });

  return pgn.join('\n');
};

// 导出PGN文件
const exportPGN = () => {
  const pgn = generatePGN();
  const blob = new Blob([pgn], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `game_${new Date().getTime()}.pgn`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  message.success('棋谱导出成功！');
};

// 复制坐标到剪贴板
const copyToClipboard = async () => {
  const moves = props.moveHistory
    .map((move, index) => `${index + 1}. ${formatPosition(move)}`)
    .join('\n');
    
  try {
    await navigator.clipboard.writeText(moves);
    message.success('已复制到剪贴板！');
  } catch (err) {
    message.error('复制失败，请手动复制。');
  }
};
</script>

<style scoped>
.record-card {
  margin: 20px 0;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.record-title {
  display: flex;
  align-items: center;
  font-size: 16px;
  font-weight: 600;
}

.record-icon {
  margin-right: 8px;
  color: #1890ff;
}

.moves-list {
  max-height: 300px;
  overflow-y: auto;
  margin-bottom: 16px;
  padding-right: 8px;
}

.piece-dot {
  font-size: 12px;
}

.record-actions {
  display: flex;
  justify-content: center;
  gap: 8px;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #f0f0f0;
}

:deep(.ant-timeline-item) {
  padding-bottom: 12px;
}

:deep(.ant-timeline-item-content) {
  font-family: 'Monaco', monospace;
}
</style> 