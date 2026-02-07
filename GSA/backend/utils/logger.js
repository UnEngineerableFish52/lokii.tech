const DEBUG = process.env.DEBUG === 'true' || process.env.NODE_ENV === 'development';

class Logger {
  log(...args) {
    if (DEBUG) {
      console.log('[GSA-LOG]', new Date().toISOString(), ...args);
    }
  }

  error(...args) {
    console.error('[GSA-ERROR]', new Date().toISOString(), ...args);
  }

  info(...args) {
    console.info('[GSA-INFO]', new Date().toISOString(), ...args);
  }

  warn(...args) {
    console.warn('[GSA-WARN]', new Date().toISOString(), ...args);
  }

  request(req) {
    if (DEBUG) {
      console.log('[GSA-REQUEST]', new Date().toISOString(), {
        method: req.method,
        url: req.url,
        ip: req.ip,
        body: req.body,
        query: req.query,
        params: req.params
      });
    }
  }

  response(status, data) {
    if (DEBUG) {
      console.log('[GSA-RESPONSE]', new Date().toISOString(), {
        status,
        data: typeof data === 'object' ? JSON.stringify(data).substring(0, 200) : data
      });
    }
  }
}

module.exports = new Logger();
