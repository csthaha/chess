<!-- src/App.vue -->
<template>
  <a-config-provider :theme="{ token: { colorPrimary: '#00b96b' } }">
    <div id="app">
      <CheckBoard ref="checkboardRef" />
      <SettingsPanel 
        
      />
    </div>
  </a-config-provider>
</template>

<script setup>
import { ref, watch } from 'vue';
import CheckBoard from './components/CheckBoard.vue';
import SettingsPanel from './components/SettingsPanel.vue';

const checkboardRef = ref(null);
const showMoveNumbers = ref(false);

const handleReset = () => {
  checkboardRef.value?.resetBoard();
};
const handleShowMoveNumbersChange = (newValue) => {
  showMoveNumbers.value = newValue;
};


</script>

<style>
#app {
  margin: 0;
  padding: 0;
  height: 100vh;
  background-color: #f5f5f5;
}

body {
  margin: 0;
  padding: 0;
}
</style>