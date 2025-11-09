// Memory management cho Railway deployment
const v8 = require('v8');

// Garbage collection force
const forceGC = () => {
  if (global.gc) {
    global.gc();
    console.log('🗑️  Forced garbage collection');
  }
};

// Memory monitoring
const logMemoryUsage = () => {
  const usage = process.memoryUsage();
  const heapStats = v8.getHeapStatistics();
  
  console.log('💾 Memory Usage:');
  console.log(`  RSS: ${Math.round(usage.rss / 1024 / 1024)}MB`);
  console.log(`  Heap Used: ${Math.round(usage.heapUsed / 1024 / 1024)}MB`);
  console.log(`  Heap Total: ${Math.round(usage.heapTotal / 1024 / 1024)}MB`);
  console.log(`  External: ${Math.round(usage.external / 1024 / 1024)}MB`);
  console.log(`  Heap Limit: ${Math.round(heapStats.heap_size_limit / 1024 / 1024)}MB`);
  
  // Cảnh báo nếu sử dụng quá nhiều memory
  const heapUsagePercent = (usage.heapUsed / heapStats.heap_size_limit) * 100;
  if (heapUsagePercent > 80) {
    console.warn(`⚠️  High memory usage: ${heapUsagePercent.toFixed(1)}%`);
    forceGC();
  }
};

// Memory cleanup interval
const startMemoryMonitoring = () => {
  // Log memory mỗi 30 giây
  setInterval(logMemoryUsage, 30000);
  
  // Force GC mỗi 5 phút
  setInterval(forceGC, 5 * 60 * 1000);
  
  console.log('🧠 Memory monitoring started');
};

module.exports = {
  logMemoryUsage,
  forceGC,
  startMemoryMonitoring
};