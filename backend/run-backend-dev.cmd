@echo off
setlocal
set ASPNETCORE_ENVIRONMENT=Development
set DOTNET_ENVIRONMENT=Development
set ASPNETCORE_URLS=http://localhost:5500
cd /d "C:\Users\a.salem.GFSA\Desktop\itsm-main\backend"
echo Launching backend at %date% %time% > "C:\Users\a.salem.GFSA\Desktop\itsm-main\backend\run.log"
echo ASPNETCORE_ENVIRONMENT=%ASPNETCORE_ENVIRONMENT%>> "C:\Users\a.salem.GFSA\Desktop\itsm-main\backend\run.log"
echo DOTNET_ENVIRONMENT=%DOTNET_ENVIRONMENT%>> "C:\Users\a.salem.GFSA\Desktop\itsm-main\backend\run.log"
echo ASPNETCORE_URLS=%ASPNETCORE_URLS%>> "C:\Users\a.salem.GFSA\Desktop\itsm-main\backend\run.log"
"C:\Program Files\dotnet\dotnet.exe" "C:\Users\a.salem.GFSA\Desktop\itsm-main\backend\bin\Debug\net10.0\ITSMBackend.dll" > "C:\Users\a.salem.GFSA\Desktop\itsm-main\backend\run.log" 2> "C:\Users\a.salem.GFSA\Desktop\itsm-main\backend\run.err"
