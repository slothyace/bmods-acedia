xcopy /y "Fixes" "./Actions"
xcopy /y "QOLs" "./Actions"
xcopy /y "Tweaks" "./Actions"
echo Merging Done.
timeout /t 5
cls
rmdir /s /q "Fixes"
rmdir /s /q "QOLs"
rmdir /s /q "Tweaks"
echo Clean Up Done.
timeout /t 5