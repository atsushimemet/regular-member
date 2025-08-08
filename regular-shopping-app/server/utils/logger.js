function nowIso() {
  return new Date().toISOString();
}

function info(message, meta = {}) {
  // keep it simple; structured logs
  console.log(JSON.stringify({ level: 'info', time: nowIso(), message, ...meta }));
}

function warn(message, meta = {}) {
  console.warn(JSON.stringify({ level: 'warn', time: nowIso(), message, ...meta }));
}

function error(message, meta = {}) {
  console.error(JSON.stringify({ level: 'error', time: nowIso(), message, ...meta }));
}

module.exports = { info, warn, error }; 
