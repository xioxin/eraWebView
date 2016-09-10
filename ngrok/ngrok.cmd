@echo off
chcp 936
echo.
set /p input=请起一个英文名字: 
set /p port=请输入端口: 

ngrok -config=ngrok.cfg -subdomain %input% %port%