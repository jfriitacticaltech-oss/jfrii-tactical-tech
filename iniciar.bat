@echo off
cd /d "%~dp0"
python -m http.server 8000
if errorlevel 1 (
    py -m http.server 8000
)
if errorlevel 1 (
    echo.
    echo No se encontro Python instalado.
    echo Instala Python desde: https://www.python.org/downloads/
    echo O usa VS Code con la extension Live Server.
    pause
)
