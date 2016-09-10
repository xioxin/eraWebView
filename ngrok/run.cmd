@echo off
chcp 936
echo.

set port=9000
set /p port=请输入端口(默认9000): 

ngrok -config=ngrok.cfg -proto=tcp %port%