export class RealTimeAudioPlayer {
  constructor(setIsAISpeaking) {
    this.audioContext = new (window.AudioContext ||
      window.webkitAudioContext)();
    this.audioQueue = [];
    this.isPlaying = false;
    this.setIsAISpeaking = setIsAISpeaking;
  }

  base64ToArrayBuffer(base64) {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
  }

  async addAudioChunk(base64Chunk) {
    const audioData = this.base64ToArrayBuffer(base64Chunk);
    const audioBuffer = await this.audioContext.decodeAudioData(audioData);

    this.audioQueue.push(audioBuffer);

    if (!this.isPlaying) {
      this.playNextChunk();
    }
  }

  async clearQueChunks() {
    this.audioQueue = [];
  }

  playNextChunk() {
    if (this.audioQueue.length === 0) {
      this.isPlaying = false;
      this.setIsAISpeaking(false);
      return; // Nothing to play
    }

    this.isPlaying = true;
    this.setIsAISpeaking(true);

    const buffer = this.audioQueue.shift();
    const source = this.audioContext.createBufferSource();
    source.buffer = buffer;

    source.onended = () => {
      this.playNextChunk();
    };

    source.connect(this.audioContext.destination);
    source.start(0);
  }
}
