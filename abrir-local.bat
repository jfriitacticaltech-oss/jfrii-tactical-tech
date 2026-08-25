@echo off
setlocal
set "HTML_FILE=C:\Users\ASUS\Desktop\Paginas\index.html"

where chrome >nul 2>nul
if not errorlevel 1 (
    start "" "chrome" --allow-file-access-from-files "%HTML_FILE%"
    exit /b 0
)

where msedge >nul 2>nul
if not errorlevel 1 (
    start "" "msedge" --allow-file-access-from-files "%HTML_FILE%"
    exit /b 0
)

where "C:\Program Files\Google\Chrome\Application\chrome.exe" >nul 2>nul
if not errorlevel 1 (
    start "" "C:\Program Files\Google\Chrome\Application\chrome.exe" --allow-file-access-from-files "%HTML_FILE%"
    exit /b 0
)

where "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe" >nul 2>nul
if not errorlevel 1 (
    start "" "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe" --allow-file-access-from-files "%HTML_FILE%"
    exit /b 0
)

echo.
echo No se encontro Chrome ni Edge instalados.
echo Instala Chrome o Edge y vuelve a ejecutar este archivo.
pause
