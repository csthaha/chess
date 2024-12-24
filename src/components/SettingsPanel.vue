<template>
  <div class="settings-panel">
    <a-button 
      type="primary"
      class="settings-icon"
      shape="circle"
      @click="showModal"
    >
      <template #icon>
        <SettingFilled class="icon-spin" />
      </template>
    </a-button>

    <a-modal
      :visible="visible"
      title="游戏设置"
      :width="400"
      centered
      class="settings-modal"
      @ok="handleOk"
      @cancel="handleCancel"
    >
      <a-form :model="formState" layout="horizontal">
        <a-form-item label="显示落子顺序">
          <a-switch 
            v-model:checked="formState.showMoveNumbers"
          />
        </a-form-item>
        <a-form-item label="显示坐标">
          <a-switch 
            v-model:checked="formState.showCoordinates"
          />
        </a-form-item>
        <a-form-item label="落子音效">
          <a-switch 
            v-model:checked="formState.soundEnabled"
          />
        </a-form-item>
        <a-divider />
        <a-form-item>
          <a-button type="primary" danger @click="handleReset">
            重新开始
          </a-button>
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, reactive, watch } from 'vue';
import { SettingFilled } from '@ant-design/icons-vue';

const props = defineProps({
  showMoveNumbers: {
    type: Boolean,
    default: true
  },
  showCoordinates: {
    type: Boolean,
    default: true
  },
  soundEnabled: {
    type: Boolean,
    default: true
  }
});

const visible = ref(false);
const formState = reactive({
  showMoveNumbers: props.showMoveNumbers,
  showCoordinates: props.showCoordinates,
  soundEnabled: props.soundEnabled,
});

// 监听属性变化，同步到表单状态
watch(() => props.showMoveNumbers, (val) => {
  formState.showMoveNumbers = val;
});

watch(() => props.showCoordinates, (val) => {
  formState.showCoordinates = val;
});

watch(() => props.soundEnabled, (val) => {
  formState.soundEnabled = val;
});

const emit = defineEmits([
  'update:showMoveNumbers', 
  'update:showCoordinates', 
  'update:soundEnabled',
  'reset'
]);

const showModal = () => {
  visible.value = true;
};

const handleOk = () => {
  emit('update:showMoveNumbers', formState.showMoveNumbers);
  emit('update:showCoordinates', formState.showCoordinates);
  emit('update:soundEnabled', formState.soundEnabled);
  visible.value = false;
};

const handleCancel = () => {
  // 取消时恢复原始值
  formState.showMoveNumbers = props.showMoveNumbers;
  formState.showCoordinates = props.showCoordinates;
  formState.soundEnabled = props.soundEnabled;
  visible.value = false;
};

const handleReset = () => {
  emit('reset');
  visible.value = false;
};
</script>

<style scoped>
.settings-panel {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 1000;
}

.settings-icon {
  width: 40px;
  height: 40px;
  font-size: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(145deg, #00b96b, #07c160);
  border: none;
  color: white;
  transition: all 0.3s ease;
}

.settings-icon:hover {
  transform: rotate(30deg);
  box-shadow: 0 2px 8px rgba(0, 185, 107, 0.3) !important;
  background: linear-gradient(145deg, #07c160, #00b96b) !important;
  outline: 2px solid #00b96b; /* 修改为绿色边框 */
  outline-offset: 2px; /* 调整边框与按钮的距离 */
}

.icon-spin {
  transition: transform 0.3s ease;
}
:deep(.settings-modal) {
  .ant-modal-content {
    border-radius: 12px;
    padding: 24px;
  }

  .ant-modal-title {
    font-size: 18px;
    font-weight: 600;
  }

  .ant-switch {
    background: rgba(0, 0, 0, 0.25);
  }

  .ant-switch-checked {
    background: #00b96b;
  }
}
</style> 