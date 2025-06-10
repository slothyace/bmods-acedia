import json
import os

def setSilentTrue(obj):
    if isinstance(obj, list):
        for item in obj:
            setSilentTrue(item)
    elif isinstance(obj, dict):
        if obj.get("file") == "sendmessage.js":
            if "data" not in obj:
                obj["data"] = {}
            obj["data"]["silent"] = True
        for key in obj:
            setSilentTrue(obj[key])

def modifyFile(filePath):
    if os.path.basename(filePath) != "data.json":
        print('File Isn\'t "data.json"!')
        return

    try:
        with open(filePath, "r", encoding="utf-8") as f:
            data = json.load(f)

        setSilentTrue(data)

        outputFilePath = os.path.join(
            os.path.dirname(filePath),
            "modified_" + os.path.basename(filePath)
        )

        with open(outputFilePath, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2)

        print(f"Modified File Saved As: {outputFilePath}")
    except Exception as err:
        print("Failed To Process The File:", err)

filePath = input('Drag the "data.json" file into this terminal: ').strip().replace('"', '')
modifyFile(filePath)
