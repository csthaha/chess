<!-- src/App.vue -->
<template>
  <a-config-provider :theme="{ token: { colorPrimary: '#00b96b' } }">
    <div id="app">
      <CheckBoard />
    </div>
  </a-config-provider>
</template>

<script setup>

import CheckBoard from './components/CheckBoard.vue';

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