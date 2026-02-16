import React, { useState } from 'react'; 
import { X, Download, Upload as UploadIcon, FileText, CheckCircle, AlertCircle } from 
'lucide-react'; 
import * as XLSX from 'xlsx'; 
const Upload = () => { 
const [selectedDate, setSelectedDate] = useState({ month: 'January', year: '2025-26' }); 
const [activeTab, setActiveTab] = useState('OverAllReview'); 
const [activeModal, setActiveModal] = useState(null); 
// State for specific files 
const [lobFile, setLobFile] = useState(null); 
const [dwellingsFile, setDwellingsFile] = useState(null); 
const [brokerFile, setBrokerFile] = useState(null); 
const [lobSegmentFile, setLobSegmentFile] = useState(null); 
const [fireBancaFile, setFireBancaFile] = useState(null); 
const [newBusinessFile, setNewBusinessFile] = useState(null); 
const [newInitiativesFile, setNewInitiativesFile] = useState(null); 
const [largeRiskFile, setLargeRiskFile] = useState(null); 
const [lastFiveYearsFile, setLastFiveYearsFile] = useState(null); 
const [cordysFile, setCordysFile] = useState(null); // New State for Cordys TAT 
  // New state for processing 
  const [processing, setProcessing] = useState(false); 
 
  // Data mapping 
  const sectionData = { 
    OverAllReview: [ 
      'LOB wise NOP GWP GIC:GEP', 'Broker wise GWP Report', 'LOB & Segment wise Report', 
      'LOB wise Growth % (GWP)', 'Last Five year comparison', 'FIRE - Banca Channel wise UnderInsurance Report', 
      'Cordys TAT Report', 'Inward Fac', 'New Business Sourced (>5 lakhs)', 'New Initiatives', 'Large risk underwritten - More than 2500 Cr' 
    ], 
    Fire: [ 
      'PRD Mix Exposure wise', 'PRD Mix on GWP', 'State wise Exposure', 'Average Rate Analysis BGR', 
      'Average Rate Analysis Non-BGR', 'Product wise Premium & Claims Report -Fire', 'SFSP, Sookshama & Laghu - Per lac Premium & Claim', 
      'FIRE-Segment wise Per policy Premium', 'FIRE-Segment wise NOP & NOC', 'Fire-Per Claim ticket size- comparison', 
      'Top 10 Occupancies ( in terms of GWP)- FIRE', 'Banca - Top 10 Occupancies', 'Banca (Partner Others) - Channel wise Report', 
      'Banca PSU Partner Report', 'Fire- Banca PSU - Dwelling Annual and Long Term', 'Fire Banca- Partner Others - Dwelling Annual and Long Term', 
      'FIRE - PSU Bank wise NOP', 'FIRE - PSU Bank wise GWP', 'FIRE - Occupancy wise GWP (PSU Banks)', 'PSU Banks - SI Band wise Report', 
      'PSU Banks - Risk location Region wise Report' 
    ], 
    Engineering: [ 
      'Portfolio - GWP Mix', 'CPM - Segment & Channel wise Premium contribution', 'IBL _ CPM - Top 15 Risk location wise Premium & Claims Report', 
      'MBD & EEI - Segment wise Report', 'IBL - CPM Equipment wise Report', 'EAR - Project wise Report', 
'CAR - Project wise Report' 
    ], 
    Marine: [ 
      'Segment wise GWP Mix', 'Segment wise Average Premium & Rate', 'Segment wise Renewal Ratio', 
      'Marine policies issued with CPM cover', 'Marine Cargo wise Premium Report' 
    ], 
    Liability: [ 
      'WC - Top 5 Occupancy', 'Major Clients', 'CGL - Top 5 Occupancy', 'PI - Top 5 Occupancy' 
    ] 
  }; 
 
  const tabs = Object.keys(sectionData); 
 
  const handleDownloadTemplate = (templateName) => { 
    const link = document.createElement('a'); 
    link.href = `/src/templates/${templateName}.xlsx`; 
    link.download = `${templateName}_template.xlsx`; 
    link.click(); 
  }; 
 
  // --- Helper: Parse Excel Numbers --- 
  const parseExcelNumber = (val) => { 
    if (val === undefined || val === null || val === '') return 0; 
    if (typeof val === 'number') return val; 
     
    let str = val.toString().trim(); 
    if (str === '-') return 0; 
 
    let isNegative = false; 
    if (str.startsWith('(') && str.endsWith(')')) { 
      isNegative = true; 
      str = str.replace(/[()]/g, ''); 
    } 
 
    str = str.replace(/,/g, ''); 
    const parsed = parseFloat(str); 
    return isNaN(parsed) ? 0 : (isNegative ? -parsed : parsed); 
  }; 
 
  // --- Helper: Title Case for LOBs --- 
  const toTitleCase = (str) => { 
    if (!str) return ''; 
    return str.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()); 
  }; 
 
  // --- Logic: Process Broker File (Nested Grouping) --- 
  const processBrokerFile = (data) => { 
    const grouped = {}; 
    data.forEach(row => { 
      const time = row['Time']; 
      const rawBroker = row['Broker Name']; 
      const rawSubChannel = row['UW Sub Channel']; 
      const rawLOB = row['LOB']; 
      const rawPrem = row['Prem']; 
 
      if (!time || !rawBroker || !rawLOB) return; 
 
      const brokerName = rawBroker.trim(); 
      const subChannel = rawSubChannel ? rawSubChannel.trim() : '(None)'; 
      const lob = toTitleCase(rawLOB.trim()); 
      const prem = parseExcelNumber(rawPrem); 
 
      if (!grouped[time]) grouped[time] = {}; 
      if (!grouped[time][brokerName]) grouped[time][brokerName] = {}; 
      if (!grouped[time][brokerName][subChannel]) grouped[time][brokerName][subChannel] = { "Grand Total": 0 }; 
      if (!grouped[time][brokerName][subChannel][lob]) grouped[time][brokerName][subChannel][lob] = 0; 
 
      grouped[time][brokerName][subChannel][lob] += prem; 
      grouped[time][brokerName][subChannel]["Grand Total"] += prem; 
    }); 
    return grouped; 
  }; 
 
  // --- Logic: Process LOB & Segment Wise File 02 (Nested Grouping) --- 
  const processLobSegmentFile = (data) => { 
    const grouped = {}; 
    data.forEach(row => { 
      const time = row['Time']; 
      const subChannel = row['UW Sub Channel']; 
      const rawLOB = row['LOB']; 
 
      if (!time || !subChannel || !rawLOB) return; 
 
      const lob = toTitleCase(rawLOB.trim()); 
 
      if (!grouped[time]) grouped[time] = {}; 
      if (!grouped[time][subChannel]) grouped[time][subChannel] = {}; 
      if (!grouped[time][subChannel][lob]) { 
        grouped[time][subChannel][lob] = { 
          "Total NOP": 0, 
          "Total Prem": 0, 
          "Total Earned Prem": 0, 
          "Total Claim incurred in Period": 0 
        }; 
      } 
 
      grouped[time][subChannel][lob]["Total NOP"] += parseExcelNumber(row['Net Pol']); 
      grouped[time][subChannel][lob]["Total Prem"] += parseExcelNumber(row['Prem']); 
      grouped[time][subChannel][lob]["Total Earned Prem"] += parseExcelNumber(row['Earned Prem']); 
      grouped[time][subChannel][lob]["Total Claim incurred in Period"] += parseExcelNumber(row['Claim incurred in period']); 
    }); 
 
    return grouped; 
  }; 
 
  // --- Logic: Process LOB & Segment File (Original for Chart) --- 
  const processLobFile = (data) => { 
    const grouped = {}; 
    data.forEach(row => { 
      const time = row['Time']; 
      const lob = row['LOB']; 
      if (!time || !lob) return; 
      if (!grouped[time]) grouped[time] = {}; 
      if (!grouped[time][lob]) { 
        grouped[time][lob] = { "Total Prem": 0, "Total Earned Prem": 0, "Total Net Pol": 0, "Total Claim incurred in period": 0 }; 
      } 
      grouped[time][lob]["Total Prem"] += parseExcelNumber(row['Prem']); 
      grouped[time][lob]["Total Earned Prem"] += parseExcelNumber(row['Earned Prem']); 
      grouped[time][lob]["Total Net Pol"] += parseExcelNumber(row['Net Pol']); 
      grouped[time][lob]["Total Claim incurred in period"] += parseExcelNumber(row['Claim incurred in period']); 
    }); 
    return Object.keys(grouped).map(timeKey => ({ "Time": timeKey, "LOB": grouped[timeKey] })); 
  }; 
 
  // --- Logic: Process Dwellings File --- 
  const processDwellingsFile = (data) => { 
    const grouped = {}; 
    data.forEach(row => { 
      const time = row['Time']; 
      if (!time) return; 
      if (!grouped[time]) { 
        grouped[time] = { "Total Prem": 0, "Total Earned Prem": 0, "Total Net Pol": 0, "Total Claim incurred in period": 0 }; 
      } 
      grouped[time]["Total Prem"] += parseExcelNumber(row['Prem']); 
      grouped[time]["Total Earned Prem"] += parseExcelNumber(row['Earned Prem']); 
      grouped[time]["Total Net Pol"] += parseExcelNumber(row['Net Pol']); 
      grouped[time]["Total Claim incurred in period"] += parseExcelNumber(row['Claim incurred in period']); 
    }); 
    return Object.keys(grouped).map(timeKey => ({ "Time": timeKey, ...grouped[timeKey] })); 
  }; 
 
  // --- Logic: Process FIRE - Banca Channel wise UnderInsurance Report --- 
  const processFireBancaFile = (data) => { 
    const grouped = {}; 
    data.forEach(row => { 
      const time = row['Time']; 
      const bankName = row['Bank Name']; 
 
      if (!time || !bankName) return; 
 
      if (!grouped[time]) { 
        grouped[time] = { 
          "Time": time, 
          "Banks": {} 
        }; 
      } 
 
      if (!grouped[time].Banks[bankName]) { 
        grouped[time].Banks[bankName] = { 
          "Comm/Hlth SubProduct Name": row['Comm/Hlth SubProduct Name'] || "", 
          "Total Claim paid": 0, 
          "Num claims registered": 0, 
          "Under insurance estimate": 0, 
          "NOC": 0 
        }; 
      } 
 
      const bankData = grouped[time].Banks[bankName]; 
      bankData["Total Claim paid"] += parseExcelNumber(row['Claim paid']); 
      bankData["Num claims registered"] += parseExcelNumber(row['Num claims registered']); 
      bankData["Under insurance estimate"] += parseExcelNumber(row['Under insurance estimate']); 
      bankData["NOC"] += parseExcelNumber(row['NOC']); 
    }); 
    return Object.values(grouped); 
  }; 
 
  // --- Logic: Process New Business Sourced --- 
  const processNewBusinessFile = (data) => { 
    const result = {}; 
    let currentChannel = ''; 
 
    data.forEach(row => { 
      if (row['Time']) { 
        result['Time'] = row['Time']; 
      } 
      if (row['UW Sub Channel']) { 
        currentChannel = row['UW Sub Channel'].toString().trim(); 
      } 
      if (!currentChannel) return; 
      if (!result[currentChannel]) { 
        result[currentChannel] = []; 
      } 
      if (row['Data']) { 
        result[currentChannel].push(row['Data']); 
      } 
    }); 
    return result; 
  }; 
 
  // --- Logic: Process New Initiatives --- 
  const processNewInitiativesFile = (data) => { 
    const result = { "Time": "", "Data": [] }; 
    data.forEach(row => { 
      if (row['Time'] && !result["Time"]) { 
        result["Time"] = row['Time']; 
      } 
      if (row['Data']) { 
        result["Data"].push(row['Data']); 
      } 
    }); 
    return result; 
  }; 
 
  // --- Logic: Process Large Risk Underwritten --- 
  const processLargeRiskFile = (data) => { 
    const result = { "Time": "", "Data": [] }; 
    data.forEach(row => { 
      if (row['Time'] && !result["Time"]) { 
        result["Time"] = row['Time']; 
      } 
      if (row['Data']) { 
        result["Data"].push(row['Data']); 
      } 
    }); 
    return result; 
  }; 
 
  // --- Logic: Process Last Five Years Comparison File --- 
  const processLastFiveYearsFile = (data) => { 
    if (!data || data.length < 4) return {}; 
    const headerRow = data[0];  
    const result = {}; 
 
    for (let colIndex = 1; colIndex < headerRow.length; colIndex++) { 
      const timePeriod = headerRow[colIndex]; 
      if (timePeriod) { 
        const periodData = []; 
        for (let rowIndex = 3; rowIndex < data.length; rowIndex++) { 
          const row = data[rowIndex]; 
          if (!row || !row[0]) continue;  
 
          const getVal = (offset) => parseExcelNumber(row[colIndex + offset]); 
 
          const rowObj = { 
            "Segment": row[0], 
            "FIRE": { "NOP": getVal(0), "GWP": getVal(1), "GIC:GEP": getVal(2) }, 
            "ENGINEERING": { "NOP": getVal(3), "GWP": getVal(4), "GIC:GEP": getVal(5) }, 
            "MISCELLANEOUS": { "NOP": getVal(6), "GWP": getVal(7), "GIC:GEP": getVal(8) }, 
            "Marine": { "NOP": getVal(9), "GWP": getVal(10), "GIC:GEP": getVal(11) }, 
            "Liability": { "NOP": getVal(12), "GWP": getVal(13), "GIC:GEP": getVal(14) }, 
            "Overall": { "NOP": getVal(15), "GWP": getVal(16), "GIC:GEP": getVal(17) } 
          }; 
          periodData.push(rowObj); 
        } 
        if (periodData.length > 0) { 
            result[timePeriod] = periodData; 
        } 
      } 
    } 
    return result; 
  }; 
 
  // --- Logic: Process Cordys TAT Report --- 
  const processCordysFile = (data) => { 
    const result = []; 
    let currentMonthGroup = null; 
 
    const formatPct = (val) => { 
      if (val === undefined || val === null) return "0%"; 
      if (typeof val === 'number') { 
         return `${Math.round(val * 100)}%`;  
      } 
      return val; 
    }; 
 
    for (let i = 0; i < data.length; i++) { 
        const row = data[i]; 
        if (!row || row.length === 0) continue; 
 
        const str0 = (row[0] || '').toString(); 
        const str1 = (row[1] || '').toString(); 
         
        if (str0.includes('Month') || str1.includes('No of RFQ')) continue; 
 
        if (str0.toLowerCase().includes('overall total')) { 
             const overallObj = { 
                "Overall Total": { 
                  "Same Day": { "No of RFQ's": row[2], "%": formatPct(row[3]) }, 
                  "Next day": { "No of RFQ's": row[4], "%": formatPct(row[5]) }, 
                  "Beyond that": { "No of RFQ's": row[6], "%": formatPct(row[7]) }, 
                  "Grand Total": row[8] 
                } 
             }; 
             result.push(overallObj); 
             continue; 
        } 
 
        if (row[0]) { 
            currentMonthGroup = { 
                "Month": row[0], 
                "Data": [] 
            }; 
            result.push(currentMonthGroup); 
        } 
 
        if (row[1] && currentMonthGroup) { 
            const entry = { 
                "LOB": row[1], 
                "Same Day": { "No of RFQ's": row[2], "%": formatPct(row[3]) }, 
                "Next day": { "No of RFQ's": row[4], "%": formatPct(row[5]) }, 
                "Beyond that": { "No of RFQ's": row[6], "%": formatPct(row[7]) }, 
                "Grand Total": row[8] 
            }; 
            currentMonthGroup.Data.push(entry); 
        } 
    } 
    return result; 
  }; 
 
  // --- Trigger Download of JSON --- 
  const downloadJson = (data, filename) => { 
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data, null, 
2)); 
    const downloadAnchorNode = document.createElement('a'); 
    downloadAnchorNode.setAttribute("href", dataStr); 
    downloadAnchorNode.setAttribute("download", filename); 
    document.body.appendChild(downloadAnchorNode); 
    downloadAnchorNode.click(); 
    downloadAnchorNode.remove(); 
  }; 
 
  // --- Main Upload Handler --- 
  const handleUploadAndProcess = async () => { 
    setProcessing(true); 
     
    // 1. Process LOB File 
    if (lobFile) { 
      const reader = new FileReader(); 
      reader.onload = (e) => { 
        const wb = XLSX.read(e.target.result, { type: 'binary' }); 
        const sheetName = wb.SheetNames[0]; 
        const json = XLSX.utils.sheet_to_json(wb.Sheets[sheetName]); 
        const processedData = processLobFile(json); 
        downloadJson(processedData, "LOB_AND_SEGMENT_WISE_DATA.json"); 
      }; 
      reader.readAsBinaryString(lobFile); 
    } 
 
    // 2. Process Dwellings File 
    if (dwellingsFile) { 
      const reader = new FileReader(); 
      reader.onload = (e) => { 
        const wb = XLSX.read(e.target.result, { type: 'binary' }); 
        const sheetName = wb.SheetNames[0]; 
        const json = XLSX.utils.sheet_to_json(wb.Sheets[sheetName]); 
        const processedData = processDwellingsFile(json); 
        downloadJson(processedData, "Dwellings.json"); 
      }; 
      reader.readAsBinaryString(dwellingsFile); 
    } 
 
    // 3. Process Broker Report File 
    if (brokerFile) { 
      const reader = new FileReader(); 
      reader.onload = (e) => { 
        const wb = XLSX.read(e.target.result, { type: 'binary' }); 
        const sheetName = wb.SheetNames[0]; 
        const json = XLSX.utils.sheet_to_json(wb.Sheets[sheetName]); 
        const processedData = processBrokerFile(json); 
        downloadJson(processedData, "BROKER_WISE_REPORT.json"); 
      }; 
      reader.readAsBinaryString(brokerFile); 
    } 
 
    // 4. Process LOB & Segment Wise Report File (New) 
    if (lobSegmentFile) { 
      const reader = new FileReader(); 
      reader.onload = (e) => { 
        const wb = XLSX.read(e.target.result, { type: 'binary' }); 
        const sheetName = wb.SheetNames[0]; 
        const json = XLSX.utils.sheet_to_json(wb.Sheets[sheetName]); 
        const processedData = processLobSegmentFile(json); 
        downloadJson(processedData, "LOB_AND_SEGMENT_WISE_DATA_02.json"); 
      }; 
      reader.readAsBinaryString(lobSegmentFile); 
    } 
 
    // 5. Process FIRE - Banca Channel wise UnderInsurance Report 
    if (fireBancaFile) { 
      const reader = new FileReader(); 
      reader.onload = (e) => { 
        const wb = XLSX.read(e.target.result, { type: 'binary' }); 
        const sheetName = wb.SheetNames[0]; 
        const json = XLSX.utils.sheet_to_json(wb.Sheets[sheetName]); 
        const processedData = processFireBancaFile(json); 
        downloadJson(processedData, "FIRE_BANCA_CHANNEL_WISE_UNDERINSURANCE_REPORT.json"); 
      }; 
      reader.readAsBinaryString(fireBancaFile); 
    } 
 
    // 6. Process New Business Sourced 
    if (newBusinessFile) { 
      const reader = new FileReader(); 
      reader.onload = (e) => { 
        const wb = XLSX.read(e.target.result, { type: 'binary' }); 
        const sheetName = wb.SheetNames[0]; 
        const json = XLSX.utils.sheet_to_json(wb.Sheets[sheetName]); 
        const processedData = processNewBusinessFile(json); 
        downloadJson(processedData, "NEW_BUSINESS_SOURCED.json"); 
      }; 
      reader.readAsBinaryString(newBusinessFile); 
    } 
 
    // 7. Process New Initiatives 
    if (newInitiativesFile) { 
      const reader = new FileReader(); 
      reader.onload = (e) => { 
        const wb = XLSX.read(e.target.result, { type: 'binary' }); 
        const sheetName = wb.SheetNames[0]; 
        const json = XLSX.utils.sheet_to_json(wb.Sheets[sheetName]); 
        const processedData = processNewInitiativesFile(json); 
        downloadJson(processedData, "NEW_INITIATIVES.json"); 
      }; 
      reader.readAsBinaryString(newInitiativesFile); 
    } 
 
    // 8. Process Large Risk Underwritten 
    if (largeRiskFile) { 
      const reader = new FileReader(); 
      reader.onload = (e) => { 
        const wb = XLSX.read(e.target.result, { type: 'binary' }); 
        const sheetName = wb.SheetNames[0]; 
        const json = XLSX.utils.sheet_to_json(wb.Sheets[sheetName]); 
        const processedData = processLargeRiskFile(json); 
        downloadJson(processedData, "LARGE_RISK_UNDERWRITTEN.json"); 
      }; 
      reader.readAsBinaryString(largeRiskFile); 
    } 
 
    // 9. Process Last Five Years Comparison 
    if (lastFiveYearsFile) { 
      const reader = new FileReader(); 
      reader.onload = (e) => { 
        const wb = XLSX.read(e.target.result, { type: 'binary' }); 
        let allYearsData = {}; 
        wb.SheetNames.forEach(sheetName => { 
            const json = XLSX.utils.sheet_to_json(wb.Sheets[sheetName], { header: 1 }); 
            const sheetResult = processLastFiveYearsFile(json); 
            if (sheetResult && Object.keys(sheetResult).length > 0) { 
                Object.assign(allYearsData, sheetResult); 
            } 
        }); 
        downloadJson(allYearsData, "LAST_FIVE_YEARS_COMPARISON.json"); 
      }; 
      reader.readAsBinaryString(lastFiveYearsFile); 
    } 
 
    // 10. Process Cordys TAT Report 
    if (cordysFile) { 
      const reader = new FileReader(); 
      reader.onload = (e) => { 
        const wb = XLSX.read(e.target.result, { type: 'binary' }); 
        // Use header: 1 to get array of arrays, easier to parse the block structure 
        const json = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { header: 1 }); 
        const processedData = processCordysFile(json); 
        downloadJson(processedData, "CORDYS_TAT_REPORT.json"); 
      }; 
      reader.readAsBinaryString(cordysFile); 
    } 
 
    setTimeout(() => { 
      setProcessing(false); 
      setActiveModal(null); 
      setLobFile(null); 
      setDwellingsFile(null); 
      setBrokerFile(null); 
      setLobSegmentFile(null); 
      setFireBancaFile(null); 
      setNewBusinessFile(null); 
      setNewInitiativesFile(null); 
      setLargeRiskFile(null); 
      setLastFiveYearsFile(null); 
      setCordysFile(null); 
      alert("Files processed! JSON files have been downloaded. Please move them to 'src/data'."); 
    }, 1000); 
  }; 
 
  // --- UI: Reset state when closing modal --- 
  const closeModal = () => { 
    setActiveModal(null); 
    setLobFile(null); 
    setDwellingsFile(null); 
    setBrokerFile(null); 
    setLobSegmentFile(null); 
    setFireBancaFile(null); 
    setNewBusinessFile(null); 
    setNewInitiativesFile(null); 
    setLargeRiskFile(null); 
    setLastFiveYearsFile(null); 
    setCordysFile(null); 
  }; 
 
  return ( 
    <div className="p-6 max-w-6xl mx-auto bg-white min-h-screen"> 
      {/* Header Section */} 
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 border-b pb-6 border-gray-100"> 
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2"> 
          <UploadIcon className="text-blue-600" /> Excel File Uploader 
        </h1> 
         
        <div className="flex gap-4 mt-4 md:mt-0"> 
          <div className="flex flex-col"> 
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Month</label> 
            <select  
              value={selectedDate.month} 
              onChange={(e) => setSelectedDate({ ...selectedDate, month: e.target.value })} 
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5" 
            > 
              {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map(m => ( 
                <option key={m} value={m}>{m}</option> 
              ))} 
            </select> 
          </div> 
          <div className="flex flex-col"> 
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Financial Year</label> 
            <select  
              value={selectedDate.year} 
              onChange={(e) => setSelectedDate({ ...selectedDate, year: e.target.value })} 
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5" 
            > 
              <option value="2024-25">2024-25</option> 
              <option value="2025-26">2025-26</option> 
            </select> 
          </div> 
        </div> 
      </div> 
 
      {/* Tabs Navigation */} 
      <div className="flex flex-wrap border-b border-gray-200 mb-6"> 
        {tabs.map((tab) => ( 
          <button 
            key={tab} 
            onClick={() => setActiveTab(tab)} 
            className={`mr-2 px-6 py-3 text-sm font-medium transition-colors duration-200 border-b-2 ${ 
              activeTab === tab  
                ? 'border-blue-600 text-blue-600'  
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300' 
            }`} 
          > 
            {tab.replace(/([A-Z])/g, ' $1').trim()} 
          </button> 
        ))} 
      </div> 
 
      {/* Buttons Grid */} 
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3"> 
        {sectionData[activeTab].map((item, index) => ( 
          <button 
            key={index} 
            onClick={() => setActiveModal(item)} 
            className="flex items-center p-3 text-left text-sm font-medium text-gray-700 bg-gray-50 
border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 
transition-all duration-200 shadow-sm" 
          > 
            <FileText className="w-4 h-4 mr-3 opacity-60" /> 
            {item} 
          </button> 
        ))} 
      </div> 
 
      {/* Upload Modal */} 
      {activeModal && ( 
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 
backdrop-blur-sm p-4"> 
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in 
fade-in zoom-in duration-200"> 
            <div className="flex items-center justify-between p-4 border-b"> 
              <h3 className="text-lg font-semibold text-gray-800 truncate pr-4"> 
                {activeModal} 
              </h3> 
              <button  
                onClick={closeModal} 
                className="p-1 hover:bg-gray-100 rounded-full transition-colors" 
              > 
                <X className="w-6 h-6 text-gray-500" /> 
              </button> 
            </div> 
             
            <div className="p-6"> 
              {/* Layout for LOB wise NOP GWP GIC:GEP */} 
              {activeModal === 'LOB wise NOP GWP GIC:GEP' ? ( 
                <div className="space-y-4"> 
                  <div className="bg-blue-50 p-3 rounded-lg flex items-start gap-3"> 
                    <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" /> 
                    <p className="text-xs text-blue-800"> 
                      Upload one or both files. The system will process them and download the JSON data 
automatically. 
                    </p> 
                  </div> 
 
                  {/* Input 1: LOB & Segment Wise */} 
                  <div className="border rounded-xl p-4 bg-gray-50 hover:border-blue-300 
transition-colors"> 
                    <label className="block text-sm font-bold text-gray-700 mb-2">1. LOB and Segment wise 
Data</label> 
                    <div className="flex items-center gap-3"> 
                       <label className="flex-1 cursor-pointer"> 
                          <div className="flex items-center justify-center w-full px-4 py-2 bg-white border 
border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50"> 
                            {lobFile ? ( 
                              <span className="flex items-center text-green-600 gap-2"><CheckCircle 
className="w-4 h-4"/> Selected</span> 
                            ) : ( 
                              <span>Choose Excel File</span> 
                            )} 
                          </div> 
                          <input type="file" className="hidden" accept=".xlsx, .xls" onChange={(e) => 
setLobFile(e.target.files[0])} /> 
                       </label> 
                       {lobFile && <span className="text-xs text-gray-500 truncate 
max-w-[100px]">{lobFile.name}</span>} 
                    </div> 
                  </div> 
 
                  {/* Input 2: Dwellings */} 
                  <div className="border rounded-xl p-4 bg-gray-50 hover:border-blue-300 
transition-colors"> 
                    <label className="block text-sm font-bold text-gray-700 mb-2">2. Dwellings Data</label> 
                    <div className="flex items-center gap-3"> 
                       <label className="flex-1 cursor-pointer"> 
                          <div className="flex items-center justify-center w-full px-4 py-2 bg-white border 
border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50"> 
                            {dwellingsFile ? ( 
                              <span className="flex items-center text-green-600 gap-2"><CheckCircle 
className="w-4 h-4"/> Selected</span> 
                            ) : ( 
                              <span>Choose Excel File</span> 
                            )} 
                          </div> 
                          <input type="file" className="hidden" accept=".xlsx, .xls" onChange={(e) => 
setDwellingsFile(e.target.files[0])} /> 
                       </label> 
                       {dwellingsFile && <span className="text-xs text-gray-500 truncate 
max-w-[100px]">{dwellingsFile.name}</span>} 
                    </div> 
                  </div> 
 
                  <div className="mt-6 flex gap-3"> 
                    <button  
                      onClick={closeModal} 
                      className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg 
hover:bg-gray-50 font-medium transition-colors" 
                    > 
                      Cancel 
                    </button> 
                    <button  
                      onClick={handleUploadAndProcess} 
                      disabled={(!lobFile && !dwellingsFile) || processing} 
                      className={`flex-1 px-4 py-2 text-white rounded-lg font-medium shadow-md 
transition-colors ${ 
                        (!lobFile && !dwellingsFile) || processing  
                        ? 'bg-gray-400 cursor-not-allowed'  
                        : 'bg-blue-600 hover:bg-blue-700 shadow-blue-200' 
                      }`} 
                    > 
                      {processing ? 'Processing...' : 'Process & Download JSON'} 
                    </button> 
                  </div> 
                </div> 
              ) : activeModal === 'Broker wise GWP Report' ? ( 
                /* Layout for Broker wise GWP Report */ 
                <div className="space-y-4"> 
                  <div className="bg-blue-50 p-3 rounded-lg flex items-start gap-3"> 
                    <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" /> 
                    <p className="text-xs text-blue-800"> 
                      Upload the Broker GWP Excel file. The system will aggregate premiums by LOB, Grouped 
by Time and Broker, and generate a Grand Total. 
                    </p> 
                  </div> 
 
                  <div className="border rounded-xl p-4 bg-gray-50 hover:border-blue-300 
transition-colors"> 
                    <label className="block text-sm font-bold text-gray-700 mb-2">Broker Wise Data 
File</label> 
                    <div className="flex items-center gap-3"> 
                       <label className="flex-1 cursor-pointer"> 
                          <div className="flex items-center justify-center w-full px-4 py-2 bg-white border 
border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50"> 
                            {brokerFile ? ( 
                              <span className="flex items-center text-green-600 gap-2"><CheckCircle 
className="w-4 h-4"/> Selected</span> 
                            ) : ( 
                              <span>Choose Excel File</span> 
                            )} 
                          </div> 
                          <input type="file" className="hidden" accept=".xlsx, .xls" onChange={(e) => 
setBrokerFile(e.target.files[0])} /> 
                       </label> 
                       {brokerFile && <span className="text-xs text-gray-500 truncate 
max-w-[100px]">{brokerFile.name}</span>} 
                    </div> 
                  </div> 
 
                  <div className="mt-6 flex gap-3"> 
                    <button  
                      onClick={closeModal} 
                      className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg 
hover:bg-gray-50 font-medium transition-colors" 
                    > 
                      Cancel 
                    </button> 
                    <button  
                      onClick={handleUploadAndProcess} 
                      disabled={!brokerFile || processing} 
                      className={`flex-1 px-4 py-2 text-white rounded-lg font-medium shadow-md 
transition-colors ${ 
                        !brokerFile || processing  
                        ? 'bg-gray-400 cursor-not-allowed'  
                        : 'bg-blue-600 hover:bg-blue-700 shadow-blue-200' 
                      }`} 
                    > 
                      {processing ? 'Processing...' : 'Process & Download JSON'} 
                    </button> 
                  </div> 
                </div> 
              ) : activeModal === 'LOB & Segment wise Report' ? ( 
                /* Layout for LOB & Segment wise Report */ 
                <div className="space-y-4"> 
                  <div className="bg-blue-50 p-3 rounded-lg flex items-start gap-3"> 
                    <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" /> 
                    <p className="text-xs text-blue-800"> 
                      Upload the LOB & Segment Data file. The system will group data by Time, Sub Channel, 
and LOB. 
                    </p> 
                  </div> 
 
                  <div className="border rounded-xl p-4 bg-gray-50 hover:border-blue-300 
transition-colors"> 
                    <label className="block text-sm font-bold text-gray-700 mb-2">LOB & Segment wise 
Data File</label> 
                    <div className="flex items-center gap-3"> 
                       <label className="flex-1 cursor-pointer"> 
                          <div className="flex items-center justify-center w-full px-4 py-2 bg-white border 
border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50"> 
                            {lobSegmentFile ? ( 
                              <span className="flex items-center text-green-600 gap-2"><CheckCircle 
className="w-4 h-4"/> Selected</span> 
                            ) : ( 
                              <span>Choose Excel File</span> 
                            )} 
                          </div> 
                          <input type="file" className="hidden" accept=".xlsx, .xls" onChange={(e) => 
setLobSegmentFile(e.target.files[0])} /> 
                       </label> 
                       {lobSegmentFile && <span className="text-xs text-gray-500 truncate 
max-w-[100px]">{lobSegmentFile.name}</span>} 
                    </div> 
                  </div> 
 
                  <div className="mt-6 flex gap-3"> 
                    <button  
                      onClick={closeModal} 
                      className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg 
hover:bg-gray-50 font-medium transition-colors" 
                    > 
                      Cancel 
                    </button> 
                    <button  
                      onClick={handleUploadAndProcess} 
                      disabled={!lobSegmentFile || processing} 
                      className={`flex-1 px-4 py-2 text-white rounded-lg font-medium shadow-md 
transition-colors ${ 
                        !lobSegmentFile || processing  
                        ? 'bg-gray-400 cursor-not-allowed'  
                        : 'bg-blue-600 hover:bg-blue-700 shadow-blue-200' 
                      }`} 
                    > 
                      {processing ? 'Processing...' : 'Process & Download JSON'} 
                    </button> 
                  </div> 
                </div> 
              ) : activeModal === 'FIRE - Banca Channel wise UnderInsurance Report' ? ( 
                /* Layout for FIRE - Banca Channel wise UnderInsurance Report */ 
                <div className="space-y-4"> 
                  <div className="bg-blue-50 p-3 rounded-lg flex items-start gap-3"> 
                    <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" /> 
                    <p className="text-xs text-blue-800"> 
                      Upload the Banca Channel UnderInsurance Excel file. The system will aggregate claims and 
insurance data by Bank for each Time period. 
                    </p> 
                  </div> 
 
                  <div className="border rounded-xl p-4 bg-gray-50 hover:border-blue-300 
transition-colors"> 
                    <label className="block text-sm font-bold text-gray-700 mb-2">Banca UnderInsurance 
Data</label> 
                    <div className="flex items-center gap-3"> 
                       <label className="flex-1 cursor-pointer"> 
                          <div className="flex items-center justify-center w-full px-4 py-2 bg-white border 
border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50"> 
                            {fireBancaFile ? ( 
                              <span className="flex items-center text-green-600 gap-2"><CheckCircle 
className="w-4 h-4"/> Selected</span> 
                            ) : ( 
                              <span>Choose Excel File</span> 
                            )} 
                          </div> 
                          <input type="file" className="hidden" accept=".xlsx, .xls" onChange={(e) => 
setFireBancaFile(e.target.files[0])} /> 
                       </label> 
                       {fireBancaFile && <span className="text-xs text-gray-500 truncate 
max-w-[100px]">{fireBancaFile.name}</span>} 
                    </div> 
                  </div> 
 
                  <div className="mt-6 flex gap-3"> 
                    <button  
                      onClick={closeModal} 
                      className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg 
hover:bg-gray-50 font-medium transition-colors" 
                    > 
                      Cancel 
                    </button> 
                    <button  
                      onClick={handleUploadAndProcess} 
                      disabled={!fireBancaFile || processing} 
                      className={`flex-1 px-4 py-2 text-white rounded-lg font-medium shadow-md 
transition-colors ${ 
                        !fireBancaFile || processing  
                        ? 'bg-gray-400 cursor-not-allowed'  
                        : 'bg-blue-600 hover:bg-blue-700 shadow-blue-200' 
                      }`} 
                    > 
                      {processing ? 'Processing...' : 'Process & Download JSON'} 
                    </button> 
                  </div> 
                </div> 
              ) : activeModal === 'New Business Sourced (>5 lakhs)' ? ( 
                /* Layout for New Business Sourced */ 
                <div className="space-y-4"> 
                  <div className="bg-blue-50 p-3 rounded-lg flex items-start gap-3"> 
                    <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" /> 
                    <p className="text-xs text-blue-800"> 
                      Upload the New Business Sourced Excel file. The system will group data by UW Sub 
Channel. 
                    </p> 
                  </div> 
 
                  <div className="border rounded-xl p-4 bg-gray-50 hover:border-blue-300 
transition-colors"> 
                    <label className="block text-sm font-bold text-gray-700 mb-2">New Business Data 
File</label> 
                    <div className="flex items-center gap-3"> 
                      <label className="flex-1 cursor-pointer"> 
                        <div className="flex items-center justify-center w-full px-4 py-2 bg-white border 
border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50"> 
                          {newBusinessFile ? ( 
                            <span className="flex items-center text-green-600 gap-2"><CheckCircle 
className="w-4 h-4"/> Selected</span> 
                          ) : ( 
                            <span>Choose Excel File</span> 
                          )} 
                        </div> 
                        <input type="file" className="hidden" accept=".xlsx, .xls" onChange={(e) => 
setNewBusinessFile(e.target.files[0])} /> 
                      </label> 
                      {newBusinessFile && <span className="text-xs text-gray-500 truncate 
max-w-[100px]">{newBusinessFile.name}</span>} 
                    </div> 
                  </div> 
 
                  <div className="mt-6 flex gap-3"> 
                    <button  
                      onClick={closeModal} 
                      className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg 
hover:bg-gray-50 font-medium transition-colors" 
                    > 
                      Cancel 
                    </button> 
                    <button  
                      onClick={handleUploadAndProcess} 
                      disabled={!newBusinessFile || processing} 
                      className={`flex-1 px-4 py-2 text-white rounded-lg font-medium shadow-md 
transition-colors ${ 
                        !newBusinessFile || processing  
                        ? 'bg-gray-400 cursor-not-allowed'  
                        : 'bg-blue-600 hover:bg-blue-700 shadow-blue-200' 
                      }`} 
                    > 
                      {processing ? 'Processing...' : 'Process & Download JSON'} 
                    </button> 
                  </div> 
                </div> 
              ) : activeModal === 'New Initiatives' ? ( 
                /* Layout for New Initiatives */ 
                <div className="space-y-4"> 
                  <div className="bg-blue-50 p-3 rounded-lg flex items-start gap-3"> 
                    <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" /> 
                    <p className="text-xs text-blue-800"> 
                      Upload the New Initiatives Excel file. The system will create a grouped list of initiatives. 
                    </p> 
                  </div> 
 
                  <div className="border rounded-xl p-4 bg-gray-50 hover:border-blue-300 
transition-colors"> 
                    <label className="block text-sm font-bold text-gray-700 mb-2">New Initiatives Data 
File</label> 
                    <div className="flex items-center gap-3"> 
                      <label className="flex-1 cursor-pointer"> 
                        <div className="flex items-center justify-center w-full px-4 py-2 bg-white border 
border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50"> 
                          {newInitiativesFile ? ( 
                            <span className="flex items-center text-green-600 gap-2"><CheckCircle 
className="w-4 h-4"/> Selected</span> 
                          ) : ( 
                            <span>Choose Excel File</span> 
                          )} 
                        </div> 
                        <input type="file" className="hidden" accept=".xlsx, .xls" onChange={(e) => 
setNewInitiativesFile(e.target.files[0])} /> 
                      </label> 
                      {newInitiativesFile && <span className="text-xs text-gray-500 truncate 
max-w-[100px]">{newInitiativesFile.name}</span>} 
                    </div> 
                  </div> 
 
                  <div className="mt-6 flex gap-3"> 
                    <button  
                      onClick={closeModal} 
                      className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg 
hover:bg-gray-50 font-medium transition-colors" 
                    > 
                      Cancel 
                    </button> 
                    <button  
                      onClick={handleUploadAndProcess} 
                      disabled={!newInitiativesFile || processing} 
                      className={`flex-1 px-4 py-2 text-white rounded-lg font-medium shadow-md 
transition-colors ${ 
                        !newInitiativesFile || processing  
                        ? 'bg-gray-400 cursor-not-allowed'  
                        : 'bg-blue-600 hover:bg-blue-700 shadow-blue-200' 
                      }`} 
                    > 
                      {processing ? 'Processing...' : 'Process & Download JSON'} 
                    </button> 
                  </div> 
                </div> 
              ) : activeModal === 'Large risk underwritten - More than 2500 Cr' ? ( 
                /* Layout for Large Risk Underwritten */ 
                <div className="space-y-4"> 
                  <div className="bg-blue-50 p-3 rounded-lg flex items-start gap-3"> 
                    <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" /> 
                    <p className="text-xs text-blue-800"> 
                      Upload the Large Risk Underwritten Excel file. The system will create a grouped list of large 
risks. 
                    </p> 
                  </div> 
 
                  <div className="border rounded-xl p-4 bg-gray-50 hover:border-blue-300 
transition-colors"> 
                    <label className="block text-sm font-bold text-gray-700 mb-2">Large Risk Data 
File</label> 
                    <div className="flex items-center gap-3"> 
                      <label className="flex-1 cursor-pointer"> 
                        <div className="flex items-center justify-center w-full px-4 py-2 bg-white border 
border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50"> 
                          {largeRiskFile ? ( 
                            <span className="flex items-center text-green-600 gap-2"><CheckCircle 
className="w-4 h-4"/> Selected</span> 
                          ) : ( 
                            <span>Choose Excel File</span> 
                          )} 
                        </div> 
                        <input type="file" className="hidden" accept=".xlsx, .xls" onChange={(e) => 
setLargeRiskFile(e.target.files[0])} /> 
                      </label> 
                      {largeRiskFile && <span className="text-xs text-gray-500 truncate 
max-w-[100px]">{largeRiskFile.name}</span>} 
                    </div> 
                  </div> 
 
                  <div className="mt-6 flex gap-3"> 
                    <button  
                      onClick={closeModal} 
                      className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg 
hover:bg-gray-50 font-medium transition-colors" 
                    > 
                      Cancel 
                    </button> 
                    <button  
                      onClick={handleUploadAndProcess} 
                      disabled={!largeRiskFile || processing} 
                      className={`flex-1 px-4 py-2 text-white rounded-lg font-medium shadow-md 
transition-colors ${ 
                        !largeRiskFile || processing  
                        ? 'bg-gray-400 cursor-not-allowed'  
                        : 'bg-blue-600 hover:bg-blue-700 shadow-blue-200' 
                      }`} 
                    > 
                      {processing ? 'Processing...' : 'Process & Download JSON'} 
                    </button> 
                  </div> 
                </div> 
              ) : activeModal === 'Last Five year comparison' ? ( 
                /* Layout for Last Five Year Comparison */ 
                <div className="space-y-4"> 
                  <div className="bg-blue-50 p-3 rounded-lg flex items-start gap-3"> 
                    <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" /> 
                    <p className="text-xs text-blue-800"> 
                      Upload the Last 5 Year Comparison Excel file. The system will scan across columns to 
capture all time periods available in the sheet. 
                    </p> 
                  </div> 
 
                  <div className="border rounded-xl p-4 bg-gray-50 hover:border-blue-300 
transition-colors"> 
                    <label className="block text-sm font-bold text-gray-700 mb-2">Last 5 Year Data 
File</label> 
                    <div className="flex items-center gap-3"> 
                      <label className="flex-1 cursor-pointer"> 
                        <div className="flex items-center justify-center w-full px-4 py-2 bg-white border 
border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50"> 
                          {lastFiveYearsFile ? ( 
                            <span className="flex items-center text-green-600 gap-2"><CheckCircle 
className="w-4 h-4"/> Selected</span> 
                          ) : ( 
                            <span>Choose Excel File</span> 
                          )} 
                        </div> 
                        <input type="file" className="hidden" accept=".xlsx, .xls" onChange={(e) => 
setLastFiveYearsFile(e.target.files[0])} /> 
                      </label> 
                      {lastFiveYearsFile && <span className="text-xs text-gray-500 truncate 
max-w-[100px]">{lastFiveYearsFile.name}</span>} 
                    </div> 
                  </div> 
 
                  <div className="mt-6 flex gap-3"> 
                    <button  
                      onClick={closeModal} 
                      className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg 
hover:bg-gray-50 font-medium transition-colors" 
                    > 
                      Cancel 
                    </button> 
                    <button  
                      onClick={handleUploadAndProcess} 
                      disabled={!lastFiveYearsFile || processing} 
                      className={`flex-1 px-4 py-2 text-white rounded-lg font-medium shadow-md 
transition-colors ${ 
                        !lastFiveYearsFile || processing  
                        ? 'bg-gray-400 cursor-not-allowed'  
                        : 'bg-blue-600 hover:bg-blue-700 shadow-blue-200' 
                      }`} 
                    > 
                      {processing ? 'Processing...' : 'Process & Download JSON'} 
                    </button> 
                  </div> 
                </div> 
              ) : activeModal === 'Cordys TAT Report' ? ( 
                /* Layout for Cordys TAT Report */ 
                <div className="space-y-4"> 
                  <div className="bg-blue-50 p-3 rounded-lg flex items-start gap-3"> 
                    <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" /> 
                    <p className="text-xs text-blue-800"> 
                      Upload the Cordys TAT Report Excel file. The system will process groupings by Month and 
LOB. 
                    </p> 
                  </div> 
 
                  <div className="border rounded-xl p-4 bg-gray-50 hover:border-blue-300 
transition-colors"> 
                    <label className="block text-sm font-bold text-gray-700 mb-2">Cordys TAT Data 
File</label> 
                    <div className="flex items-center gap-3"> 
                      <label className="flex-1 cursor-pointer"> 
                        <div className="flex items-center justify-center w-full px-4 py-2 bg-white border 
border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50"> 
                          {cordysFile ? ( 
                            <span className="flex items-center text-green-600 gap-2"><CheckCircle 
className="w-4 h-4"/> Selected</span> 
                          ) : ( 
                            <span>Choose Excel File</span> 
                          )} 
                        </div> 
                        <input type="file" className="hidden" accept=".xlsx, .xls" onChange={(e) => 
setCordysFile(e.target.files[0])} /> 
                      </label> 
                      {cordysFile && <span className="text-xs text-gray-500 truncate 
max-w-[100px]">{cordysFile.name}</span>} 
                    </div> 
                  </div> 
 
                  <div className="mt-6 flex gap-3"> 
                    <button  
                      onClick={closeModal} 
                      className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg 
hover:bg-gray-50 font-medium transition-colors" 
                    > 
                      Cancel 
                    </button> 
                    <button  
                      onClick={handleUploadAndProcess} 
                      disabled={!cordysFile || processing} 
                      className={`flex-1 px-4 py-2 text-white rounded-lg font-medium shadow-md 
transition-colors ${ 
                        !cordysFile || processing  
                        ? 'bg-gray-400 cursor-not-allowed'  
                        : 'bg-blue-600 hover:bg-blue-700 shadow-blue-200' 
                      }`} 
                    > 
                      {processing ? 'Processing...' : 'Process & Download JSON'} 
                    </button> 
                  </div> 
                </div> 
              ) : ( 
                /* Default Generic Upload UI */ 
                <> 
                  <div className="mb-6"> 
                    <button  
                      onClick={() => handleDownloadTemplate(activeModal)} 
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-50 
text-green-700 font-semibold rounded-xl border border-green-200 hover:bg-green-100 
transition-colors" 
                    > 
                      <Download className="w-5 h-5" /> Download Template 
                    </button> 
                  </div> 
 
                  <div className="space-y-2"> 
                    <label className="block text-sm font-medium text-gray-700">Upload Data File</label> 
                    <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 
border-dashed rounded-xl hover:border-blue-400 transition-colors bg-gray-50"> 
                      <div className="space-y-1 text-center"> 
                        <UploadIcon className="mx-auto h-10 w-10 text-gray-400" /> 
                        <div className="flex text-sm text-gray-600"> 
                          <label htmlFor="file-upload" className="relative cursor-pointer bg-transparent 
rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none"> 
                            <span>Browse files</span> 
                            <input id="file-upload" name="file-upload" type="file" className="sr-only" 
accept=".xlsx, .xls" /> 
                          </label> 
                        </div> 
                        <p className="text-xs text-gray-500">Excel files only (max. 10MB)</p> 
                      </div> 
                    </div> 
                  </div> 
                   
                  <div className="mt-8 flex gap-3"> 
                    <button  
                      onClick={closeModal} 
                      className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg 
hover:bg-gray-50 font-medium transition-colors" 
                    > 
                      Cancel 
                    </button> 
                    <button className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg 
hover:bg-blue-700 font-medium shadow-md shadow-blue-200 transition-colors"> 
                      Upload File 
                    </button> 
                  </div> 
                </> 
              )} 
            </div> 
          </div> 
        </div> 
      )} 
    </div> 
  ); 
}; 
 
export default Upload;
