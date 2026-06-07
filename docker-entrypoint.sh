#!/bin/sh
set -e

echo "🚀 Starting application initialization..."

# 显示环境信息
echo "📍 Working directory: $(pwd)"
echo "🗄️  Database URL: ${DATABASE_URL}"

# 确保 Prisma Client 已生成
echo "🔧 Generating Prisma Client..."
npx prisma generate

# 运行数据库迁移
echo "📦 Running database migrations..."
if npx prisma migrate deploy; then
  echo "✅ Migrations completed successfully"
else
  echo "⚠️  Migration failed, trying db push..."
  npx prisma db push --skip-generate
fi

# 启动应用
echo "🎉 Starting Next.js server..."
exec node server.js
