@echo off
chcp 65001 >nul
title 序时 · 局域网模式
setlocal enabledelayedexpansion
set PORT=8848
cd /d "%~dp0"

echo.
echo   ==========================================
echo    序时 · 局域网模式（不用域名、不上传）
echo   ==========================================
echo.

set PY=
where py >nul 2>nul && set PY=py
if not defined PY (where python >nul 2>nul && set PY=python)
if not defined PY (
  echo   [!] 这台电脑没装 Python，起不了服务。
  echo.
  echo       两条路：
  echo         A. 装个 Python： https://www.python.org/downloads/
  echo            安装第一屏记得勾 "Add python.exe to PATH"
  echo         B. 不用这种方式，改走免费的 Cloudflare Pages
  echo            （见 README 第三节，不用买域名也不用装东西）
  echo.
  pause
  exit /b 1
)

echo   手机要访问的地址（手机和电脑连同一个 WiFi）：
echo.
for /f "delims=" %%A in ('powershell -NoProfile -Command "Get-NetIPAddress -AddressFamily IPv4 ^| Where-Object { $_.IPAddress -notlike '127.*' -and $_.IPAddress -notlike '100.*' -and $_.IPAddress -notlike '169.254.*' } ^| ForEach-Object { $_.IPAddress }"') do (
  echo       http://%%A:%PORT%/
  echo       http://%%A:%PORT%/install.html      ^<-- 装到桌面用这个
  echo.
)

echo   ------------------------------------------
echo   下面这个窗口要一直开着。关掉 = 手机打不开。
echo   第一次运行 Windows 会弹防火墙提示，点「允许访问」。
echo   ------------------------------------------
echo.

start "" "http://127.0.0.1:%PORT%/install.html"

%PY% -m http.server %PORT% --bind 0.0.0.0
pause
