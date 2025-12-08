# UniCafe Cleanup Script - Remove Unused Files
# Run this from the UniCafe root directory

Write-Host "🧹 Starting UniCafe Cleanup..." -ForegroundColor Cyan

# Navigate to Unicafe folder
Set-Location "Unicafe"

# Remove root-level unused Vite project files
Write-Host "`n📁 Removing root-level unused files..." -ForegroundColor Yellow
Remove-Item -Path "src" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item -Path "index.html" -Force -ErrorAction SilentlyContinue
Remove-Item -Path "vite.config.js" -Force -ErrorAction SilentlyContinue
Remove-Item -Path "eslint.config.js" -Force -ErrorAction SilentlyContinue
Remove-Item -Path "package.json" -Force -ErrorAction SilentlyContinue
Remove-Item -Path "package-lock.json" -Force -ErrorAction SilentlyContinue
Remove-Item -Path "public" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item -Path "postcss.config.cjs" -Force -ErrorAction SilentlyContinue

# Remove unused AnimatedBackground component
Write-Host "`n🎨 Removing unused AnimatedBackground component..." -ForegroundColor Yellow
Remove-Item -Path "customer-side\src\components\AnimatedBackground.jsx" -Force -ErrorAction SilentlyContinue

# Remove unused backend services
Write-Host "`n⚙️ Removing unused backend services..." -ForegroundColor Yellow
Remove-Item -Path "backend\services\emailService.js" -Force -ErrorAction SilentlyContinue
Remove-Item -Path "backend\services\profileService.js" -Force -ErrorAction SilentlyContinue

# Remove backup database
Write-Host "`n💾 Removing backup database..." -ForegroundColor Yellow
Remove-Item -Path "unicafe(BACKUP).db" -Force -ErrorAction SilentlyContinue

# Optional: Remove test files (uncomment if you don't need them)
# Write-Host "`n🧪 Removing test files..." -ForegroundColor Yellow
# Remove-Item -Path "backend\test-customers.js" -Force -ErrorAction SilentlyContinue
# Remove-Item -Path "backend\tests" -Recurse -Force -ErrorAction SilentlyContinue

Write-Host "`n✅ Cleanup complete!" -ForegroundColor Green
Write-Host "`nRemaining structure:" -ForegroundColor Cyan
Get-ChildItem -Directory | Select-Object Name

# Go back to root
Set-Location ..
