"""List all registered API routes."""
import sys
import json
sys.path.insert(0, "backend")
import main

schema = main.app.openapi()
paths = sorted(schema.get("paths", {}).keys())
print(f"Total API paths: {len(paths)}")
for p in paths:
    methods = list(schema["paths"][p].keys())
    method_str = " ".join(m.upper() for m in methods)
    print(f"  {method_str:20s}  {p}")
