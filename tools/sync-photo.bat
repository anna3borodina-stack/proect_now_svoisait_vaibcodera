@echo off
chcp 65001 >nul
set "SRC=%USERPROFILE%\.cursor\projects\c-Users-AppData-Local-GitHubDesktop-app-3-5-6-proect-now-svoisait-vaibcodera\assets\c__Users______AppData_Roaming_Cursor_User_workspaceStorage_fc6d70df85e6d9c6acac90c2d8005185_images_photo.jpg-a2c22a88-ba63-4267-9524-f5cd955c167b.png"
set "DST=%~dp0..\assets\photo.png"
if exist "%SRC%" (
  copy /Y "%SRC%" "%DST%" >nul && echo OK: новое фото скопировано в assets\photo.png
) else (
  echo Файл из чата не найден по пути Cursor. Сохраните фото вручную как: assets\photo.png
)
if "%~1"=="" pause
