// 判断是否必胜开

import { ref } from 'vue';

// 判断是否是花月
const isHuaYue = (moveHistory) => {
    if (moveHistory.length < 3) return false;
    
    // 前三颗即可判断
    const first = moveHistory[0];
    const second = moveHistory[1];
    const third = moveHistory[2];

    // 花月形态：三个点呈"L"形，间隔一格
    if (first.row === second.row && second.col === third.col) {
        return Math.abs(first.col - second.col) === 2 && Math.abs(second.row - third.row) === 2;
    }
    if (first.col === second.col && second.row === third.row) {
        return Math.abs(first.row - second.row) === 2 && Math.abs(second.col - third.col) === 2;
    }
    return false;
}

// 判断是否是蒲月
const isPuYue = (moveHistory) => {
    if (moveHistory.length < 3) return false;
    
    // 前三颗即可判断
    const first = moveHistory[0];
    const second = moveHistory[1];
    const third = moveHistory[2];

    // 蒲月形态：三个点呈"L"形，第二、三手相邻
    if (first.row === second.row) {
        return Math.abs(first.col - second.col) === 2 && 
               Math.abs(second.row - third.row) === 1 && 
               Math.abs(second.col - third.col) === 1;
    }
    if (first.col === second.col) {
        return Math.abs(first.row - second.row) === 2 && 
               Math.abs(second.row - third.row) === 1 && 
               Math.abs(second.col - third.col) === 1;
    }
    return false;
}

// 判断是否是雨月
const isYuYue = (moveHistory) => {
    if (moveHistory.length < 3) return false;
    
    const first = moveHistory[0];
    const second = moveHistory[1];
    const third = moveHistory[2];

    // 雨月形态：三个点呈直线形，间隔一格
    return (first.row === second.row && second.row === third.row && 
            Math.abs(first.col - second.col) === 2 && Math.abs(second.col - third.col) === 2) ||
           (first.col === second.col && second.col === third.col && 
            Math.abs(first.row - second.row) === 2 && Math.abs(second.row - third.row) === 2);
}

// 判断是否是浦月
const isPuuYue = (moveHistory) => {
    if (moveHistory.length < 3) return false;
    
    const first = moveHistory[0];
    const second = moveHistory[1];
    const third = moveHistory[2];

    // 浦月形态：三个点呈"L"形，第一、二手相邻
    return (Math.abs(first.row - second.row) === 1 && 
            Math.abs(first.col - second.col) === 1 && 
            ((first.row === third.row && Math.abs(first.col - third.col) === 2) ||
             (first.col === third.col && Math.abs(first.row - third.row) === 2)));
}

export const useJudgeWin = () => {
  // 检查是否是必胜开局
  const check = (moveHistory) => {
    if (moveHistory.length < 3) return { isWinningPattern: false };
    
    const patterns = {
      isHuaYue: isHuaYue(moveHistory),
      isPuYue: isPuYue(moveHistory),
      isYuYue: isYuYue(moveHistory),
      isPuuYue: isPuuYue(moveHistory)
    };

    const isWinningPattern = Object.values(patterns).some(value => value);
    const patternName = Object.entries(patterns).find(([_, value]) => value)?.[0];

    return {
      isWinningPattern,
      patternName: patternName ? patternName.replace('is', '') : null
    };
  }

  return {
    check
  };
};
