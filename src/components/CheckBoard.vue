<!-- src/components/Gobang.vue -->
<template>
  <div class="game-container">
    <div class="game-content">
      <div class="gobang">
        <canvas
          ref="canvas" 
          :width="canvasWidth" 
          :height="canvasHeight" 
          @click="handleClick"
        >
        </canvas>
      </div>
      <div class="control-panel">
        <h3 class="panel-title">游戏控制</h3>
        <div class="button-group">
          <button class="control-btn undo" @click="undoLastMove" :disabled="moveCount === 0">
            <span class="btn-icon">↩</span>
            回退上一步
          </button>
          <button class="control-btn regret" @click="regretMove" :disabled="moveCount === 0">
            <span class="btn-icon">⟲</span>
            悔棋
          </button>
          <button class="control-btn reset" @click="resetBoard">
            <span class="btn-icon">⟳</span>
            重新开始
          </button>
          <button class="control-btn surrender" @click="surrender">
            <span class="btn-icon">⚑</span>
            认输
          </button>
        </div>
      </div>
    </div>
    <SettingsPanel
      v-model:showMoveNumbers="showMoveNumbers"
      v-model:showCoordinates="showCoordinates"
      v-model:soundEnabled="soundEnabled"
      @reset="resetBoard"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from 'vue';
import { message, Modal } from 'ant-design-vue';
import { useForbiddenMove } from '../hooks/useForbiddenMove';
import { useGameState } from '../hooks/useGameState';
import { useGameBoard } from '../hooks/useGameBoard';
import { usePieceDrawing } from '../hooks/usePieceDrawing';
import { useAudio } from '../hooks/useAudio';
import SettingsPanel from './SettingsPanel.vue';

const canvas = ref(null);
const boardSize = 15;

// 使用各个 hooks
const {
  board,
  currentPlayer,
  moveCount,
  showMoveNumbers,
  resetGame,
  switchPlayer,
  incrementMoveCount,
  moveHistory,
  addMove,
  undoMove,
} = useGameState(boardSize);

const {
  canvasWidth,
  canvasHeight,
  cellSize,
  drawBoard,
  drawCoordinates,
  drawStarPoints,
} = useGameBoard(boardSize);

const { drawPiece } = usePieceDrawing(cellSize);
const { checkForbiddenMove } = useForbiddenMove(board, boardSize);
const { playDownSound } = useAudio();

// 添加新的状态
const showCoordinates = ref(true);
const soundEnabled = ref(true);

// 监听坐标显示变化
watch(showCoordinates, () => {
  initBoard();
});

// 初始化棋盘
const initBoard = () => {
  const ctx = canvas.value.getContext('2d');
  const offset = cellSize.value;
  
  drawBoard(ctx, offset);
  if (showCoordinates.value) {
    drawCoordinates(ctx, offset);
  }
  drawStarPoints(ctx, offset);

  // 重绘所有棋子
  moveHistory.value.forEach((move, index) => {
    drawPiece(
      ctx,
      move.col,
      move.row,
      move.player,
      offset,
      showMoveNumbers.value,
      index + 1
    );
  });
};

// 处理点击事件
const handleClick = (event) => {
  const ctx = canvas.value.getContext('2d');
  const rect = canvas.value.getBoundingClientRect();
  const offset = cellSize.value;
  
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;

  const col = Math.round((x - offset) / offset);
  const row = Math.round((y - offset) / offset);

  if (row >= 0 && row < boardSize && col >= 0 && col < boardSize && board.value[row][col] === 0) {
    board.value[row][col] = currentPlayer.value;
    drawPiece(ctx, col, row, currentPlayer.value, offset, showMoveNumbers.value, moveCount.value + 1);
    
    // 根据设置决定是否播放音效
    if (soundEnabled.value) {
      playDownSound();
    }
    
    // 记录这步棋
    addMove({ row, col, player: currentPlayer.value });
    
    if (!checkWin(row, col)) {
      incrementMoveCount();
      switchPlayer();
    }
  }
};

// 检查胜利
const checkWin = (row, col) => {
  if (currentPlayer.value === 1) {
    const isForbidden = checkForbiddenMove(row, col);
    if (isForbidden) {
      message.error('黑禁手，白胜！');
      resetGame();
      initBoard();
      return true;
    }
  }

  const directions = [
    [1, 0],   // 水平
    [0, 1],   // 垂直
    [1, 1],   // 右下斜
    [1, -1],  // 右上斜
  ];

  for (const [dx, dy] of directions) {
    let count = 1;  // 当前位置算1个
    
    // 正向检查
    for (let i = 1; i < 5; i++) {
      const newRow = row + dy * i;
      const newCol = col + dx * i;
      if (
        newRow < 0 || 
        newRow >= boardSize || 
        newCol < 0 || 
        newCol >= boardSize || 
        board.value[newRow][newCol] !== currentPlayer.value
      ) {
        break;
      }
      count++;
    }

    // 反向检查
    for (let i = 1; i < 5; i++) {
      const newRow = row - dy * i;
      const newCol = col - dx * i;
      if (
        newRow < 0 || 
        newRow >= boardSize || 
        newCol < 0 || 
        newCol >= boardSize || 
        board.value[newRow][newCol] !== currentPlayer.value
      ) {
        break;
      }
      count++;
    }

    // 判断是否胜利
    if (count >= 5) {
      setTimeout(() => {
        message.success(`${currentPlayer.value === 1 ? '黑' : '白'}子胜！`);
        resetGame();
        initBoard();
      }, 100);
      return true;
    }
  }
  return false;
};

// 重置棋盘
const resetBoard = () => {
  resetGame();
  initBoard();
};

// 添加新的功能函数
const undoLastMove = () => {
  if (moveCount.value > 0) {
    const lastMove = undoMove();
    if (lastMove) {
      board.value[lastMove.row][lastMove.col] = 0;
      initBoard();
      // 重绘所有棋子
      moveHistory.value.forEach((move, index) => {
        const ctx = canvas.value.getContext('2d');
        drawPiece(ctx, move.col, move.row, move.player, cellSize.value, showMoveNumbers.value, index + 1);
      });
      switchPlayer();
    }
  }
};

const regretMove = () => {
  if (moveCount.value > 0) {
    Modal.confirm({
      title: '确认悔棋',
      content: '确定要悔棋吗？',
      okText: '确定',
      cancelText: '取消',
      onOk() {
        undoLastMove();
      }
    });
  }
};

const surrender = () => {
  Modal.confirm({
    title: '确认认输',
    content: `${currentPlayer.value === 1 ? '黑' : '白'}方确定要认输吗？`,
    okText: '确定',
    cancelText: '取消',
    onOk() {
      message.success(`${currentPlayer.value === 1 ? '白' : '黑'}方获胜！`);
      resetBoard();
    }
  });
};

defineExpose({
  resetBoard,
  showMoveNumbers,
});

onMounted(() => {
  initBoard();
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', adjustCanvasSize);
});
</script>

<style scoped>
.game-container {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  padding: 20px;
}

.game-content {
  display: flex;
  gap: 40px;
  background: white;
  padding: 30px;
  border-radius: 20px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

.gobang {
  position: relative;
}

canvas {
  display: block;
  border-radius: 12px;
  background-color: #e4b170;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  transition: transform 0.3s ease;
}

/* canvas:hover {
  transform: translateY(-2px);
} */

.control-panel {
  display: flex;
  flex-direction: column;
  min-width: 200px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.panel-title {
  margin: 0 0 20px 0;
  color: #2c3e50;
  font-size: 1.2em;
  font-weight: 600;
  text-align: center;
  padding-bottom: 10px;
  border-bottom: 2px solid #e9ecef;
}

.button-group {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.control-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 20px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  color: white;
  position: relative;
  overflow: hidden;
}

.btn-icon {
  font-size: 16px;
}

.control-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    120deg,
    transparent,
    rgba(255, 255, 255, 0.2),
    transparent
  );
  transition: 0.5s;
}

.control-btn:hover::before {
  left: 100%;
}

.control-btn.undo {
  background: #4a90e2;
}

.control-btn.regret {
  background: #f39c12;
}

.control-btn.reset {
  background: #2ecc71;
}

.control-btn.surrender {
  background: #e74c3c;
}

.control-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.control-btn:active {
  transform: translateY(0);
}

.control-btn:disabled {
  background-color: #bdc3c7;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.control-btn:disabled::before {
  display: none;
}

@media (max-width: 900px) {
  .game-content {
    flex-direction: column;
    align-items: center;
    padding: 20px;
  }

  .control-panel {
    width: 100%;
    max-width: 400px;
  }
}
</style>