@echo off
REM ========================================================
REM  CREATURE FORGE: Migrating to Python 3.12 (For Trellis)
REM ========================================================

set "PYTHON_EXE=C:\Program Files\Python312\python.exe"
set "COMFY_ROOT=C:\Users\panca\Documents\ComfyUI"
set "VENV_DIR=%COMFY_ROOT%\venv312"
set "REQUIREMENTS=%COMFY_ROOT%\ComfyUI\requirements.txt"
set "TRELLIS_REQ=%COMFY_ROOT%\ComfyUI\custom_nodes\ComfyUI_TRELLIS\requirements.txt"
set "ESSENTIALS_REQ=%COMFY_ROOT%\ComfyUI\custom_nodes\comfyui_essentials\requirements.txt"

echo Target ComfyUI: "%COMFY_ROOT%"
echo Target Python:  "%PYTHON_EXE%"
echo.

REM 1. Check for Python 3.12
if exist "%PYTHON_EXE%" goto python_found
echo [ERROR] Python 3.12 not found at "%PYTHON_EXE%"
pause
exit /b
:python_found

REM 2. Check Venv
if exist "%VENV_DIR%" goto venv_exists
echo [SETUP] Creating Virtual Environment (venv312)...
"%PYTHON_EXE%" -m venv "%VENV_DIR%"
if errorlevel 1 goto fail
:venv_exists

REM 3. Activate Venv
echo [SETUP] Activating Environment...
call "%VENV_DIR%\Scripts\activate.bat"
if errorlevel 1 goto fail
echo [INFO] Python Version Active:
python --version

REM 4. Install PyTorch
echo [SETUP] Installing PyTorch (CUDA 12.4)...
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu124
if errorlevel 1 goto fail

REM 5. Install ComfyUI Core
echo [SETUP] Installing Core Requirements...
if not exist "%REQUIREMENTS%" goto skip_core_reqs
pip install -r "%REQUIREMENTS%"
:skip_core_reqs

REM 6. Install Kaolin
echo [SETUP] Installing Kaolin...
pip install kaolin
if errorlevel 1 goto try_kaolin_wheel
goto kaolin_done

:try_kaolin_wheel
echo [WARNING] Standard pip failed. Trying Wheel...
pip install kaolin --no-index --find-links https://nvidia-kaolin.s3.us-east-2.amazonaws.com/torch-2.4.1_cu124.html
if errorlevel 1 echo [WARNING] Kaolin wheel also failed. Continuing anyway...

:kaolin_done

REM 7. Install Custom Nodes
echo [SETUP] Installing Trellis Requirements...
if exist "%TRELLIS_REQ%" pip install -r "%TRELLIS_REQ%"

echo [SETUP] Installing Essentials Requirements...
if exist "%ESSENTIALS_REQ%" pip install -r "%ESSENTIALS_REQ%"

REM 8. Safety Fixes
echo [SETUP] Installing Safe Numpy/Rembg...
pip install rembg[gpu] "numpy<2.0"

echo.
echo ========================================================
echo  SETUP COMPLETE! Launching Creature Forge (Python 3.12)
echo ========================================================
echo.

cd /d "%COMFY_ROOT%\ComfyUI"
python main.py --listen 0.0.0.0 --cuda-device 1

goto :eof

:fail
echo.
echo [ERROR] Setup Step Failed.
pause
