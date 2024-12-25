<template>
  <div class="control-panel">
    <h3 class="panel-title">游戏控制</h3>
    <div class="button-group">
      <div class="undo-redo-group">
        <button class="control-btn undo" @click="$emit('undo')" :disabled="moveCount === 0">
          <span class="btn-icon">↩</span>
          回退
        </button>
        <button class="control-btn redo" @click="$emit('redo')" :disabled="!canRedo">
          <span class="btn-icon">↪</span>
          下一步
        </button>
      </div>
      <button class="control-btn regret" @click="$emit('regret')" :disabled="moveCount === 0">
        <span class="btn-icon">⟲</span>
        悔棋
      </button>
      <button class="control-btn reset" @click="$emit('reset')">
        <span class="btn-icon">⟳</span>
        重新开始
      </button>
      <button class="control-btn surrender" @click="$emit('surrender')">
        <span class="btn-icon">⚑</span>
        认输
      </button>
    </div>
  </div>
</template>

<script setup>
defineProps({
  moveCount: {
    type: Number,
    required: true
  },
  canRedo: {
    type: Boolean,
    required: true
  }
});

defineEmits(['undo', 'redo', 'regret', 'reset', 'surrender']);
</script>

<style scoped>
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

.control-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.control-btn.undo {
  background: linear-gradient(145deg, #3498db, #2980b9);
}

.control-btn.regret {
  background: linear-gradient(145deg, #e67e22, #d35400);
}

.control-btn.reset {
  background: linear-gradient(145deg, #2ecc71, #27ae60);
}

.control-btn.surrender {
  background: linear-gradient(145deg, #e74c3c, #c0392b);
}

.control-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.control-btn:active:not(:disabled) {
  transform: translateY(0);
}

.btn-icon {
  font-size: 16px;
}

/* 添加按钮点击波纹效果 */
.control-btn::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 5px;
  height: 5px;
  background: rgba(255, 255, 255, 0.5);
  opacity: 0;
  border-radius: 100%;
  transform: scale(1, 1) translate(-50%);
  transform-origin: 50% 50%;
}

.control-btn:focus:not(:active)::after {
  animation: ripple 1s ease-out;
}

@keyframes ripple {
  0% {
    transform: scale(0, 0);
    opacity: 0.5;
  }
  100% {
    transform: scale(20, 20);
    opacity: 0;
  }
}

.undo-redo-group {
  display: flex;
  gap: 8px;
}

.control-btn.redo {
  background: linear-gradient(145deg, #3498db, #2980b9);
}
</style> 