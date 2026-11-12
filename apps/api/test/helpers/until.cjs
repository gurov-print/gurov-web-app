const assert = require('node:assert/strict');
const { setTimeout: delay } = require('node:timers/promises');
async function until(check, timeout = 7000) {
  const deadline = Date.now() + timeout;
  while (true) {
    const value = await check();
    if (value) return value;
    assert(Date.now() < deadline, 'Timed out waiting for test state');
    await delay(20);
  }
}
module.exports = { until };
