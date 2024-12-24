import { ref } from 'vue';

export const useGameBoard = (boardSize = 15) => {
  const cellSize = ref(35);
  const canvasWidth = ref(600);
  const canvasHeight = ref(600);

  const drawBoard = (ctx, offset) => {
    ctx.clearRect(0, 0, canvasWidth.value, canvasHeight.value);

    // 绘制木纹背景
    const gradient = ctx.createLinearGradient(0, 0, canvasWidth.value, canvasHeight.value);
    gradient.addColorStop(0, '#e4b170');
    gradient.addColorStop(0.5, '#dea963');
    gradient.addColorStop(1, '#e4b170');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvasWidth.value, canvasHeight.value);
    
    // 绘制网格线
    drawGridLines(ctx, offset);
  };

  const drawGridLines = (ctx, offset) => {
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.lineWidth = 0.8;

    // 绘制内部网格线
    for (let i = 0; i < boardSize; i++) {
      ctx.beginPath();
      ctx.moveTo(offset, offset + i * cellSize.value);
      ctx.lineTo(offset + (boardSize - 1) * cellSize.value, offset + i * cellSize.value);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(offset + i * cellSize.value, offset);
      ctx.lineTo(offset + i * cellSize.value, offset + (boardSize - 1) * cellSize.value);
      ctx.stroke();
    }
  };

  const drawCoordinates = (ctx, offset) => {
    ctx.font = '14px Arial';
    ctx.fillStyle = '#000';
    ctx.textAlign = 'center';
    
    // 横向字母坐标 (A-O)
    for (let i = 0; i < boardSize; i++) {
      const letter = String.fromCharCode(65 + i);
      ctx.fillText(
        letter, 
        offset + i * cellSize.value, 
        offset + (boardSize - 1) * cellSize.value + 25
      );
    }

    // 纵向数字坐标 (1-15)
    ctx.textAlign = 'right';
    for (let i = 0; i < boardSize; i++) {
      ctx.fillText(
        (i + 1).toString(), 
        offset - 10, 
        offset + i * cellSize.value + 5
      );
    }
  };

  const drawStarPoints = (ctx, offset) => {
    const points = [
      [3, 3], [11, 3], [3, 11], [11, 11], [7, 7],
      [3, 7], [11, 7], [7, 3], [7, 11]
    ];

    points.forEach(([x, y]) => {
      ctx.beginPath();
      ctx.arc(offset + x * cellSize.value, offset + y * cellSize.value, 3, 0, Math.PI * 2);
      ctx.fillStyle = '#000';
      ctx.fill();
    });
  };

  return {
    canvasWidth,
    canvasHeight,
    cellSize,
    drawBoard,
    drawCoordinates,
    drawStarPoints,
  };
}; 