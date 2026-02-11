import { useState, useEffect, Fragment } from 'react'; 
import { 
  Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
  LineChart, Line, ComposedChart, PieChart, Pie, Cell 
} from 'recharts'; 
import '../styles/OverAllReview.css'; 
 
// Static configuration for Chart LOB columns   
const chartLobOrder = [ 
  { key: 'FIRE (Dwellings)', label: 'FIRE (Dwellings)', colorClass: 'lob-fire' }, 
  { key: 'FIRE (Non-Dwellings)', label: 'FIRE (Non-Dwellings)', colorClass: 'lob-fire' }, 
  { key: 'ENGINEERING', label: 'ENGINEERING', colorClass: 'lob-engineering' }, 
  { key: 'MISCELLANEOUS', label: 'MISCELLANEOUS', colorClass: 'lob-miscellaneous' }, 
  { key: 'MARINE', label: 'MARINE', colorClass: 'lob-marine' }, 
  { key: 'LIABILITY', label: 'LIABILITY', colorClass: 'lob-liability' }, 
  { key: 'OVERALL', label: 'OVERALL', colorClass: 'lob-overall' } 
]; 
 
const OverAllReview = ({ selectedDate }) => { 
  // --- State Management ---   
  const [lobRawData, setLobRawData] = useState([]); 
  const [dwellingsRawData, setDwellingsRawData] = useState([]); 
  const [brokerRawData, setBrokerRawData] = useState({}); 
  const [lobSegmentRawData, setLobSegmentRawData] = useState({}); 
  const [fireBancaRawData, setFireBancaRawData] = useState([]); 
  const [newBusinessSourcedData, setNewBusinessSourcedData] = useState({}); 
  const [fetchedNewInitiatives, setFetchedNewInitiatives] = useState({}); // New State for Initiatives 
  const [allData, setAllData] = useState({}); 
  const [loading, setLoading] = useState(true); 
  const [error, setError] = useState(null); 
 
  // Chart Data   
  const [availablePeriods, setAvailablePeriods] = useState([]); 
  const [selectedLobPeriod, setSelectedLobPeriod] = useState(''); 
  const [chartData, setChartData] = useState([]); 
 
  // Broker Table Data   
  const [processedBrokerData, setProcessedBrokerData] = useState([]); 
  const [brokerTotalRow, setBrokerTotalRow] = useState(null); 
  const [brokerHeaderTime, setBrokerHeaderTime] = useState(''); 
 
  // LOB & Segment Table Data   
  const [selectedMatrixPeriod, setSelectedMatrixPeriod] = useState(''); 
  const [matrixPeriods, setMatrixPeriods] = useState([]); 
  const [processedMatrixData, setProcessedMatrixData] = useState([]); 
 
  // Growth Section Data   
  const [growthPeriods, setGrowthPeriods] = useState([]); 
  const [selectedGrowthPeriod, setSelectedGrowthPeriod] = useState(''); 
  const [growthChartData, setGrowthChartData] = useState([]); 
  const [growthFYLabels, setGrowthFYLabels] = useState({ current: '', previous: '' }); 
 
  // Fire Banca Table Data 
  const [processedFireBancaData, setProcessedFireBancaData] = useState([]); 
  const [fireBancaTotal, setFireBancaTotal] = useState(null); 
  const [fireBancaTime, setFireBancaTime] = useState(''); 
 
  // Growth Popup Data   
  const [showGrowthPopup, setShowGrowthPopup] = useState(false); 
  const [popupPeriod, setPopupPeriod] = useState("Apr'24 - Mar'25"); 
 
  // --- CUSTOM LABEL FUNCTION (Fixes Overflow & Centers Text) ---  
  const RADIAN = Math.PI / 180; 
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, value }) => { 
    // Calculate the radius to be exactly in the middle of the donut ring  
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5; 
    const x = cx + radius * Math.cos(-midAngle * RADIAN); 
    const y = cy + radius * Math.sin(-midAngle * RADIAN); 
 
    return ( 
      <text 
        x={x} 
        y={y} 
        fill="black" 
        textAnchor="middle" 
        dominantBaseline="central" 
        style={{ fontSize: '11px', fontWeight: 'bold' }} 
      > 
        {value.toLocaleString()} 
      </text> 
    ); 
  }; 
 
  // --- Data Fetching ---   
  useEffect(() => { 
    const loadData = async () => { 
      try { 
        setLoading(true); 
        setError(null); 
 
        // Safely load all JSON files   
        const modules = import.meta.glob('../data/*.json', { eager: true }); 
 
        const getFile = (name) => { 
          const key = Object.keys(modules).find(k => k.includes(name)); 
          return key ? (modules[key].default || modules[key]) : null; 
        }; 
 
        const lobJson = getFile('LOB_AND_SEGMENT_WISE_DATA.json') || []; 
        const dwellingsJson = getFile('Dwellings') || []; 
        const brokerJson = getFile('BROKER_WISE_REPORT') || {}; 
        const lobSegmentJson = getFile('LOB_AND_SEGMENT_WISE_DATA_02') || {}; 
        const fireBancaJson = getFile('FIRE_BANCA_CHANNEL_WISE_UNDERINSURANCE_REPORT') || 
[]; 
        const newBusinessJson = getFile('NEW_BUSINESS_SOURCED') || {}; 
        const newInitiativesJson = getFile('NEW_INITIATIVES') || {}; // Load Initiatives 
        const overallJson = getFile('overall_review_data') || {}; 
 
        setLobRawData(lobJson); 
        setDwellingsRawData(dwellingsJson); 
        setBrokerRawData(brokerJson); 
        setLobSegmentRawData(lobSegmentJson); 
        setFireBancaRawData(fireBancaJson); 
        setNewBusinessSourcedData(newBusinessJson); 
        setFetchedNewInitiatives(newInitiativesJson); 
        setAllData(overallJson); 
 
        // Initialize Chart Dropdown   
        if (Array.isArray(lobJson) && lobJson.length > 0) { 
          const periods = lobJson.map(item => item.Time); 
          setAvailablePeriods(periods); 
          const match = periods.find(p => p.includes(selectedDate?.month)) || periods[0]; 
          setSelectedLobPeriod(match); 
 
          // Initialize Growth Dropdown (YTD only)   
          const ytdPeriods = periods.filter(p => p.toLowerCase().startsWith('april')); 
          setGrowthPeriods(ytdPeriods); 
          const growthMatch = ytdPeriods.find(p => p.includes(selectedDate?.month)) || 
            ytdPeriods[0] || ''; 
          setSelectedGrowthPeriod(growthMatch); 
        } 
 
        // Initialize Matrix Dropdown   
        const mPeriods = Object.keys(lobSegmentJson); 
        setMatrixPeriods(mPeriods); 
        if (mPeriods.length > 0) { 
          const match = mPeriods.find(p => p.includes(selectedDate?.month)) || mPeriods[0]; 
          setSelectedMatrixPeriod(match); 
        } 
 
      } catch (err) { 
        console.error("Error loading data:", err); 
        setError("Failed to load data files."); 
      } finally { 
        setLoading(false); 
      } 
    }; 
 
    loadData(); 
  }, [selectedDate]); 
 
  // --- Chart Data Processing ---   
  useEffect(() => { 
    if (!selectedLobPeriod || !lobRawData || lobRawData.length === 0) return; 
 
    const lobPeriodData = lobRawData.find(item => item.Time === selectedLobPeriod); 
    const dwellingPeriodData = dwellingsRawData.find(item => item.Time === 
selectedLobPeriod) || {}; 
 
    if (!lobPeriodData) return; 
 
    const getNum = (val) => val || 0; 
    const processedChartData = []; 
    let totalNop = 0, totalPrem = 0, totalEarned = 0, totalClaims = 0; 
 
    // Fire Split   
    const fireDwelling = { 
      label: 'FIRE (Dwellings)', 
      nop: getNum(dwellingPeriodData["Total Net Pol"]), 
      prem: getNum(dwellingPeriodData["Total Prem"]), 
      earned: getNum(dwellingPeriodData["Total Earned Prem"]), 
      claims: getNum(dwellingPeriodData["Total Claim incurred in period"]), 
    }; 
 
    const totalFireLOB = lobPeriodData.LOB?.['FIRE'] || {}; 
    const totalFire = { 
      nop: getNum(totalFireLOB["Total Net Pol"]), 
      prem: getNum(totalFireLOB["Total Prem"]), 
      earned: getNum(totalFireLOB["Total Earned Prem"]), 
      claims: getNum(totalFireLOB["Total Claim incurred in period"]), 
    }; 
 
    const fireNonDwelling = { 
      label: 'FIRE (Non-Dwellings)', 
      nop: totalFire.nop - fireDwelling.nop, 
      prem: totalFire.prem - fireDwelling.prem, 
      earned: totalFire.earned - fireDwelling.earned, 
      claims: totalFire.claims - fireDwelling.claims, 
    }; 
 
    [fireDwelling, fireNonDwelling].forEach(item => { 
      processedChartData.push({ 
        lob: item.label, 
        nop: item.nop, 
        gwp_millions: Math.round(item.prem / 1000000), 
        gic_gep: item.earned !== 0 ? Math.round((item.claims / item.earned) * 100) : 0, 
        raw_gwp: item.prem 
      }); 
      totalNop += item.nop; totalPrem += item.prem; totalEarned += item.earned; totalClaims += 
item.claims; 
    }); 
 
    const otherLobs = ['ENGINEERING', 'MISCELLANEOUS', 'MARINE', 'LIABILITY']; 
    otherLobs.forEach(key => { 
      const data = lobPeriodData.LOB?.[key] || {}; 
      const nop = getNum(data["Total Net Pol"]); 
      const prem = getNum(data["Total Prem"]); 
      const earned = getNum(data["Total Earned Prem"]); 
      const claims = getNum(data["Total Claim incurred in period"]); 
      let label = key === 'MISCELLANEOUS' ? 'Misc.' : key.charAt(0) + key.slice(1).toLowerCase(); 
 
      processedChartData.push({ 
        lob: label, 
        nop: nop, 
        gwp_millions: Math.round(prem / 1000000), 
        gic_gep: earned !== 0 ? Math.round((claims / earned) * 100) : 0, 
        raw_gwp: prem 
      }); 
      totalNop += nop; totalPrem += prem; totalEarned += earned; totalClaims += claims; 
    }); 
 
    processedChartData.push({ 
      lob: 'Total', 
      nop: totalNop, 
      gwp_millions: Math.round(totalPrem / 1000000), 
      gic_gep: totalEarned !== 0 ? Math.round((totalClaims / totalEarned) * 100) : 0 
    }); 
 
    setChartData(processedChartData); 
  }, [selectedLobPeriod, lobRawData, dwellingsRawData]); 
 
  // --- Broker Table Logic ---   
  useEffect(() => { 
    let timeKey = Object.keys(brokerRawData).find(t => t === selectedLobPeriod); 
    if (!timeKey && Object.keys(brokerRawData).length > 0) { 
      const month = selectedDate?.month; 
      timeKey = Object.keys(brokerRawData).find(t => t.includes(month)) || 
Object.keys(brokerRawData)[0]; 
    } 
 
    if (!timeKey || !brokerRawData[timeKey]) { 
      setProcessedBrokerData([]); 
      setBrokerHeaderTime(''); 
      return; 
    } 
 
    setBrokerHeaderTime(timeKey); 
    const dataForTime = brokerRawData[timeKey]; 
 
    const flattenedBrokers = Object.entries(dataForTime).map(([brokerName, brokerContent]) => { 
      let fire = 0, engg = 0, marine = 0, misc = 0, liability = 0, grandTotal = 0; 
      let channelName = ''; 
 
      Object.entries(brokerContent).forEach(([subChannel, lobData]) => { 
        channelName = subChannel; 
        fire += lobData['Fire'] || 0; 
        engg += lobData['Engineering'] || 0; 
        marine += lobData['Marine'] || 0; 
        misc += lobData['Miscellaneous'] || 0; 
        liability += lobData['Liability'] || 0; 
        grandTotal += lobData['Grand Total'] || 0; 
      }); 
      return { brokerName, channel: channelName, fire, engg, marine, misc, liability, grandTotal }; 
    }); 
 
    flattenedBrokers.sort((a, b) => b.grandTotal - a.grandTotal); 
    const top11 = flattenedBrokers.slice(0, 11); 
    const others = flattenedBrokers.slice(11); 
 
    const othersRow = { brokerName: 'Others', channel: '', fire: 0, engg: 0, marine: 0, misc: 0, liability: 
0, grandTotal: 0 }; 
    others.forEach(item => { 
      othersRow.fire += item.fire; othersRow.engg += item.engg; othersRow.marine += 
item.marine; 
      othersRow.misc += item.misc; othersRow.liability += item.liability; othersRow.grandTotal += 
item.grandTotal; 
    }); 
 
    const finalRows = [...top11]; 
    if (others.length > 0) finalRows.push(othersRow); 
 
    const totalRow = { fire: 0, engg: 0, marine: 0, misc: 0, liability: 0 }; 
    finalRows.forEach(r => { 
      totalRow.fire += r.fire; totalRow.engg += r.engg; totalRow.marine += r.marine; 
      totalRow.misc += r.misc; totalRow.liability += r.liability; 
    }); 
 
    const fmt = (val) => (val / 1000000).toFixed(1); 
    const formattedRows = finalRows.map(r => ({ 
      ...r, fire: fmt(r.fire), engg: fmt(r.engg), marine: fmt(r.marine), misc: fmt(r.misc), liability: 
fmt(r.liability) 
    })); 
    const formattedTotal = { 
      fire: fmt(totalRow.fire), engg: fmt(totalRow.engg), marine: fmt(totalRow.marine), misc: 
fmt(totalRow.misc), liability: fmt(totalRow.liability) 
    }; 
 
    setProcessedBrokerData(formattedRows); 
    setBrokerTotalRow(formattedTotal); 
  }, [brokerRawData, selectedLobPeriod, selectedDate]); 
 
  // --- LOB & Segment Table Logic ---   
  useEffect(() => { 
    if (!selectedMatrixPeriod || !lobSegmentRawData[selectedMatrixPeriod]) { 
      setProcessedMatrixData([]); 
      return; 
    } 
 
    const data = lobSegmentRawData[selectedMatrixPeriod]; 
    const segments = Object.keys(data); 
    const lobs = ['Fire', 'Engineering', 'Miscellaneous', 'Marine', 'Liability']; 
 
    const rows = segments.map(segment => { 
      const rowData = { segment }; 
      let rowNop = 0, rowPrem = 0, rowEarned = 0, rowClaims = 0; 
 
      lobs.forEach(lob => { 
        const cellData = data[segment][lob] || { "Total NOP": 0, "Total Prem": 0, "Total Earned Prem": 
0, "Total Claim incurred in Period": 0 }; 
        const nop = cellData["Total NOP"] || 0; 
        const prem = cellData["Total Prem"] || 0; 
        const earned = cellData["Total Earned Prem"] || 0; 
        const claims = cellData["Total Claim incurred in Period"] || 0; 
 
        rowData[lob] = { 
          nop: nop, 
          gwp: Math.round(prem / 1000000), 
          gicgep: earned !== 0 ? Math.round((claims / earned) * 100) : 0 
        }; 
 
        rowNop += nop; 
        rowPrem += prem; rowEarned += earned; rowClaims += claims; 
      }); 
 
      rowData['Overall'] = { 
        nop: rowNop, 
        gwp: Math.round(rowPrem / 1000000), 
        gicgep: rowEarned !== 0 ? Math.round((rowClaims / rowEarned) * 100) : 0 
      }; 
 
      return rowData; 
    }); 
 
    if (rows.length > 0) { 
      const totalRow = { segment: 'Grand Total', isTotal: true }; 
      [...lobs, 'Overall'].forEach(col => { 
        let colNop = 0; 
        let rawPremSum = 0; 
        let rawEarnedSum = 0; 
        let rawClaimsSum = 0; 
 
        if (col === 'Overall') { 
          Object.values(data).forEach(segData => { 
            Object.values(segData).forEach(lData => { 
              colNop += lData["Total NOP"] || 0; 
              rawPremSum += lData["Total Prem"] || 0; 
              rawEarnedSum += lData["Total Earned Prem"] || 0; 
              rawClaimsSum += lData["Total Claim incurred in Period"] || 0; 
            }); 
          }); 
        } else { 
          Object.values(data).forEach(segData => { 
            const lData = segData[col] || {}; 
            colNop += lData["Total NOP"] || 0; 
            rawPremSum += lData["Total Prem"] || 0; 
            rawEarnedSum += lData["Total Earned Prem"] || 0; 
            rawClaimsSum += lData["Total Claim incurred in Period"] || 0; 
          }); 
        } 
 
        totalRow[col] = { 
          nop: colNop, 
          gwp: Math.round(rawPremSum / 1000000), 
          gicgep: rawEarnedSum !== 0 ? Math.round((rawClaimsSum / rawEarnedSum) * 100) : 0 
        }; 
      }); 
      rows.push(totalRow); 
    } 
 
    setProcessedMatrixData(rows); 
  }, [selectedMatrixPeriod, lobSegmentRawData]); 
 
  // --- Growth Section Logic ---   
  useEffect(() => { 
    if (!selectedGrowthPeriod || !lobRawData.length) return; 
 
    // 1. Identify Current and Previous Periods   
    const currentPeriod = selectedGrowthPeriod; 
    const prevPeriod = currentPeriod.replace(/(\d{4})-(\d{2})/g, (match, p1, p2) => { 
      return `${parseInt(p1) - 1}-${parseInt(p2) - 1}`; 
    }); 
 
    // Extract FY String for Legend (e.g. "2025-26" -> "FY '25-26")   
    const extractFY = (periodStr) => { 
      const match = periodStr.match(/(\d{4}-\d{2})/); 
      return match ? `FY '${match[1].substring(2)}` : ''; 
    }; 
    setGrowthFYLabels({ 
      current: extractFY(currentPeriod) || "Current", 
      previous: extractFY(prevPeriod) || "Previous" 
    }); 
 
    // 2. Fetch Data   
    const currentData = lobRawData.find(d => d.Time === currentPeriod); 
    const prevData = lobRawData.find(d => d.Time === prevPeriod); 
 
    if (!currentData) return; 
 
    const categories = [ 
      { key: 'FIRE', label: 'FIRE', colors: ['#f97316', '#fdba74'] }, // Dark Orange, Light Orange   
      { key: 'ENGINEERING', label: 'ENGINEERING', colors: ['#22c55e', '#86efac'] }, // Dark Green, Light Green   
      { key: 'MISCELLANEOUS', label: 'MISCELLANEOUS', colors: ['#ffff00', '#fef08a'] }, // Yellows   
      { key: 'MARINE', label: 'MARINE', colors: ['#1d4ed8', '#93c5fd'] }, // Dark Blue, Light Blue   
      { key: 'LIABILITY', label: 'LIABILITY', colors: ['#06b6d4', '#67e8f9'] }, // Cyan   
      { key: 'Total', label: 'OVERALL', colors: ['#f43f5e', '#fda4af'] } // Pink   
    ]; 
 
    const growthResult = categories.map(cat => { 
      let currentGWP = 0; 
      let prevGWP = 0; 
 
      if (cat.key === 'Total') { 
        if (currentData && currentData.LOB) { 
          Object.values(currentData.LOB).forEach(v => currentGWP += (v['Total Prem'] || 0)); 
        } 
        if (prevData && prevData.LOB) { 
          Object.values(prevData.LOB).forEach(v => prevGWP += (v['Total Prem'] || 0)); 
        } 
      } else { 
        currentGWP = currentData?.LOB?.[cat.key]?.['Total Prem'] || 0; 
        prevGWP = prevData?.LOB?.[cat.key]?.['Total Prem'] || 0; 
      } 
 
      let growthPct = 0; 
      if (prevGWP !== 0) { 
        growthPct = Math.round(((currentGWP - prevGWP) / prevGWP) * 100); 
      } 
 
      return { 
        key: cat.key, 
        label: cat.label, 
        currentGWP: Math.round(currentGWP / 1000000), 
        prevGWP: Math.round(prevGWP / 1000000), 
        growth: growthPct, 
        colors: cat.colors 
      }; 
    }); 
 
    setGrowthChartData(growthResult); 
  }, [selectedGrowthPeriod, lobRawData]); 
 
  // --- FIRE BANCA REPORT LOGIC (Updated to ROUND OFF values) --- 
  useEffect(() => { 
    let foundData = null; 
    if (fireBancaRawData.length > 0) { 
      const month = selectedDate?.month; 
      foundData = fireBancaRawData.find(d => d.Time && d.Time.includes(month)) || 
fireBancaRawData[0]; 
    } 
 
    if (!foundData || !foundData.Banks) { 
      setProcessedFireBancaData([]); 
      setFireBancaTime(''); 
      setFireBancaTotal(null); 
      return; 
    } 
 
    setFireBancaTime(foundData.Time); 
 
    let grandTotalClaimsRaw = 0; 
    let grandTotalEstRaw = 0; 
    let grandTotalNOCRaw = 0; 
 
    Object.values(foundData.Banks).forEach(bank => { 
      grandTotalClaimsRaw += (bank["Total Claim paid"] || 0); 
      grandTotalEstRaw += (bank["Under insurance estimate"] || 0); 
      grandTotalNOCRaw += (bank["NOC"] || 0); 
    }); 
 
    const targetBanks = [ 
      'BOB', 'PNB', 'PARTNERS OTHERS', 'UNION BANK', 'OBC', 
      'INDIAN BANK', 'AGENCY', 'UNITED BANK OF INDIA', 'CBI' 
    ]; 
 
    let namedClaimsSum = 0; 
    let namedEstSum = 0; 
    let namedNOCSum = 0; 
 
    const rows = targetBanks.map(bankName => { 
      const bankData = foundData.Banks[bankName] || { 
        "Total Claim paid": 0, 
        "Under insurance estimate": 0, 
        "NOC": 0 
      }; 
 
      const claims = Math.round(bankData["Total Claim paid"] || 0); 
      const est = Math.round(bankData["Under insurance estimate"] || 0); 
      const noc = Math.round(bankData["NOC"] || 0); 
 
      namedClaimsSum += claims; 
      namedEstSum += est; 
      namedNOCSum += noc; 
 
      const pct = claims !== 0 ? Math.round((est / claims) * 100) : 0; 
 
      return { 
        name: bankName, 
        claims: claims, 
        est: est, 
        pct: pct, 
        noc: noc 
      }; 
    }); 
 
    const totalClaimsRounded = Math.round(grandTotalClaimsRaw); 
    const totalEstRounded = Math.round(grandTotalEstRaw); 
    const totalNOCRounded = Math.round(grandTotalNOCRaw); 
 
    const othersClaims = totalClaimsRounded - namedClaimsSum; 
    const othersEst = totalEstRounded - namedEstSum; 
    const othersNOC = totalNOCRounded - namedNOCSum; 
    const othersPct = othersClaims !== 0 ? Math.round((othersEst / othersClaims) * 100) : 0; 
 
    rows.push({ 
      name: 'OTHERS', 
      claims: othersClaims, 
      est: othersEst, 
      pct: othersPct, 
      noc: othersNOC 
    }); 
 
    const totalPct = totalClaimsRounded !== 0 ? Math.round((totalEstRounded / 
totalClaimsRounded) * 100) : 0; 
 
    setProcessedFireBancaData(rows); 
    setFireBancaTotal({ 
      claims: totalClaimsRounded, 
      est: totalEstRounded, 
      pct: totalPct, 
      noc: totalNOCRounded 
    }); 
 
  }, [fireBancaRawData, selectedDate]); 
 
 
  // --- Helpers ---   
  const getDefaultKey = () => selectedDate?.month === 'July' ? 'YTD July 2025' : 
    selectedDate?.month === 'June' ? 'YTD June 2025' : 'YTD May 2025'; 
  const getMonthName = () => selectedDate?.month || 'May'; 
 
  const getGicGepStyle = (val, isOverall) => { 
    if (isOverall) return {}; 
    return val > 90 ? { color: 'red' } : {}; 
  }; 
 
  // --- Derived Data for OTHER Tables ---   
  const currentKey = getDefaultKey(); 
  const cordysTatData = allData?.cordysTatDataMap?.[currentKey] || []; 
 
  const inwardMonthKey = selectedDate?.month?.toLowerCase() || 'may'; 
  const inwardFacRaw = allData?.inwardFacDataMap?.[currentKey] || { [inwardMonthKey]: [], 
ytd: [] }; 
  const inwardMonthData = inwardFacRaw[inwardMonthKey] || []; 
  const inwardYtdData = inwardFacRaw.ytd || []; 
   
  const largeRiskData = allData?.largeRiskDataMap?.[currentKey] || 'Nil'; 
  // newInitiativesData no longer derived from allData, now fetched independently 
  const popupData = allData?.popupDataMap?.[popupPeriod] || []; 
 
  if (loading) return <div className="or-loader-container"><div className="or-loader"></div></div>; 
  if (error) return <div className="or-error-container"><h3>{error}</h3></div>; 
 
  return ( 
    <div className="or-main"> 
      <div className="or-top-grid"> 
 
        {/* Chart Section */} 
        <div className="or-chart-container"> 
          <div className="or-chart-header"> 
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}> 
              <h1 className="or-chart-title"> 
                LOB wise NOP, GWP and GIC:GEP (GWP in Mn) - {selectedLobPeriod} 
              </h1> 
              <select 
                value={selectedLobPeriod} 
                onChange={(e) => setSelectedLobPeriod(e.target.value)} 
                style={{ 
                  padding: '4px 8px', borderRadius: '4px', border: '1px solid #ccc', fontSize: '14px', 
                  marginRight: '10px', color: '#000', backgroundColor: '#fff', fontWeight: '500' 
                }} 
              > 
                {availablePeriods.length > 0 ? availablePeriods.map((period, index) => ( 
                  <option key={index} value={period}>{period}</option> 
                )) : <option>No Data Available</option>} 
              </select> 
            </div> 
          </div> 
          <div className="or-chart"> 
            <ResponsiveContainer width="100%" height="100%"> 
              <ComposedChart data={chartData} margin={{ top: 15, right: 25, left: 15, bottom: 60 }}> 
                <CartesianGrid strokeDasharray="3 3" /> 
                <XAxis dataKey="lob" angle={-45} textAnchor="end" height={80} fontSize={9} interval={0} /> 
                <YAxis yAxisId="left" orientation="left" scale="log" domain={[1, 10000000]} fontSize={9} 
                  tickFormatter={(val) => val >= 1000000 ? `${val / 1000000}M` : val >= 1000 ? `${val / 
1000}K` : val} /> 
                <YAxis yAxisId="right" orientation="right" domain={[0, 200]} tickFormatter={(val) => `${val}%`} 
fontSize={9} /> 
                <Tooltip formatter={(val, name) => name === 'GIC:GEP' ? [`${val}%`, name] : 
[Number(val).toLocaleString(), name]} /> 
                <Legend wrapperStyle={{ fontSize: '10px' }} /> 
                <Bar yAxisId="left" dataKey="nop" fill="#30cd05" name="NOP" /> 
                <Bar yAxisId="left" dataKey="gwp_millions" fill="#2563eb" name="GWP (Mn)" /> 
                <Line yAxisId="right" type="monotone" dataKey="gic_gep" stroke="#e30613" strokeWidth={2} 
                  dot={{ r: 3 }} name="GIC:GEP" label={({ x, y, value }) => (<text x={x} y={y - 10} fill="#e30613" 
                    fontSize={10} textAnchor="middle" fontWeight="bold">{value}%</text>)} /> 
              </ComposedChart> 
            </ResponsiveContainer> 
          </div> 
          <div className="or-note-chart or-note-red" style={{ marginTop: '10px', fontSize: '12px', 
lineHeight: '1.4' }}> 
            Fire is inclusive of Generic New NOP - 8,233 with GWP of Rs. 38 Mn. The drop in Misc. NOP and 
            GWP is due to Burglary policies being issued under EPP Tiny (Fire).<br /> 
            *Engineering -  Commercial -  BAGMANE DEVELOPERS PRIVATE LTD - Rs. 14.88 Crs (Short 
            Circuit Fire) 
          </div> 
        </div> 
 
        {/* Broker Table Section */} 
        <div className="or-broker-table-container"> 
          <div className="or-table-header"> 
            <h2 className="or-table-title"> 
              Broker wise GWP Report - {brokerHeaderTime} ( Amt in Mn ) 
            </h2> 
          </div> 
          <div className="or-table-scroll"> 
            <table className="or-table"> 
              <thead className="or-table-thead"> 
                <tr> 
                  <th className="or-table-th or-table-th-broker">Broker Name</th> 
                  <th className="or-table-th">UW Channel</th> 
                  <th className="or-table-th">Fire</th> 
                  <th className="or-table-th">Engg.</th> 
                  <th className="or-table-th">Marine</th> 
                  <th className="or-table-th">Misc</th> 
                  <th className="or-table-th">Liability</th> 
                </tr> 
              </thead> 
              <tbody className="or-table-tbody"> 
                {processedBrokerData.length > 0 ? ( 
                  <> 
                    {processedBrokerData.map((item, index) => ( 
                      <tr key={index} className={`or-table-tr ${item.brokerName === 'Others' ? 
'or-table-tr-others' : ''}`}> 
                        <td className="or-table-td or-table-td-broker"><div 
className="or-table-broker-name" title={item.brokerName}>{item.brokerName}</div></td> 
                        <td className="or-table-td">{item.channel}</td> 
                        <td className="or-table-td">{item.fire}</td> 
                        <td className="or-table-td">{item.engg}</td> 
                        <td className="or-table-td">{item.marine}</td> 
                        <td className="or-table-td">{item.misc}</td> 
                        <td className="or-table-td">{item.liability}</td> 
                      </tr> 
                    ))} 
                    <tr className="or-table-tr or-table-tr-total" style={{ backgroundColor: '#fbcfe8', 
fontWeight: 'bold' }}> 
                      <td className="or-table-td or-table-td-broker" style={{ textAlign: 'center' }}>Total 
GWP</td> 
                      <td className="or-table-td"></td> 
                      <td className="or-table-td">{brokerTotalRow?.fire}</td> 
                      <td className="or-table-td">{brokerTotalRow?.engg}</td> 
                      <td className="or-table-td">{brokerTotalRow?.marine}</td> 
                      <td className="or-table-td">{brokerTotalRow?.misc}</td> 
                      <td className="or-table-td">{brokerTotalRow?.liability}</td> 
                    </tr> 
                  </> 
                ) : <tr><td colSpan="7" className="or-table-td">No data available</td></tr>} 
              </tbody> 
            </table> 
 
          </div> 
        </div> 
      </div> 
 
      {/* LOB & Segment Wise Report (New Matrix) */} 
      <div className="or-matrix-table-container"> 
        <div className="or-table-header"> 
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}> 
            <h2 className="or-table-title"> 
              LOB & Segment wise Report - {selectedMatrixPeriod} 
            </h2> 
            <select 
              value={selectedMatrixPeriod} 
              onChange={(e) => setSelectedMatrixPeriod(e.target.value)} 
              style={{ 
                padding: '4px 8px', borderRadius: '4px', border: '1px solid #ccc', fontSize: '14px', 
                marginRight: '10px', color: '#000', backgroundColor: '#fff' 
              }} 
            > 
              {matrixPeriods.length > 0 ? matrixPeriods.map(p => ( 
                <option key={p} value={p}>{p}</option> 
              )) : <option>No Data</option>} 
            </select> 
          </div> 
        </div> 
        <div className="or-table-scroll"> 
          <table className="or-matrix-table"> 
            <thead> 
              <tr> 
                <th rowSpan={2} className="or-matrix-th-segment">Segment</th> 
                <th colSpan={3} className="or-matrix-th-lob lob-fire">FIRE</th> 
                <th colSpan={3} className="or-matrix-th-lob lob-engineering">ENGINEERING</th> 
                <th colSpan={3} className="or-matrix-th-lob lob-miscellaneous">MISCELLANEOUS</th> 
                <th colSpan={3} className="or-matrix-th-lob lob-marine">MARINE</th> 
                <th colSpan={3} className="or-matrix-th-lob lob-liability">LIABILITY</th> 
                <th colSpan={3} className="or-matrix-th-lob lob-overall" style={{ backgroundColor: 
'#ff00cc', color: 'white' }}>OVERALL</th> 
              </tr> 
              <tr> 
                {[...Array(6)].map((_, i) => ( 
                  <Fragment key={i}> 
                    <th className="or-matrix-th-sub">NOP</th> 
                    <th className="or-matrix-th-sub">GWP</th> 
                    <th className="or-matrix-th-sub">GIC:GEP</th> 
                  </Fragment> 
                ))} 
              </tr> 
            </thead> 
            <tbody> 
              {processedMatrixData.length > 0 ? processedMatrixData.map((row, i) => ( 
                <tr key={i} style={row.isTotal ? { backgroundColor: '#fbcfe8', fontWeight: 'bold' } : {}}> 
                  <td className="or-matrix-td-segment">{row.segment}</td> 
                  {['Fire', 'Engineering', 'Miscellaneous', 'Marine', 'Liability', 'Overall'].map((colKey) => { 
                    const cell = row[colKey] || { nop: 0, gwp: 0, gicgep: 0 }; 
                    return ( 
                      <Fragment key={colKey}> 
                        <td className="or-matrix-td-nop">{cell.nop ? cell.nop.toLocaleString() : '-'}</td> 
                        <td className="or-matrix-td-gwp">{cell.gwp ? cell.gwp.toLocaleString() : '-'}</td> 
                        <td className="or-matrix-td-gicgep" style={getGicGepStyle(cell.gicgep, colKey === 
'Overall')}> 
                          {cell.gicgep ? cell.gicgep + '%' : '0%'} 
                        </td> 
                      </Fragment> 
                    ); 
                  })} 
                </tr> 
              )) : <tr><td colSpan="19" className="or-table-td" style={{ textAlign: 'center' }}>No 
Data</td></tr>} 
            </tbody> 
          </table> 
          <div className="or-note or-note-red" style={{ marginTop: '10px', fontSize: '11px' }}> 
            *Fire - Commercial : KAMCO CHEW FOOD PRIVATE LTD - 29.31 Crs (Short Circuit Fire) ; 
            Engg - Commercial : BAGMANE DEVELOPERS PRIVATE LTD = 14.88 Crs (Short Circuit Fire) ; 
            Others : MITSUI AND CO LIMITED = 85.24 L (Storm, Cyclone, Typhoon, Tempest, Hurricane, 
Tornado) ; 
            Marine - Commercial - D LINK INDIA LTD = 2.42 Crs(General Average/ Jettison) , SME : LANEXIS 
PRIVATE 
            LIMITED- 73.53 L (General Average (GA)); 
            Others - TUBE INVESTMENTS OF INDIA LIMITED- CYCLE DIVISION = 18.83 Lakhs (Wet Damage) 
          </div> 
        </div> 
      </div> 
 
      {/* Growth Section */} 
      <div className="or-growth-section"> 
        <div className="or-growth-header"> 
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}> 
            <span>LOB wise Growth % ( GWP ) - {selectedGrowthPeriod}</span> 
            <select 
              value={selectedGrowthPeriod} 
              onChange={(e) => setSelectedGrowthPeriod(e.target.value)} 
              style={{ padding: '4px 8px', borderRadius: '4px', border: '1px solid #ccc', fontSize: '14px', 
marginLeft: '10px', color: '#000', backgroundColor: '#fff' }} 
            > 
              {growthPeriods.length > 0 ? growthPeriods.map((period, index) => ( 
                <option key={index} value={period}>{period}</option> 
              )) : <option>No YTD Data</option>} 
            </select> 
          </div> 
        </div> 
        <div className="or-growth-charts" style={{ justifyContent: 'space-between', gap: '0.5rem' }}> 
          {growthChartData.map((lob) => ( 
            <div key={lob.key} className="or-growth-chart-item" style={{ minWidth: 100 }}> 
              <div className="or-growth-chart-label" style={{ fontSize: '13px', fontWeight: 600 
}}>{lob.label}</div> 
              <div className="or-growth-pie-container" style={{ width: 140, height: 140 }}> 
                <ResponsiveContainer height={140}> 
                  <PieChart> 
                    <Pie 
                      data={[ 
                        { name: "Current", value: lob.currentGWP, color: lob.colors[0] }, // Dynamic Values  
                        { name: "Previous", value: lob.prevGWP, color: lob.colors[1] },   // Dynamic Values  
                      ]} 
                      dataKey="value" 
                      nameKey="name" 
                      cx="50%" 
                      cy="50%" 
                      innerRadius={25} 
                      outerRadius={65} 
                      startAngle={90} 
                      endAngle={-270} 
                      stroke="white" 
                      strokeWidth={2} 
                      labelLine={false} // Removes the leader line  
                      label={renderCustomizedLabel} // Centers text inside the curve  
                    > 
                      { 
                        [ 
                          { name: "Current", value: lob.currentGWP, color: lob.colors[0] }, 
                          { name: "Previous", value: lob.prevGWP, color: lob.colors[1] } 
                        ].map((entry, index) => ( 
                          <Cell key={`cell-${index}`} fill={entry.color} /> 
                        )) 
                      } 
                    </Pie> 
                  </PieChart> 
                </ResponsiveContainer> 
                {/* Center Value: Growth % */} 
 
                <div className="or-growth-pie-center"> 
                  <div className="or-growth-pie-growth" style={{ fontSize: '14px', fontWeight: 'bold' }}> 
                    {lob.growth}% 
                  </div> 
                </div> 
 
              </div> 
            </div> 
          ))} 
        </div> 
        {/* Growth Legend */} 
        {growthChartData.length > 0 && ( 
          <div className="or-growth-legend"> 
            {growthChartData.map(lob => ( 
              <div key={lob.key} className="or-growth-legend-item"> 
                <div style={{ display: 'flex', alignItems: 'center' }}> 
                  <div className="or-growth-legend-color" style={{ background: lob.colors[0] }}></div> 
                  <span className="or-growth-legend-label">{lob.label} {growthFYLabels.current} 
GWP</span> 
                </div> 
                <div style={{ display: 'flex', alignItems: 'center' }}> 
                  <div className="or-growth-legend-color" style={{ background: lob.colors[1] }}></div> 
                  <span className="or-growth-legend-label">{lob.label} {growthFYLabels.previous} 
GWP</span> 
                </div> 
              </div> 
            ))} 
          </div> 
        )} 
 
        <div style={{ textAlign: 'center', marginTop: '15px' }}> 
          <button onClick={() => setShowGrowthPopup(true)} className="or-growth-btn">
📊
 Click Here - 
LOB Segment wise Report Last 5 Years Comparison</button> 
        </div> 
      </div> 
 
      {/* Bottom Tables */} 
      <div className="or-tables-section"> 
        <div className="or-tables-side-by-side"> 
          <div className="or-table-block"> 
            <div className="or-table-block-header">Cordys TAT Report</div> 
            <table className="or-table-block-table"> 
              <thead> 
                <tr> 
                  <th rowSpan={2} className="or-table-block-th">Month</th><th rowSpan={2} 
                    className="or-table-block-th">LOB</th> 
                  <th 
                    colSpan={2} className="or-table-block-th">Same Day</th><th colSpan={2} 
                      className="or-table-block-th">Next day</th> 
                  <th colSpan={2} className="or-table-block-th">Beyond that</th><th rowSpan={2} 
                    className="or-table-block-th">Grand Total</th> 
                </tr> 
                <tr> 
                  <th className="or-table-block-th">No</th><th className="or-table-block-th">%</th><th 
                    className="or-table-block-th">No</th><th className="or-table-block-th">%</th><th 
                      className="or-table-block-th">No</th><th className="or-table-block-th">%</th> 
                </tr> 
              </thead> 
              <tbody> 
                {cordysTatData.map((row, idx) => ( 
                  <tr key={idx} className={idx % 2 === 0 ? "or-table-block-tr-even" : 
"or-table-block-tr-odd"}> 
                    {(idx === 0 || cordysTatData[idx - 1].month !== row.month) && <td 
                      rowSpan={cordysTatData.filter(r => r.month === row.month).length} 
                      className="or-table-block-td">{row.month}</td>} 
                    <td className="or-table-block-td">{row.lob}</td> 
                    <td className="or-table-block-td">{row.sameDay}</td><td 
                      className="or-table-block-td">{row.sameDayPct}</td> 
                    <td className="or-table-block-td">{row.nextDay}</td><td 
                      className="or-table-block-td">{row.nextDayPct}</td> 
                    <td className="or-table-block-td">{row.beyond}</td><td 
                      className="or-table-block-td">{row.beyondPct}</td> 
                    <td className="or-table-block-td">{row.total}</td> 
                  </tr> 
                ))} 
              </tbody> 
            </table> 
          </div> 
 
          <div className="or-table-block"> 
            <div className="or-table-block-header" style={{ backgroundColor: '#ff0066', color: 'white' }}> 
              FIRE - Banca Channel wise UnderInsurance Report - {fireBancaTime} 
            </div> 
            <table className="or-table-block-table"> 
              <thead> 
                <tr style={{ backgroundColor: '#ff99cc' }}> 
                  <th className="or-table-block-th">Banca Channel</th> 
                  <th className="or-table-block-th">Claims Paid</th> 
                  <th className="or-table-block-th">Under insurance estimate</th> 
                  <th className="or-table-block-th">Underinsurance Claims %</th> 
                  <th className="or-table-block-th">NOC (Underinsurance)</th> 
                </tr> 
              </thead> 
              <tbody> 
                {processedFireBancaData.length > 0 ? ( 
                  <> 
                    {processedFireBancaData.map((row, idx) => ( 
                      <tr key={idx} className="or-table-block-tr-even"> 
                        <td className="or-table-block-td">{row.name}</td> 
                        <td className="or-table-block-td">{row.claims.toLocaleString()}</td> 
                        <td className="or-table-block-td">{row.est.toLocaleString()}</td> 
                        <td className="or-table-block-td">{row.pct}%</td> 
                        <td className="or-table-block-td">{row.noc}</td> 
                      </tr> 
                    ))} 
                    {fireBancaTotal && ( 
                      <tr style={{ backgroundColor: '#ff99cc', fontWeight: 'bold' }}> 
                        <td className="or-table-block-td">Grand Total</td> 
                        <td className="or-table-block-td">{fireBancaTotal.claims.toLocaleString()}</td> 
                        <td className="or-table-block-td">{fireBancaTotal.est.toLocaleString()}</td> 
                        <td className="or-table-block-td">{fireBancaTotal.pct}%</td> 
                        <td className="or-table-block-td">{fireBancaTotal.noc}</td> 
                      </tr> 
                    )} 
                  </> 
                ) : <tr><td colSpan="5" className="or-table-block-td">No data</td></tr>} 
              </tbody> 
            </table> 
          </div> 
        </div> 
 
        <div className="or-table-block"> 
          <div className="or-table-block-header"> 
            Inward Fac - {getDefaultKey()} 
          </div> 
          <table className="or-table-block-table"> 
            <thead> 
              <tr> 
                <th rowSpan={2} className="or-table-block-th">LOB</th> 
                <th colSpan={6} className="or-table-block-th">{getMonthName()} 2025</th> 
                <th colSpan={6} className="or-table-block-th">YTD {getMonthName()} 2025</th> 
              </tr> 
              <tr> 
                <th className="or-table-block-th">NOP</th><th 
                  className="or-table-block-th">GWP</th><th className="or-table-block-th">SI</th><th 
                    className="or-table-block-th">GIC</th><th className="or-table-block-th">GEP</th><th 
                      className="or-table-block-th">Ratio</th> 
                <th className="or-table-block-th">NOP</th><th 
                  className="or-table-block-th">GWP</th><th className="or-table-block-th">SI</th><th 
                    className="or-table-block-th">GIC</th><th className="or-table-block-th">GEP</th><th 
                      className="or-table-block-th">Ratio</th> 
              </tr> 
            </thead> 
            <tbody> 
              {inwardMonthData.length > 0 ? inwardMonthData.map((row, idx) => ( 
                <tr key={idx} className={idx % 2 === 0 ? "or-table-block-tr-even" : "or-table-block-tr-odd"}> 
                  <td className="or-table-block-td">{row.lob}</td> 
                  <td className="or-table-block-td">{row.nop}</td><td 
                    className="or-table-block-td">{row.gwp}</td><td 
className="or-table-block-td">{row.si}</td><td 
                      className="or-table-block-td">{row.gic}</td><td 
className="or-table-block-td">{row.gep}</td><td 
                        className="or-table-block-td">{row.gicgep}</td> 
                  {inwardYtdData[idx] ? ( 
                    <><td className="or-table-block-td">{inwardYtdData[idx].nop}</td><td 
                      className="or-table-block-td">{inwardYtdData[idx].gwp}</td><td 
                        className="or-table-block-td">{inwardYtdData[idx].si}</td><td 
                          className="or-table-block-td">{inwardYtdData[idx].gic}</td><td 
                            className="or-table-block-td">{inwardYtdData[idx].gep}</td><td 
                              className="or-table-block-td">{inwardYtdData[idx].gicgep}</td></> 
                  ) : <td colSpan={6} className="or-table-block-td">-</td>} 
                </tr> 
              )) : <tr><td colSpan="13" className="or-table-block-td">No data</td></tr>} 
            </tbody> 
          </table> 
        </div> 
      </div> 
 
      <div className="or-bottom-grid" style={{ fontSize: '10px' }}> 
        <div className="or-bottom-left"> 
          <div className="or-bottom-header" style={{ padding: '0.2rem 0', fontSize: '11px' }}> 
            New Business Sourced ({">"}5 lakhs) - {newBusinessSourcedData.Time || getDefaultKey()} 
          </div> 
          <div className="or-bottom-content" style={{ padding: '0.2rem', fontSize: '10px' }}> 
            {Object.keys(newBusinessSourcedData).length > 0 ? ( 
              Object.keys(newBusinessSourcedData).map(key => { 
                if (key === 'Time') return null; // Skip time key 
                 
                // Handle multi-line strings from array 
                const items = newBusinessSourcedData[key].flatMap(str => str.split(/\r?\n/)).filter(s => s.trim() 
!== ''); 
 
                return ( 
                  <div key={key}> 
                    <span className="or-bottom-label" style={{ fontSize: '10px' }}>{key}:</span> 
                    <ul className="or-bottom-list" style={{ marginBottom: '0.2rem', listStyleType: 'none', 
paddingLeft: 0 }}> 
                      {items.map((item, idx) => ( 
                        <li key={idx}>{item.trim()}</li> 
                      ))} 
                    </ul> 
                  </div> 
                ); 
              }) 
            ) : ( 
              <p>No Data</p> 
            )} 
          </div> 
          <div className="or-bottom-header or-bottom-header-secondary" style={{ padding: '0.2rem 0', 
fontSize: '11px', marginTop: '0.3rem' }}> 
            Large risk underwritten - More than 2500 Cr - {getDefaultKey()} 
          </div> 
          <div className="or-bottom-content" style={{ padding: '0.2rem', fontSize: '9px', lineHeight: '1.2' 
}}>{largeRiskData}</div> 
        </div> 
         
        {/* NEW INITIATIVES SECTION - DYNAMIC */} 
        <div className="or-bottom-right"> 
          <div className="or-bottom-header" style={{ padding: '0.2rem 0', fontSize: '11px' }}> 
             New Initiatives - {fetchedNewInitiatives.Time || getDefaultKey()} 
          </div> 
          <div className="or-bottom-content" style={{ padding: '0.2rem', fontSize: '10px' }}> 
            {fetchedNewInitiatives.Data && fetchedNewInitiatives.Data.length > 0 ? ( 
               <ul className="or-bottom-list" style={{ marginBottom: '0.2rem', listStyleType: 'none', 
paddingLeft: 0 }}> 
                 {fetchedNewInitiatives.Data.flatMap(str => str.split(/\r?\n/)).filter(s => s.trim() !== '').map((item, 
idx) => ( 
                   <li key={idx} style={{marginBottom: '4px'}}>{item.trim()}</li> 
                 ))} 
               </ul> 
            ) : ( 
               <p>No Data</p> 
            )} 
          </div> 
        </div> 
      </div> 
 
      {showGrowthPopup && ( 
        <div style={{ 
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', 
          display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 
        }}> 
          <div style={{ 
            backgroundColor: 'white', padding: '20px', borderRadius: '8px', maxWidth: '95vw', 
            maxHeight: '90vh', overflow: 'auto', position: 'relative' 
          }}> 
            <button onClick={() => setShowGrowthPopup(false)} style={{ 
              position: 'absolute', top: '10px', 
              right: '15px', background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#666' 
            }}>×</button> 
            <h2 style={{ marginBottom: '20px', textAlign: 'center' }}>LOB wise Growth % (GWP)</h2> 
            <div style={{ marginBottom: '30px' }}> 
              <h3 style={{ 
                backgroundColor: '#ff6600', color: 'white', padding: '8px', margin: '0 0 10px 0', 
                textAlign: 'center' 
              }}> 
                {selectedDate?.month === 'July' ? "Apr'25 - July'25" : selectedDate?.month === 'June' ? 
                  "Apr'25 - June'25" : "Apr'25 - May'25"} 
              </h3> 
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}> 
                <thead> 
                  <tr style={{ backgroundColor: '#f0f0f0' }}> 
                    <th rowSpan={2} style={{ border: '1px solid #ccc', padding: '8px', backgroundColor: '#ffb3b3' 
}}>Segment</th> 
                    <th colSpan={3} style={{ border: '1px solid #ccc', padding: '8px', backgroundColor: '#ff9900' 
}}>FIRE</th> 
                    <th colSpan={3} style={{ border: '1px solid #ccc', padding: '8px', backgroundColor: 
'#00cc00' }}>ENGINEERING</th> 
                    <th colSpan={3} style={{ border: '1px solid #ccc', padding: '8px', backgroundColor: '#ffff00' 
}}>MISCELLANEOUS</th> 
                    <th colSpan={3} style={{ border: '1px solid #ccc', padding: '8px', backgroundColor: 
'#0066cc' }}>Marine</th> 
                    <th colSpan={3} style={{ border: '1px solid #ccc', padding: '8px', backgroundColor: 
'#00cccc' }}>LIABILITY</th> 
                    <th colSpan={3} style={{ border: '1px solid #ccc', padding: '8px', backgroundColor: '#ff00cc' 
}}>OVERALL</th> 
                  </tr> 
                  <tr>{Array(6).fill(['NOP', 'GWP', 'GIC:GEP']).flat().map((h, i) => <th key={i} style={{ border: '1px solid #ccc', padding: '4px', fontSize: '10px' }}>{h}</th>)}</tr> 
                </thead> 
                <tbody> 
                  {popupData.map((row, i) => ( 
                    <tr key={i} style={{ backgroundColor: i % 2 === 0 ? '#f9f9f9' : 'white' }}> 
                      <td style={{ border: '1px solid #ccc', padding: '4px', fontWeight: 'bold' 
}}>{row.segment}</td> 
                      {[row.fire_nop, row.fire_gwp, row.fire_gicgep, row.engg_nop, row.engg_gwp, 
                      row.engg_gicgep, row.misc_nop, row.misc_gwp, row.misc_gicgep, row.marine_nop, 
row.marine_gwp, 
                      row.marine_gicgep, row.liability_nop, row.liability_gwp, row.liability_gicgep, row.overall_nop, 
                      row.overall_gwp, row.overall_gicgep].map((val, idx) => ( 
                        <td key={idx} style={{ border: '1px solid #ccc', padding: '4px' }}>{typeof val === 'number' ? 
                          val.toLocaleString() : val}</td> 
                      ))} 
                    </tr> 
                  ))} 
                </tbody> 
              </table> 
            </div> 
          </div> 
        </div> 
)} 
</div> 
); 
}; 
export default OverAllReview;
