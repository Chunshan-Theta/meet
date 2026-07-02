#!/bin/sh
set -e

echo "🚀 Starting application..."

# 提取数据库文件路径
DB_PATH=$(echo $DATABASE_URL | sed 's/file://')
echo "📍 Database path: $DB_PATH"

# 无论数据库是否已存在，都执行 migrate deploy 以补齐新增迁移
if [ ! -f "$DB_PATH" ]; then
  echo "📦 Database not found, initializing..."
else
  echo "✅ Using existing database, checking pending migrations..."
fi

npx prisma migrate deploy
echo "✅ Database migration check completed"

# 启动应用
echo "🎉 Starting Next.js server..."
exec node server.js
