import { message, Modal } from 'ant-design-vue';

export const useGameOperations = (
  moveCount,
  currentPlayer,
  undoMove,
  redoMove,
  switchPlayer,
  board,
  resetGame,
  initBoard,
  startWinAnimation
) => {
  // 回退一步
  const undoLastMove = () => {
    if (moveCount.value > 0) {
      const lastMove = undoMove();
      console.log(555, moveCount.value, lastMove);
      if (lastMove) {
        board.value[lastMove.row][lastMove.col] = 0;
        initBoard();
        switchPlayer();
      }
    }
  };

  // 添加下一步功能
  const redoLastMove = () => {
    const nextMove = redoMove();
    if (nextMove) {
      board.value[nextMove.row][nextMove.col] = nextMove.player;
      initBoard();
      switchPlayer();
    }
  };

  // 悔棋
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

  // 认输
  const surrender = () => {
    Modal.confirm({
      title: '确认认输',
      content: `${currentPlayer.value === 1 ? '黑' : '白'}方确定要认输吗？`,
      okText: '确定',
      cancelText: '取消',
      onOk() {
        message.success(`${currentPlayer.value === 1 ? '白' : '黑'}方获胜！`);
        startWinAnimation(currentPlayer.value === 1 ? 2 : 1);
      }
    });
  };

  // 重置棋盘
  const resetBoard = () => {
    resetGame();
    initBoard();
  };

  return {
    undoLastMove,
    redoLastMove,
    regretMove,
    surrender,
    resetBoard
  };
}; 