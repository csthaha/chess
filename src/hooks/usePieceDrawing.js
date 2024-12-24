export const usePieceDrawing = (cellSize) => {
  const drawPiece = (ctx, col, row, piece, offset, showMoveNumber = false, moveCount = 0) => {
    const x = offset + col * cellSize.value;
    const y = offset + row * cellSize.value;
    const radius = cellSize.value * 0.48;

    // 绘制阴影
    drawShadow(ctx, x, y, radius);
    
    // 绘制棋子主体
    drawPieceBody(ctx, x, y, radius, piece);
    
    // 添加高光效果
    drawHighlight(ctx, x, y, radius, piece);

    // 如果开启了显示落子顺序，绘制数字
    if (showMoveNumber) {
      drawMoveNumber(ctx, x, y, moveCount, piece, cellSize.value);
    }
  };

  const drawShadow = (ctx, x, y, radius) => {
    ctx.beginPath();
    ctx.arc(x + 2, y + 2, radius, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
    ctx.fill();
  };

  const drawPieceBody = (ctx, x, y, radius, piece) => {
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    
    const gradient = ctx.createRadialGradient(
      x - radius/3, y - radius/3, radius/10,
      x, y, radius
    );

    if (piece === 1) { // 黑子
      gradient.addColorStop(0, '#666');
      gradient.addColorStop(0.3, '#111');
      gradient.addColorStop(1, '#000');
    } else { // 白子
      gradient.addColorStop(0, '#fff');
      gradient.addColorStop(0.3, '#f0f0f0');
      gradient.addColorStop(1, '#ddd');
    }

    ctx.fillStyle = gradient;
    ctx.fill();

    // 为白子添加边框
    if (piece === 2) {
      ctx.strokeStyle = '#999';
      ctx.lineWidth = 1;
      ctx.stroke();
    }
  };

  const drawHighlight = (ctx, x, y, radius, piece) => {
    ctx.beginPath();
    ctx.arc(x - radius/3, y - radius/3, radius/4, 0, Math.PI * 2);
    ctx.fillStyle = piece === 1 ? 'rgba(255, 255, 255, 0.2)' : 'rgba(255, 255, 255, 0.8)';
    ctx.fill();
  };

  const drawMoveNumber = (ctx, x, y, moveCount, piece, cellSize) => {
    ctx.font = `bold ${cellSize * 0.38}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = piece === 1 ? '#fff' : '#000';
    ctx.fillText(moveCount.toString(), x, y);
  };

  return {
    drawPiece
  };
}; 