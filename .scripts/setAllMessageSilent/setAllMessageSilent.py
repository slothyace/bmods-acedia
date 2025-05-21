import json
import os
import sys

def setSilentTrue(obj):
    if isinstance(obj, list):
        for item in obj:
            setSilentTrue(item)
    elif isinstance(obj, dict):
        if obj.get("name") == "Send Message":
            if "data" not in obj or not isinstance(obj["data"], dict):
                obj["data"] = {}
            obj["data"]["silent"] = True
        for value in obj.values():
            setSilentTrue(value)

# Load the JSON file
if len(sys.argv) > 1:
    filePath = sys.argv[1].strip('"').strip()
else:
    filePath = input("📄 Drag your 'data.json' file here: ").strip('"').strip()
if os.path.basename(filePath) != "data.json":
    print("❌ The file must be named exactly 'data.json'.")
    exit(1)

with open(filePath, "r", encoding="utf-8") as f:
    data = json.load(f)

# Modify all Send Message actions
setSilentTrue(data)

# Save the modified JSON back to file
outputPath = os.path.join(os.path.dirname(filePath), "modified_data.json")
with open(outputPath, "w", encoding="utf-8") as f:
    json.dump(data, f, indent=2)
