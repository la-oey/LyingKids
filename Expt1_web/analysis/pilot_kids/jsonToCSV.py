import io
import json
import csv
from os import listdir
from os.path import isfile, join
mypath = '../../data/loey/trick-or-truth-2/dat/pilot_kids/' #set path to folder containing json files

files = [f for f in listdir(mypath) if isfile(join(mypath, f))]
raw = open('raw.csv','w')
trialwriter = csv.writer(raw)

demo = open('demographic.csv','w')
demowriter = csv.writer(demo)

head = 0

for f in files: #iterate through files in folder
	if f != ".DS_Store":
		with io.open(mypath+f,'r',encoding='utf-8',errors='ignore') as f:
			content = f.read()
			parsed = json.loads(content)
			subjID = parsed["client"]["sid"]
			startTime = parsed["client"]["exptStartTime"]
			userAgent = parsed["client"]["userAgent"]
			demographic = parsed["client"]["demographic"]			
			subjTrials = parsed["trials"]

			if head == 0:
				headerDem = ["subjID", "startTime", "userAgent"] #init header array
				fullDemoKey = demographic.keys()
				headerDem.extend(fullDemoKey)
				demowriter.writerow(headerDem)

				header = ["subjID"] 
				header.extend(subjTrials[0].keys())
				trialwriter.writerow(header)

				head = 1

			valsDem = [subjID, startTime, userAgent] #init data array
			for h in fullDemoKey: #fill in empty demographic data
				if h not in demographic.keys():
					demographic[h] = "missing"
				elif demographic[h] == "":
					demographic[h] = "NA"
			demographic = {k: demographic[k] for k in fullDemoKey} #reorder demographic data
			valsDem.extend(demographic.values())
			demowriter.writerow(valsDem) #write demographic data to csv

			if not subjTrials: #check if no trial data
				print(subjID + " is empty")
				continue

			for t in subjTrials: #write each trial to csv
				vals = [subjID] #init data array
				vals.extend(t.values())
				trialwriter.writerow(vals)
raw.close()

