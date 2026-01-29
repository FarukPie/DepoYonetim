@echo off
echo Depo Yonetim Sistemi Baslatiliyor...

:: Backend'i yeni bir pencerede baslat
start "Backend - .NET API" cmd /k "cd src\WebAPI && dotnet run"

:: Backend'in biraz baslamasini bekle (opsiyonel)
timeout /t 5 /nobreak >nul

:: Frontend'i yeni bir pencerede baslat
start "Frontend - React" cmd /k "cd frontend && npm run dev"

echo.
echo ========================================================
echo Backend ve Frontend baslatildi.
echo Backend penceresini ve Frontend penceresini kapatmayin.
echo Tarayicida http://localhost:5173 adresine gidebilirsiniz (Frontend basladiginda).
echo ========================================================
pause
