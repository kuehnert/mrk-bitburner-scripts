﻿#NoEnv
SendMode Input
SetWorkingDir %A_ScriptDir%
Menu, Tray, Icon, shell32.dll, 147
#singleinstance force

#Include %A_ScriptDir%\files\lib.ahk

; HotkeylessAHK by sebinside
; ALL INFORMATION: https://github.com/sebinside/HotkeylessAHK
; Make sure that you have downloaded everything, especially the "/files" folder.
; Make sure that you have nodeJS installed and available in the PATH variable.

SetupServer()
RunClient()

; Your custom functions go here!
; You can then call them by using the URL "localhost:42800/send/yourFunctionName"
; The funciton name "kill" is reserved to end the script execution.

HelloWorld() {
    MsgBox, Hello World
}

OpenExplorer() {
    Run, explorer.exe
}

FocusBitburner() {
    WinActivate, ahk_exe bitburner.exe
}

SendKeyToBitburner(char) {
    switch char {
        case "%": SendInput, {{}
        case "&": SendInput, {}}
        case "_": Send {Space down}{Space up}
        case "↑": SendInput, {Up}
        case "↓": SendInput, {Down}
        case "→": SendInput, {Right}
        case "←": SendInput, {Left}
        case "^": SendInput, {Tab}
        case "§": SendInput, {Enter}
        default: SendInput, %char%
    }
}
