import json
import sys

try:
    with open('/var/folders/4p/jl22tv_s1tvchcwgbc5mfztc0000gn/T/chrome-devtools-mcp-h497M9/report.json', 'r') as f:
        data = json.load(f)
    
    audits = data.get('audits', {})
    categories = data.get('categories', {})
    a11y = categories.get('accessibility', {})
    
    for audit_ref in a11y.get('auditRefs', []):
        audit_id = audit_ref.get('id')
        audit = audits.get(audit_id, {})
        if audit.get('score') == 0 or audit.get('score') == None:
            if audit.get('scoreDisplayMode') == 'binary' or audit.get('scoreDisplayMode') == 'numeric':
                print(f"FAILED: {audit_id} - {audit.get('title')}")
                print(f"  Description: {audit.get('description')}")
                if 'details' in audit and 'items' in audit['details']:
                    for item in audit['details']['items']:
                        if 'node' in item and 'snippet' in item['node']:
                            print(f"  Element: {item['node']['snippet']}")
                print()
except Exception as e:
    print(f"Error: {e}")
