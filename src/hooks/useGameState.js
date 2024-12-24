import { ref } from 'vue';

export const useGameState = (boardSize = 15) => {
  const board = ref(Array.from({ length: boardSize }, () => Array(boardSize).fill(0)));
  const currentPlayer = ref(1); // 1 for black, 2 for white
  const moveCount = ref(0);
  const showMoveNumbers = ref(true);
  const moveHistory = ref([]); // 新增：记录移动历史

  const resetGame = () => {
    board.value = Array.from({ length: boardSize }, () => Array(boardSize).fill(0));
    moveCount.value = 0;
    currentPlayer.value = 1;
    moveHistory.value = []; // 清空历史记录
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

  return {
    board,
    currentPlayer,
    moveCount,
    showMoveNumbers,
    moveHistory, // 新增
    resetGame,
    switchPlayer,
    incrementMoveCount,
    addMove, // 新增
    undoMove, // 新增
  };
}; 