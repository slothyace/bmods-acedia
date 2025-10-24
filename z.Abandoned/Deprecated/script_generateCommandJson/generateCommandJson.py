import os
import json
import zipfile
from pathlib import Path

def normalizePath(inputPath):
    return inputPath.strip().replace('"', '').replace("'", '')

inputPath = input('Drag the "data.json" file into this terminal: ')
inputPath = normalizePath(inputPath)

if Path(inputPath).name != "data.json":
    print('File isn\'t "data.json"!')
    exit()

projectDir = os.path.dirname(inputPath)
rawData = Path(inputPath).read_text(encoding="utf-8")
botData = json.loads(rawData)
commandsFolder = os.path.join(projectDir, botData["name"])

if not os.path.exists(commandsFolder):
    os.makedirs(commandsFolder, exist_ok=True)

commands = botData["commands"]
for command in commands:
    commandFilePath = os.path.join(commandsFolder, f"{command['name']}.json")
    with open(commandFilePath, "w", encoding="utf-8") as f:
        json.dump(command, f, indent=2)
    print(f"{commandFilePath} created...")

print(f"Converted All Commands Into Individual Json In {commandsFolder}")

answer = input("\nCompress To Zip? (y/n): ")
if answer.strip().lower() == "y":
    zipFile = f"{commandsFolder}.zip"
    print("Creating Zip...")
    with zipfile.ZipFile(zipFile, "w", zipfile.ZIP_DEFLATED) as zipf:
        for root, _, files in os.walk(commandsFolder):
            for file in files:
                filePath = os.path.join(root, file)
                arcname = os.path.relpath(filePath, os.path.dirname(commandsFolder))
                zipf.write(filePath, arcname)
    print(f"Zip Creation Success: {zipFile}")
else:
    print("Skipping Zip Creation...")