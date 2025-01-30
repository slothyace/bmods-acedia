xcopy "Fixes" "./Actions"
xcopy "QOLs" "./Actions"
xcopy "Tweaks" "./Actions"
echo Merging Done.
timeout /t 5
cls
rmdir "Fixes"
rmdir "QOLs"
rmdir "Tweaks"
echo Clean Up Done.
timeout /t 5