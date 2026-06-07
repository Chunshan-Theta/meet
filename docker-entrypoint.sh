#!/bin/sh
set -e

echo "🚀 Starting application..."

# 提取数据库文件路径
DB_PATH=$(echo $DATABASE_URL | sed 's/file://')
echo "📍 Database path: $DB_PATH"

# 如果数据库文件不存在，运行迁移初始化
if [ ! -f "$DB_PATH" ]; then
  echo "📦 Database not found, initializing..."
  npx prisma migrate deploy
  echo "✅ Database initialized"
else
  echo "✅ Using existing database"
fi

# 启动应用
echo "🎉 Starting Next.js server..."
exec node server.js
