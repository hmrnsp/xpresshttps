"use strict";

// Jalankan: pm2 start ecosystem.config.js --env production
module.exports = {
  apps: [
    {
      name: "hello-cf",
      script: "src/app.js",
      cwd: __dirname,

      // fork = 1 proses. Ganti ke "cluster" + instances: "max" untuk pakai semua core CPU.
      exec_mode: "fork",
      instances: 1,

      autorestart: true,
      watch: false,
      max_memory_restart: "300M",
      restart_delay: 2000,
      exp_backoff_restart_delay: 100,

      // app.js menunggu sampai 10 detik saat SIGTERM, jadi beri waktu yang sama.
      kill_timeout: 10000,

      out_file: "logs/out.log",
      error_file: "logs/error.log",
      merge_logs: true,
      time: true,

      env: {
        NODE_ENV: "development",
        HOST: "0.0.0.0",
        PORT: 6969,
      },
      env_production: {
        NODE_ENV: "production",
        HOST: "0.0.0.0",
        PORT: 6969,
      },
    },
  ],
};
