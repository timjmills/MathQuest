import sys, json, openpyxl
wb = openpyxl.load_workbook(sys.argv[1], read_only=True)
out = []
for r in wb[sys.argv[2]].iter_rows(values_only=True, min_row=2):
    if not r or not r[6]:
        continue
    out.append({"week": r[0], "lesson": str(r[6]), "prior": (r[14] if len(r) > 14 else None)})
print(json.dumps(out))
