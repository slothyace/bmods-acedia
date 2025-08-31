import os
import json

def readAndPush(fileLocation, commands):
    try:
        with open(fileLocation, "r", encoding="utf-8") as f:
            rawCommandJson = f.read()
    except Exception:
        print(f'Could not read file "{fileLocation}"')
        return

    try:
        commandJson = json.loads(rawCommandJson)
    except Exception:
        print(f'The content inside "{fileLocation}" isn\'t valid JSON!')
        return

    if isinstance(commandJson, list):
        commands.extend(commandJson)
    else:
        commands.append(commandJson)

    print(f'Content inside "{fileLocation}" has been merged into "data.json"')


inputPath = input('Drag the "data.json" file into this terminal: ').strip().replace('"', '')
inputPath = os.path.normpath(inputPath)

if os.path.basename(inputPath) != "data.json":
    print('File isn\'t "data.json"!')
    exit(1)

projectDir = os.path.dirname(inputPath)

with open(inputPath, "r", encoding="utf-8") as f:
    rawData = f.read()

botData = json.loads(rawData)
commands = botData.get("commands", [])

backupPath = os.path.join(projectDir, "backupdata.json")
with open(backupPath, "w", encoding="utf-8") as f:
    json.dump(botData, f, indent=2, ensure_ascii=False)
print("Backup created.")
print("Bot data loaded.")

location = input('\nPlease drag the file / folder you\'re importing into this terminal: ').strip().replace('"', '')
location = os.path.normpath(location)

if not os.path.exists(location):
    print(f'Path "{location}" does not exist.')
    exit(1)

if os.path.isdir(location):
    for file in os.listdir(location):
        if not file.endswith(".json"):
            print(f'Skipping non-JSON file: {file}')
            continue
        fileLocation = os.path.join(location, file)
        readAndPush(fileLocation, commands)

elif os.path.isfile(location):
    readAndPush(location, commands)

else:
    print(f'"{location}" is neither a file nor a directory.')
    exit(1)

botData["commands"] = commands
with open(inputPath, "w", encoding="utf-8") as f:
    json.dump(botData, f, indent=2, ensure_ascii=False)

print("Commands merged in.")
