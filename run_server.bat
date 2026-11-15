@echo off
rem -------------------------------------------------
rem Alpha Nutri – servidor de desenvolvimento
rem -------------------------------------------------
rem 1. Verifica se o diretório está correto
set "PROJECT_ROOT=%~dp0"
cd /d "%PROJECT_ROOT%"

rem 2. Inicia o servidor HTTP do Python (porta 8000)
rem Caso o Python não esteja no PATH, use "py" ao invés de "python"
python -m http.server 8000 --directory "." || py -m http.server 8000 --directory "."

rem 3. Mensagem de encerramento
echo.
echo =====================================================
echo  Servidor encerrado. Pressione any key para fechar…
pause >nul
