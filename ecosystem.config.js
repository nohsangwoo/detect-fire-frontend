module.exports = {
  apps: [
    {
      name: 'ludgi-fire',
      script: 'node_modules/next/dist/bin/next',
      args: 'start -p 7999',
      watch: false,
      ignore_watch: ['node_modules', 'logs'],
      autorestart: true,
      max_memory_restart: '7G',
      merge_logs: true,
      env: {
        NODE_ENV: 'development',
        ANALYZE: false,
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 7999,
        ANALYZE: true,
      },
    },
  ],
}
