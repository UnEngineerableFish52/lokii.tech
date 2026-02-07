import { Audio } from 'expo-av';

class SoundManager {
  constructor() {
    this.sounds = {};
    this.enabled = true;
    this.initialized = false;
  }

  async initialize() {
    if (this.initialized) return;
    
    try {
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
      });

      // Create simple beep sounds programmatically
      this.sounds = {
        click: null,
        send: null,
        receive: null,
        success: null,
        error: null,
      };

      this.initialized = true;
      console.log('[SoundManager] Initialized successfully');
    } catch (error) {
      console.error('[SoundManager] Initialization error:', error);
    }
  }

  async playSound(soundName) {
    if (!this.enabled || !this.initialized) return;

    try {
      // Create a simple beep sound
      const { sound } = await Audio.Sound.createAsync(
        { uri: 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjKM0fPTgjMGHm7A7+OZQQ0PVqzl77BcFw1Bn9vzvmwhBi+I0fPVhC8GGWu77+OaQg0OVarn8LReGAxBnt3zuWsgBi6Fz/PWhS8GF2m67+SZRA0NVKnn8LNfGg1Bnt3zuWsgBjCFz/PUhC4GF2i67+OaQw0OVKrn8LNfGQxCnt3zuWsgBiyEz/PUhC4GFma67+SaQgwOVqrn8LFdGQxEnt3zuGwgBi2Ez/PShS0GF2i67+OZRA0NVKnn8LFeGg1Bn9zzuGsgBiuEz/PUhS0FF2m77+OaRAwOVqrm8LJfGQxCn9vzt2MgBSyEz/PShi4FFmm77+OYRw0PV6vn8LNgGQxBntzzuGodBSqFz/PVhS0FF2i67+KZRA0PV6rm8LFfGQ1Cnt' },
        { shouldPlay: true, volume: 0.3 }
      );

      // Unload after playing
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.didJustFinish) {
          sound.unloadAsync();
        }
      });
    } catch (error) {
      console.error(`[SoundManager] Error playing ${soundName}:`, error);
    }
  }

  async click() {
    await this.playSound('click');
  }

  async send() {
    await this.playSound('send');
  }

  async receive() {
    await this.playSound('receive');
  }

  async success() {
    await this.playSound('success');
  }

  async error() {
    await this.playSound('error');
  }

  setEnabled(enabled) {
    this.enabled = enabled;
    console.log('[SoundManager] Sound', enabled ? 'enabled' : 'disabled');
  }

  isEnabled() {
    return this.enabled;
  }
}

// Export singleton instance
const soundManager = new SoundManager();
export default soundManager;
