@echo off
title GitHub Setup Helper
cd /d "%~dp0"
echo Initializing local Git repository...
git init
git add .
git commit -m "Initial commit: Birthday Letter Generator Electron App"
echo.
echo =========================================================
echo  로컬 Git 저장소 초기화 및 첫 커밋이 완료되었습니다!
echo =========================================================
echo.
echo GitHub에 코드를 업로드하고 공유하려면 아래 순서대로 진행해 주세요:
echo.
echo 1. https://github.com 에 접속하여 새 저장소(New repository)를 만듭니다.
echo    (README, .gitignore, License 등은 생성하지 말고 빈 저장소로 만듭니다.)
echo.
echo 2. 생성된 저장소의 주소(예: https://github.com/아이디/이름.git)를 복사합니다.
echo.
echo 3. 이 창(CMD)에서 아래 명령어를 순서대로 실행합니다:
echo.
echo    git branch -M main
echo    git remote add origin 복사한_주소
echo    git push -u origin main
echo.
pause
