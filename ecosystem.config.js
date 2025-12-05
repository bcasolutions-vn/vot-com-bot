module.exports = {
  apps: [{
    name: 'vote-com-bot',
    script: './index.js',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '500M',
    env: {
      NODE_ENV: 'production'
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss',
    merge_logs: true,
    // Auto-restart on crash with exponential backoff
    exp_backoff_restart_delay: 100,
    // Restart if app crashes 10 times in 1 minute
    min_uptime: '10s',
    max_restarts: 10
  }]
};
