import json
import datetime
import subprocess
find = False
today = str(datetime.date.today())
with open('data.json') as json_file:
    data = json.load(json_file)
for t in data['times']:
	if(t["day"]==today):
		t["end"]=str(datetime.datetime.now())
		print(t)
		find=True

if( not find):
	newdata=[{"start": str(datetime.datetime.now()), "end": str(datetime.datetime.now()), "day":str(today)}]
	data["times"]=data["times"]+newdata
with open('data.json', 'w') as outfile:
	json.dump(data, outfile)
