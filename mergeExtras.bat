xcopy /y "Fixes" "./Actions"
xcopy /y "QOLs" "./Actions"
xcopy /y "Tweaks" "./Actions"
xcopy /y "Extras" "./Actions"
echo Merging Done.
timeout /t 5
rmdir /s /q "Fixes"
rmdir /s /q "QOLs"
rmdir /s /q "Tweaks"
rmdir /s /q "Extras"
echo Cleanup Done.
timeout /t 5