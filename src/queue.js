// src/queue.js

class BatchQueue {
  constructor(batchSize = 3, workerFn) {
    this.batchSize = batchSize;
    this.workerFn = workerFn;
    this.buffer = [];
    this.processedCount = 0;
  }

  async push(item) {
    this.buffer.push(item);

    if (this.buffer.length >= this.batchSize) {
      await this.flush();
    }
  }

  async flush() {
    if (this.buffer.length === 0) return;

    await this.workerFn(this.buffer);
    this.processedCount += this.buffer.length;
    this.buffer = []; // Clears items added while workerFn was awaiting!
  }
}

module.exports = BatchQueue;