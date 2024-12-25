<template>
  <div 
    class="context-menu"
    :style="{ 
      left: position.x + 'px', 
      top: position.y + 'px' 
    }"
  >
    <div class="menu-section">
      <div class="context-menu-item undo" @click="handleClick('undo')" :class="{ disabled: moveCount === 0 }">
        <span class="menu-icon">↩</span>
        <div class="menu-content">
          <span class="menu-title">回退</span>
          <span class="menu-desc">返回上一步</span>
        </div>
      </div>
      <div class="context-menu-item redo" @click="handleClick('redo')" :class="{ disabled: !canRedo }">
        <span class="menu-icon">↪</span>
        <div class="menu-content">
          <span class="menu-title">下一步</span>
          <span class="menu-desc">恢复已回退的步骤</span>
        </div>
      </div>
    </div>

    <div class="menu-divider"></div>

    <div class="menu-section">
      <div class="context-menu-item regret" @click="handleClick('regret')" :class="{ disabled: moveCount === 0 }">
        <span class="menu-icon">⟲</span>
        <div class="menu-content">
          <span class="menu-title">悔棋</span>
          <span class="menu-desc">重新下这一步</span>
        </div>
      </div>
      <div class="context-menu-item reset" @click="handleClick('reset')">
        <span class="menu-icon">⟳</span>
        <div class="menu-content">
          <span class="menu-title">重新开始</span>
          <span class="menu-desc">清空棋盘重新对局</span>
        </div>
      </div>
      <div class="context-menu-item surrender" @click="handleClick('surrender')">
        <span class="menu-icon">⚑</span>
        <div class="menu-content">
          <span class="menu-title">认输</span>
          <span class="menu-desc">结束当前对局</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  position: {
    type: Object,
    required: true
  },
  moveCount: {
    type: Number,
    required: true
  },
  canRedo: {
    type: Boolean,
    required: true
  }
});

const emit = defineEmits(['action', 'close']);

const handleClick = (action) => {
  emit('action', action);
  emit('close');
};
</script>

<style scoped>
.context-menu {
  position: fixed;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  padding: 8px;
  min-width: 240px;
  z-index: 1000;
  animation: slideIn 0.2s ease-out;
  border: 1px solid rgba(0, 0, 0, 0.08);
}

.menu-section {
  padding: 4px;
}

.menu-divider {
  height: 1px;
  background: rgba(0, 0, 0, 0.08);
  margin: 4px 8px;
}

.context-menu-item {
  padding: 10px 12px;
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  margin: 2px;
  border-radius: 12px;
  position: relative;
  overflow: hidden;
}

.menu-icon {
  font-size: 18px;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  transition: transform 0.2s ease;
}

.menu-content {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.menu-title {
  font-weight: 500;
  font-size: 14px;
  color: white;
}

.menu-desc {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.8);
}

.context-menu-item:hover:not(.disabled) {
  transform: translateX(4px);
}

.context-menu-item:hover:not(.disabled) .menu-icon {
  transform: scale(1.1) rotate(10deg);
}

.context-menu-item:active:not(.disabled) {
  transform: translateX(2px);
}

.context-menu-item::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 100%;
  height: 100%;
  background: radial-gradient(circle, rgba(255,255,255,0.2) 0%, transparent 70%);
  transform: translate(-50%, -50%) scale(0);
  transition: transform 0.3s ease-out;
  pointer-events: none;
}

.context-menu-item:hover::before {
  transform: translate(-50%, -50%) scale(2);
}

.context-menu-item.undo { background: linear-gradient(135deg, #3498db, #2980b9); }
.context-menu-item.redo { background: linear-gradient(135deg, #3498db, #2980b9); }
.context-menu-item.regret { background: linear-gradient(135deg, #e67e22, #d35400); }
.context-menu-item.reset { background: linear-gradient(135deg, #2ecc71, #27ae60); }
.context-menu-item.surrender { background: linear-gradient(135deg, #e74c3c, #c0392b); }

.context-menu-item.disabled {
  opacity: 0.5;
  cursor: not-allowed;
  filter: grayscale(50%);
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(10px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* 添加响应式设计 */
@media (max-width: 768px) {
  .context-menu {
    min-width: 200px;
  }
  
  .menu-desc {
    display: none;
  }
}
</style> 