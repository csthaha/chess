import { ref } from 'vue';

// 胜利时的粒子效果钩子函数
export const useConfetti = (canvasWidth, canvasHeight) => {
  // 存储所有粒子的数组
  const particles = ref([]);
  // 重力加速度
  const gravity = 0.5;
  // 空气阻力（摩擦系数）
  const friction = 0.99;
  // 粒子可能的颜色数组
  const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff'];

  // 粒子类：定义单个粒子的属性和行为
  class Particle {
    constructor(x, y) {
      // 粒子的初始位置
      this.x = x;
      this.y = y;
      // 随机大小（4-12像素）
      this.size = Math.random() * 8 + 4;
      // 随机水平速度（-6到6）
      this.speedX = Math.random() * 12 - 6;
      // 随机垂直速度（-20到-5，向上）
      this.speedY = Math.random() * -15 - 5;
      // 随机选择颜色
      this.color = colors[Math.floor(Math.random() * colors.length)];
      // 随机初始旋转角度
      this.rotation = Math.random() * Math.PI * 2;
      // 随机旋转速度
      this.rotationSpeed = (Math.random() - 0.5) * 0.2;
    }

    // 更新粒子状态
    update() {
      // 应用重力
      this.speedY += gravity;
      // 应用空气阻力
      this.speedX *= friction;
      // 更新位置
      this.x += this.speedX;
      this.y += this.speedY;
      // 更新旋转角度
      this.rotation += this.rotationSpeed;
      // 如果粒子还在画布内则返回true，否则返回false
      return this.y < canvasHeight.value;
    }

    // 绘制粒子
    draw(ctx) {
      ctx.save();
      // 移动到粒子位置
      ctx.translate(this.x, this.y);
      // 应用旋转
      ctx.rotate(this.rotation);
      // 设置颜色
      ctx.fillStyle = this.color;
      // 绘制矩形粒子（以中心点为基准）
      ctx.fillRect(-this.size / 2, -this.size / 2, this.size, this.size);
      ctx.restore();
    }
  }

  // 创建粒子效果
  const createConfetti = (x, y, amount = 100) => {
    // 在指定位置创建指定数量的粒子
    for (let i = 0; i < amount; i++) {
      particles.value.push(new Particle(x, y));
    }
  };

  // 更新并绘制所有粒子
  const updateConfetti = (ctx) => {
    // 如果没有粒子，返回false
    if (particles.value.length === 0) return false;

    ctx.save();
    // 更新粒子状态，并移除超出画布的粒子
    particles.value = particles.value.filter(particle => particle.update());
    // 绘制所有存活的粒子
    particles.value.forEach(particle => particle.draw(ctx));
    ctx.restore();

    // 返回是否还有粒子在画布内
    return particles.value.length > 0;
  };

  // 返回创建和更新粒子的方法
  return {
    createConfetti,
    updateConfetti
  };
}; 