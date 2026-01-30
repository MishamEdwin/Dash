	• This work is for Upload.jsx component's "LOB wise NOP GWP GIC:GEP" tab.
	• This particular tab should have the feature to upload two files namely: 
	                      1. LOB and Segment wise Data
	                      2. Dwellings
	•  After I uploaded these two files, the data from these files should be extracted and stored in JSON format in a newly created file in "src/data" according to their names.
	• If I upload just any one file, it should work fine.
	
	Eg:
	
	1. LOB and Segment wise Data:
	•  If the uploaded excel file is in this format:


	LOB 	UW Sub Channel	Comm/Hlth SubProduct Name	Time	Prem	Earned Prem	Net Pol	Claim incurred in period
	LIABILITY	Banca PSU	(None)	December, 2025/26	39,264 	384,355 	5 	 
	LIABILITY	Banca PSU	(None)	December, 2024/25	(21,751)	582,573 	3 	504,500 
	LIABILITY	Banca PSU	(None)	April, 2025-26 - December, 2025-26	3,879,178 	2,933,151 	68 	123,525 
	LIABILITY	Banca PSU	(None)	April, 2024-25 - December, 2024-25	1,147,888 	12,412,198 	41 	781,500 
	LIABILITY	Commercial	(None)	December, 2025/26	973,184 	1,571,891 	50 	2,579,163 
	LIABILITY	Commercial	(None)	December, 2024/25	1,214,242 	1,615,757 	57 	(1,045,242)
	LIABILITY	Commercial	(None)	April, 2025-26 - December, 2025-26	16,002,591 	14,012,887 	597 	11,355,765 
	
	

	Then the data should be stored like this in "LOB_AND_SEGMENT_WISE_DATA.json" file in "src/data" directory. Leave out the "UW Sub Channel" and "Comm/Hith SubProduct Name". The blank number fields should be 0.
[
  {
    "Time": "December, 2025/26",
    "LOB": {
      "LIABILITY": {
        "Total Prem": 1012448,
        "Total Earned Prem": 1956246,
        "Total Net Pol": 55,
        "Total Claim incurred in period": 2579163
      }
    }
  },
  {
    "Time": "December, 2024/25",
    "LOB": {
      "LIABILITY": {
        "Total Prem": 1192491,
        "Total Earned Prem": 2198330,
        "Total Net Pol": 60,
        "Total Claim incurred in period": -540742
      }
    }
  },
  {
    "Time": "April, 2025-26 - December, 2025-26",
    "LOB": {
      "LIABILITY": {
        "Total Prem": 19881769,
        "Total Earned Prem": 16946038,
        "Total Net Pol": 665,
        "Total Claim incurred in period": 11479290
      }
    }
  },
  {
    "Time": "April, 2024-25 - December, 2024-25",
    "LOB": {
      "LIABILITY": {
        "Total Prem": 1147888,
        "Total Earned Prem": 12412198,
        "Total Net Pol": 41,
        "Total Claim incurred in period": 781500
      }
    }
  }
]

	2. Dwellings.
	• If the uploaded excel file is in this format:
	 
	UW Sub Channel	Time	Prem	Earned Prem	Net Pol	Claim incurred in period
	Others	December, 2025/26	 	91,833 	 	 
	Others	December, 2024/25	 	103,742 	 	 
	Others	April, 2025-26 - December, 2025-26	 	1,060,605 	 	 
	Others	April, 2024-25 - December, 2024-25	 	17,370,057 	 	 
	Banca PSU	December, 2025/26	78,547,623 	106,329,662 	19,679 	(6,426,268)
	Banca PSU	December, 2024/25	63,314,371 	46,628,191 	14,468 	2,120,321 
	Banca PSU	April, 2025-26 - December, 2025-26	619,531,888 	507,988,942 	151,565 	59,815,176 
	Banca PSU	April, 2024-25 - December, 2024-25	552,194,399 	393,290,329 	118,778 	40,159,179 
	
	
		Then the data should be stored like this in "Dwellings.json" file in "src/data" directory. Leave out the "UW Sub Channel". The blank number fields should be 0.

		[
		  {
		    "Time": "December, 2025/26",
		    "Total Prem": 78547623,
		    "Total Earned Prem": 106421495,
		    "Total Net Pol": 19679,
		    "Total Claim incurred in period": -6426268
		  },
		  {
		    "Time": "December, 2024/25",
		    "Total Prem": 63314371,
		    "Total Earned Prem": 46731933,
		    "Total Net Pol": 14468,
		    "Total Claim incurred in period": 2120321
		  },
		  {
		    "Time": "April, 2025-26 - December, 2025-26",
		    "Total Prem": 619531888,
		    "Total Earned Prem": 509049547,
		    "Total Net Pol": 151565,
		    "Total Claim incurred in period": 59815176
		  },
		  {
		    "Time": "April, 2024-25 - December, 2024-25",
		    "Total Prem": 552194399,
		    "Total Earned Prem": 410660386,
		    "Total Net Pol": 118778,
		    "Total Claim incurred in period": 40159179
		  }
		]
