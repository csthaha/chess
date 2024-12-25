<template>
  <div 
    class="context-menu"
    :style="{ 
      left: position.x + 'px', 
      top: position.y + 'px' 
    }"
  >
    <div class="context-menu-item undo" @click="handleClick('undo')" :class="{ disabled: moveCount === 0 }">
      <span class="menu-icon">↩</span>
      回退
    </div>
    <div class="context-menu-item redo" @click="handleClick('redo')" :class="{ disabled: !canRedo }">
      <span class="menu-icon">↪</span>
      下一步
    </div>
    <div class="context-menu-item regret" @click="handleClick('regret')" :class="{ disabled: moveCount === 0 }">
      <span class="menu-icon">⟲</span>
      悔棋
    </div>
    <div class="context-menu-item reset" @click="handleClick('reset')">
      <span class="menu-icon">⟳</span>
      重新开始
    </div>
    <div class="context-menu-item surrender" @click="handleClick('surrender')">
      <span class="menu-icon">⚑</span>
      认输
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
  background: #f8f9fa;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  padding: 12px 0;
  min-width: 180px;
  z-index: 1000;
  animation: fadeIn 0.15s ease-out;
}

.context-menu-item {
  padding: 10px 16px;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  color: white;
  margin: 4px 8px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
}

.menu-icon {
  font-size: 16px;
}

.context-menu-item.undo {
  background: linear-gradient(145deg, #3498db, #2980b9);
}

.context-menu-item.regret {
  background: linear-gradient(145deg, #e67e22, #d35400);
}

.context-menu-item.reset {
  background: linear-gradient(145deg, #2ecc71, #27ae60);
}

.context-menu-item.surrender {
  background: linear-gradient(145deg, #e74c3c, #c0392b);
}

.context-menu-item.redo {
  background: linear-gradient(145deg, #3498db, #2980b9);
}

.context-menu-item:hover:not(.disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.context-menu-item:active:not(.disabled) {
  transform: translateY(0);
}

.context-menu-item.disabled {
  opacity: 0.6;
  cursor: not-allowed;
  pointer-events: none;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style> 