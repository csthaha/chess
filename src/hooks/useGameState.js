import { ref } from 'vue';

export const useGameState = (boardSize = 15) => {
  const board = ref(Array.from({ length: boardSize }, () => Array(boardSize).fill(0)));
  const currentPlayer = ref(1); // 1 for black, 2 for white
  const moveCount = ref(0);
  const moveHistory = ref([]); // 记录移动历史
  const isFinish = ref(false);

  // 游戏设置状态
  const gameSettings = ref({
    showMoveNumbers: false,
    showCoordinates: false,
    soundEnabled: false
  });

  const resetGame = () => {
    board.value = Array.from({ length: boardSize }, () => Array(boardSize).fill(0));
    moveCount.value = 0;
    currentPlayer.value = 1;
    moveHistory.value = [];
    isFinish.value = false;
  };

  const switchPlayer = () => {
    currentPlayer.value = currentPlayer.value === 1 ? 2 : 1;
  };

  const incrementMoveCount = () => {
    moveCount.value++;
  };

  // 新增：添加移动记录
  const addMove = (move) => {
    moveHistory.value.push(move);
  };

  // 新增：撤销最后一步
  const undoMove = () => {
    if (moveHistory.value.length > 0) {
      const lastMove = moveHistory.value.pop();
      moveCount.value--;
      return lastMove;
    }
    return null;
  };

  const updateSettings = (settings) => {
    gameSettings.value = {
      ...gameSettings.value,
      ...settings
    };
  };

  return {
    board,
    isFinish,
    currentPlayer,
    moveCount,
    moveHistory,
    gameSettings,
    resetGame,
    switchPlayer,
    incrementMoveCount,
    addMove,
    undoMove,
    updateSettings
  };
}; 