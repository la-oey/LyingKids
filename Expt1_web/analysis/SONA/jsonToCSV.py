import io
import json
import csv
from os import listdir
from os.path import isfile, join
mypath = 'data/' #set path to folder containing json files

files = [f for f in listdir(mypath) if isfile(join(mypath, f))]
raw = open('raw.csv','w')
csvwriter = csv.writer(raw)

head = 0

for f in files: #iterate through files in folder
	if f != ".DS_Store":
		with io.open(mypath+f,'r',encoding='utf-8',errors='ignore') as f:
			content = f.read()
			parsed = json.loads(content)
			subjID = parsed["client"]["sid"]
			stillimages = parsed["client"]["demographic"]["stillimages"]
			try:
				comments = parsed["client"]["demographic"]["comments"]
			except:
				#print(subjID + " no comments")
				comments = "NA"
			
			subjTrials = parsed["trials"]

			if not subjTrials:
				print(subjID + " is empty")
				continue

			if head == 0:
				header = ["subjID", "stillimages", "comments"] #init header array
				header.extend(subjTrials[0].keys())
				csvwriter.writerow(header)
				head = 1

			for t in subjTrials:
				vals = [subjID, stillimages, comments] #init data array
				vals.extend(t.values())
				csvwriter.writerow(vals)
raw.close()

