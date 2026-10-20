#!/bin/sh
set -e

# 以 root 运行时，修复挂载卷权限后降权为 nextjs 用户重新执行
if [ "$(id -u)" = "0" ]; then
  DIR=$(dirname "$(echo "$DATABASE_URL" | sed 's/file://')")
  mkdir -p "$DIR"
  chown -R nextjs:nodejs "$DIR"
  exec su-exec nextjs "$0" "$@"
fi

echo "🚀 Starting application..."

# 提取数据库文件路径
DB_PATH=$(echo $DATABASE_URL | sed 's/file://')
echo "📍 Database path: $DB_PATH"

# Always run migrate deploy to apply any pending migrations
if [ ! -f "$DB_PATH" ]; then
  echo "📦 Database not found, initializing..."
fi

npx prisma migrate deploy
echo "✅ Database migration check completed"

# 启动应用
echo "🎉 Starting Next.js server..."
exec node server.js
