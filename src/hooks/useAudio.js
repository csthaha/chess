import { ref } from 'vue';
import downSound from '../assets/down.mp3';
export const useAudio = () => {
  const audio = ref(new Audio(downSound)); // 确保音频文件放在 public 目录下

  const playDownSound = () => {
    audio.value.currentTime = 0; // 重置音频播放位置
    audio.value.play().catch(error => {
      console.warn('Audio playback failed:', error);
    });
  };

  return {
    playDownSound
  };
};