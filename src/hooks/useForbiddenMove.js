import { ref } from 'vue';

export const useForbiddenMove = (board, boardSize) => {
  // 辅助函数：匹配模式
  const matchPattern = (sequence, pattern) => {
    if (sequence.length !== pattern.length) return false;
    return sequence.every((val, idx) => val === pattern[idx]);
  };

  // 检查活三
  const isOpenThree = (row, col, directionPair) => {
    const [[dx1, dy1]] = directionPair;
    let sequence = [];
    let startRow = row;
    let startCol = col;
    
    // 找到序列的起始点
    for (let i = 0; i < 4; i++) {
      const newRow = row + dy1 * i;
      const newCol = col + dx1 * i;
      if (newRow < 0 || newRow >= boardSize || newCol < 0 || newCol >= boardSize) break;
      startRow = newRow;
      startCol = newCol;
    }
    
    // 从起始点开始收集序列
    for (let i = 0; i < 7; i++) {
      const checkRow = startRow - dy1 * i;
      const checkCol = startCol - dx1 * i;
      if (checkRow < 0 || checkRow >= boardSize || checkCol < 0 || checkCol >= boardSize) break;
      sequence.push(board.value[checkRow][checkCol]);
    }
    
    // 活三的标准模式
    const liveThreePatterns = [
      [0, 1, 1, 1, 0],     // ○●●●○
      [0, 1, 1, 0, 1, 0],  // ○●●○●○
      [0, 1, 0, 1, 1, 0],  // ○●○●●○
    ];
    
    // 检查每个可能的子序列
    for (let i = 0; i <= sequence.length - 5; i++) {
      const subSeq = sequence.slice(i, i + 6);
      for (const pattern of liveThreePatterns) {
        if (matchPattern(subSeq, pattern)) {
          return true;
        }
      }
    }
    
    return false;
  };

  // 检查四子
  const isFour = (row, col, directionPair) => {
    const [[dx1, dy1]] = directionPair;
    let sequence = [];
    
    // 收集方向上的序列
    for (let i = -4; i <= 4; i++) {
      const newRow = row + dy1 * i;
      const newCol = col + dx1 * i;
      if (newRow < 0 || newRow >= boardSize || newCol < 0 || newCol >= boardSize) continue;
      sequence.push(board.value[newRow][newCol]);
    }
    
    // 四子的标准模式
    const fourPatterns = [
      [0, 1, 1, 1, 1, 0],     // ○●●●●○
      [1, 1, 1, 0, 1],        // ●●●○●
      [1, 1, 0, 1, 1],        // ●●○●●
      [1, 0, 1, 1, 1],        // ●○●●●
    ];
    
    // 检查每个可能的子序列
    for (let i = 0; i <= sequence.length - 5; i++) {
      const subSeq = sequence.slice(i, i + 6);
      for (const pattern of fourPatterns) {
        if (matchPattern(subSeq, pattern)) {
          return true;
        }
      }
    }
    
    return false;
  };

  // 检查三三禁手
  const checkDoubleThree = (row, col) => {
    const directions = [
      [[1, 0], [-1, 0]], // 水平
      [[0, 1], [0, -1]], // 垂直
      [[1, 1], [-1, -1]], // 右下斜
      [[1, -1], [-1, 1]] // 右上斜
    ];
    
    let openThreeCount = 0;
    
    // 临时在棋盘上放置黑子
    board.value[row][col] = 1;
    
    for (const directionPair of directions) {
      if (isOpenThree(row, col, directionPair)) {
        openThreeCount++;
        if (openThreeCount >= 2) {
          board.value[row][col] = 0; // 恢复棋盘
          return true;
        }
      }
    }
    
    board.value[row][col] = 0; // 恢复棋盘
    return false;
  };

  // 检查四四禁手
  const checkDoubleFour = (row, col) => {
    const directions = [
      [[1, 0], [-1, 0]], // 水平
      [[0, 1], [0, -1]], // 垂直
      [[1, 1], [-1, -1]], // 右下斜
      [[1, -1], [-1, 1]] // 右上斜
    ];
    
    let fourCount = 0;
    
    // 临时在棋盘上放置黑子
    board.value[row][col] = 1;
    
    for (const directionPair of directions) {
      if (isFour(row, col, directionPair)) {
        fourCount++;
        if (fourCount >= 2) {
          board.value[row][col] = 0; // 恢复棋盘
          return true;
        }
      }
    }
    
    board.value[row][col] = 0; // 恢复棋盘
    return false;
  };

  // 检查长连禁手
  const checkOverline = (row, col) => {
    const directions = [
      [1, 0],   // 水平
      [0, 1],   // 垂直
      [1, 1],   // 右下斜
      [1, -1],  // 右上斜
    ];

    for (const [dx, dy] of directions) {
      let count = 1;
      
      // 正向检查
      for (let i = 1; i < 6; i++) {
        const newRow = row + dy * i;
        const newCol = col + dx * i;
        if (
          newRow < 0 || 
          newRow >= boardSize || 
          newCol < 0 || 
          newCol >= boardSize || 
          board.value[newRow][newCol] !== 1
        ) break;
        count++;
      }
      
      // 反向检查
      for (let i = 1; i < 6; i++) {
        const newRow = row - dy * i;
        const newCol = col - dx * i;
        if (
          newRow < 0 || 
          newRow >= boardSize || 
          newCol < 0 || 
          newCol >= boardSize || 
          board.value[newRow][newCol] !== 1
        ) break;
        count++;
      }
      
      if (count > 5) return true;
    }
    
    return false;
  };

  // 检查禁手
  const checkForbiddenMove = (row, col) => {
    const isForbidden = checkDoubleThree(row, col) || 
      checkDoubleFour(row, col) || 
      checkOverline(row, col);

    return isForbidden;
  };

  return {
    checkForbiddenMove
  };
}; 