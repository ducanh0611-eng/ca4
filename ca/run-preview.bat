@echo off
title CarNaviLauncher Web Preview
echo =======================================================
echo   DANG KHOI DONG CAR NAVI LAUNCHER PREVIEW
echo =======================================================
echo   Mo trinh duyet tai: http://localhost:8080
echo   Nhan Ctrl+C de dung server.
echo =======================================================
cd app\src\main\assets
python -m http.server 8080
pause
