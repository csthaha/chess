<!-- src/components/Gobang.vue -->
<template>
  <div 
    class="game-container"
    @contextmenu="handleContextMenu"
  >
    <GameTips
      ref="gameTips"
      :currentPlayer="currentPlayer"
      :moveCount="moveCount"
      :lastMove="lastMove"
      :isWinningPattern="isWinningPattern"
      :patternName="patternName"
      :board="board"
      :moveHistory="moveHistory"
    />
    <div class="game-content">
      <div class="game-left">
        <canvas
          ref="canvas"
          :width="canvasWidth"
          :height="canvasHeight"
          @mousemove="handleMouseMove"
          @click="handleClick"
          @mouseout="handleMouseOut"
        ></canvas>
        <GameTimer :currentPlayer="currentPlayer" ref="gameTimer" />
      </div>
      <div class="game-right">
        <GameStats ref="gameStats" />
        <GameRecord 
          :moveHistory="moveHistory"
          :boardSize="boardSize"
        />
        <GameControls
          :moveCount="moveCount"
          :canRedo="redoHistory.length > 0"
          @undo="undoLastMove"
          @redo="redoLastMove"
          @regret="regretMove"
          @reset="resetBoard"
          @surrender="surrender"
        />
        <SettingsPanel @update="handleSettingsUpdate" />
      </div>
    </div>
    <ContextMenu
      v-if="showContextMenu"
      :position="contextMenuPosition"
      :moveCount="moveCount"
      :canRedo="redoHistory.length > 0"
      @action="handleMenuClick"
      @close="showContextMenu = false"
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
import { useConfetti } from '../hooks/useConfetti';
import { useGameOperations } from '../hooks/useGameOperations';
import GameControls from './GameControls.vue';
import ContextMenu from './ContextMenu.vue';
import GameTimer from './GameTimer.vue';
import GameStats from './GameStats.vue';
import GameTips from './GameTips.vue';
import GameRecord from './GameRecord.vue';

const canvas = ref(null);
const boardSize = 15;

// 使用各个 hooks
const {
  board,
  currentPlayer,
  moveCount,
  moveHistory,
  gameSettings,
  resetGame,
  switchPlayer,
  incrementMoveCount,
  addMove,
  updateSettings
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
const { createConfetti, updateConfetti } = useConfetti(canvasWidth, canvasHeight);
let animationFrameId = null;

// 添加右键菜单状态
const showContextMenu = ref(false);
const contextMenuPosition = ref({ x: 0, y: 0 });

// 添加鼠标悬停状态
const hoverPosition = ref({ row: -1, col: -1 });
const lastMove = ref({ row: -1, col: -1 });

// 添加重做历史记录
const redoHistory = ref([]);

// 添加存储获胜棋子位置的数组
const winningPieces = ref([]);

// 添加重做函数
const redoMove = () => {
  if (redoHistory.value.length > 0) {
    const nextMove = redoHistory.value.pop();
    moveHistory.value.push(nextMove);
    return nextMove;
  }
  return null;
};

// 处理右键点击
const handleContextMenu = (event) => {
  event.preventDefault();
  showContextMenu.value = true;
  contextMenuPosition.value = {
    x: event.clientX,
    y: event.clientY
  };
};

// 处理菜单项点击
const handleMenuClick = (action) => {
  switch (action) {
    case 'undo':
      undoLastMove();
      break;
    case 'regret':
      regretMove();
      break;
    case 'reset':
      resetBoard();
      break;
    case 'surrender':
      surrender();
      break;
  }
  showContextMenu.value = false;
};

// 处理鼠标移动
const handleMouseMove = (event) => {
  const rect = canvas.value.getBoundingClientRect();
  const offset = cellSize.value;
  
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;

  const col = Math.round((x - offset) / offset);
  const row = Math.round((y - offset) / offset);

  if (
    row >= 0 && 
    row < boardSize && 
    col >= 0 && 
    col < boardSize && 
    board.value[row][col] === 0
  ) {
    hoverPosition.value = { row, col };
    initBoard(); // 重绘棋盘
    drawHoverPiece(row, col); // 绘制悬停效果
  } else {
    hoverPosition.value = { row: -1, col: -1 };
    initBoard();
  }
};

// 处理鼠标移出
const handleMouseOut = () => {
  hoverPosition.value = { row: -1, col: -1 };
  initBoard();
};

// 绘制悬停效果
const drawHoverPiece = (row, col) => {
  const ctx = canvas.value.getContext('2d');
  const offset = cellSize.value;
  const x = offset + col * cellSize.value;
  const y = offset + row * cellSize.value;
  const radius = cellSize.value * 0.48;

  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fillStyle = currentPlayer.value === 1 ? 
    'rgba(0, 0, 0, 0.3)' : 
    'rgba(255, 255, 255, 0.3)';
  ctx.fill();
  
  if (currentPlayer.value === 2) {
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.lineWidth = 1;
    ctx.stroke();
  }
};

// 先声明 initBoard 函数
const initBoard = () => {
  if (!canvas.value) return;
  
  const ctx = canvas.value.getContext('2d');
  const offset = cellSize.value;
  
  drawBoard(ctx, offset);
  if (gameSettings.value.showCoordinates) {
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
      gameSettings.value.showMoveNumbers,
      index + 1
    );
    
    // 如果是最后一步，绘制标记
    if (index === moveHistory.value.length - 1) {
      drawLastMoveMarker(ctx, move.col, move.row, offset);
    }
  });
};

// 只保留一个 watch
watch(() => gameSettings.value, () => {
  initBoard();
}, { deep: true, immediate: true });

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
    redoHistory.value = []; // 清空重做历史
    board.value[row][col] = currentPlayer.value;
    lastMove.value = { row, col }; // 记录最后一步
    
    drawPiece(
      ctx, 
      col, 
      row, 
      currentPlayer.value, 
      offset, 
      gameSettings.value.showMoveNumbers,
      moveCount.value + 1
    );
    
    // 绘制最后一步的标记
    drawLastMoveMarker(ctx, col, row, offset);
    
    if (gameSettings.value.soundEnabled) {
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

// 添加最后一步标记的绘制函数
const drawLastMoveMarker = (ctx, col, row, offset) => {
  const x = offset + col * cellSize.value;
  const y = offset + row * cellSize.value;
  const radius = cellSize.value * 0.48;
  
  ctx.beginPath();
  ctx.arc(x, y, radius + 2, 0, Math.PI * 2);
  ctx.strokeStyle = '#ff4d4f';
  ctx.lineWidth = 2;
  ctx.stroke();
};

// 检查胜利
const checkWin = (row, col) => {
  if (currentPlayer.value === 1) {
    const isForbidden = checkForbiddenMove(row, col);
    if (isForbidden) {
      message.error('黑禁手，白胜！');
      startWinAnimation(2);
      return true;
    }
  }

  const directions = [
    [1, 0],   // 水平
    [0, 1],   // 垂直
    [1, 1],   // 右下斜
    [1, -1]   // 右上斜
  ];

  for (const [dx, dy] of directions) {
    let count = 1;
    const pieces = [[row, col]]; // 记录连珠的位置

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
      pieces.push([newRow, newCol]);
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
      pieces.unshift([newRow, newCol]);
    }

    // 判断是否胜利
    if (count >= 5) {
      winningPieces.value = pieces;
      animateWinningPieces();
      setTimeout(() => {
        message.success(`${currentPlayer.value === 1 ? '黑' : '白'}子胜！`);
        startWinAnimation(currentPlayer.value);
      }, 1500); // 等动画播放一会后再显示胜利
      return true;
    }
  }
  return false;
};

// 添加获胜棋子的动画函数
const animateWinningPieces = () => {
  const ctx = canvas.value.getContext('2d');
  const offset = cellSize.value;
  let frame = 0;
  
  const animate = () => {
    // 重绘棋盘
    initBoard();
    
    // 给获胜的五子添加特效
    winningPieces.value.forEach(([row, col], index) => {
      const x = offset + col * cellSize.value;
      const y = offset + row * cellSize.value;
      const radius = cellSize.value * 0.45;
      
      // 绘制光环
      const glowSize = Math.sin(frame * 0.1 + index) * 4 + 8; // 光环大小随时间变化
      ctx.beginPath();
      ctx.arc(x, y, radius + glowSize, 0, Math.PI * 2);
      ctx.strokeStyle = currentPlayer.value === 1 ? 
        'rgba(255, 215, 0, 0.6)' : 'rgba(255, 215, 0, 0.6)';
      ctx.lineWidth = 3;
      ctx.stroke();
      
      // 绘制闪烁效果
      ctx.beginPath();
      ctx.arc(x, y, radius - 2, 0, Math.PI * 2);
      ctx.fillStyle = currentPlayer.value === 1 ? 
        `rgba(0, 0, 0, ${0.8 + Math.sin(frame * 0.2 + index) * 0.2})` : 
        `rgba(255, 255, 255, ${0.8 + Math.sin(frame * 0.2 + index) * 0.2})`;
      ctx.fill();
      
      if (currentPlayer.value === 2) {
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    });
    
    frame++;
    if (frame < 60) { // 动画持续约1秒
      requestAnimationFrame(animate);
    }
  };
  
  animate();
};

// 添加胜利动画函数
const startWinAnimation = (winner) => {
  // 在棋盘中心创建粒子效果
  const centerX = canvasWidth.value / 2;
  const centerY = canvasHeight.value / 2;
  createConfetti(centerX, centerY);

  // 开始动画循环
  const animate = () => {
    const ctx = canvas.value.getContext('2d');
    
    // 重绘棋盘
    initBoard();
    
    // 更新和绘制粒子
    const hasParticles = updateConfetti(ctx);
    
    if (hasParticles) {
      animationFrameId = requestAnimationFrame(animate);
    } else {
      cancelAnimationFrame(animationFrameId);
      resetGame();
      initBoard();
    }
  };

  animate();
};

// 在 setup 中使用
const {
  undoLastMove,
  redoLastMove,
  regretMove,
  surrender,
  resetBoard
} = useGameOperations(
  moveCount,
  currentPlayer,
  redoMove,
  switchPlayer,
  board,
  resetGame,
  initBoard,
  startWinAnimation
);

defineExpose({
  resetBoard,
});

onMounted(() => {
  initBoard();
  document.addEventListener('click', (event) => {
    if (!event.target.closest('.context-menu')) {
      showContextMenu.value = false;
    }
  });
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', adjustCanvasSize);
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
  }
});

// 添加设置更新处理函数
const handleSettingsUpdate = (newSettings) => {
  gameSettings.value = {
    ...gameSettings.value,
    ...newSettings
  };
};
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

.context-menu {
  position: fixed;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.15);
  padding: 8px 0;
  min-width: 160px;
  z-index: 1000;
  animation: fadeIn 0.15s ease-out;
}

.context-menu-item {
  padding: 8px 16px;
  display: flex;
  align-items: center;
  cursor: pointer;
  transition: all 0.2s ease;
  color: #333;
  font-size: 14px;
}

.context-menu-item:hover {
  background: #f5f5f5;
  color: #00b96b;
}

.context-menu-item.danger {
  color: #ff4d4f;
}

.context-menu-item.danger:hover {
  background: #fff1f0;
  color: #ff4d4f;
}

.menu-icon {
  margin-right: 8px;
  font-size: 16px;
  width: 20px;
  text-align: center;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.game-left {
  display: flex;
  flex-direction: column;
  gap: 20px;
}
</style>