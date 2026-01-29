import { useState } from 'react';
import { Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, ComposedChart, PieChart, Pie, Cell } from 'recharts';
import '../styles/OverAllReview.css';

// Static configuration array defining the order and styling of Line of Business (LOB) columns
const lobOrder = [
  { key: 'FIRE', label: 'FIRE', colorClass: 'lob-fire' }, // Fire insurance LOB configuration
  { key: 'ENGINEERING', label: 'ENGINEERING', colorClass: 'lob-engineering' }, // Engineering insurance LOB configuration
  { key: 'MISCELLANEOUS', label: 'MISCELLANEOUS', colorClass: 'lob-miscellaneous' }, // Miscellaneous insurance LOB configuration
  { key: 'MARINE', label: 'MARINE', colorClass: 'lob-marine' }, // Marine insurance LOB configuration
  { key: 'LIABILITY', label: 'LIABILITY', colorClass: 'lob-liability' }, // Liability insurance LOB configuration
  { key: 'OVERALL', label: 'OVERALL', colorClass: 'lob-overall' } // Overall totals LOB configuration
];

/**
 * OverAllReview component - Displays comprehensive insurance business overview with charts and tables
 * Shows LOB-wise data, broker reports, segment matrices, growth analysis, and operational metrics
 * @param {Object} selectedDate - Object containing selected month and year for data filtering
 * @returns {JSX.Element} Complete overview dashboard with multiple data visualizations
 */
const OverAllReview = ({ selectedDate }) => {
  // State variables for managing component data and UI interactions
  const [selectedLobPeriod, setSelectedLobPeriod] = useState( // Selected period for LOB chart data
    selectedDate?.month === 'July' ? 'YTD July 2025' : 
    selectedDate?.month === 'June' ? 'YTD June 2025' : 'YTD May 2025'
  );
  const [selectedMatrixPeriod, setSelectedMatrixPeriod] = useState( // Selected period for segment matrix table
    selectedDate?.month === 'July' ? 'YTD July 2025' : 
    selectedDate?.month === 'June' ? 'YTD June 2025' : 'YTD May 2025'
  );
  const [showGrowthPopup, setShowGrowthPopup] = useState(false); // Boolean flag to show/hide growth comparison popup
  const [popupPeriod, setPopupPeriod] = useState('Apr\'24 - Mar\'25'); // Selected period for popup historical data
  
  const lobDataMap = {
    'YTD July 2025': [
      { lob: 'FIRE (Dwellings)', nop: 146708, gwp_millions: 710, gic_gep: 14 },
      { lob: 'FIRE (Non Dwellings)', nop: 271042, gwp_millions: 2737, gic_gep: 78 },
      { lob: 'Engineering', nop: 2648, gwp_millions: 172, gic_gep: 158 },
      { lob: 'Misc.', nop: 88165, gwp_millions: 137, gic_gep: 5 },
      { lob: 'Marine', nop: 4718, gwp_millions: 653, gic_gep: 60 },
      { lob: 'Liability', nop: 3000, gwp_millions: 124, gic_gep: 64 },
      { lob: 'Total', nop: 516281, gwp_millions: 4532, gic_gep: 66 }
    ],
    'YTD July 2024': [
      { lob: 'FIRE (Dwellings)', nop: 221374, gwp_millions: 648, gic_gep: 5 },
      { lob: 'FIRE (Non Dwellings)', nop: 239056, gwp_millions: 2539, gic_gep: 10 },
      { lob: 'Engineering', nop: 2459, gwp_millions: 159, gic_gep: 61 },
      { lob: 'Misc.', nop: 174952, gwp_millions: 235, gic_gep: 7 },
      { lob: 'Marine', nop: 4369, gwp_millions: 600, gic_gep: 52 },
      { lob: 'Liability', nop: 2833, gwp_millions: 108, gic_gep: 16 },
      { lob: 'Total', nop: 645043, gwp_millions: 4289, gic_gep: 17 }
    ],
    'July 2025': [
      { lob: 'FIRE (Dwellings)', nop: 39456, gwp_millions: 189, gic_gep: 4 },
      { lob: 'FIRE (Non Dwellings)', nop: 73455, gwp_millions: 493, gic_gep: 299 },
      { lob: 'Engineering', nop: 623, gwp_millions: 46, gic_gep: 114 },
      { lob: 'Misc.', nop: 24560, gwp_millions: 32, gic_gep: -5 },
      { lob: 'Marine', nop: 1154, gwp_millions: 155, gic_gep: 46 },
      { lob: 'Liability', nop: 729, gwp_millions: 31, gic_gep: 17 },
      { lob: 'Total', nop: 139977, gwp_millions: 945, gic_gep: 74 }
    ],
    'July 2024': [
      { lob: 'FIRE (Dwellings)', nop: 60384, gwp_millions: 183, gic_gep: 1 },
      { lob: 'FIRE (Non Dwellings)', nop: 65778, gwp_millions: 443, gic_gep: -148 },
      { lob: 'Engineering', nop: 598, gwp_millions: 37, gic_gep: 92 },
      { lob: 'Misc.', nop: 47543, gwp_millions: 56, gic_gep: 10 },
      { lob: 'Marine', nop: 878, gwp_millions: 151, gic_gep: 40 },
      { lob: 'Liability', nop: 772, gwp_millions: 28, gic_gep: 20 },
      { lob: 'Total', nop: 175953, gwp_millions: 897, gic_gep: -9 }
    ],
    'YTD June 2025': [
      { lob: 'FIRE (Dwellings)', nop: 104620, gwp_millions: 508, gic_gep: 1 },
      { lob: 'FIRE (Non Dwellings)', nop: 196660, gwp_millions: 2240, gic_gep: 0 },
      { lob: 'Engineering', nop: 2004, gwp_millions: 125, gic_gep: 175 },
      { lob: 'Misc.', nop: 63355, gwp_millions: 104, gic_gep: 8 },
      { lob: 'Marine', nop: 3553, gwp_millions: 462, gic_gep: 66 },
      { lob: 'Liability', nop: 2261, gwp_millions: 93, gic_gep: 84 },
      { lob: 'Total', nop: 372453, gwp_millions: 3532, gic_gep: 64 }
    ],
    'YTD June 2024': [
      { lob: 'FIRE (Dwellings)', nop: 160990, gwp_millions: 465, gic_gep: 5 },
      { lob: 'FIRE (Non Dwellings)', nop: 173278, gwp_millions: 2096, gic_gep: 25 },
      { lob: 'Engineering', nop: 1861, gwp_millions: 123, gic_gep: 48 },
      { lob: 'Misc.', nop: 127409, gwp_millions: 180, gic_gep: 6 },
      { lob: 'Marine', nop: 3491, gwp_millions: 449, gic_gep: 56 },
      { lob: 'Liability', nop: 2061, gwp_millions: 79, gic_gep: 15 },
      { lob: 'Total', nop: 469090, gwp_millions: 3392, gic_gep: 26 }
    ],
    'June 2025': [
      { lob: 'FIRE (Dwellings)', nop: 36488, gwp_millions: 174, gic_gep: 0 },
      { lob: 'FIRE (Non Dwellings)', nop: 66916, gwp_millions: 548, gic_gep: 0 },
      { lob: 'Engineering', nop: 615, gwp_millions: 47, gic_gep: 350 },
      { lob: 'Misc.', nop: 23542, gwp_millions: 31, gic_gep: 0 },
      { lob: 'Marine', nop: 990, gwp_millions: 98, gic_gep: 110 },
      { lob: 'Liability', nop: 623, gwp_millions: 40, gic_gep: 124 },
      { lob: 'Total', nop: 129174, gwp_millions: 937, gic_gep: 83 }
    ],
    'June 2024': [
      { lob: 'FIRE (Dwellings)', nop: 58281, gwp_millions: 166, gic_gep: 4 },
      { lob: 'FIRE (Non Dwellings)', nop: 66140, gwp_millions: 388, gic_gep: 84 },
      { lob: 'Engineering', nop: 567, gwp_millions: 37, gic_gep: 78 },
      { lob: 'Misc.', nop: 51167, gwp_millions: 64, gic_gep: 8 },
      { lob: 'Marine', nop: 1211, gwp_millions: 100, gic_gep: 49 },
      { lob: 'Liability', nop: 717, gwp_millions: 32, gic_gep: 0 },
      { lob: 'Total', nop: 178083, gwp_millions: 788, gic_gep: 60 }
    ],
    'YTD May 2025': [
      { lob: 'FIRE (Dwellings)', nop: 67054, gwp_millions: 327, gic_gep: 12 },
      { lob: 'FIRE (Non Dwellings)', nop: 128737, gwp_millions: 1668, gic_gep: 73 },
      { lob: 'Engineering', nop: 1369, gwp_millions: 77, gic_gep: 67 },
      { lob: 'Misc.', nop: 39398, gwp_millions: 73, gic_gep: 12 },
      { lob: 'Marine', nop: 2537, gwp_millions: 364, gic_gep: 43 },
      { lob: 'Liability', nop: 1630, gwp_millions: 53, gic_gep: 63 },
      { lob: 'Total', nop: 240725, gwp_millions: 2562, gic_gep: 53 }
    ],
    'YTD May 2024': [
      { lob: 'FIRE (Dwellings)', nop: 102709, gwp_millions: 298, gic_gep: 6 },
      { lob: 'FIRE (Non Dwellings)', nop: 107138, gwp_millions: 1708, gic_gep: 0 },
      { lob: 'Engineering', nop: 1294, gwp_millions: 86, gic_gep: 34 },
      { lob: 'Misc.', nop: 76242, gwp_millions: 116, gic_gep: 5 },
      { lob: 'Marine', nop: 2280, gwp_millions: 349, gic_gep: 60 },
      { lob: 'Liability', nop: 1344, gwp_millions: 47, gic_gep: 29 },
      { lob: 'Total', nop: 291007, gwp_millions: 2604, gic_gep: 10 }
    ],
    'May 2025': [
      { lob: 'FIRE (Dwellings)', nop: 34409, gwp_millions: 174, gic_gep: 12 },
      { lob: 'FIRE (Non Dwellings)', nop: 71945, gwp_millions: 716, gic_gep: 52 },
      { lob: 'Engineering', nop: 628, gwp_millions: 37, gic_gep: 67 },
      { lob: 'Misc.', nop: 23149, gwp_millions: 39, gic_gep: 21 },
      { lob: 'Marine', nop: 1180, gwp_millions: 77, gic_gep: 73 },
      { lob: 'Liability', nop: 808, gwp_millions: 23, gic_gep: 41 },
      { lob: 'Total', nop: 132119, gwp_millions: 1067, gic_gep: 47 }
    ],
    'May 2024': [
      { lob: 'FIRE (Dwellings)', nop: 48025, gwp_millions: 141, gic_gep: 0 },
      { lob: 'FIRE (Non Dwellings)', nop: 60594, gwp_millions: 679, gic_gep: 0 },
      { lob: 'Engineering', nop: 585, gwp_millions: 32, gic_gep: 67 },
      { lob: 'Misc.', nop: 43287, gwp_millions: 65, gic_gep: 4 },
      { lob: 'Marine', nop: 1090, gwp_millions: 95, gic_gep: 61 },
      { lob: 'Liability', nop: 658, gwp_millions: 13, gic_gep: 28 },
      { lob: 'Total', nop: 154239, gwp_millions: 1025, gic_gep: 0 }
    ]
  };
  
  const brokerDataMap = {
    'YTD July 2025': [
      { broker_name: 'Toyota Tsusho Insurance Broker India Pvt Ltd', uw_channel: 'J&K', fire: 220.0, engineering: 0.5, marine: 121.2, misc: 0.2, liability: 14.3 },
      { broker_name: 'Marsh India Insurance Brokers Pvt Ltd', uw_channel: 'J&K', fire: 101.4, engineering: 1.1, marine: 10.8, misc: 0.0, liability: 12.0 },
      { broker_name: 'Prudent Insurance Brokers Pvt Ltd', uw_channel: 'Commercial', fire: 48.0, engineering: 0.2, marine: 14.5, misc: 0.0, liability: 0.7 },
      { broker_name: 'Alliance Insurance Brokers Pvt Ltd', uw_channel: 'Commercial', fire: 38.9, engineering: -0.2, marine: 4.4, misc: 0.0, liability: 0.1 },
      { broker_name: 'Bharat Re Insurance Brokers Pvt Ltd', uw_channel: 'J&K', fire: 27.2, engineering: 0.0, marine: 5.0, misc: 0.3, liability: 0.0 },
      { broker_name: 'Metier Insurance Broking Private Limited', uw_channel: 'SME', fire: 22.4, engineering: 0.1, marine: 9.2, misc: 0.1, liability: 0.2 },
      { broker_name: 'Beacon Insurance Brokers Private Ltd', uw_channel: 'Commercial', fire: 27.6, engineering: 0.2, marine: 3.0, misc: 0.0, liability: 0.1 },
      { broker_name: 'Pioneer Insurance & Reinsurance Brokers Pvt', uw_channel: 'Commercial', fire: 26.2, engineering: 1.3, marine: 1.5, misc: 0.0, liability: 0.6 },
      { broker_name: 'Smarttech Insurance Brokers Llp', uw_channel: 'Commercial', fire: 17.5, engineering: 0.0, marine: 11.6, misc: 0.0, liability: 0.0 },
      { broker_name: 'Marsh India Insurance Brokers Pvt. Ltd', uw_channel: 'Commercial', fire: 25.1, engineering: 1.7, marine: 1.8, misc: 0.0, liability: 0.2 },
      { broker_name: 'Madhuvan Ins.Broking Services Pvt Ltd', uw_channel: 'Commercial', fire: 27.3, engineering: 0.0, marine: 0.0, misc: 0.0, liability: 0.0 },
      { broker_name: 'Others', uw_channel: '', fire: 634.0, engineering: 49.3, marine: 125.2, misc: 6.4, liability: 24.6 },
      { broker_name: 'Total GWP', uw_channel: '', fire: 1215.6, engineering: 54.2, marine: 308.2, misc: 7.2, liability: 52.8 }
    ],
    'YTD June 2025': [
      { broker_name: 'Toyota Tsusho Insurance Broker India Pvt Ltd', uw_channel: 'J&K', fire: 183.6, engineering: 0.4, marine: 83.3, misc: 0.2, liability: 13.5 },
      { broker_name: 'Marsh India Insurance Brokers Pvt Ltd', uw_channel: 'J&K', fire: 54.0, engineering: 1.1, marine: 10.7, misc: 0.0, liability: 11.6 },
      { broker_name: 'Prudent Insurance Brokers Pvt Ltd', uw_channel: 'Commercial', fire: 41.8, engineering: 0.1, marine: 11.8, misc: 0.0, liability: 0.6 },
      { broker_name: 'Alliance Insurance Brokers Pvt Ltd', uw_channel: 'Commercial', fire: 32.2, engineering: 0.0, marine: 3.6, misc: 0.0, liability: 0.1 },
      { broker_name: 'Metier Insurance Broking Private Limited', uw_channel: 'SME', fire: 31.4, engineering: 0.0, marine: 9.0, misc: 0.0, liability: 0.1 },
      { broker_name: 'Bharat Re Insurance Brokers Pvt Ltd', uw_channel: 'J&K', fire: 24.4, engineering: 0.0, marine: 5.0, misc: 0.3, liability: 0.0 },
      { broker_name: 'Pioneer Insurance & Reinsurance Brokers', uw_channel: 'Commercial', fire: 26.4, engineering: 1.1, marine: 1.4, misc: 0.0, liability: 0.4 },
      { broker_name: 'Smarttech Insurance Brokers Llp', uw_channel: 'Commercial', fire: 17.4, engineering: 0.0, marine: 11.6, misc: 0.0, liability: 0.0 },
      { broker_name: 'Madhuvan Ins.Broking Services Pvt Ltd', uw_channel: 'Commercial', fire: 26.0, engineering: 0.0, marine: 0.0, misc: 0.0, liability: 0.0 },
      { broker_name: 'Marsh India Insurance Brokers Pvt. Ltd', uw_channel: 'Commercial', fire: 22.3, engineering: 1.7, marine: 1.6, misc: 0.0, liability: 0.0 },
      { broker_name: 'Beacon Insurance Brokers Private Ltd', uw_channel: 'Commercial', fire: 22.5, engineering: 0.2, marine: 2.6, misc: 0.0, liability: 0.1 },
      { broker_name: 'Others', uw_channel: '', fire: 559.1, engineering: 39.3, marine: 99.2, misc: 4.7, liability: 20.0 },
      { broker_name: 'Total GWP', uw_channel: '', fire: 1001.0, engineering: 44.0, marine: 239.9, misc: 5.5, liability: 46.5 }
    ],
    'YTD May 2025': [
      { broker_name: 'Toyota Tsusho Insurance Broker India Pvt Ltd', uw_channel: 'J&K', fire: 122.7, engineering: 0.4, marine: 73.4, misc: 0.2, liability: 11.0 },
      { broker_name: 'Marsh India Insurance Brokers Pvt Ltd', uw_channel: 'J&K', fire: 54.0, engineering: 0.9, marine: 6.5, misc: 0.0, liability: 7.5 },
      { broker_name: 'Prudent Insurance Brokers Pvt Ltd', uw_channel: 'Commercial', fire: 29.4, engineering: 0.0, marine: 10.3, misc: 0.0, liability: 0.3 },
      { broker_name: 'Alliance Insurance Brokers Pvt Ltd', uw_channel: 'Commercial', fire: 28.2, engineering: 0.0, marine: 1.4, misc: 0.0, liability: 0.1 },
      { broker_name: 'Bharat Re Insurance Brokers Pvt Ltd', uw_channel: 'J&K', fire: 24.4, engineering: 0.0, marine: 5.0, misc: 0.3, liability: 0.0 },
      { broker_name: 'Smarttech Insurance Brokers Llp', uw_channel: 'Commercial', fire: 16.7, engineering: 0.0, marine: 11.6, misc: 0.0, liability: 0.0 },
      { broker_name: 'Madhuvan Ins.Broking Services Pvt Ltd', uw_channel: 'Commercial', fire: 25.7, engineering: 0.0, marine: 0.0, misc: 0.0, liability: 0.0 },
      { broker_name: 'Metier Insurance Broking Private Limited', uw_channel: 'SME', fire: 17.9, engineering: 0.0, marine: 7.2, misc: 0.0, liability: 0.0 },
      { broker_name: 'Pioneer Insurance & Reinsurance Brokers', uw_channel: 'Commercial', fire: 21.9, engineering: 0.8, marine: -0.4, misc: 0.0, liability: 0.2 },
      { broker_name: 'Aon India Insurance Brokers Private Limited', uw_channel: 'J&K', fire: 8.9, engineering: 0.0, marine: 11.1, misc: 0.0, liability: 1.1 },
      { broker_name: 'Beacon Insurance Brokers Private Ltd', uw_channel: 'Commercial', fire: 18.0, engineering: 0.1, marine: 1.7, misc: 0.0, liability: 0.1 },
      { broker_name: 'Others', uw_channel: '', fire: 385.5, engineering: 17.2, marine: 65.2, misc: 4.3, liability: 12.4 },
      { broker_name: 'Total GWP', uw_channel: '', fire: 753.3, engineering: 19.5, marine: 192.9, misc: 4.9, liability: 32.8 }
    ]
  };
  
  // State variables for chart and table data based on selected date
  const [lobData, setLobData] = useState(lobDataMap[ // LOB chart data array with NOP, GWP, and GIC:GEP metrics
    selectedDate?.month === 'July' ? 'YTD July 2025' : 
    selectedDate?.month === 'June' ? 'YTD June 2025' : 'YTD May 2025'
  ]);
  const [brokerData, setBrokerData] = useState(brokerDataMap[ // Broker-wise GWP report data array
    selectedDate?.month === 'July' ? 'YTD July 2025' : 
    selectedDate?.month === 'June' ? 'YTD June 2025' : 'YTD May 2025'
  ]);
  const segmentMatrixDataMap = {
    'Apr\'25 - July\'25': [
      { uw_seg_map: 'JK', lob: 'FIRE', nop: 219, gwp: 672, gic_gep: '27%' },
      { uw_seg_map: 'JK', lob: 'ENGINEERING', nop: 122, gwp: 22, gic_gep: '-3%' },
      { uw_seg_map: 'JK', lob: 'MISCELLANEOUS', nop: 130, gwp: 2, gic_gep: '3%' },
      { uw_seg_map: 'JK', lob: 'MARINE', nop: 158, gwp: 413, gic_gep: '32%' },
      { uw_seg_map: 'JK', lob: 'LIABILITY', nop: 163, gwp: 46, gic_gep: '63%' },
      { uw_seg_map: 'JK', lob: 'OVERALL', nop: 792, gwp: 1154, gic_gep: '29%' },
      { uw_seg_map: 'Banca PSU', lob: 'FIRE', nop: 320001, gwp: 977, gic_gep: '63%' },
      { uw_seg_map: 'Banca PSU', lob: 'ENGINEERING', nop: 244, gwp: 5, gic_gep: '-8%' },
      { uw_seg_map: 'Banca PSU', lob: 'MISCELLANEOUS', nop: 85342, gwp: 106, gic_gep: '-1%' },
      { uw_seg_map: 'Banca PSU', lob: 'MARINE', nop: 36, gwp: 1, gic_gep: '28%' },
      { uw_seg_map: 'Banca PSU', lob: 'LIABILITY', nop: 46, gwp: 4, gic_gep: '17%' },
      { uw_seg_map: 'Banca PSU', lob: 'OVERALL', nop: 405669, gwp: 1094, gic_gep: '54%' },
      { uw_seg_map: 'Partner Others', lob: 'FIRE', nop: 87985, gwp: 453, gic_gep: '17%' },
      { uw_seg_map: 'Partner Others', lob: 'ENGINEERING', nop: 1493, gwp: 14, gic_gep: '49%' },
      { uw_seg_map: 'Partner Others', lob: 'MISCELLANEOUS', nop: 846, gwp: 6, gic_gep: '14%' },
      { uw_seg_map: 'Partner Others', lob: 'MARINE', nop: 584, gwp: 3, gic_gep: '20%' },
      { uw_seg_map: 'Partner Others', lob: 'LIABILITY', nop: 42, gwp: 7, gic_gep: '42%' },
      { uw_seg_map: 'Partner Others', lob: 'OVERALL', nop: 90950, gwp: 482, gic_gep: '18%' },
      { uw_seg_map: 'Commercial', lob: 'FIRE', nop: 2774, gwp: 1015, gic_gep: '116%' },
      { uw_seg_map: 'Commercial', lob: 'ENGINEERING', nop: 315, gwp: 79, gic_gep: '259%' },
      { uw_seg_map: 'Commercial', lob: 'MISCELLANEOUS', nop: 786, gwp: 19, gic_gep: '22%' },
      { uw_seg_map: 'Commercial', lob: 'MARINE', nop: 560, gwp: 126, gic_gep: '129%' },
      { uw_seg_map: 'Commercial', lob: 'LIABILITY', nop: 478, gwp: 35, gic_gep: '59%' },
      { uw_seg_map: 'Commercial', lob: 'OVERALL', nop: 4913, gwp: 1273, gic_gep: '130%' },
      { uw_seg_map: 'SME', lob: 'FIRE', nop: 4754, gwp: 305, gic_gep: '76%' },
      { uw_seg_map: 'SME', lob: 'ENGINEERING', nop: 436, gwp: 50, gic_gep: '104%' },
      { uw_seg_map: 'SME', lob: 'MISCELLANEOUS', nop: 1011, gwp: 4, gic_gep: '120%' },
      { uw_seg_map: 'SME', lob: 'MARINE', nop: 2556, gwp: 106, gic_gep: '79%' },
      { uw_seg_map: 'SME', lob: 'LIABILITY', nop: 2009, gwp: 25, gic_gep: '72%' },
      { uw_seg_map: 'SME', lob: 'OVERALL', nop: 10766, gwp: 491, gic_gep: '80%' },
      { uw_seg_map: 'Others', lob: 'FIRE', nop: 2017, gwp: 25, gic_gep: '43%' },
      { uw_seg_map: 'Others', lob: 'ENGINEERING', nop: 38, gwp: 3, gic_gep: '-75%' },
      { uw_seg_map: 'Others', lob: 'MISCELLANEOUS', nop: 50, gwp: 0, gic_gep: '153%' },
      { uw_seg_map: 'Others', lob: 'MARINE', nop: 824, gwp: 4, gic_gep: '556%' },
      { uw_seg_map: 'Others', lob: 'LIABILITY', nop: 262, gwp: 6, gic_gep: '66%' },
      { uw_seg_map: 'Others', lob: 'OVERALL', nop: 3191, gwp: 38, gic_gep: '101%' },
      { uw_seg_map: 'TOTAL', lob: 'FIRE', nop: 417750, gwp: 3447, gic_gep: '66%' },
      { uw_seg_map: 'TOTAL', lob: 'ENGINEERING', nop: 2648, gwp: 172, gic_gep: '158%' },
      { uw_seg_map: 'TOTAL', lob: 'MISCELLANEOUS', nop: 88165, gwp: 137, gic_gep: '5%' },
      { uw_seg_map: 'TOTAL', lob: 'MARINE', nop: 4718, gwp: 653, gic_gep: '60%' },
      { uw_seg_map: 'TOTAL', lob: 'LIABILITY', nop: 3000, gwp: 124, gic_gep: '64%' },
      { uw_seg_map: 'TOTAL', lob: 'OVERALL', nop: 516281, gwp: 4532, gic_gep: '66%' },
    ],
    'YTD July 2025': [
      { uw_seg_map: 'J&K', lob: 'FIRE', nop: 219, gwp: 672, gic_gep: '27%' },
      { uw_seg_map: 'J&K', lob: 'ENGINEERING', nop: 122, gwp: 22, gic_gep: '-3%' },
      { uw_seg_map: 'J&K', lob: 'MISCELLANEOUS', nop: 130, gwp: 2, gic_gep: '3%' },
      { uw_seg_map: 'J&K', lob: 'MARINE', nop: 158, gwp: 413, gic_gep: '32%' },
      { uw_seg_map: 'J&K', lob: 'LIABILITY', nop: 163, gwp: 46, gic_gep: '63%' },
      { uw_seg_map: 'J&K', lob: 'OVERALL', nop: 792, gwp: 1154, gic_gep: '29%' },
      { uw_seg_map: 'Banca PSU', lob: 'FIRE', nop: 320001, gwp: 977, gic_gep: '63%' },
      { uw_seg_map: 'Banca PSU', lob: 'ENGINEERING', nop: 244, gwp: 5, gic_gep: '-8%' },
      { uw_seg_map: 'Banca PSU', lob: 'MISCELLANEOUS', nop: 85342, gwp: 106, gic_gep: '-1%' },
      { uw_seg_map: 'Banca PSU', lob: 'MARINE', nop: 36, gwp: 1, gic_gep: '28%' },
      { uw_seg_map: 'Banca PSU', lob: 'LIABILITY', nop: 46, gwp: 4, gic_gep: '17%' },
      { uw_seg_map: 'Banca PSU', lob: 'OVERALL', nop: 405669, gwp: 1094, gic_gep: '54%' },
      { uw_seg_map: 'Partners Others', lob: 'FIRE', nop: 87985, gwp: 453, gic_gep: '17%' },
      { uw_seg_map: 'Partners Others', lob: 'ENGINEERING', nop: 1493, gwp: 14, gic_gep: '49%' },
      { uw_seg_map: 'Partners Others', lob: 'MISCELLANEOUS', nop: 846, gwp: 6, gic_gep: '14%' },
      { uw_seg_map: 'Partners Others', lob: 'MARINE', nop: 584, gwp: 3, gic_gep: '20%' },
      { uw_seg_map: 'Partners Others', lob: 'LIABILITY', nop: 42, gwp: 7, gic_gep: '42%' },
      { uw_seg_map: 'Partners Others', lob: 'OVERALL', nop: 90950, gwp: 482, gic_gep: '18%' },
      { uw_seg_map: 'Commercial', lob: 'FIRE', nop: 2774, gwp: 1015, gic_gep: '116%' },
      { uw_seg_map: 'Commercial', lob: 'ENGINEERING', nop: 315, gwp: 79, gic_gep: '259%' },
      { uw_seg_map: 'Commercial', lob: 'MISCELLANEOUS', nop: 786, gwp: 19, gic_gep: '22%' },
      { uw_seg_map: 'Commercial', lob: 'MARINE', nop: 560, gwp: 126, gic_gep: '129%' },
      { uw_seg_map: 'Commercial', lob: 'LIABILITY', nop: 478, gwp: 35, gic_gep: '59%' },
      { uw_seg_map: 'Commercial', lob: 'OVERALL', nop: 4913, gwp: 1273, gic_gep: '130%' },
      { uw_seg_map: 'SME', lob: 'FIRE', nop: 4754, gwp: 305, gic_gep: '76%' },
      { uw_seg_map: 'SME', lob: 'ENGINEERING', nop: 436, gwp: 50, gic_gep: '104%' },
      { uw_seg_map: 'SME', lob: 'MISCELLANEOUS', nop: 1011, gwp: 4, gic_gep: '120%' },
      { uw_seg_map: 'SME', lob: 'MARINE', nop: 2556, gwp: 106, gic_gep: '79%' },
      { uw_seg_map: 'SME', lob: 'LIABILITY', nop: 2009, gwp: 25, gic_gep: '72%' },
      { uw_seg_map: 'SME', lob: 'OVERALL', nop: 10766, gwp: 491, gic_gep: '80%' },
      { uw_seg_map: 'Others', lob: 'FIRE', nop: 2017, gwp: 25, gic_gep: '43%' },
      { uw_seg_map: 'Others', lob: 'ENGINEERING', nop: 38, gwp: 3, gic_gep: '-75%' },
      { uw_seg_map: 'Others', lob: 'MISCELLANEOUS', nop: 50, gwp: 0, gic_gep: '153%' },
      { uw_seg_map: 'Others', lob: 'MARINE', nop: 824, gwp: 4, gic_gep: '556%' },
      { uw_seg_map: 'Others', lob: 'LIABILITY', nop: 262, gwp: 6, gic_gep: '66%' },
      { uw_seg_map: 'Others', lob: 'OVERALL', nop: 3191, gwp: 38, gic_gep: '101%' },
      { uw_seg_map: 'TOTAL', lob: 'FIRE', nop: 417750, gwp: 3447, gic_gep: '66%' },
      { uw_seg_map: 'TOTAL', lob: 'ENGINEERING', nop: 2648, gwp: 172, gic_gep: '158%' },
      { uw_seg_map: 'TOTAL', lob: 'MISCELLANEOUS', nop: 88165, gwp: 137, gic_gep: '5%' },
      { uw_seg_map: 'TOTAL', lob: 'MARINE', nop: 4718, gwp: 653, gic_gep: '60%' },
      { uw_seg_map: 'TOTAL', lob: 'LIABILITY', nop: 3000, gwp: 124, gic_gep: '64%' },
      { uw_seg_map: 'TOTAL', lob: 'OVERALL', nop: 516281, gwp: 4532, gic_gep: '66%' },
    ],

    'YTD July 2024': [
      { uw_seg_map: 'J&K', lob: 'FIRE', nop: 225, gwp: 702, gic_gep: '-102%' },
      { uw_seg_map: 'J&K', lob: 'ENGINEERING', nop: 135, gwp: 29, gic_gep: '-71%' },
      { uw_seg_map: 'J&K', lob: 'MISCELLANEOUS', nop: 139, gwp: 3, gic_gep: '60%' },
      { uw_seg_map: 'J&K', lob: 'MARINE', nop: 145, gwp: 381, gic_gep: '26%' },
      { uw_seg_map: 'J&K', lob: 'LIABILITY', nop: 176, gwp: 44, gic_gep: '2%' },
      { uw_seg_map: 'J&K', lob: 'OVERALL', nop: 820, gwp: 1158, gic_gep: '-44%' },
      { uw_seg_map: 'Banca PSU', lob: 'FIRE', nop: 277604, gwp: 772, gic_gep: '54%' },
      { uw_seg_map: 'Banca PSU', lob: 'ENGINEERING', nop: 229, gwp: 7, gic_gep: '193%' },
      { uw_seg_map: 'Banca PSU', lob: 'MISCELLANEOUS', nop: 171356, gwp: 178, gic_gep: '4%' },
      { uw_seg_map: 'Banca PSU', lob: 'MARINE', nop: 25, gwp: 0, gic_gep: '0%' },
      { uw_seg_map: 'Banca PSU', lob: 'LIABILITY', nop: 25, gwp: 1, gic_gep: '16%' },
      { uw_seg_map: 'Banca PSU', lob: 'OVERALL', nop: 449239, gwp: 959, gic_gep: '44%' },
      { uw_seg_map: 'Partners Others', lob: 'FIRE', nop: 173877, gwp: 428, gic_gep: '17%' },
      { uw_seg_map: 'Partners Others', lob: 'ENGINEERING', nop: 1301, gwp: 13, gic_gep: '105%' },
      { uw_seg_map: 'Partners Others', lob: 'MISCELLANEOUS', nop: 1232, gwp: 27, gic_gep: '1%' },
      { uw_seg_map: 'Partners Others', lob: 'MARINE', nop: 547, gwp: 3, gic_gep: '0%' },
      { uw_seg_map: 'Partners Others', lob: 'LIABILITY', nop: 24, gwp: 2, gic_gep: '7%' },
      { uw_seg_map: 'Partners Others', lob: 'OVERALL', nop: 176981, gwp: 473, gic_gep: '19%' },
      { uw_seg_map: 'Commercial', lob: 'FIRE', nop: 3054, gwp: 1027, gic_gep: '72%' },
      { uw_seg_map: 'Commercial', lob: 'ENGINEERING', nop: 418, gwp: 78, gic_gep: '97%' },
      { uw_seg_map: 'Commercial', lob: 'MISCELLANEOUS', nop: 1027, gwp: 22, gic_gep: '52%' },
      { uw_seg_map: 'Commercial', lob: 'MARINE', nop: 692, gwp: 138, gic_gep: '119%' },
      { uw_seg_map: 'Commercial', lob: 'LIABILITY', nop: 488, gwp: 36, gic_gep: '19%' },
      { uw_seg_map: 'Commercial', lob: 'OVERALL', nop: 5679, gwp: 1301, gic_gep: '77%' },
      { uw_seg_map: 'SME', lob: 'FIRE', nop: 4712, gwp: 243, gic_gep: '-192%' },
      { uw_seg_map: 'SME', lob: 'ENGINEERING', nop: 306, gwp: 28, gic_gep: '60%' },
      { uw_seg_map: 'SME', lob: 'MISCELLANEOUS', nop: 1142, gwp: 4, gic_gep: '37%' },
      { uw_seg_map: 'SME', lob: 'MARINE', nop: 2439, gwp: 76, gic_gep: '86%' },
      { uw_seg_map: 'SME', lob: 'LIABILITY', nop: 1843, gwp: 22, gic_gep: '28%' },
      { uw_seg_map: 'SME', lob: 'OVERALL', nop: 10442, gwp: 374, gic_gep: '-91%' },
      { uw_seg_map: 'Others', lob: 'FIRE', nop: 558, gwp: 15, gic_gep: '20%' },
      { uw_seg_map: 'Others', lob: 'ENGINEERING', nop: 70, gwp: 4, gic_gep: '30%' },
      { uw_seg_map: 'Others', lob: 'MISCELLANEOUS', nop: 56, gwp: 0, gic_gep: '0%' },
      { uw_seg_map: 'Others', lob: 'MARINE', nop: 521, gwp: 2, gic_gep: '37%' },
      { uw_seg_map: 'Others', lob: 'LIABILITY', nop: 277, gwp: 3, gic_gep: '14%' },
      { uw_seg_map: 'Others', lob: 'OVERALL', nop: 1482, gwp: 25, gic_gep: '21%' },
    ],
    'July 2025': [
      { uw_seg_map: 'J&K', lob: 'FIRE', nop: 58, gwp: 109, gic_gep: '93%' },
      { uw_seg_map: 'J&K', lob: 'ENGINEERING', nop: 36, gwp: 4, gic_gep: '-62%' },
      { uw_seg_map: 'J&K', lob: 'MISCELLANEOUS', nop: 19, gwp: 1, gic_gep: '-1%' },
      { uw_seg_map: 'J&K', lob: 'MARINE', nop: 39, gwp: 86, gic_gep: '25%' },
      { uw_seg_map: 'J&K', lob: 'LIABILITY', nop: 40, gwp: 6, gic_gep: '18%' },
      { uw_seg_map: 'J&K', lob: 'OVERALL', nop: 172, gwp: 206, gic_gep: '55%' },
      { uw_seg_map: 'Banca PSU', lob: 'FIRE', nop: 88956, gwp: 268, gic_gep: '44%' },
      { uw_seg_map: 'Banca PSU', lob: 'ENGINEERING', nop: 46, gwp: 2, gic_gep: '-2%' },
      { uw_seg_map: 'Banca PSU', lob: 'MISCELLANEOUS', nop: 23990, gwp: 29, gic_gep: '7%' },
      { uw_seg_map: 'Banca PSU', lob: 'MARINE', nop: 5, gwp: 0, gic_gep: '117%' },
      { uw_seg_map: 'Banca PSU', lob: 'LIABILITY', nop: 22, gwp: 3, gic_gep: '9%' },
      { uw_seg_map: 'Banca PSU', lob: 'OVERALL', nop: 113019, gwp: 303, gic_gep: '39%' },
      { uw_seg_map: 'Partners Others', lob: 'FIRE', nop: 21813, gwp: 113, gic_gep: '12%' },
      { uw_seg_map: 'Partners Others', lob: 'ENGINEERING', nop: 382, gwp: 5, gic_gep: '26%' },
      { uw_seg_map: 'Partners Others', lob: 'MISCELLANEOUS', nop: 209, gwp: 0, gic_gep: '27%' },
      { uw_seg_map: 'Partners Others', lob: 'MARINE', nop: 110, gwp: 1, gic_gep: '-20%' },
      { uw_seg_map: 'Partners Others', lob: 'LIABILITY', nop: 20, gwp: 6, gic_gep: '0%' },
      { uw_seg_map: 'Partners Others', lob: 'OVERALL', nop: 22534, gwp: 124, gic_gep: '13%' },
      { uw_seg_map: 'Commercial', lob: 'FIRE', nop: 526, gwp: 111, gic_gep: '-201%' },
      { uw_seg_map: 'Commercial', lob: 'ENGINEERING', nop: 49, gwp: 19, gic_gep: '-187%' },
      { uw_seg_map: 'Commercial', lob: 'MISCELLANEOUS', nop: 120, gwp: 0, gic_gep: '-152%' },
      { uw_seg_map: 'Commercial', lob: 'MARINE', nop: 122, gwp: 23, gic_gep: '135%' },
      { uw_seg_map: 'Commercial', lob: 'LIABILITY', nop: 96, gwp: 6, gic_gep: '16%' },
      { uw_seg_map: 'Commercial', lob: 'OVERALL', nop: 913, gwp: 159, gic_gep: '-181%' },
      { uw_seg_map: 'SME', lob: 'FIRE', nop: 902, gwp: 71, gic_gep: '37%' },
      { uw_seg_map: 'SME', lob: 'ENGINEERING', nop: 99, gwp: 14, gic_gep: '112%' },
      { uw_seg_map: 'SME', lob: 'MISCELLANEOUS', nop: 209, gwp: 1, gic_gep: '-46%' },
      { uw_seg_map: 'SME', lob: 'MARINE', nop: 655, gwp: 44, gic_gep: '78%' },
      { uw_seg_map: 'SME', lob: 'LIABILITY', nop: 476, gwp: 5, gic_gep: '30%' },
      { uw_seg_map: 'SME', lob: 'OVERALL', nop: 2341, gwp: 136, gic_gep: '51%' },
      { uw_seg_map: 'Others', lob: 'FIRE', nop: 676, gwp: 9, gic_gep: '110%' },
      { uw_seg_map: 'Others', lob: 'ENGINEERING', nop: 11, gwp: 1, gic_gep: '50%' },
      { uw_seg_map: 'Others', lob: 'MISCELLANEOUS', nop: 13, gwp: 0, gic_gep: '0%' },
      { uw_seg_map: 'Others', lob: 'MARINE', nop: 223, gwp: 1, gic_gep: '-352%' },
      { uw_seg_map: 'Others', lob: 'LIABILITY', nop: 75, gwp: 5, gic_gep: '1%' },
      { uw_seg_map: 'Others', lob: 'OVERALL', nop: 998, gwp: 16, gic_gep: '10%' },
    ],
    'July 2024': [
      { uw_seg_map: 'J&K', lob: 'FIRE', nop: 42, gwp: 142, gic_gep: '-404%' },
      { uw_seg_map: 'J&K', lob: 'ENGINEERING', nop: 23, gwp: 8, gic_gep: '-40%' },
      { uw_seg_map: 'J&K', lob: 'MISCELLANEOUS', nop: 21, gwp: 1, gic_gep: '-26%' },
      { uw_seg_map: 'J&K', lob: 'MARINE', nop: 31, gwp: 111, gic_gep: '28%' },
      { uw_seg_map: 'J&K', lob: 'LIABILITY', nop: 26, gwp: 13, gic_gep: '10%' },
      { uw_seg_map: 'J&K', lob: 'OVERALL', nop: 143, gwp: 275, gic_gep: '-176%' },
      { uw_seg_map: 'Banca PSU', lob: 'FIRE', nop: 75822, gwp: 205, gic_gep: '40%' },
      { uw_seg_map: 'Banca PSU', lob: 'ENGINEERING', nop: 57, gwp: 2, gic_gep: '135%' },
      { uw_seg_map: 'Banca PSU', lob: 'MISCELLANEOUS', nop: 46836, gwp: 47, gic_gep: '5%' },
      { uw_seg_map: 'Banca PSU', lob: 'MARINE', nop: 8, gwp: 0, gic_gep: '0%' },
      { uw_seg_map: 'Banca PSU', lob: 'LIABILITY', nop: 3, gwp: 0, gic_gep: '0%' },
      { uw_seg_map: 'Banca PSU', lob: 'OVERALL', nop: 122726, gwp: 254, gic_gep: '33%' },
      { uw_seg_map: 'Partners Others', lob: 'FIRE', nop: 48527, gwp: 126, gic_gep: '-5%' },
      { uw_seg_map: 'Partners Others', lob: 'ENGINEERING', nop: 352, gwp: 4, gic_gep: '23%' },
      { uw_seg_map: 'Partners Others', lob: 'MISCELLANEOUS', nop: 216, gwp: 6, gic_gep: '0%' },
      { uw_seg_map: 'Partners Others', lob: 'MARINE', nop: 111, gwp: 1, gic_gep: '-51%' },
      { uw_seg_map: 'Partners Others', lob: 'LIABILITY', nop: 8, gwp: 0, gic_gep: '-69%' },
      { uw_seg_map: 'Partners Others', lob: 'OVERALL', nop: 49214, gwp: 136, gic_gep: '-4%' },
      { uw_seg_map: 'Commercial', lob: 'FIRE', nop: 654, gwp: 113, gic_gep: '43%' },
      { uw_seg_map: 'Commercial', lob: 'ENGINEERING', nop: 85, gwp: 18, gic_gep: '-199%' },
      { uw_seg_map: 'Commercial', lob: 'MISCELLANEOUS', nop: 189, gwp: 1, gic_gep: '87%' },
      { uw_seg_map: 'Commercial', lob: 'MARINE', nop: 122, gwp: 26, gic_gep: '82%' },
      { uw_seg_map: 'Commercial', lob: 'LIABILITY', nop: 126, gwp: 9, gic_gep: '10%' },
      { uw_seg_map: 'Commercial', lob: 'OVERALL', nop: 1176, gwp: 166, gic_gep: '57%' },
      { uw_seg_map: 'SME', lob: 'FIRE', nop: 965, gwp: 38, gic_gep: '121%' },
      { uw_seg_map: 'SME', lob: 'ENGINEERING', nop: 69, gwp: 5, gic_gep: '61%' },
      { uw_seg_map: 'SME', lob: 'MISCELLANEOUS', nop: 272, gwp: 1, gic_gep: '75%' },
      { uw_seg_map: 'SME', lob: 'MARINE', nop: 507, gwp: 13, gic_gep: '64%' },
      { uw_seg_map: 'SME', lob: 'LIABILITY', nop: 531, gwp: 5, gic_gep: '58%' },
      { uw_seg_map: 'SME', lob: 'OVERALL', nop: 2344, gwp: 62, gic_gep: '98%' },
      { uw_seg_map: 'Others', lob: 'FIRE', nop: 152, gwp: 2, gic_gep: '27%' },
      { uw_seg_map: 'Others', lob: 'ENGINEERING', nop: 12, gwp: 0, gic_gep: '1%' },
      { uw_seg_map: 'Others', lob: 'MISCELLANEOUS', nop: 9, gwp: 0, gic_gep: '0%' },
      { uw_seg_map: 'Others', lob: 'MARINE', nop: 99, gwp: 0, gic_gep: '29%' },
      { uw_seg_map: 'Others', lob: 'LIABILITY', nop: 78, gwp: 1, gic_gep: '31%' },
      { uw_seg_map: 'Others', lob: 'OVERALL', nop: 350, gwp: 4, gic_gep: '25%' },
    ],
    'YTD June 2025': [
      { uw_seg_map: 'J&K', lob: 'FIRE', nop: 180, gwp: 562, gic_gep: '1%' },
      { uw_seg_map: 'J&K', lob: 'ENGINEERING', nop: 86, gwp: 17, gic_gep: '21%' },
      { uw_seg_map: 'J&K', lob: 'MISCELLANEOUS', nop: 118, gwp: 2, gic_gep: '5%' },
      { uw_seg_map: 'J&K', lob: 'MARINE', nop: 118, gwp: 292, gic_gep: '36%' },
      { uw_seg_map: 'J&K', lob: 'LIABILITY', nop: 131, gwp: 35, gic_gep: '2%' },
      { uw_seg_map: 'J&K', lob: 'OVERALL', nop: 639, gwp: 854, gic_gep: '12%' },
      { uw_seg_map: 'Banca PSU', lob: 'FIRE', nop: 230128, gwp: 706, gic_gep: '-16%' },
      { uw_seg_map: 'Banca PSU', lob: 'ENGINEERING', nop: 197, gwp: 4, gic_gep: '-11%' },
      { uw_seg_map: 'Banca PSU', lob: 'MISCELLANEOUS', nop: 60237, gwp: 76, gic_gep: '6%' },
      { uw_seg_map: 'Banca PSU', lob: 'MARINE', nop: 31, gwp: 1, gic_gep: '0%' },
      { uw_seg_map: 'Banca PSU', lob: 'LIABILITY', nop: 25, gwp: 1, gic_gep: '25%' },
      { uw_seg_map: 'Banca PSU', lob: 'OVERALL', nop: 301770, gwp: 830, gic_gep: '-12%' },
      { uw_seg_map: 'Partners Others', lob: 'FIRE', nop: 63704, gwp: 327, gic_gep: '8%' },
      { uw_seg_map: 'Partners Others', lob: 'ENGINEERING', nop: 1102, gwp: 9, gic_gep: '57%' },
      { uw_seg_map: 'Partners Others', lob: 'MISCELLANEOUS', nop: 612, gwp: 6, gic_gep: '2%' },
      { uw_seg_map: 'Partners Others', lob: 'MARINE', nop: 474, gwp: 2, gic_gep: '34%' },
      { uw_seg_map: 'Partners Others', lob: 'LIABILITY', nop: 22, gwp: 3, gic_gep: '298%' },
      { uw_seg_map: 'Partners Others', lob: 'OVERALL', nop: 58870, gwp: 318, gic_gep: '11%' },
      { uw_seg_map: 'Commercial', lob: 'FIRE', nop: 2222, gwp: 897, gic_gep: '64%' },
      { uw_seg_map: 'Commercial', lob: 'ENGINEERING', nop: 255, gwp: 58, gic_gep: '288%' },
      { uw_seg_map: 'Commercial', lob: 'MISCELLANEOUS', nop: 798, gwp: 19, gic_gep: '84%' },
      { uw_seg_map: 'Commercial', lob: 'MARINE', nop: 437, gwp: 103, gic_gep: '126%' },
      { uw_seg_map: 'Commercial', lob: 'LIABILITY', nop: 412, gwp: 15, gic_gep: '75%' },
      { uw_seg_map: 'Commercial', lob: 'OVERALL', nop: 4350, gwp: 1281, gic_gep: '78%' },
      { uw_seg_map: 'SME', lob: 'FIRE', nop: 3641, gwp: 234, gic_gep: '84%' },
      { uw_seg_map: 'SME', lob: 'ENGINEERING', nop: 334, gwp: 36, gic_gep: '101%' },
      { uw_seg_map: 'SME', lob: 'MISCELLANEOUS', nop: 870, gwp: 3, gic_gep: '42%' },
      { uw_seg_map: 'SME', lob: 'MARINE', nop: 1873, gwp: 62, gic_gep: '79%' },
      { uw_seg_map: 'SME', lob: 'LIABILITY', nop: 1520, gwp: 20, gic_gep: '118%' },
      { uw_seg_map: 'SME', lob: 'OVERALL', nop: 8643, gwp: 401, gic_gep: '86%' },
      { uw_seg_map: 'Others', lob: 'FIRE', nop: 1405, gwp: 22, gic_gep: '66%' },
      { uw_seg_map: 'Others', lob: 'ENGINEERING', nop: 30, gwp: 2, gic_gep: '-97%' },
      { uw_seg_map: 'Others', lob: 'MISCELLANEOUS', nop: 38, gwp: 0, gic_gep: '320%' },
      { uw_seg_map: 'Others', lob: 'MARINE', nop: 620, gwp: 2, gic_gep: '1143%' },
      { uw_seg_map: 'Others', lob: 'LIABILITY', nop: 151, gwp: 2, gic_gep: '175%' },
      { uw_seg_map: 'Others', lob: 'OVERALL', nop: 2039, gwp: 24, gic_gep: '200%' },
    ],
    'YTD June 2024': [
      { uw_seg_map: 'J&K', lob: 'FIRE', nop: 173, gwp: 465, gic_gep: '5%' },
      { uw_seg_map: 'J&K', lob: 'ENGINEERING', nop: 112, gwp: 21, gic_gep: '-88%' },
      { uw_seg_map: 'J&K', lob: 'MISCELLANEOUS', nop: 142, gwp: 2, gic_gep: '98%' },
      { uw_seg_map: 'J&K', lob: 'MARINE', nop: 114, gwp: 270, gic_gep: '25%' },
      { uw_seg_map: 'J&K', lob: 'LIABILITY', nop: 148, gwp: 34, gic_gep: '0%' },
      { uw_seg_map: 'J&K', lob: 'OVERALL', nop: 689, gwp: 792, gic_gep: '8%' },
      { uw_seg_map: 'Banca PSU', lob: 'FIRE', nop: 267268, gwp: 561, gic_gep: '25%' },
      { uw_seg_map: 'Banca PSU', lob: 'ENGINEERING', nop: 172, gwp: 5, gic_gep: '215%' },
      { uw_seg_map: 'Banca PSU', lob: 'MISCELLANEOUS', nop: 125267, gwp: 128, gic_gep: '4%' },
      { uw_seg_map: 'Banca PSU', lob: 'MARINE', nop: 17, gwp: 0.4, gic_gep: '0%' },
      { uw_seg_map: 'Banca PSU', lob: 'LIABILITY', nop: 22, gwp: 1, gic_gep: '35%' },
      { uw_seg_map: 'Banca PSU', lob: 'OVERALL', nop: 392746, gwp: 695, gic_gep: '21%' },
      { uw_seg_map: 'Partners Others', lob: 'FIRE', nop: 61410, gwp: 270, gic_gep: '6%' },
      { uw_seg_map: 'Partners Others', lob: 'ENGINEERING', nop: 949, gwp: 10, gic_gep: '133%' },
      { uw_seg_map: 'Partners Others', lob: 'MISCELLANEOUS', nop: 1238, gwp: 26, gic_gep: '1%' },
      { uw_seg_map: 'Partners Others', lob: 'MARINE', nop: 436, gwp: 2, gic_gep: '17%' },
      { uw_seg_map: 'Partners Others', lob: 'LIABILITY', nop: 12, gwp: 3, gic_gep: '52%' },
      { uw_seg_map: 'Partners Others', lob: 'OVERALL', nop: 64045, gwp: 311, gic_gep: '8%' },
      { uw_seg_map: 'Commercial', lob: 'FIRE', nop: 2637, gwp: 1200, gic_gep: '26%' },
      { uw_seg_map: 'Commercial', lob: 'ENGINEERING', nop: 330, gwp: 60, gic_gep: '52%' },
      { uw_seg_map: 'Commercial', lob: 'MISCELLANEOUS', nop: 1042, gwp: 24, gic_gep: '15%' },
      { uw_seg_map: 'Commercial', lob: 'MARINE', nop: 570, gwp: 112, gic_gep: '131%' },
      { uw_seg_map: 'Commercial', lob: 'LIABILITY', nop: 382, gwp: 12, gic_gep: '82%' },
      { uw_seg_map: 'Commercial', lob: 'OVERALL', nop: 4961, gwp: 1408, gic_gep: '42%' },
      { uw_seg_map: 'SME', lob: 'FIRE', nop: 3502, gwp: 200, gic_gep: '15%' },
      { uw_seg_map: 'SME', lob: 'ENGINEERING', nop: 237, gwp: 23, gic_gep: '60%' },
      { uw_seg_map: 'SME', lob: 'MISCELLANEOUS', nop: 986, gwp: 3, gic_gep: '18%' },
      { uw_seg_map: 'SME', lob: 'MARINE', nop: 1912, gwp: 63, gic_gep: '94%' },
      { uw_seg_map: 'SME', lob: 'LIABILITY', nop: 1224, gwp: 14, gic_gep: '23%' },
      { uw_seg_map: 'SME', lob: 'OVERALL', nop: 7861, gwp: 303, gic_gep: '35%' },
      { uw_seg_map: 'Others', lob: 'FIRE', nop: 1000, gwp: 15, gic_gep: '56%' },
      { uw_seg_map: 'Others', lob: 'ENGINEERING', nop: 61, gwp: 4, gic_gep: '40%' },
      { uw_seg_map: 'Others', lob: 'MISCELLANEOUS', nop: 34, gwp: 0, gic_gep: '0%' },
      { uw_seg_map: 'Others', lob: 'MARINE', nop: 442, gwp: 1.6, gic_gep: '47%' },
      { uw_seg_map: 'Others', lob: 'LIABILITY', nop: 273, gwp: 2, gic_gep: '0%' },
      { uw_seg_map: 'Others', lob: 'OVERALL', nop: 1810, gwp: 22, gic_gep: '48%' },
    ],
    'June 2025': [
      { uw_seg_map: 'J&K', lob: 'FIRE', nop: 68, gwp: 174, gic_gep: '0%' },
      { uw_seg_map: 'J&K', lob: 'ENGINEERING', nop: 19, gwp: 5, gic_gep: '13%' },
      { uw_seg_map: 'J&K', lob: 'MISCELLANEOUS', nop: 23, gwp: 0, gic_gep: '3%' },
      { uw_seg_map: 'J&K', lob: 'MARINE', nop: 34, gwp: 56, gic_gep: '64%' },
      { uw_seg_map: 'J&K', lob: 'LIABILITY', nop: 39, gwp: 7, gic_gep: '0%' },
      { uw_seg_map: 'J&K', lob: 'OVERALL', nop: 183, gwp: 242, gic_gep: '15%' },
      { uw_seg_map: 'Banca PSU', lob: 'FIRE', nop: 91162, gwp: 374, gic_gep: '-5%' },
      { uw_seg_map: 'Banca PSU', lob: 'ENGINEERING', nop: 45, gwp: 1, gic_gep: '4%' },
      { uw_seg_map: 'Banca PSU', lob: 'MISCELLANEOUS', nop: 23119, gwp: 28, gic_gep: '3%' },
      { uw_seg_map: 'Banca PSU', lob: 'MARINE', nop: 15, gwp: 0, gic_gep: '0%' },
      { uw_seg_map: 'Banca PSU', lob: 'LIABILITY', nop: 9, gwp: 0, gic_gep: '47%' },
      { uw_seg_map: 'Banca PSU', lob: 'OVERALL', nop: 114350, gwp: 403, gic_gep: '-4%' },
      { uw_seg_map: 'Partners Others', lob: 'FIRE', nop: 16256, gwp: 91, gic_gep: '-1%' },
      { uw_seg_map: 'Partners Others', lob: 'ENGINEERING', nop: 359, gwp: 3, gic_gep: '58%' },
      { uw_seg_map: 'Partners Others', lob: 'MISCELLANEOUS', nop: 227, gwp: 2, gic_gep: '5%' },
      { uw_seg_map: 'Partners Others', lob: 'MARINE', nop: 106, gwp: 0, gic_gep: '0%' },
      { uw_seg_map: 'Partners Others', lob: 'LIABILITY', nop: 8, gwp: 1, gic_gep: '615%' },
      { uw_seg_map: 'Partners Others', lob: 'OVERALL', nop: 16956, gwp: 97, gic_gep: '2%' },
      { uw_seg_map: 'Commercial', lob: 'FIRE', nop: 816, gwp: 322, gic_gep: '83%' },
      { uw_seg_map: 'Commercial', lob: 'ENGINEERING', nop: 81, gwp: 30, gic_gep: '624%' },
      { uw_seg_map: 'Commercial', lob: 'MISCELLANEOUS', nop: 271, gwp: 1, gic_gep: '124%' },
      { uw_seg_map: 'Commercial', lob: 'MARINE', nop: 112, gwp: 26, gic_gep: '212%' },
      { uw_seg_map: 'Commercial', lob: 'LIABILITY', nop: 126, gwp: 6, gic_gep: '74%' },
      { uw_seg_map: 'Commercial', lob: 'OVERALL', nop: 1406, gwp: 385, gic_gep: '120%' },
      { uw_seg_map: 'SME', lob: 'FIRE', nop: 1337, gwp: 107, gic_gep: '350%' },
      { uw_seg_map: 'SME', lob: 'ENGINEERING', nop: 102, gwp: 8, gic_gep: '42%' },
      { uw_seg_map: 'SME', lob: 'MISCELLANEOUS', nop: 314, gwp: 1, gic_gep: '67%' },
      { uw_seg_map: 'SME', lob: 'MARINE', nop: 542, gwp: 14, gic_gep: '169%' },
      { uw_seg_map: 'SME', lob: 'LIABILITY', nop: 446, gwp: 13, gic_gep: '56%' },
      { uw_seg_map: 'SME', lob: 'OVERALL', nop: 2741, gwp: 143, gic_gep: '201%' },
      { uw_seg_map: 'Others', lob: 'FIRE', nop: 365, gwp: 5, gic_gep: '124%' },
      { uw_seg_map: 'Others', lob: 'ENGINEERING', nop: 9, gwp: 1, gic_gep: '-214%' },
      { uw_seg_map: 'Others', lob: 'MISCELLANEOUS', nop: 14, gwp: 0, gic_gep: '650%' },
      { uw_seg_map: 'Others', lob: 'MARINE', nop: 181, gwp: 1, gic_gep: '640%' },
      { uw_seg_map: 'Others', lob: 'LIABILITY', nop: 0, gwp: 0, gic_gep: '-49%' },
      { uw_seg_map: 'Others', lob: 'OVERALL', nop: 569, gwp: 7, gic_gep: '183%' },
    ],
    'June 2024': [
      { uw_seg_map: 'J&K', lob: 'FIRE', nop: 43, gwp: 54, gic_gep: '-1%' },
      { uw_seg_map: 'J&K', lob: 'ENGINEERING', nop: 23, gwp: 8, gic_gep: '-16%' },
      { uw_seg_map: 'J&K', lob: 'MISCELLANEOUS', nop: 27, gwp: 0, gic_gep: '80%' },
      { uw_seg_map: 'J&K', lob: 'MARINE', nop: 34, gwp: 73, gic_gep: '7%' },
      { uw_seg_map: 'J&K', lob: 'LIABILITY', nop: 34, gwp: 4, gic_gep: '-2%' },
      { uw_seg_map: 'J&K', lob: 'OVERALL', nop: 161, gwp: 140, gic_gep: '2%' },
      { uw_seg_map: 'Banca PSU', lob: 'FIRE', nop: 77119, gwp: 215, gic_gep: '74%' },
      { uw_seg_map: 'Banca PSU', lob: 'ENGINEERING', nop: 50, gwp: 2, gic_gep: '73%' },
      { uw_seg_map: 'Banca PSU', lob: 'MISCELLANEOUS', nop: 50395, gwp: 51, gic_gep: '4%' },
      { uw_seg_map: 'Banca PSU', lob: 'MARINE', nop: 4, gwp: 0, gic_gep: '0%' },
      { uw_seg_map: 'Banca PSU', lob: 'LIABILITY', nop: 8, gwp: 0, gic_gep: '2%' },
      { uw_seg_map: 'Banca PSU', lob: 'OVERALL', nop: 127576, gwp: 268, gic_gep: '58%' },
      { uw_seg_map: 'Partners Others', lob: 'FIRE', nop: 44718, gwp: 104, gic_gep: '17%' },
      { uw_seg_map: 'Partners Others', lob: 'ENGINEERING', nop: 344, gwp: 3, gic_gep: '90%' },
      { uw_seg_map: 'Partners Others', lob: 'MISCELLANEOUS', nop: 278, gwp: 6, gic_gep: '0%' },
      { uw_seg_map: 'Partners Others', lob: 'MARINE', nop: 111, gwp: 1, gic_gep: '31%' },
      { uw_seg_map: 'Partners Others', lob: 'LIABILITY', nop: 8, gwp: 0, gic_gep: '-5%' },
      { uw_seg_map: 'Partners Others', lob: 'OVERALL', nop: 45459, gwp: 113, gic_gep: '19%' },
      { uw_seg_map: 'Commercial', lob: 'FIRE', nop: 760, gwp: 134, gic_gep: '150%' },
      { uw_seg_map: 'Commercial', lob: 'ENGINEERING', nop: 64, gwp: 14, gic_gep: '115%' },
      { uw_seg_map: 'Commercial', lob: 'MISCELLANEOUS', nop: 180, gwp: 5, gic_gep: '41%' },
      { uw_seg_map: 'Commercial', lob: 'MARINE', nop: 175, gwp: 14, gic_gep: '160%' },
      { uw_seg_map: 'Commercial', lob: 'LIABILITY', nop: 112, gwp: 19, gic_gep: '-66%' },
      { uw_seg_map: 'Commercial', lob: 'OVERALL', nop: 1291, gwp: 187, gic_gep: '125%' },
      { uw_seg_map: 'SME', lob: 'FIRE', nop: 1504, gwp: 42, gic_gep: '54%' },
      { uw_seg_map: 'SME', lob: 'ENGINEERING', nop: 67, gwp: 7, gic_gep: '97%' },
      { uw_seg_map: 'SME', lob: 'MISCELLANEOUS', nop: 253, gwp: 1, gic_gep: '41%' },
      { uw_seg_map: 'SME', lob: 'MARINE', nop: 644, gwp: 11, gic_gep: '90%' },
      { uw_seg_map: 'SME', lob: 'LIABILITY', nop: 487, gwp: 7, gic_gep: '16%' },
      { uw_seg_map: 'SME', lob: 'OVERALL', nop: 2955, gwp: 69, gic_gep: '63%' },
      { uw_seg_map: 'Others', lob: 'FIRE', nop: 277, gwp: 6, gic_gep: '5%' },
      { uw_seg_map: 'Others', lob: 'ENGINEERING', nop: 19, gwp: 3, gic_gep: '36%' },
      { uw_seg_map: 'Others', lob: 'MISCELLANEOUS', nop: 34, gwp: 0, gic_gep: '0%' },
      { uw_seg_map: 'Others', lob: 'MARINE', nop: 243, gwp: 1, gic_gep: '11%' },
      { uw_seg_map: 'Others', lob: 'LIABILITY', nop: 68, gwp: 2, gic_gep: '6%' },
      { uw_seg_map: 'Others', lob: 'OVERALL', nop: 641, gwp: 11, gic_gep: '10%' },
    ],
    'YTD May 2025': [
      { uw_seg_map: 'J&K', lob: 'FIRE', nop: 137, gwp: 434, gic_gep: '3%' },
      { uw_seg_map: 'J&K', lob: 'ENGINEERING', nop: 64, gwp: 12, gic_gep: '25%' },
      { uw_seg_map: 'J&K', lob: 'MISCELLANEOUS', nop: 95, gwp: 1, gic_gep: '7%' },
      { uw_seg_map: 'J&K', lob: 'MARINE', nop: 83, gwp: 235, gic_gep: '20%' },
      { uw_seg_map: 'J&K', lob: 'LIABILITY', nop: 92, gwp: 28, gic_gep: '0%' },
      { uw_seg_map: 'J&K', lob: 'OVERALL', nop: 471, gwp: 709, gic_gep: '10%' },
      { uw_seg_map: 'Banca PSU', lob: 'FIRE', nop: 150118, gwp: 461, gic_gep: '69%' },
      { uw_seg_map: 'Banca PSU', lob: 'ENGINEERING', nop: 152, gwp: 2, gic_gep: '-19%' },
      { uw_seg_map: 'Banca PSU', lob: 'MISCELLANEOUS', nop: 37813, gwp: 48, gic_gep: '4%' },
      { uw_seg_map: 'Banca PSU', lob: 'MARINE', nop: 16, gwp: 1, gic_gep: '0%' },
      { uw_seg_map: 'Banca PSU', lob: 'LIABILITY', nop: 16, gwp: 0, gic_gep: '21%' },
      { uw_seg_map: 'Banca PSU', lob: 'OVERALL', nop: 188115, gwp: 514, gic_gep: '59%' },
      { uw_seg_map: 'Partners Others', lob: 'FIRE', nop: 40393, gwp: 211, gic_gep: '12%' },
      { uw_seg_map: 'Partners Others', lob: 'ENGINEERING', nop: 733, gwp: 6, gic_gep: '57%' },
      { uw_seg_map: 'Partners Others', lob: 'MISCELLANEOUS', nop: 385, gwp: 4, gic_gep: '3%' },
      { uw_seg_map: 'Partners Others', lob: 'MARINE', nop: 366, gwp: 1, gic_gep: '50%' },
      { uw_seg_map: 'Partners Others', lob: 'LIABILITY', nop: 14, gwp: 2, gic_gep: '282%' },
      { uw_seg_map: 'Partners Others', lob: 'OVERALL', nop: 41891, gwp: 224, gic_gep: '14%' },
      { uw_seg_map: 'Commercial', lob: 'FIRE', nop: 1632, gwp: 698, gic_gep: '90%' },
      { uw_seg_map: 'Commercial', lob: 'ENGINEERING', nop: 169, gwp: 28, gic_gep: '56%' },
      { uw_seg_map: 'Commercial', lob: 'MISCELLANEOUS', nop: 525, gwp: 18, gic_gep: '107%' },
      { uw_seg_map: 'Commercial', lob: 'MARINE', nop: 323, gwp: 76, gic_gep: '83%' },
      { uw_seg_map: 'Commercial', lob: 'LIABILITY', nop: 286, gwp: 9, gic_gep: '68%' },
      { uw_seg_map: 'Commercial', lob: 'OVERALL', nop: 2935, gwp: 829, gic_gep: '86%' },
      { uw_seg_map: 'SME', lob: 'FIRE', nop: 2709, gwp: 180, gic_gep: '77%' },
      { uw_seg_map: 'SME', lob: 'ENGINEERING', nop: 226, gwp: 28, gic_gep: '135%' },
      { uw_seg_map: 'SME', lob: 'MISCELLANEOUS', nop: 556, gwp: 2, gic_gep: '45%' },
      { uw_seg_map: 'SME', lob: 'MARINE', nop: 1313, gwp: 48, gic_gep: '36%' },
      { uw_seg_map: 'SME', lob: 'LIABILITY', nop: 1074, gwp: 13, gic_gep: '109%' },
      { uw_seg_map: 'SME', lob: 'OVERALL', nop: 5878, gwp: 270, gic_gep: '80%' },
      { uw_seg_map: 'Others', lob: 'FIRE', nop: 802, gwp: 12, gic_gep: '33%' },
      { uw_seg_map: 'Others', lob: 'ENGINEERING', nop: 25, gwp: 1, gic_gep: '-1%' },
      { uw_seg_map: 'Others', lob: 'MISCELLANEOUS', nop: 24, gwp: 0, gic_gep: '304%' },
      { uw_seg_map: 'Others', lob: 'MARINE', nop: 436, gwp: 3, gic_gep: '911%' },
      { uw_seg_map: 'Others', lob: 'LIABILITY', nop: 148, gwp: 1, gic_gep: '161%' },
      { uw_seg_map: 'Others', lob: 'OVERALL', nop: 1435, gwp: 17, gic_gep: '186%' },
    ],
    'YTD May 2024': [
      { uw_seg_map: 'J&K', lob: 'FIRE', nop: 140, gwp: 506, gic_gep: '0%' },
      { uw_seg_map: 'J&K', lob: 'ENGINEERING', nop: 89, gwp: 13, gic_gep: '-131%' },
      { uw_seg_map: 'J&K', lob: 'MISCELLANEOUS', nop: 91, gwp: 1, gic_gep: '92%' },
      { uw_seg_map: 'J&K', lob: 'MARINE', nop: 80, gwp: 197, gic_gep: '34%' },
      { uw_seg_map: 'J&K', lob: 'LIABILITY', nop: 116, gwp: 27, gic_gep: '0%' },
      { uw_seg_map: 'J&K', lob: 'OVERALL', nop: 516, gwp: 744, gic_gep: '11%' },
      { uw_seg_map: 'Banca PSU', lob: 'FIRE', nop: 124663, gwp: 352, gic_gep: '51%' },
      { uw_seg_map: 'Banca PSU', lob: 'ENGINEERING', nop: 122, gwp: 3, gic_gep: '276%' },
      { uw_seg_map: 'Banca PSU', lob: 'MISCELLANEOUS', nop: 74125, gwp: 80, gic_gep: '3%' },
      { uw_seg_map: 'Banca PSU', lob: 'MARINE', nop: 13, gwp: 0, gic_gep: '0%' },
      { uw_seg_map: 'Banca PSU', lob: 'LIABILITY', nop: 14, gwp: 0, gic_gep: '31%' },
      { uw_seg_map: 'Banca PSU', lob: 'OVERALL', nop: 198937, gwp: 436, gic_gep: '42%' },
      { uw_seg_map: 'Partners Others', lob: 'FIRE', nop: 80632, gwp: 198, gic_gep: '29%' },
      { uw_seg_map: 'Partners Others', lob: 'ENGINEERING', nop: 605, gwp: 7, gic_gep: '156%' },
      { uw_seg_map: 'Partners Others', lob: 'MISCELLANEOUS', nop: 738, gwp: 16, gic_gep: '1%' },
      { uw_seg_map: 'Partners Others', lob: 'MARINE', nop: 325, gwp: 2, gic_gep: '10%' },
      { uw_seg_map: 'Partners Others', lob: 'LIABILITY', nop: 8, gwp: 2, gic_gep: '49%' },
      { uw_seg_map: 'Partners Others', lob: 'OVERALL', nop: 82308, gwp: 224, gic_gep: '32%' },
      { uw_seg_map: 'Commercial', lob: 'FIRE', nop: 1634, gwp: 779, gic_gep: '58%' },
      { uw_seg_map: 'Commercial', lob: 'ENGINEERING', nop: 269, gwp: 46, gic_gep: '27%' },
      { uw_seg_map: 'Commercial', lob: 'MISCELLANEOUS', nop: 654, gwp: 16, gic_gep: '42%' },
      { uw_seg_map: 'Commercial', lob: 'MARINE', nop: 394, gwp: 97, gic_gep: '116%' },
      { uw_seg_map: 'Commercial', lob: 'LIABILITY', nop: 249, gwp: 8, gic_gep: '74%' },
      { uw_seg_map: 'Commercial', lob: 'OVERALL', nop: 3200, gwp: 946, gic_gep: '63%' },
      { uw_seg_map: 'SME', lob: 'FIRE', nop: 2240, gwp: 162, gic_gep: '-467%' },
      { uw_seg_map: 'SME', lob: 'ENGINEERING', nop: 171, gwp: 17, gic_gep: '42%' },
      { uw_seg_map: 'SME', lob: 'MISCELLANEOUS', nop: 616, gwp: 2, gic_gep: '15%' },
      { uw_seg_map: 'SME', lob: 'MARINE', nop: 1268, gwp: 52, gic_gep: '95%' },
      { uw_seg_map: 'SME', lob: 'LIABILITY', nop: 815, gwp: 9, gic_gep: '20%' },
      { uw_seg_map: 'SME', lob: 'OVERALL', nop: 5110, gwp: 242, gic_gep: '-257%' },
      { uw_seg_map: 'Others', lob: 'FIRE', nop: 538, gwp: 8, gic_gep: '25%' },
      { uw_seg_map: 'Others', lob: 'ENGINEERING', nop: 38, gwp: 1, gic_gep: '49%' },
      { uw_seg_map: 'Others', lob: 'MISCELLANEOUS', nop: 18, gwp: 0, gic_gep: '0%' },
      { uw_seg_map: 'Others', lob: 'MARINE', nop: 200, gwp: 1, gic_gep: '-39%' },
      { uw_seg_map: 'Others', lob: 'LIABILITY', nop: 142, gwp: 1, gic_gep: '0%' },
      { uw_seg_map: 'Others', lob: 'OVERALL', nop: 936, gwp: 12, gic_gep: '27%' },
    ],
    'May 2025': [
      { uw_seg_map: 'J&K', lob: 'FIRE', nop: 88, gwp: 168, gic_gep: '5%' },
      { uw_seg_map: 'J&K', lob: 'ENGINEERING', nop: 35, gwp: 3, gic_gep: '83%' },
      { uw_seg_map: 'J&K', lob: 'MISCELLANEOUS', nop: 48, gwp: 0, gic_gep: '8%' },
      { uw_seg_map: 'J&K', lob: 'MARINE', nop: 33, gwp: 41, gic_gep: '47%' },
      { uw_seg_map: 'J&K', lob: 'LIABILITY', nop: 38, gwp: 12, gic_gep: '0%' },
      { uw_seg_map: 'J&K', lob: 'OVERALL', nop: 242, gwp: 224, gic_gep: '23%' },
      { uw_seg_map: 'Banca PSU', lob: 'FIRE', nop: 84172, gwp: 259, gic_gep: '78%' },
      { uw_seg_map: 'Banca PSU', lob: 'ENGINEERING', nop: 76, gwp: 1, gic_gep: '-103%' },
      { uw_seg_map: 'Banca PSU', lob: 'MISCELLANEOUS', nop: 22253, gwp: 28, gic_gep: '6%' },
      { uw_seg_map: 'Banca PSU', lob: 'MARINE', nop: 8, gwp: 0, gic_gep: '0%' },
      { uw_seg_map: 'Banca PSU', lob: 'LIABILITY', nop: 12, gwp: 0, gic_gep: '41%' },
      { uw_seg_map: 'Banca PSU', lob: 'OVERALL', nop: 106521, gwp: 288, gic_gep: '66%' },
      { uw_seg_map: 'Partners Others', lob: 'FIRE', nop: 19404, gwp: 107, gic_gep: '15%' },
      { uw_seg_map: 'Partners Others', lob: 'ENGINEERING', nop: 281, gwp: 2, gic_gep: '88%' },
      { uw_seg_map: 'Partners Others', lob: 'MISCELLANEOUS', nop: 235, gwp: 2, gic_gep: '7%' },
      { uw_seg_map: 'Partners Others', lob: 'MARINE', nop: 118, gwp: 1, gic_gep: '100%' },
      { uw_seg_map: 'Partners Others', lob: 'LIABILITY', nop: 5, gwp: 0, gic_gep: '547%' },
      { uw_seg_map: 'Partners Others', lob: 'OVERALL', nop: 20043, gwp: 112, gic_gep: '20%' },
      { uw_seg_map: 'Commercial', lob: 'FIRE', nop: 884, gwp: 276, gic_gep: '24%' },
      { uw_seg_map: 'Commercial', lob: 'ENGINEERING', nop: 94, gwp: 15, gic_gep: '62%' },
      { uw_seg_map: 'Commercial', lob: 'MISCELLANEOUS', nop: 283, gwp: 9, gic_gep: '175%' },
      { uw_seg_map: 'Commercial', lob: 'MARINE', nop: 145, gwp: 22, gic_gep: '78%' },
      { uw_seg_map: 'Commercial', lob: 'LIABILITY', nop: 124, gwp: 4, gic_gep: '67%' },
      { uw_seg_map: 'Commercial', lob: 'OVERALL', nop: 1530, gwp: 325, gic_gep: '38%' },
      { uw_seg_map: 'SME', lob: 'FIRE', nop: 1343, gwp: 73, gic_gep: '53%' },
      { uw_seg_map: 'SME', lob: 'ENGINEERING', nop: 134, gwp: 15, gic_gep: '95%' },
      { uw_seg_map: 'SME', lob: 'MISCELLANEOUS', nop: 318, gwp: 1, gic_gep: '89%' },
      { uw_seg_map: 'SME', lob: 'MARINE', nop: 648, gwp: 12, gic_gep: '99%' },
      { uw_seg_map: 'SME', lob: 'LIABILITY', nop: 575, gwp: 7, gic_gep: '51%' },
      { uw_seg_map: 'SME', lob: 'OVERALL', nop: 3018, gwp: 109, gic_gep: '65%' },
      { uw_seg_map: 'Others', lob: 'FIRE', nop: 463, gwp: 7, gic_gep: '62%' },
      { uw_seg_map: 'Others', lob: 'ENGINEERING', nop: 8, gwp: 0, gic_gep: '13%' },
      { uw_seg_map: 'Others', lob: 'MISCELLANEOUS', nop: 12, gwp: 0, gic_gep: '650%' },
      { uw_seg_map: 'Others', lob: 'MARINE', nop: 228, gwp: 2, gic_gep: '1319%' },
      { uw_seg_map: 'Others', lob: 'LIABILITY', nop: 54, gwp: 0, gic_gep: '-49%' },
      { uw_seg_map: 'Others', lob: 'OVERALL', nop: 765, gwp: 10, gic_gep: '301%' },
    ],
    'May 2024': [
      { uw_seg_map: 'J&K', lob: 'FIRE', nop: 63, gwp: 224, gic_gep: '1%' },
      { uw_seg_map: 'J&K', lob: 'ENGINEERING', nop: 41, gwp: 3, gic_gep: '135%' },
      { uw_seg_map: 'J&K', lob: 'MISCELLANEOUS', nop: 42, gwp: 0, gic_gep: '142%' },
      { uw_seg_map: 'J&K', lob: 'MARINE', nop: 28, gwp: 54, gic_gep: '18%' },
      { uw_seg_map: 'J&K', lob: 'LIABILITY', nop: 51, gwp: 6, gic_gep: '0%' },
      { uw_seg_map: 'J&K', lob: 'OVERALL', nop: 225, gwp: 287, gic_gep: '11%' },
      { uw_seg_map: 'Banca PSU', lob: 'FIRE', nop: 71287, gwp: 195, gic_gep: '49%' },
      { uw_seg_map: 'Banca PSU', lob: 'ENGINEERING', nop: 53, gwp: 1, gic_gep: '29%' },
      { uw_seg_map: 'Banca PSU', lob: 'MISCELLANEOUS', nop: 42279, gwp: 45, gic_gep: '0%' },
      { uw_seg_map: 'Banca PSU', lob: 'MARINE', nop: 10, gwp: 0, gic_gep: '0%' },
      { uw_seg_map: 'Banca PSU', lob: 'LIABILITY', nop: 7, gwp: 0, gic_gep: '55%' },
      { uw_seg_map: 'Banca PSU', lob: 'OVERALL', nop: 113636, gwp: 241, gic_gep: '38%' },
      { uw_seg_map: 'Partners Others', lob: 'FIRE', nop: 35149, gwp: 82, gic_gep: '28%' },
      { uw_seg_map: 'Partners Others', lob: 'ENGINEERING', nop: 268, gwp: 3, gic_gep: '254%' },
      { uw_seg_map: 'Partners Others', lob: 'MISCELLANEOUS', nop: 333, gwp: 7, gic_gep: '3%' },
      { uw_seg_map: 'Partners Others', lob: 'MARINE', nop: 137, gwp: 1, gic_gep: '20%' },
      { uw_seg_map: 'Partners Others', lob: 'LIABILITY', nop: 6, gwp: 0, gic_gep: '0%' },
      { uw_seg_map: 'Partners Others', lob: 'OVERALL', nop: 35893, gwp: 92, gic_gep: '36%' },
      { uw_seg_map: 'Commercial', lob: 'FIRE', nop: 750, gwp: 265, gic_gep: '20%' },
      { uw_seg_map: 'Commercial', lob: 'ENGINEERING', nop: 127, gwp: 18, gic_gep: '37%' },
      { uw_seg_map: 'Commercial', lob: 'MISCELLANEOUS', nop: 316, gwp: 12, gic_gep: '43%' },
      { uw_seg_map: 'Commercial', lob: 'MARINE', nop: 187, gwp: 22, gic_gep: '198%' },
      { uw_seg_map: 'Commercial', lob: 'LIABILITY', nop: 101, gwp: 2, gic_gep: '72%' },
      { uw_seg_map: 'Commercial', lob: 'OVERALL', nop: 1481, gwp: 319, gic_gep: '41%' },
      { uw_seg_map: 'SME', lob: 'FIRE', nop: 1104, gwp: 52, gic_gep: '-761%' },
      { uw_seg_map: 'SME', lob: 'ENGINEERING', nop: 78, gwp: 7, gic_gep: '15%' },
      { uw_seg_map: 'SME', lob: 'MISCELLANEOUS', nop: 315, gwp: 1, gic_gep: '26%' },
      { uw_seg_map: 'SME', lob: 'MARINE', nop: 563, gwp: 17, gic_gep: '82%' },
      { uw_seg_map: 'SME', lob: 'LIABILITY', nop: 428, gwp: 5, gic_gep: '19%' },
      { uw_seg_map: 'SME', lob: 'OVERALL', nop: 2488, gwp: 81, gic_gep: '-450%' },
      { uw_seg_map: 'Others', lob: 'FIRE', nop: 266, gwp: 2, gic_gep: '30%' },
      { uw_seg_map: 'Others', lob: 'ENGINEERING', nop: 18, gwp: 1, gic_gep: '67%' },
      { uw_seg_map: 'Others', lob: 'MISCELLANEOUS', nop: 2, gwp: 0, gic_gep: '0%' },
      { uw_seg_map: 'Others', lob: 'MARINE', nop: 165, gwp: 1, gic_gep: '-1%' },
      { uw_seg_map: 'Others', lob: 'LIABILITY', nop: 65, gwp: 1, gic_gep: '0%' },
      { uw_seg_map: 'Others', lob: 'OVERALL', nop: 516, gwp: 4, gic_gep: '32%' },
    ]
  };
  
  const fireUnderInsuranceDataMap = {
    'YTD July 2025': [
      ['BOB', '56,712,055', '1,725,608', '3%', '3'],
      ['PNB', '20,043,969', '2,148,670', '11%', '3'],
      ['PARTNERS OTHERS', '4,549,772', '1,237,969', '27%', '2'],
      ['UNION BANK', '66,133,212', '1,146,087', '2%', '2'],
      ['OBC', '11,603,120', '684,191', '6%', '2'],
      ['INDIAN BANK', '43,391,492', '714,560', '2%', '1'],
      ['AGENCY', '0', '0', '0%', '0'],
      ['UNITED BANK OF INDIA', '5,196,620', '656,576', '13%', '2'],
      ['CBI', '4,251,340', '0', '0%', '0'],
      ['OTHERS', '14,556,217', '184,642', '1%', '2']
    ],
    'YTD June 2025': [
      ['BOB', '44,689,877', '1,255,348', '3%', '3'],
      ['PNB', '16,362,629', '1,959,835', '12%', '3'],
      ['PARTNERS OTHERS', '3,373,418', '1,237,969', '37%', '2'],
      ['UNION BANK', '32,274,178', '885,466', '3%', '2'],
      ['OBC', '8,913,008', '594,211', '7%', '2'],
      ['INDIAN BANK', '10,545,803', '714,560', '7%', '1'],
      ['AGENCY', '0', '0', '0%', '0'],
      ['UNITED BANK OF INDIA', '4,472,905', '0', '0%', '0'],
      ['CBI', '3,821,348', '0', '0%', '0'],
      ['OTHERS', '11,081,219', '37,197', '0%', '1']
    ],
    'YTD May 2025': [
      ['BOB', '35,481,119', '27,260', '0%', '1'],
      ['PNB', '17,781,677', '1,424,103', '8%', '4'],
      ['PARTNERS OTHERS', '1,687,299', '1,022,388', '61%', '1'],
      ['UNION BANK', '27,700,009', '592', '0%', '1'],
      ['OBC', '1,370,005', '0', '0%', '0'],
      ['INDIAN BANK', '3,394,971', '322,529', '10%', '1'],
      ['AGENCY', '0', '0', '0%', '0'],
      ['UNITED BANK OF INDIA', '4,130,993', '0', '0%', '0'],
      ['CBI', '3,657,448', '0', '0%', '0'],
      ['OTHERS', '5,336,212', '0', '0%', '0']
    ]
  };

  const cordysTatDataMap = {
    'YTD July 2025': [
      { month: 'Apr\'25', lob: 'Fire', sameDay: 265, sameDayPct: '73%', nextDay: 54, nextDayPct: '15%', beyond: 46, beyondPct: '13%', total: 365 },
      { month: 'Apr\'25', lob: 'Engineering', sameDay: 75, sameDayPct: '66%', nextDay: 23, nextDayPct: '20%', beyond: 16, beyondPct: '14%', total: 114 },
      { month: 'Apr\'25', lob: 'Miscellaneous', sameDay: 213, sameDayPct: '83%', nextDay: 31, nextDayPct: '12%', beyond: 12, beyondPct: '5%', total: 256 },
      { month: 'Apr\'25', lob: 'Total', sameDay: 553, sameDayPct: '75%', nextDay: 108, nextDayPct: '15%', beyond: 74, beyondPct: '10%', total: 735 },
      { month: 'July\'25', lob: 'Fire', sameDay: 37, sameDayPct: '58%', nextDay: 17, nextDayPct: '27%', beyond: 10, beyondPct: '16%', total: 64 },
      { month: 'July\'25', lob: 'Engineering', sameDay: 64, sameDayPct: '80%', nextDay: 10, nextDayPct: '13%', beyond: 6, beyondPct: '8%', total: 80 },
      { month: 'July\'25', lob: 'Miscellaneous', sameDay: 67, sameDayPct: '87%', nextDay: 9, nextDayPct: '12%', beyond: 1, beyondPct: '1%', total: 77 },
      { month: 'July\'25', lob: 'Total', sameDay: 168, sameDayPct: '76%', nextDay: 36, nextDayPct: '16%', beyond: 17, beyondPct: '8%', total: 221 }
    ],
    'YTD June 2025': [
      { month: 'Apr\'25', lob: 'Fire', sameDay: 143, sameDayPct: '76%', nextDay: 32, nextDayPct: '17%', beyond: 14, beyondPct: '7%', total: 189 },
      { month: 'Apr\'25', lob: 'Engineering', sameDay: 36, sameDayPct: '69%', nextDay: 11, nextDayPct: '21%', beyond: 5, beyondPct: '10%', total: 52 },
      { month: 'Apr\'25', lob: 'Miscellaneous', sameDay: 96, sameDayPct: '80%', nextDay: 19, nextDayPct: '16%', beyond: 5, beyondPct: '4%', total: 120 },
      { month: 'May\'25', lob: 'Fire', sameDay: 100, sameDayPct: '71%', nextDay: 14, nextDayPct: '10%', beyond: 26, beyondPct: '19%', total: 140 },
      { month: 'May\'25', lob: 'Engineering', sameDay: 25, sameDayPct: '63%', nextDay: 7, nextDayPct: '18%', beyond: 8, beyondPct: '20%', total: 40 },
      { month: 'May\'25', lob: 'Miscellaneous', sameDay: 74, sameDayPct: '85%', nextDay: 8, nextDayPct: '9%', beyond: 5, beyondPct: '6%', total: 87 },
      { month: 'June\'25', lob: 'Fire', sameDay: 22, sameDayPct: '61%', nextDay: 8, nextDayPct: '22%', beyond: 6, beyondPct: '17%', total: 36 },
      { month: 'June\'25', lob: 'Engineering', sameDay: 14, sameDayPct: '64%', nextDay: 5, nextDayPct: '23%', beyond: 3, beyondPct: '14%', total: 22 },
      { month: 'June\'25', lob: 'Miscellaneous', sameDay: 43, sameDayPct: '88%', nextDay: 4, nextDayPct: '8%', beyond: 2, beyondPct: '4%', total: 49 }
    ],
    'YTD May 2025': [
      { month: 'Apr\'25', lob: 'Fire', sameDay: 143, sameDayPct: '76%', nextDay: 32, nextDayPct: '17%', beyond: 14, beyondPct: '7%', total: 189 },
      { month: 'Apr\'25', lob: 'Engineering', sameDay: 36, sameDayPct: '69%', nextDay: 11, nextDayPct: '21%', beyond: 5, beyondPct: '10%', total: 52 },
      { month: 'Apr\'25', lob: 'Miscellaneous', sameDay: 96, sameDayPct: '80%', nextDay: 19, nextDayPct: '16%', beyond: 5, beyondPct: '4%', total: 120 },
      { month: 'May\'25', lob: 'Fire', sameDay: 100, sameDayPct: '71%', nextDay: 14, nextDayPct: '10%', beyond: 26, beyondPct: '19%', total: 140 },
      { month: 'May\'25', lob: 'Engineering', sameDay: 25, sameDayPct: '63%', nextDay: 7, nextDayPct: '18%', beyond: 8, beyondPct: '20%', total: 40 },
      { month: 'May\'25', lob: 'Miscellaneous', sameDay: 74, sameDayPct: '85%', nextDay: 8, nextDayPct: '9%', beyond: 5, beyondPct: '6%', total: 87 }
    ]
  };

  const inwardFacDataMap = {
    'YTD July 2025': {
      july: [
        { lob: 'Fire', nop: 9, gwp: '33,780,316', si: '32,018,932,122', gic: '8,294,830', gep: '24,023,023', gicgep: '35%' },
        { lob: 'Engineering', nop: 0, gwp: '6,554,430', si: '0', gic: '45,003,095', gep: '6,673,417', gicgep: '674%' },
        { lob: 'Marine', nop: 0, gwp: '5,315', si: '22,618,822', gic: '0', gep: '5,315', gicgep: '0%' },
        { lob: 'Miscellaneous', nop: 0, gwp: '0', si: '0', gic: '0', gep: '0', gicgep: '0%' },
        { lob: 'Liability', nop: 0, gwp: '0', si: '0', gic: '0', gep: '0', gicgep: '0%' }
      ],
      ytd: [
        { lob: 'Fire', nop: 51, gwp: '174,792,589', si: '167,523,418,758', gic: '106,409,077', gep: '104,256,822', gicgep: '102%' },
        { lob: 'Engineering', nop: 4, gwp: '22,770,784', si: '6,393,025,284', gic: '62,591,851', gep: '20,214,621', gicgep: '310%' },
        { lob: 'Marine', nop: 0, gwp: '5,315', si: '22,618,822', gic: '0', gep: '5,315', gicgep: '0%' },
        { lob: 'Miscellaneous', nop: 0, gwp: '0', si: '0', gic: '0', gep: '0', gicgep: '0%' },
        { lob: 'Liability', nop: 0, gwp: '0', si: '0', gic: '0', gep: '0', gicgep: '0%' }
      ]
    },
    'YTD June 2025': {
      june: [
        { lob: 'Fire', nop: 4, gwp: '18,804,479', si: '11,602,437,577', gic: '15,855,260', gep: '25,782,283', gicgep: '62%' },
        { lob: 'Engineering', nop: 3, gwp: '7,159,288', si: '4,446,010,218', gep: '5,189,563', gicgep: '3%' },
        { lob: 'Marine', nop: 0, gwp: '0', si: '0', gic: '0', gep: '0', gicgep: '0%' },
        { lob: 'Miscellaneous', nop: 0, gwp: '0', si: '0', gic: '0', gep: '0', gicgep: '0%' },
        { lob: 'Liability', nop: 0, gwp: '0', si: '0', gic: '0', gep: '0', gicgep: '0%' }
      ],
      ytd: [
        { lob: 'Fire', nop: 43, gwp: '142,333,563', si: '136,410,986,650', gic: '98,114,247', gep: '80,233,798', gicgep: '122%' },
        { lob: 'Engineering', nop: 4, gwp: '15,367,796', si: '5,324,422,702', gic: '17,588,756', gep: '13,541,204', gicgep: '130%' },
        { lob: 'Marine', nop: 0, gwp: '0', si: '0', gic: '0', gep: '0', gicgep: '0%' },
        { lob: 'Miscellaneous', nop: 0, gwp: '0', si: '0', gic: '0', gep: '0', gicgep: '0%' },
        { lob: 'Liability', nop: 0, gwp: '0', si: '0', gic: '0', gep: '0', gicgep: '0%' }
      ]
    },
    'YTD May 2025': {
      may: [
        { lob: 'Fire', nop: 2, gwp: '8,621,406', si: '12,462,760,872', gic: '53,319,274', gep: '28,330,026', gicgep: '190%' },
        { lob: 'Engineering', nop: 1, gwp: '8,208,507', si: '878,412,484', gic: '9,762,017', gep: '6,299,514', gicgep: '155%' },
        { lob: 'Marine', nop: 0, gwp: '0', si: '0', gic: '0', gep: '0', gicgep: '0%' },
        { lob: 'Miscellaneous', nop: 0, gwp: '0', si: '0', gic: '0', gep: '0', gicgep: '0%' },
        { lob: 'Liability', nop: 0, gwp: '0', si: '0', gic: '0', gep: '0', gicgep: '0%' }
      ],
      ytd: [
        { lob: 'Fire', nop: 39, gwp: '128,531,084', si: '124,808,549,073', gic: '82,218,987', gep: '54,451,509', gicgep: '151%' },
        { lob: 'Engineering', nop: 1, gwp: '8,208,507', si: '878,412,484', gic: '17,438,756', gep: '8,351,636', gicgep: '209%' },
        { lob: 'Marine', nop: 0, gwp: '0', si: '0', gic: '0', gep: '0', gicgep: '0%' },
        { lob: 'Miscellaneous', nop: 0, gwp: '0', si: '0', gic: '0', gep: '0', gicgep: '0%' },
        { lob: 'Liability', nop: 0, gwp: '0', si: '0', gic: '0', gep: '0', gicgep: '0%' }
      ]
    }
  };

  const newBusinessDataMap = {
    'YTD July 2025': {
      commercial: [
        'JANATICS INDIA PVT LTD - Manufacturing Unit - Engineering Workshop- Manufacturing of Pneumatic Valves, Cylinders - ROTN (Ourshare 100%)(Premium Rs.6.80 L)',
        'JANATICS INDIA PVT LTD - Manufacturing Unit - Engineering Workshop - Manufacturing of Pneumatic Valves, Cylinders - Spinning mills -ROTN (Ourshare 100%)(Premium Rs.12.00 L)',
        'SALZER ELECTRONICS LTD - Manufacturer of wires & Cables and wire Harness - ROTN (Ourshare 100%) (Premium Rs.18.89 L)',
        'DISHMAN CARBOGEN AMCIS LIMITED -Chemical Manufacturing(Using materials with Flash Point below 32 degree C), Bulk Drug Manufacturing - Ahmedabad (Ourshare 5%) (Premium Rs.11.59 L)',
        'JAYANT AGRO ORGANICS LTD -Chemical Manufacturing(others), Pharmaceuticals, Toiletry products - AHMEDABAD (Ourshare 20%)(Premium Rs.5.67L)',
        'JAY JAGDAMBA LTD - Engineering Workshop- Pipe Extruding - Solar Power stations - Mumbai (Ourshare 20%)(Premium Rs.6.29)',
        'PRISM JOHNSON BUILDING SOLUTIONS LIMITED - Tiles manufacturing - Mumbai (Ourshare 100%) (Premium Rs.20 L)',
        'Pokarna Engineered Stone Limited- Tile & Pottery works - Hyderabad (Ourshare 20%) (Premium Rs.17.70 L)'
      ],
      liability: [],
      sme: [
        'Shivam Auto Tech Ltd - Engineering Workshop- Pipe Extruding - Delhi - 7.94L - (Ourshare 30%)',
        'Suzann Biotech - Chemical Manufacturing(others), Pharmaceuticals, Toiletry products - Delhi - 8.55L - (Ourshare 100%)',
        'KMV Projects Ltd - Construction of (10+2) court building complexes - Hyderabad - 70.51L - (Ourshare 100%)',
        'KMV PROJECTS LTD - Building In course of construction - Hyderabad - 16.60L - (Ourshare 100%)',
        'KMV PROJECTS LTD - Building In course of construction - Hyderabad - 16.06L - (Ourshare 100%)',
        'SLN Coffee - Coffee Curing/ Grinding - Bangalore - 5.95L - (Ourshare 35%)',
        'Max Granito PVT LTD. - Ceramic Factories - Bangalore - 6.87L - (Ourshare 100%)'
      ]
    },
    'YTD June 2025': {
      commercial: [
        'R R KABEL LTD - Cable Manufacturing -Mumbai (Ourshare 10%) (Premium Rs.22.56 L)',
        'SAHAJANAND COTSPIN PRIVATE LIMITED - Textile Mills - Spinning mills -AHMEDABAD (Ourshare 100%) (Premium Rs.5.79 L)',
        'LCC PROJECTS LIMITED - Storage of Non-hazardous goods - AHMEDABAD (Ourshare 49%) (Premium Rs.67.50 L)',
        'HALEWOOD LABORATORIES PRIVATE LIMITED -Chemical Manufacturing(others) - Ahmedabad (Ourshare 100%) (Premium Rs.21 L)',
        'CONCORD BIOTECH LIMITED -Chemical Manufacturing(Using materials with Flash Point below 32 degree C) - AHMEDABAD (Ourshare 10%)(Premium Rs.11.42L)',
        'VINAYAK TMT BARS PRIVATE LIMITED - Electric Generation Stations - Solar Power stations - AHMEDABAD (Ourshare 100%)(Premium Rs.5.7L)',
        'JAYANT AGRO ORGANICS LTD - Chemical Manufacturing(others), Pharmaceuticals, Toiletry products - AHMEDABAD (Ourshare 20%) (Premium Rs.5.85 L)',
        'SRIKUNU WEAVING PRIVATE LIMITED - Weaving Mills - AHMEDABAD (Ourshare 100%) (Premium Rs.11.13 L)',
        'GETANJALI UNIVERSITY - Electric Generation Stations - Solar Power stations - JAIPUR (Ourshare 100%) (Premium Rs.9.32 L)',
        'LTK Industries Pvt Ltd - Hosiery, lace, Embroidery/Thread factories - Kolkata (Ourshare 10%) (Premium Rs.10.60 L)',
        'Kalinga Institute of Industrial Technology - School/College - Kolkata (Ourshare 100%) (Premium Rs.6.58 L)',
        'Maa Mahamaya Industries Ltd - Garment Makers - Engineering Workshop -- Steel Plant - Kolkata(Ourshare 30%) (Premium Rs.36.44 L)',
        'FINCAR PHARMACEUTICALS PRIVATE LIMITED - Chemical Manufacturing(others), Pharmaceuticals, Toiletry products - Mumbai (Ourshare 70%) (Premium Rs.7.69 L)'
      ],
      liability: [
        'MS TOYOTSU RARE EARTHS INDIA PRIVATE LTD - Karnataka (OurShare 100%)(Premium 25L)',
        'DAIKIN AIRCONDITIONING INDIA PRIVATE LTD - Delhi (OurShare 100%)(Premium 6.31L)',
        'DAIKIN AIRCONDITIONING INDIA PRIVATE LTD - Delhi (OurShare 100%)(Premium 22.35L)',
        'YAMAHA MUSIC INDIA PRIVATE LTD - TN1 (OurShare 100%)(Premium 11.33L)',
        'MITSUI AND CO INDIA PRIVATE LIMITED - Delhi (OurShare 100%)(Premium 6.77L)',
        'PAYSWIFT TECHNOLOGIES PRIVATE LIMITED - TN1 (OurShare 100%)(Premium 17.5L)',
        'JUST UDO AVIATION PRIVATE LIMITED - TN1 (OurShare 100%)(Premium 8.95L)'
      ],
      sme: [
        'SHIVKRUPA COTSPIN PRIVATE LIMITED - Spinning mills - Madhya Pradesh - 16.00L - (Ourshare 100%)',
        'ENICAR PHARMACEUTICALS PRIVATE LIMITED - Chemical Manufacturing(others), Pharmaceuticals, Toiletry products - Mumbai - 5.38L - (Ourshare 100%)',
        'AKG INDIA PVT LTD - ENGINEER WORKSHOP SHEET METAL FABRICATION - ROTN - 14.95L - (Ourshare 100%)',
        'Rolta Indal Limited - Silent Risk - Kolkata - 9.16L - (Ourshare 100%)',
        'S N DAMANI INFRA PRIVATE LIMITED - Storage In Godowns And Silos of Category I hazardous Goods - TN1 - 7.61L - (Ourshare 25%)'
      ]
    },
    'YTD May 2025': {
      commercial: [
        'CHANDRESH CABLES LTD - Cable Manufacturing -AHMEDABAD (Ourshare 49%) (Premium Rs.9.55 L)',
        'TERRATECH CHEMICALS INDIA PRIVATE LIMITED - Chemical Manufacturing(others), Pharmaceuticals, Toiletry products -AHMEDABAD (Ourshare 100%) (Premium Rs.9.71 L)',
        'ARVIND ENVIOSIL LIMITED - Engineering Workshop (Others) - AHMEDABAD (Ourshare 100%) (Premium Rs.6.37 L)',
        'HAMI RAYCOT PRIVATE LIMITED -Weaving Mills - Surat (Ourshare 100%) (Premium Rs.11.29 L)',
        'SKY TEXTILES INDIA PRIVATE LIMITED -Cloth Processing units situated outside the compound of Textile mills - AHMEDABAD (Ourshare 51%)(Premium Rs.46.09L)',
        'CASA CANS PRIVATE LIMITED - Engineering Workshop - Structural Steel fabricators, Sheet Metal fabricators - AHMEDABAD (Ourshare 100%)(Premium Rs.21.81L)',
        'MS MADHAV PHOOL SAGAR NIWAS SHAHUPURA CONTD HIGHWAY PVT LTD - Road - Bhopal  Ourshare 100%) (Premium Rs.6.95 L)',
        'M/S. ANUGRAHA FASHION MILLS PRIVATE LIMITED - Garment Makers - Coimbatore (Ourshare 60%) (Premium Rs.5.17 L)',
        'ROSS PROCESS EQUIPMENT PRIVATE LIMITED - Engineering Workshop -- Structural Steel fabricators, Sheet Metal fabricators, -  Pune (Ourshare 100%) (Premium Rs.6.01 L)',
        'HILTON GARDEN INN MUMBAI INTERNATIONAL AIRPORT C/O FAIRYHS HOTELS PRIVATE LIMITED - Hotel - Pune (Ourshare 100%) (Premium Rs.9.32 L)'
      ],
      liability: [
        'MS TOYOTSU RARE EARTHS INDIA PRIVATE LTD - Karnataka (OurShare 100%)(Premium 25L)',
        'DAIKIN AIRCONDITIONING INDIA PRIVATE LTD - Delhi (OurShare 100%)(Premium 6.31L)',
        'DAIKIN AIRCONDITIONING INDIA PRIVATE LTD - Delhi (OurShare 100%)(Premium 22.35L)',
        'YAMAHA MUSIC INDIA PRIVATE LTD - TN1 (OurShare 100%)(Premium 11.33L)',
        'MITSUI AND CO INDIA PRIVATE LIMITED - Delhi (OurShare 100%)(Premium 6.77L)',
        'PAYSWIFT TECHNOLOGIES PRIVATE LIMITED - TN1 (OurShare 100%)(Premium 17.5L)',
        'JUST UDO AVIATION PRIVATE LIMITED - TN1 (OurShare 100%)(Premium 8.95L)'
      ],
      sme: [
        'GRP Ltd - Rubber Goods Manufacturing without Spreading - Mumbai - 9.99L - (Ourshare 10%)',
        'Radhalaxmi Ipl - Textile Mills – Spinning mills - Ahmedabad - 10.40L - (Ourshare 49%)',
        'SUNRISE GLASS INDUSTRIES PRIVATE LIMITED - Glass Manufacturing/ Automobile glass mfg. - Ahmedabad - 18.10L - (Ourshare 100%)',
        'VINOD TEXSPIN LLP - Textile Mills - Spinning mills - Ahmedabad - 8.20L - (Ourshare 100%)',
        'Indospun Yarn Pvt Ltd - Textile Mills - Spinning mills - Surat - 11.95L - (Ourshare 100%)',
        'M/S. MUTHUR MURUGAN MILLS PVT LTD - TEXTILE MILLS - SPINNING MILLS - Coimbatore - 5.89L - (Ourshare 100%)',
        'KMV Space LLP - Certificate of Estimation for Development of 89 Villas consisting of G+2 of the Project KMV Vivaan Villas Phase - III - Hyderabad - 5.16L - (Ourshare 100%)',
        'SLMG Beverages Private Limited - Storage of Cat 1 goods - Lucknow - 16.5L - (Ourshare 100%)',
        'SLMG Beverages Private Limited -Aerated Water Factories without pet bottles - Lucknow - 14.94L - (Ourshare 100%)',
        'NICVIN INDIA HEALTH CARE LTD -Chemical Manufacturing(others), Pharmaceuticals, Toiletry products- Chandigarh - 6.8L - (Ourshare 100%)',
        'THE HI-TECH GEARS LIMITED -ENGG WORKSHOP (MBD)- Delhi - 8.7L - (Ourshare 15%)',
        'THE HI-TECH GEARS LIMITED -ENGG WORKSHOP (MBD) - Delhi - 6.4L - (Ourshare 20%)',
        'THE HI-TECH GEARS LIMITED -ENGG WORKSHOP (MBD) - Delhi - 11.17L - (Ourshare 20%)'
      ]
    }
  };

  const newInitiativesDataMap = {
    'YTD July 2025': '',
    'YTD June 2025': '',
    'YTD May 2025': '1. Provided Griha Raksha and BSUS Rates for IndoStar Finance.<br />2. Provided CGR Rates for India Shelter.'
  };

  const largeRiskDataMap = {
    'YTD July 2025': 'Commercial: 1. Adhunik Power & Natural Resources Ltd - SI = 3888 Crores, Our share 10% , Premium - Rs.39.16 Lakhs.',
    'YTD June 2025': 'Nil',
    'YTD May 2025': 'Nil'
  };

  // Additional state variables for matrix data and loading states
  const [segmentLobMatrix, setSegmentLobMatrix] = useState(segmentMatrixDataMap[ // Segment vs LOB matrix data array
    selectedDate?.month === 'July' ? 'YTD July 2025' : 
    selectedDate?.month === 'June' ? 'YTD June 2025' : 'YTD May 2025'
  ]);
  const [loading, setLoading] = useState(false); // General loading state for component
  const [segmentLobLoading, setSegmentLobLoading] = useState(false); // Specific loading state for segment matrix
  const [error, setError] = useState(null); // Error state for handling API failures

  const popupDataMap = {
    "Apr'24 - Mar'25": [
      { segment: 'J&K', fire_nop: 507, fire_gwp: 1238, fire_gicgep: '-59%', engg_nop: 333, engg_gwp: 74, engg_gicgep: '-3%', misc_nop: 295, misc_gwp: 5, misc_gicgep: '46%', marine_nop: 366, marine_gwp: 955, marine_gicgep: '44%', liability_nop: 426, liability_gwp: 70, liability_gicgep: '-29%', overall_nop: 1927, overall_gwp: 2342, overall_gicgep: '-11%' },
      { segment: 'Banca PSU', fire_nop: 965182, fire_gwp: 2843, fire_gicgep: '37%', engg_nop: 713, engg_gwp: 18, engg_gicgep: '35%', misc_nop: 448988, misc_gwp: 500, misc_gicgep: '9%', marine_nop: 66, marine_gwp: 3, marine_gicgep: '3%', liability_nop: 87, liability_gwp: 24, liability_gicgep: '7%', overall_nop: 1415036, overall_gwp: 3388, overall_gicgep: '31%' },
      { segment: 'Partner Others', fire_nop: 421703, fire_gwp: 1426, fire_gicgep: '18%', engg_nop: 4825, engg_gwp: 44, engg_gicgep: '66%', misc_nop: 2933, misc_gwp: 59, misc_gicgep: '19%', marine_nop: 1814, marine_gwp: 9, marine_gicgep: '0%', liability_nop: 75, liability_gwp: 4, liability_gicgep: '3%', overall_nop: 431350, overall_gwp: 1542, overall_gicgep: '21%' },
      { segment: 'Commercial', fire_nop: 7180, fire_gwp: 1789, fire_gicgep: '91%', engg_nop: 961, engg_gwp: 221, engg_gicgep: '70%', misc_nop: 2407, misc_gwp: 44, misc_gicgep: '46%', marine_nop: 1546, marine_gwp: 320, marine_gicgep: '91%', liability_nop: 1327, liability_gwp: 55, liability_gicgep: '7%', overall_nop: 13421, overall_gwp: 2429, overall_gicgep: '87%' },
      { segment: 'SME', fire_nop: 12139, fire_gwp: 580, fire_gicgep: '-15%', engg_nop: 957, engg_gwp: 109, engg_gicgep: '55%', misc_nop: 2952, misc_gwp: 13, misc_gicgep: '24%', marine_nop: 6526, marine_gwp: 158, marine_gicgep: '53%', liability_nop: 5615, liability_gwp: 74, liability_gicgep: '7%', overall_nop: 28189, overall_gwp: 933, overall_gicgep: '8%' },
      { segment: 'Others', fire_nop: 3413, fire_gwp: 49, fire_gicgep: '4%', engg_nop: 140, engg_gwp: 18, engg_gicgep: '88%', misc_nop: 216, misc_gwp: 1, misc_gicgep: '0%', marine_nop: 1806, marine_gwp: 11, marine_gicgep: '49%', liability_nop: 861, liability_gwp: 31, liability_gicgep: '-3%', overall_nop: 6436, overall_gwp: 109, overall_gicgep: '7%' },
      { segment: 'TOTAL', fire_nop: 1410124, fire_gwp: 7924, fire_gicgep: '29%', engg_nop: 7929, engg_gwp: 484, engg_gicgep: '53%', misc_nop: 457791, misc_gwp: 621, misc_gicgep: '13%', marine_nop: 12144, marine_gwp: 1457, marine_gicgep: '55%', liability_nop: 8391, liability_gwp: 258, liability_gicgep: '-1%', overall_nop: 1896359, overall_gwp: 10744, overall_gicgep: '32%' }
    ],
    "Apr'23 - Mar'24": [
      { segment: 'J&K', fire_nop: 541, fire_gwp: 1084, fire_gicgep: '375%', engg_nop: 332, engg_gwp: 76, engg_gicgep: '101%', misc_nop: 322, misc_gwp: 9, misc_gicgep: '79%', marine_nop: 427, marine_gwp: 827, marine_gicgep: '51%', liability_nop: 443, liability_gwp: 48, liability_gicgep: '101%', overall_nop: 2065, overall_gwp: 2043, overall_gicgep: '227%' },
      { segment: 'Banca PSU', fire_nop: 1012499, fire_gwp: 2662, fire_gicgep: '44%', engg_nop: 587, engg_gwp: 14, engg_gicgep: '26%', misc_nop: 611340, misc_gwp: 633, misc_gicgep: '4%', marine_nop: 88, marine_gwp: 3, marine_gicgep: '14%', liability_nop: 88, liability_gwp: 23, liability_gicgep: '0%', overall_nop: 1624602, overall_gwp: 3336, overall_gicgep: '35%' },
      { segment: 'Partner Others', fire_nop: 394500, fire_gwp: 1070, fire_gicgep: '6%', engg_nop: 3187, engg_gwp: 36, engg_gicgep: '55%', misc_nop: 2630, misc_gwp: 102, misc_gicgep: '0%', marine_nop: 1301, marine_gwp: 8, marine_gicgep: '13%', liability_nop: 124, liability_gwp: 10, liability_gicgep: '16%', overall_nop: 401742, overall_gwp: 1227, overall_gicgep: '8%' },
      { segment: 'Commercial', fire_nop: 7050, fire_gwp: 1936, fire_gicgep: '86%', engg_nop: 976, engg_gwp: 137, engg_gicgep: '74%', misc_nop: 2359, misc_gwp: 30, misc_gicgep: '29%', marine_nop: 1838, marine_gwp: 304, marine_gicgep: '97%', liability_nop: 1266, liability_gwp: 51, liability_gicgep: '37%', overall_nop: 13489, overall_gwp: 2458, overall_gicgep: '97%' },
      { segment: 'SME', fire_nop: 11748, fire_gwp: 578, fire_gicgep: '158%', engg_nop: 1096, engg_gwp: 120, engg_gicgep: '42%', misc_nop: 2831, misc_gwp: 12, misc_gicgep: '30%', marine_nop: 7660, marine_gwp: 166, marine_gicgep: '64%', liability_nop: 5090, liability_gwp: 72, liability_gicgep: '29%', overall_nop: 28425, overall_gwp: 947, overall_gicgep: '119%' },
      { segment: 'Others', fire_nop: 38237, fire_gwp: 128, fire_gicgep: '2%', engg_nop: 200, engg_gwp: 2, engg_gicgep: '63%', misc_nop: 8, misc_gwp: 0, misc_gicgep: '-121%', marine_nop: 172, marine_gwp: 1, marine_gicgep: '25%', liability_nop: 564, liability_gwp: 3, liability_gicgep: '95%', overall_nop: 39181, overall_gwp: 135, overall_gicgep: '6%' },
      { segment: 'TOTAL', fire_nop: 1464575, fire_gwp: 7458, fire_gicgep: '122%', engg_nop: 6378, engg_gwp: 384, engg_gicgep: '64%', misc_nop: 619490, misc_gwp: 787, misc_gicgep: '12%', marine_nop: 11486, marine_gwp: 1311, marine_gicgep: '63%', liability_nop: 7575, liability_gwp: 207, liability_gicgep: '47%', overall_nop: 2109504, overall_gwp: 10147, overall_gicgep: '101%' }
    ],
    "Apr'22 - Mar'23": [
      { segment: 'J&K', fire_nop: 588, fire_gwp: 1035, fire_gicgep: '-25%', engg_nop: 339, engg_gwp: 34, engg_gicgep: '-83%', misc_nop: 400, misc_gwp: 11, misc_gicgep: '73%', marine_nop: 454, marine_gwp: 711, marine_gicgep: '50%', liability_nop: 426, liability_gwp: 42, liability_gicgep: '0%', overall_nop: 2207, overall_gwp: 1834, overall_gicgep: '3%' },
      { segment: 'Banca PSU', fire_nop: 937032, fire_gwp: 2551, fire_gicgep: '28%', engg_nop: 581, engg_gwp: 16, engg_gicgep: '-1%', misc_nop: 552817, misc_gwp: 562, misc_gicgep: '2%', marine_nop: 109, marine_gwp: 4, marine_gicgep: '40%', liability_nop: 108, liability_gwp: 38, liability_gicgep: '0%', overall_nop: 1490647, overall_gwp: 3171, overall_gicgep: '22%' },
      { segment: 'Partner Others', fire_nop: 185450, fire_gwp: 771, fire_gicgep: '3%', engg_nop: 2570, engg_gwp: 45, engg_gicgep: '57%', misc_nop: 1550, misc_gwp: 76, misc_gicgep: '7%', marine_nop: 1298, marine_gwp: 12, marine_gicgep: '8%', liability_nop: 133, liability_gwp: 5, liability_gicgep: '7%', overall_nop: 191001, overall_gwp: 909, overall_gicgep: '9%' },
      { segment: 'Commercial', fire_nop: 5607, fire_gwp: 1541, fire_gicgep: '33%', engg_nop: 845, engg_gwp: 121, engg_gicgep: '22%', misc_nop: 1713, misc_gwp: 19, misc_gicgep: '68%', marine_nop: 1489, marine_gwp: 332, marine_gicgep: '69%', liability_nop: 1007, liability_gwp: 71, liability_gicgep: '5%', overall_nop: 10661, overall_gwp: 2084, overall_gicgep: '47%' },
      { segment: 'SME', fire_nop: 11621, fire_gwp: 587, fire_gicgep: '100%', engg_nop: 894, engg_gwp: 86, engg_gicgep: '21%', misc_nop: 1834, misc_gwp: 9, misc_gicgep: '3%', marine_nop: 7796, marine_gwp: 155, marine_gicgep: '61%', liability_nop: 3741, liability_gwp: 65, liability_gicgep: '22%', overall_nop: 25886, overall_gwp: 902, overall_gicgep: '78%' },
      { segment: 'Others', fire_nop: 60364, fire_gwp: 116, fire_gicgep: '3%', engg_nop: 728, engg_gwp: 5, engg_gicgep: '19%', misc_nop: 11717, misc_gwp: 7, misc_gicgep: '41%', marine_nop: 604, marine_gwp: 15, marine_gicgep: '87%', liability_nop: 997, liability_gwp: 7, liability_gicgep: '15%', overall_nop: 74410, overall_gwp: 150, overall_gicgep: '24%' },
      { segment: 'TOTAL', fire_nop: 1200662, fire_gwp: 6701, fire_gicgep: '23%', engg_nop: 5957, engg_gwp: 307, engg_gicgep: '12%', misc_nop: 570031, misc_gwp: 684, misc_gicgep: '6%', marine_nop: 11750, marine_gwp: 1230, marine_gicgep: '56%', liability_nop: 6412, liability_gwp: 227, liability_gicgep: '7%', overall_nop: 1794812, overall_gwp: 9150, overall_gicgep: '26%' }
    ],
    "Apr'21 - Mar'22": [
      { segment: 'J&K', fire_nop: 581, fire_gwp: 886, fire_gicgep: '72%', engg_nop: 439, engg_gwp: 44, engg_gicgep: '-52%', misc_nop: 525, misc_gwp: 9, misc_gicgep: '41%', marine_nop: 476, marine_gwp: 517, marine_gicgep: '88%', liability_nop: 445, liability_gwp: 38, liability_gicgep: '0%', overall_nop: 2466, overall_gwp: 1494, overall_gicgep: '72%' },
      { segment: 'Banca PSU', fire_nop: 738011, fire_gwp: 2092, fire_gicgep: '31%', engg_nop: 421, engg_gwp: 14, engg_gicgep: '44%', misc_nop: 443184, misc_gwp: 449, misc_gicgep: '8%', marine_nop: 82, marine_gwp: 2, marine_gicgep: '7%', liability_nop: 95, liability_gwp: 38, liability_gicgep: '6%', overall_nop: 1181793, overall_gwp: 2596, overall_gicgep: '28%' },
      { segment: 'Partner Others', fire_nop: 98384, fire_gwp: 378, fire_gicgep: '13%', engg_nop: 3398, engg_gwp: 59, engg_gicgep: '53%', misc_nop: 575, misc_gwp: 13, misc_gicgep: '13%', marine_nop: 1954, marine_gwp: 19, marine_gicgep: '0%', liability_nop: 73, liability_gwp: 3, liability_gicgep: '46%', overall_nop: 104384, overall_gwp: 472, overall_gicgep: '18%' },
      { segment: 'Commercial', fire_nop: 3851, fire_gwp: 1163, fire_gicgep: '24%', engg_nop: 671, engg_gwp: 112, engg_gicgep: '58%', misc_nop: 1337, misc_gwp: 5, misc_gicgep: '24%', marine_nop: 1601, marine_gwp: 267, marine_gicgep: '62%', liability_nop: 884, liability_gwp: 61, liability_gicgep: '13%', overall_nop: 8344, overall_gwp: 1611, overall_gicgep: '42%' },
      { segment: 'SME', fire_nop: 10677, fire_gwp: 383, fire_gicgep: '113%', engg_nop: 785, engg_gwp: 74, engg_gicgep: '23%', misc_nop: 12968, misc_gwp: 12, misc_gicgep: '40%', marine_nop: 5943, marine_gwp: 96, marine_gicgep: '79%', liability_nop: 3100, liability_gwp: 58, liability_gicgep: '45%', overall_nop: 33473, overall_gwp: 622, overall_gicgep: '88%' },
      { segment: 'Others', fire_nop: 76886, fire_gwp: 97, fire_gicgep: '13%', engg_nop: 435, engg_gwp: 9, engg_gicgep: '82%', misc_nop: 20935, misc_gwp: 16, misc_gicgep: '111%', marine_nop: 1617, marine_gwp: 44, marine_gicgep: '92%', liability_nop: 372, liability_gwp: 10, liability_gicgep: '47%', overall_nop: 100845, overall_gwp: 177, overall_gicgep: '52%' },
      { segment: 'TOTAL', fire_nop: 928390, fire_gwp: 4999, fire_gicgep: '41%', engg_nop: 6149, engg_gwp: 312, engg_gicgep: '32%', misc_nop: 479524, misc_gwp: 508, misc_gicgep: '29%', marine_nop: 11673, marine_gwp: 945, marine_gicgep: '78%', liability_nop: 5569, liability_gwp: 207, liability_gicgep: '22%', overall_nop: 1431305, overall_gwp: 6972, overall_gicgep: '45%' }
    ]
  };

  const staticGrowthDataMap = {
    'YTD July 2025': [
      { segment: 'J&K', fire_nop: 219, fire_gwp: 672, fire_gicgep: '27%', engg_nop: 122, engg_gwp: 22, engg_gicgep: '-3%', misc_nop: 130, misc_gwp: 2, misc_gicgep: '3%', marine_nop: 158, marine_gwp: 413, marine_gicgep: '32%', liability_nop: 163, liability_gwp: 46, liability_gicgep: '63%', overall_nop: 792, overall_gwp: 1154, overall_gicgep: '29%' },
      { segment: 'Banca PSU', fire_nop: 320001, fire_gwp: 977, fire_gicgep: '63%', engg_nop: 244, engg_gwp: 5, engg_gicgep: '-8%', misc_nop: 85342, misc_gwp: 106, misc_gicgep: '-1%', marine_nop: 36, marine_gwp: 1, marine_gicgep: '28%', liability_nop: 46, liability_gwp: 4, liability_gicgep: '17%', overall_nop: 405669, overall_gwp: 1094, overall_gicgep: '54%' },
      { segment: 'Partners Others', fire_nop: 87985, fire_gwp: 453, fire_gicgep: '17%', engg_nop: 1493, engg_gwp: 14, engg_gicgep: '49%', misc_nop: 846, misc_gwp: 6, misc_gicgep: '14%', marine_nop: 584, marine_gwp: 3, marine_gicgep: '20%', liability_nop: 42, liability_gwp: 7, liability_gicgep: '42%', overall_nop: 90950, overall_gwp: 482, overall_gicgep: '18%' },
      { segment: 'Commercial', fire_nop: 2774, fire_gwp: 1015, fire_gicgep: '116%', engg_nop: 315, engg_gwp: 79, engg_gicgep: '259%', misc_nop: 786, misc_gwp: 19, misc_gicgep: '22%', marine_nop: 560, marine_gwp: 126, marine_gicgep: '129%', liability_nop: 478, liability_gwp: 35, liability_gicgep: '59%', overall_nop: 4913, overall_gwp: 1273, overall_gicgep: '130%' },
      { segment: 'SME', fire_nop: 4754, fire_gwp: 305, fire_gicgep: '76%', engg_nop: 436, engg_gwp: 50, engg_gicgep: '104%', misc_nop: 1011, misc_gwp: 4, misc_gicgep: '-120%', marine_nop: 2556, marine_gwp: 106, marine_gicgep: '79%', liability_nop: 2009, liability_gwp: 25, liability_gicgep: '72%', overall_nop: 10766, overall_gwp: 491, overall_gicgep: '80%' },
      { segment: 'Others', fire_nop: 2017, fire_gwp: 25, fire_gicgep: '43%', engg_nop: 38, engg_gwp: 3, engg_gicgep: '-75%', misc_nop: 50, misc_gwp: 0, misc_gicgep: '-153%', marine_nop: 824, marine_gwp: 4, marine_gicgep: '556%', liability_nop: 262, liability_gwp: 6, liability_gicgep: '66%', overall_nop: 3191, overall_gwp: 38, overall_gicgep: '101%' },
      { segment: 'TOTAL', fire_nop: 417750, fire_gwp: 3447, fire_gicgep: '66%', engg_nop: 2648, engg_gwp: 172, engg_gicgep: '158%', misc_nop: 88165, misc_gwp: 137, misc_gicgep: '5%', marine_nop: 4718, marine_gwp: 653, marine_gicgep: '60%', liability_nop: 3000, liability_gwp: 124, liability_gicgep: '64%', overall_nop: 516281, overall_gwp: 4532, overall_gicgep: '66%' }
    ],
    'YTD June 2025': [
      { segment: 'J&K', fire_nop: 180, fire_gwp: 562, fire_gicgep: '5%', engg_nop: 86, engg_gwp: 17, engg_gicgep: '21%', misc_nop: 111, misc_gwp: 1, misc_gicgep: '4%', marine_nop: 118, marine_gwp: 292, marine_gicgep: '36%', liability_nop: 123, liability_gwp: 40, liability_gicgep: '80%', overall_nop: 618, overall_gwp: 912, overall_gicgep: '20%' },
      { segment: 'Banca PSU', fire_nop: 230128, fire_gwp: 706, fire_gicgep: '70%', engg_nop: 197, engg_gwp: 4, engg_gicgep: '-11%', misc_nop: 61115, misc_gwp: 77, misc_gicgep: '-3%', marine_nop: 31, marine_gwp: 1, marine_gicgep: '0%', liability_nop: 24, liability_gwp: 1, liability_gicgep: '28%', overall_nop: 291495, overall_gwp: 787, overall_gicgep: '59%' },
      { segment: 'Partner Others', fire_nop: 63704, fire_gwp: 327, fire_gicgep: '18%', engg_nop: 1102, engg_gwp: 9, engg_gicgep: '57%', misc_nop: 635, misc_gwp: 5, misc_gicgep: '11%', marine_nop: 474, marine_gwp: 2, marine_gicgep: '34%', liability_nop: 22, liability_gwp: 2, liability_gicgep: '189%', overall_nop: 65937, overall_gwp: 345, overall_gicgep: '20%' },
      { segment: 'Commercial', fire_nop: 2222, fire_gwp: 897, fire_gicgep: '89%', engg_nop: 255, engg_gwp: 58, engg_gicgep: '288%', misc_nop: 657, misc_gwp: 18, misc_gicgep: '78%', marine_nop: 437, marine_gwp: 103, marine_gicgep: '126%', liability_nop: 376, liability_gwp: 29, liability_gicgep: '81%', overall_nop: 3947, overall_gwp: 1105, overall_gicgep: '114%' },
      { segment: 'SME', fire_nop: 3641, fire_gwp: 234, fire_gicgep: '90%', engg_nop: 334, engg_gwp: 36, engg_gicgep: '101%', misc_nop: 794, misc_gwp: 3, misc_gicgep: '176%', marine_nop: 1873, marine_gwp: 62, marine_gicgep: '79%', liability_nop: 1505, liability_gwp: 20, liability_gicgep: '89%', overall_nop: 8147, overall_gwp: 355, overall_gicgep: '91%' },
      { segment: 'Others', fire_nop: 1405, fire_gwp: 22, fire_gicgep: '14%', engg_nop: 30, engg_gwp: 2, engg_gicgep: '-97%', misc_nop: 43, misc_gwp: 0, misc_gicgep: '181%', marine_nop: 620, marine_gwp: 2, marine_gicgep: '1143%', liability_nop: 211, liability_gwp: 2, liability_gicgep: '92%', overall_nop: 2309, overall_gwp: 28, overall_gicgep: '114%' },
      { segment: 'TOTAL', fire_nop: 301280, fire_gwp: 2748, fire_gicgep: '59%', engg_nop: 2004, engg_gwp: 125, engg_gicgep: '175%', misc_nop: 63355, misc_gwp: 104, misc_gicgep: '8%', marine_nop: 3553, marine_gwp: 462, marine_gicgep: '66%', liability_nop: 2261, liability_gwp: 93, liability_gicgep: '84%', overall_nop: 372453, overall_gwp: 3532, overall_gicgep: '64%' }
    ],
    'YTD May 2025': [
      { segment: 'J&K', fire_nop: 137, fire_gwp: 434, fire_gicgep: '3%', engg_nop: 64, engg_gwp: 12, engg_gicgep: '25%', misc_nop: 95, misc_gwp: 1, misc_gicgep: '7%', marine_nop: 83, marine_gwp: 235, marine_gicgep: '20%', liability_nop: 92, liability_gwp: 28, liability_gicgep: '0%', overall_nop: 471, overall_gwp: 709, overall_gicgep: '10%' },
      { segment: 'Banca PSU', fire_nop: 150118, fire_gwp: 461, fire_gicgep: '69%', engg_nop: 152, engg_gwp: 2, engg_gicgep: '-19%', misc_nop: 37813, misc_gwp: 48, misc_gicgep: '4%', marine_nop: 16, marine_gwp: 1, marine_gicgep: '0%', liability_nop: 16, liability_gwp: 0, liability_gicgep: '21%', overall_nop: 188115, overall_gwp: 514, overall_gicgep: '59%' },
      { segment: 'Partner Others', fire_nop: 40393, fire_gwp: 211, fire_gicgep: '12%', engg_nop: 733, engg_gwp: 6, engg_gicgep: '57%', misc_nop: 385, misc_gwp: 4, misc_gicgep: '3%', marine_nop: 366, marine_gwp: 1, marine_gicgep: '50%', liability_nop: 14, liability_gwp: 2, liability_gicgep: '282%', overall_nop: 41891, overall_gwp: 224, overall_gicgep: '14%' },
      { segment: 'Commercial', fire_nop: 1632, fire_gwp: 698, fire_gicgep: '90%', engg_nop: 169, engg_gwp: 28, engg_gicgep: '56%', misc_nop: 525, misc_gwp: 18, misc_gicgep: '107%', marine_nop: 323, marine_gwp: 76, marine_gicgep: '83%', liability_nop: 286, liability_gwp: 9, liability_gicgep: '68%', overall_nop: 2935, overall_gwp: 829, overall_gicgep: '86%' },
      { segment: 'SME', fire_nop: 2709, fire_gwp: 180, fire_gicgep: '77%', engg_nop: 226, engg_gwp: 28, engg_gicgep: '135%', misc_nop: 556, misc_gwp: 2, misc_gicgep: '45%', marine_nop: 1313, marine_gwp: 48, marine_gicgep: '36%', liability_nop: 1074, liability_gwp: 13, liability_gicgep: '109%', overall_nop: 5878, overall_gwp: 270, overall_gicgep: '80%' },
      { segment: 'Others', fire_nop: 802, fire_gwp: 12, fire_gicgep: '33%', engg_nop: 25, engg_gwp: 1, engg_gicgep: '-1%', misc_nop: 24, misc_gwp: 0, misc_gicgep: '304%', marine_nop: 436, marine_gwp: 3, marine_gicgep: '911%', liability_nop: 148, liability_gwp: 1, liability_gicgep: '161%', overall_nop: 1435, overall_gwp: 17, overall_gicgep: '186%' },
      { segment: 'TOTAL', fire_nop: 195791, fire_gwp: 1996, fire_gicgep: '58%', engg_nop: 1369, engg_gwp: 77, engg_gicgep: '67%', misc_nop: 39398, misc_gwp: 73, misc_gicgep: '12%', marine_nop: 2537, marine_gwp: 364, marine_gicgep: '43%', liability_nop: 1630, liability_gwp: 53, liability_gicgep: '63%', overall_nop: 240725, overall_gwp: 2562, overall_gicgep: '53%' }
    ]
  };
  
  const staticGrowthData = staticGrowthDataMap[
    selectedDate?.month === 'July' ? 'YTD July 2025' : 
    selectedDate?.month === 'June' ? 'YTD June 2025' : 'YTD May 2025'
  ];

  const lobGrowthDataMap = {
    'YTD July 2025': [
      {
        key: 'FIRE',
        label: 'FIRE',
        fy25: 3447,
        fy24: 3187,
        growth: 8,
        colors: ['#ff9800', '#ffe0b2'],
      },
      {
        key: 'ENGINEERING',
        label: 'ENGINEERING',
        fy25: 172,
        fy24: 159,
        growth: 8,
        colors: ['#43ea00', '#d7ffb2'],
      },
      {
        key: 'MISCELLANEOUS',
        label: 'MISCELLANEOUS',
        fy25: 137,
        fy24: 235,
        growth: -42,
        colors: ['#ffe600', '#fff9b2'],
      },
      {
        key: 'MARINE',
        label: 'MARINE',
        fy25: 653,
        fy24: 600,
        growth: 9,
        colors: ['#1b63c7', '#90caf9'],
      },
      {
        key: 'LIABILITY',
        label: 'LIABILITY',
        fy25: 124,
        fy24: 108,
        growth: 15,
        colors: ['#00e6e6', '#b2fff9'],
      },
      {
        key: 'OVERALL',
        label: 'OVERALL',
        fy25: 4532,
        fy24: 4289,
        growth: 6,
        colors: ['#ff3366', '#ffb2d7'],
      },
    ],
    'YTD June 2025': [
      {
        key: 'FIRE',
        label: 'FIRE',
        fy25: 2748,
        fy24: 2561,
        growth: 7,
        colors: ['#ff9800', '#ffe0b2'],
      },
      {
        key: 'ENGINEERING',
        label: 'ENGINEERING',
        fy25: 125,
        fy24: 123,
        growth: 2,
        colors: ['#43ea00', '#d7ffb2'],
      },
      {
        key: 'MISCELLANEOUS',
        label: 'MISCELLANEOUS',
        fy25: 104,
        fy24: 180,
        growth: -42,
        colors: ['#ffe600', '#fff9b2'],
      },
      {
        key: 'MARINE',
        label: 'MARINE',
        fy25: 462,
        fy24: 449,
        growth: 3,
        colors: ['#1b63c7', '#90caf9'],
      },
      {
        key: 'LIABILITY',
        label: 'LIABILITY',
        fy25: 93,
        fy24: 79,
        growth: 17,
        colors: ['#00e6e6', '#b2fff9'],
      },
      {
        key: 'OVERALL',
        label: 'OVERALL',
        fy25: 3532,
        fy24: 3392,
        growth: 4,
        colors: ['#ff3366', '#ffb2d7'],
      },
    ],
    'YTD May 2025': [
      {
        key: 'FIRE',
        label: 'FIRE',
        fy25: 2006,
        fy24: 1996,
        growth: -1,
        colors: ['#ff9800', '#ffe0b2'],
      },
      {
        key: 'ENGINEERING',
        label: 'ENGINEERING',
        fy25: 86,
        fy24: 77,
        growth: -10,
        colors: ['#43ea00', '#d7ffb2'],
      },
      {
        key: 'MISCELLANEOUS',
        label: 'MISCELLANEOUS',
        fy25: 116,
        fy24: 73,
        growth: -37,
        colors: ['#ffe600', '#fff9b2'],
      },
      {
        key: 'MARINE',
        label: 'MARINE',
        fy25: 349,
        fy24: 364,
        growth: 4,
        colors: ['#1b63c7', '#90caf9'],
      },
      {
        key: 'LIABILITY',
        label: 'LIABILITY',
        fy25: 47,
        fy24: 53,
        growth: 13,
        colors: ['#00e6e6', '#b2fff9'],
      },
      {
        key: 'OVERALL',
        label: 'OVERALL',
        fy25: 2604,
        fy24: 2562,
        growth: -2,
        colors: ['#ff3366', '#ffb2d7'],
      },
    ]
  };
  
  const lobGrowthData = lobGrowthDataMap[
    selectedDate?.month === 'July' ? 'YTD July 2025' : 
    selectedDate?.month === 'June' ? 'YTD June 2025' : 'YTD May 2025'
  ];



  if (loading) {
    return (
      <div className="or-loader-container">
        <div className="or-loader"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="or-error-container">
        <div className="or-error-icon">⚠️</div>
        <h3 className="or-error-title">Error Loading Data</h3>
        <p className="or-error-message">{error}</p>
      </div>
    );
  }

  // Data processing for segment matrix table display
  const segments = Array.from(new Set(segmentLobMatrix.map(row => row.uw_seg_map))); // Extract unique segment names
  const segMap = {}; // Object to organize matrix data by segment and LOB
  segmentLobMatrix.forEach(row => {
    if (!segMap[row.uw_seg_map]) segMap[row.uw_seg_map] = {}; // Initialize segment object if not exists
    segMap[row.uw_seg_map][row.lob] = row; // Map LOB data to segment
  });

  /**
   * Determines CSS styling for GIC:GEP ratio cells based on threshold values
   * @param {string} gicGep - GIC:GEP ratio as percentage string (e.g., '95%')
   * @returns {Object} CSS style object with color property for high ratios
   */
  const getGicGepStyle = (gicGep) => {
    const numericValue = parseInt(gicGep.replace('%', '')); // Extract numeric value from percentage
    return numericValue >= 90 ? { color: 'red' } : {}; // Return red color for ratios >= 90%
  };

  return (
    <div className="or-main">
      <div className="or-top-grid">
        <div className="or-chart-container">
          <div className="or-chart-header">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h1 className="or-chart-title">
                LOB wise NOP, GWP and GIC:GEP (GWP in Mn) - {selectedLobPeriod}
              </h1>
              <select 
                value={selectedLobPeriod} 
                onChange={(e) => {
                  setSelectedLobPeriod(e.target.value);
                  setLobData(lobDataMap[e.target.value]);
                  // Update broker data based on period
                  const isJulyPeriod = e.target.value.includes('July');
                  const isJunePeriod = e.target.value.includes('June');
                  const brokerPeriod = isJulyPeriod ? 'YTD July 2025' : isJunePeriod ? 'YTD June 2025' : 'YTD May 2025';
                  setBrokerData(brokerDataMap[brokerPeriod]);
                }}
                style={{ 
                  padding: '4px 8px', 
                  borderRadius: '4px', 
                  border: '1px solid #ccc',
                  fontSize: '14px',
                  marginRight: '10px',
                  color: '#000',
                  backgroundColor: '#fff'
                }}
              >
                {selectedDate?.month === 'July' ? (
                  <>
                    <option value="YTD July 2025">YTD July 2025</option>
                    <option value="YTD July 2024">YTD July 2024</option>
                    <option value="July 2025">July 2025</option>
                    <option value="July 2024">July 2024</option>
                  </>
                ) : selectedDate?.month === 'June' ? (
                  <>
                    <option value="YTD June 2025">YTD June 2025</option>
                    <option value="YTD June 2024">YTD June 2024</option>
                    <option value="June 2025">June 2025</option>
                    <option value="June 2024">June 2024</option>
                  </>
                ) : (
                  <>
                    <option value="YTD May 2025">YTD May 2025</option>
                    <option value="YTD May 2024">YTD May 2024</option>
                    <option value="May 2025">May 2025</option>
                    <option value="May 2024">May 2024</option>
                  </>
                )}
              </select>
            </div>
          </div>
          <div className="or-chart">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart
                data={lobData}
                margin={{
                  top: 15,
                  right: 25,
                  left: 15,
                  bottom: 60,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="lob" 
                  angle={-45}
                  textAnchor="end"
                  height={70}
                  fontSize={9}
                  interval={0}
                />
                <YAxis 
                  yAxisId="left" 
                  orientation="left"
                  scale="log"
                  domain={[1, 10000000]}
                  tickFormatter={(value) => {
                    if (value >= 1000000) return `${value / 1000000}M`;
                    if (value >= 1000) return `${value / 1000}K`;
                    return value.toString();
                  }}
                  fontSize={9}
                  ticks={[1, 10, 100, 1000, 10000, 100000, 1000000, 10000000]}
                />
                <YAxis 
                  yAxisId="right" 
                  orientation="right"
                  domain={[0, 100]}
                  tickFormatter={(value) => `${value}%`}
                  fontSize={9}
                  ticks={[0, 20, 40, 60, 80, 100, 150, 200, 400]}
                />
                <Tooltip 
                  formatter={(value, name) => {
                    if (name === 'GIC:GEP') return [`${value}%`, 'GIC:GEP'];
                    if (name === 'GWP') return [`${Number(value).toFixed(2)} Mn`, 'GWP (Millions)'];
                    if (name === 'NOP') return [Number(value).toLocaleString(), 'NOP'];
                    return [value, name];
                  }}
                  contentStyle={{ fontSize: '11px' }}
                />
                <Legend wrapperStyle={{ fontSize: '10px' }} />
                <Bar yAxisId="left" dataKey="nop" fill="#30cd05" name="NOP" />
                <Bar yAxisId="left" dataKey="gwp_millions" fill="#2563eb" name="GWP" />
                <Line 
                  yAxisId="right" 
                  type="monotone" 
                  dataKey="gic_gep" 
                  stroke="#e30613" 
                  strokeWidth={2}
                  dot={{ fill: '#e30613', strokeWidth: 1, r: 3, stroke: '#e30613' }}
                  name="GIC:GEP"
                  label={({ x, y, value }) => (
                    <text x={x} y={y - 12} fill="#e30613" fontWeight="bold" fontSize="12" textAnchor="middle">{value}%</text>
                  )}
                  connectNulls={false}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
          <div className="or-note-chart or-note-red" style={{ marginTop: '10px', fontSize: '12px', lineHeight: '1.4' }}>
            {selectedDate?.month === 'July' ? 
              'Fire is inclusive of Generic New NOP - 4,172 with GWP of Rs. 19 Mn' :
              'Fire is inclusive of Generic New NOP - 1,686 with GWP of Rs. 6 Mn'
            }
            {selectedDate?.month === 'July' && (
              <><br />*Engineering - Commercial - BAGMANE DEVELOPERS PRIVATE LTD - Rs. 14.89 Crs (Short Circuit Fire)</>
            )}
          </div>
        </div>
        <div className="or-broker-table-container">
          <div className="or-table-header">
            <h2 className="or-table-title">
              Broker wise GWP Report - YTD {selectedDate?.month || 'May'} 2025 (Amt in Mn)
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
                {brokerData.map((item, index) => {
                  const isOthers = item.broker_name === 'Others';
                  const isTotal = item.broker_name === 'Total GWP';
                  return (
                    <tr 
                      key={index} 
                      className={`or-table-tr ${isTotal ? 'or-table-tr-total' : ''} ${isOthers ? 'or-table-tr-others' : ''}`}
                    >
                      <td className="or-table-td or-table-td-broker">
                        <div className="or-table-broker-name" title={item.broker_name}>
                          {item.broker_name}
                        </div>
                      </td>
                      <td className="or-table-td">{item.uw_channel}</td>
                      <td className="or-table-td">{item.fire}</td>
                      <td className="or-table-td">{item.engineering}</td>
                      <td className="or-table-td">{item.marine}</td>
                      <td className="or-table-td">{item.misc}</td>
                      <td className="or-table-td">{item.liability}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <div className="or-matrix-table-container">
        <div className="or-table-header">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 className="or-table-title">
              LOB & Segment wise Report - {selectedMatrixPeriod}
            </h2>
            <select 
              value={selectedMatrixPeriod} 
              onChange={(e) => {
                setSelectedMatrixPeriod(e.target.value);
                setSegmentLobMatrix(segmentMatrixDataMap[e.target.value]);
              }}
              style={{ 
                padding: '4px 8px', 
                borderRadius: '4px', 
                border: '1px solid #ccc',
                fontSize: '14px',
                marginRight: '10px',
                color: '#000',
                backgroundColor: '#fff'
              }}
            >
              {selectedDate?.month === 'July' ? (
                <>
                  <option value="YTD July 2025">YTD July 2025</option>
                  <option value="YTD July 2024">YTD July 2024</option>
                  <option value="July 2025">July 2025</option>
                  <option value="July 2024">July 2024</option>
                </>
              ) : selectedDate?.month === 'June' ? (
                <>
                  <option value="YTD June 2025">YTD June 2025</option>
                  <option value="YTD June 2024">YTD June 2024</option>
                  <option value="June 2025">June 2025</option>
                  <option value="June 2024">June 2024</option>
                </>
              ) : (
                <>
                  <option value="YTD May 2025">YTD May 2025</option>
                  <option value="YTD May 2024">YTD May 2024</option>
                  <option value="May 2025">May 2025</option>
                  <option value="May 2024">May 2024</option>
                </>
              )}
            </select>
          </div>
        </div>
        <div className="or-table-scroll">
          {segmentLobLoading ? (
            <div className="or-table-loading">Loading...</div>
          ) : (
            <table className="or-matrix-table">
              <thead>
                <tr>
                  <th rowSpan={2} className="or-matrix-th-segment">Segment</th>
                  {lobOrder.map(lob => (
                    <th
                      key={lob.key}
                      colSpan={3}
                      className={`or-matrix-th-lob ${lob.colorClass}`}
                    >
                      {lob.label}
                    </th>
                  ))}
                </tr>
                <tr>
                  {lobOrder.map(lob => (
                    <>
                      <th key={lob.key + '-nop'} className="or-matrix-th-sub">NOP</th>
                      <th key={lob.key + '-gwp'} className="or-matrix-th-sub">GWP (Mn)</th>
                      <th key={lob.key + '-gicgep'} className="or-matrix-th-sub">GIC:GEP</th>
                    </>
                  ))}
                </tr>
              </thead>
              <tbody>
                {segments.map(segment => (
                  <tr key={segment}>
                    <td className="or-matrix-td-segment">{segment}</td>
                    {lobOrder.map(lob => {
                      const cell = segMap[segment][lob.key];
                      return (
                        <>
                          <td key={lob.key + '-nop'} className="or-matrix-td-nop">
                            {cell ? cell.nop : '-'}
                          </td>
                          <td key={lob.key + '-gwp'} className="or-matrix-td-gwp">
                            {cell ? cell.gwp.toLocaleString() : '-'}
                          </td>
                          <td key={lob.key + '-gicgep'} className="or-matrix-td-gicgep" style={cell ? getGicGepStyle(cell.gic_gep) : {}}>
                            {cell ? cell.gic_gep || '0%' : '0%'}
                          </td>
                        </>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          <div className="or-note or-note-red" style={{ marginTop: '10px', fontSize: '11px', lineHeight: '1.4' }}>
            *Fire - Commercial : JAL AQUA INTERNATIONAL = 19.91 Crs. (Accidental Damage) ; Engg - SME: RADHA SMELTERS PRIVATE LIMITED = 83,64 L . (Operational Errors) ; Misc - Commercial :  CHOLAMANDALAM INVESTMENT AND FINANCE COMPANY LTD = 64.55 L (Accidental Damage), Others : TOPSEL TRUCKING (A UNIT OF TOPSPARES PVT. LTD.) = 3.25L (Theft )   ; Marine - Others : VA TECH WABAG LTD = 1.46 Crs (Accident to Carrying Vehicle) ; Liability - SME : REDINGTON LIMITED - 40 L (Accidental Damage), Others - KCP INFRA LIMITED = 13.04 L (Death) ;
          </div>
        </div>
      </div>
      <div className="or-growth-section">
        <div className="or-growth-header">
          LOB wise Growth % ( GWP ) - YTD {selectedDate?.month || 'May'} 2025
        </div>
        <div className="or-growth-charts" style={{ justifyContent: 'space-between', gap: '0.5rem' }}>
          {lobGrowthData.map((lob, idx) => (
            <div key={lob.key} className="or-growth-chart-item" style={{ minWidth: 100 }}>
              <div className="or-growth-chart-label" style={{ fontSize: '13px', fontWeight: 600 }}>
                {lob.label}
              </div>
              <div className="or-growth-pie-container" style={{ width: 140, height: 140 }}>
                <ResponsiveContainer height={140}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: "FY25", value: lob.fy25, color: lob.colors[0] },
                        { name: "FY24", value: lob.fy24, color: lob.colors[1] },
                      ]}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={25}
                      outerRadius={65}
                      startAngle={90}
                      endAngle={450}
                      stroke="white"
                      strokeWidth={2}
                    >
                      <Cell fill={lob.colors[0]} />
                      <Cell fill={lob.colors[1]} />
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="or-growth-pie-center">
                  <div className="or-growth-pie-growth" style={{ fontSize: '14px' }}>
                    {lob.growth > 0 ? `${lob.growth}%` : `${lob.growth}%`}
                  </div>
                </div>
                <div className="or-growth-pie-fy25" style={{ left: '0.8rem' }}>
                  <div className="or-growth-pie-value">{lob.fy25}</div>
                </div>
                <div className="or-growth-pie-fy24" style={{ right: '0.8rem' }}>
                  <div className="or-growth-pie-value">{lob.fy24}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="or-growth-legend">
          {lobGrowthData.map((lob) => (
            <div key={lob.key} className="or-growth-legend-item">
              <div className="or-growth-legend-color" style={{ background: lob.colors[0] }}></div>
              <span className="or-growth-legend-label">FY '25-26</span>
              <div className="or-growth-legend-color" style={{ background: lob.colors[1] }}></div>
              <span className="or-growth-legend-label">FY '24-25</span>
            </div>
          ))}
        </div>
        <div style={{ textAlign: 'center', marginTop: '15px' }}>
          <button 
            onClick={() => setShowGrowthPopup(true)}
            style={{
              padding: '12px 24px',
              backgroundColor: '#db2777',
              color: 'white',
              border: '2px solid #db2777',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 'bold',
              boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
              transition: 'all 0.3s ease',
              textTransform: 'uppercase'
            }}
            onMouseOver={(e) => {
              e.target.style.backgroundColor = '#be185d';
              e.target.style.transform = 'translateY(-2px)';
            }}
            onMouseOut={(e) => {
              e.target.style.backgroundColor = '#db2777';
              e.target.style.transform = 'translateY(0)';
            }}
          >
            📊 Click Here - LOB Segment wise Report Last 5 Years Comparison
          </button>
        </div>
      </div>
      <div className="or-tables-section">
        <div className="or-tables-side-by-side">
          <div className="or-table-block">
            <div className="or-table-block-header">
              Cordys TAT Report
            </div>
            <table className="or-table-block-table">
              <thead>
                <tr>
                  <th rowSpan={2} className="or-table-block-th">Month</th>
                  <th rowSpan={2} className="or-table-block-th">LOB</th>
                  <th colSpan={2} className="or-table-block-th">Same Day</th>
                  <th colSpan={2} className="or-table-block-th">Next day</th>
                  <th colSpan={2} className="or-table-block-th">Beyond that</th>
                  <th rowSpan={2} className="or-table-block-th">Grand Total</th>
                </tr>
                <tr>
                  <th className="or-table-block-th">No of RFQ's</th>
                  <th className="or-table-block-th">%</th>
                  <th className="or-table-block-th">No of RFQ's</th>
                  <th className="or-table-block-th">%</th>
                  <th className="or-table-block-th">No of RFQ's</th>
                  <th className="or-table-block-th">%</th>
                </tr>
              </thead>
              <tbody>
                {cordysTatDataMap[
                  selectedDate?.month === 'July' ? 'YTD July 2025' : 
                  selectedDate?.month === 'June' ? 'YTD June 2025' : 'YTD May 2025'
                ].map((row, idx) => {
                  const dataKey = selectedDate?.month === 'July' ? 'YTD July 2025' : 
                                 selectedDate?.month === 'June' ? 'YTD June 2025' : 'YTD May 2025';
                  const isFirstOfMonth = idx === 0 || cordysTatDataMap[dataKey][idx - 1].month !== row.month;
                  const monthRows = cordysTatDataMap[dataKey].filter(r => r.month === row.month);
                  const isTotal = row.lob === 'Total';
                  
                  return (
                    <tr key={idx} className={idx % 2 === 0 ? "or-table-block-tr-even" : "or-table-block-tr-odd"} style={isTotal ? { backgroundColor: '#fbcfe8' } : {}}>
                      {isFirstOfMonth && <td rowSpan={monthRows.length} className="or-table-block-td">{row.month}</td>}
                      <td className="or-table-block-td" style={isTotal ? { fontWeight: 'bold' } : {}}>{row.lob}</td>
                    <td className="or-table-block-td">{row.sameDay}</td>
                    <td className="or-table-block-td">{row.sameDayPct}</td>
                    <td className="or-table-block-td">{row.nextDay}</td>
                    <td className="or-table-block-td">{row.nextDayPct}</td>
                    <td className="or-table-block-td">{row.beyond}</td>
                    <td className="or-table-block-td">{row.beyondPct}</td>
                    <td className="or-table-block-td">{row.total}</td>
                  </tr>
                );
              })}

              <tr className="or-table-block-tr-even" style={{ backgroundColor: '#fbcfe8' }}>
                <td className="or-table-block-td" style={{ fontWeight: 'bold' }}>Overall Total</td>
                <td className="or-table-block-td"></td>
                <td className="or-table-block-td" style={{ fontWeight: 'bold' }}>
                  {selectedDate?.month === 'July' ? '721' : 
                   selectedDate?.month === 'June' ? '79' : '474'}
                </td>
                <td className="or-table-block-td" style={{ fontWeight: 'bold' }}>
                  {selectedDate?.month === 'July' ? '75%' : 
                   selectedDate?.month === 'June' ? '74%' : '229%'}
                </td>
                <td className="or-table-block-td" style={{ fontWeight: 'bold' }}>
                  {selectedDate?.month === 'July' ? '144' : 
                   selectedDate?.month === 'June' ? '17' : '91'}
                </td>
                <td className="or-table-block-td" style={{ fontWeight: 'bold' }}>
                  {selectedDate?.month === 'July' ? '15%' : 
                   selectedDate?.month === 'June' ? '16%' : '44%'}
                </td>
                <td className="or-table-block-td" style={{ fontWeight: 'bold' }}>
                  {selectedDate?.month === 'July' ? '91' : 
                   selectedDate?.month === 'June' ? '11' : '63'}
                </td>
                <td className="or-table-block-td" style={{ fontWeight: 'bold' }}>
                  {selectedDate?.month === 'July' ? '10%' : 
                   selectedDate?.month === 'June' ? '10%' : '30%'}
                </td>
                <td className="or-table-block-td" style={{ fontWeight: 'bold' }}>
                  {selectedDate?.month === 'July' ? '956' : 
                   selectedDate?.month === 'June' ? '107' : '628'}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="or-table-block">
          <div className="or-table-block-header">
            FIRE - Banca Channel wise UnderInsurance Report - YTD {selectedDate?.month || 'May'} 2025
          </div>
          <table className="or-table-block-table">
            <thead>
              <tr>
                <th className="or-table-block-th">Banca Channel</th>
                <th className="or-table-block-th">Claims Paid</th>
                <th className="or-table-block-th">Under insurance estimate</th>
                <th className="or-table-block-th">Underinsurance Claims %</th>
                <th className="or-table-block-th">NOC (Underinsurance)</th>
              </tr>
            </thead>
            <tbody>
              {fireUnderInsuranceDataMap[
                selectedDate?.month === 'July' ? 'YTD July 2025' : 
                selectedDate?.month === 'June' ? 'YTD June 2025' : 'YTD May 2025'
              ].map((row, idx) => (
                <tr key={idx} className={idx % 2 === 0 ? "or-table-block-tr-even" : "or-table-block-tr-odd"}>
                  {row.map((cell, i) => (
                    <td key={i} className="or-table-block-td">{cell}</td>
                  ))}
                </tr>
              ))}
              <tr className="or-table-block-tr-total">
                <td className="or-table-block-td">Grand Total</td>
                <td className="or-table-block-td">
                  {selectedDate?.month === 'July' ? '226,437,796' : 
                   selectedDate?.month === 'June' ? '135,534,335' : '100,539,732'}
                </td>
                <td className="or-table-block-td">
                  {selectedDate?.month === 'July' ? '8,498,303' : 
                   selectedDate?.month === 'June' ? '6,685,086' : '2,796,872'}
                </td>
                <td className="or-table-block-td">
                  {selectedDate?.month === 'July' ? '5%' : 
                   selectedDate?.month === 'June' ? '5%' : '3%'}
                </td>
                <td className="or-table-block-td">
                  {selectedDate?.month === 'July' ? '17' : 
                   selectedDate?.month === 'June' ? '14' : '8'}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
        <div className="or-table-block">
          <div className="or-table-block-header">
            Inward Fac - YTD {selectedDate?.month || 'May'} 2025
          </div>
          <table className="or-table-block-table">
            <thead>
              <tr>
                <th rowSpan={2} className="or-table-block-th">LOB</th>
                <th colSpan={6} className="or-table-block-th">May 2025</th>
                <th colSpan={6} className="or-table-block-th">YTD May 2025</th>
              </tr>
              <tr>
                <th className="or-table-block-th">NOP</th>
                <th className="or-table-block-th">GWP</th>
                <th className="or-table-block-th">SI</th>
                <th className="or-table-block-th">GIC</th>
                <th className="or-table-block-th">GEP</th>
                <th className="or-table-block-th">GIC:GEP</th>
                <th className="or-table-block-th">NOP</th>
                <th className="or-table-block-th">GWP</th>
                <th className="or-table-block-th">SI</th>
                <th className="or-table-block-th">GIC</th>
                <th className="or-table-block-th">GEP</th>
                <th className="or-table-block-th">GIC:GEP</th>
              </tr>
            </thead>
            <tbody>
              {inwardFacDataMap[
                selectedDate?.month === 'July' ? 'YTD July 2025' : 
                selectedDate?.month === 'June' ? 'YTD June 2025' : 'YTD May 2025'
              ][
                selectedDate?.month === 'July' ? 'july' : 
                selectedDate?.month === 'June' ? 'june' : 'may'
              ].map((row, idx) => (
                <tr key={idx} className={idx % 2 === 0 ? "or-table-block-tr-even" : "or-table-block-tr-odd"}>
                  <td className="or-table-block-td">{row.lob}</td>
                  <td className="or-table-block-td">{row.nop}</td>
                  <td className="or-table-block-td">{row.gwp}</td>
                  <td className="or-table-block-td">{row.si}</td>
                  <td className="or-table-block-td">{row.gic || '150,000'}</td>
                  <td className="or-table-block-td">{row.gep}</td>
                  <td className="or-table-block-td">{row.gicgep}</td>
                  {idx === 0 && (
                    <>
                      <td className="or-table-block-td">{inwardFacDataMap[
                        selectedDate?.month === 'July' ? 'YTD July 2025' : 
                        selectedDate?.month === 'June' ? 'YTD June 2025' : 'YTD May 2025'
                      ].ytd[0].nop}</td>
                      <td className="or-table-block-td">{inwardFacDataMap[
                        selectedDate?.month === 'July' ? 'YTD July 2025' : 
                        selectedDate?.month === 'June' ? 'YTD June 2025' : 'YTD May 2025'
                      ].ytd[0].gwp}</td>
                      <td className="or-table-block-td">{inwardFacDataMap[
                        selectedDate?.month === 'July' ? 'YTD July 2025' : 
                        selectedDate?.month === 'June' ? 'YTD June 2025' : 'YTD May 2025'
                      ].ytd[0].si}</td>
                      <td className="or-table-block-td">{inwardFacDataMap[
                        selectedDate?.month === 'July' ? 'YTD July 2025' : 
                        selectedDate?.month === 'June' ? 'YTD June 2025' : 'YTD May 2025'
                      ].ytd[0].gic}</td>
                      <td className="or-table-block-td">{inwardFacDataMap[
                        selectedDate?.month === 'July' ? 'YTD July 2025' : 
                        selectedDate?.month === 'June' ? 'YTD June 2025' : 'YTD May 2025'
                      ].ytd[0].gep}</td>
                      <td className="or-table-block-td">{inwardFacDataMap[
                        selectedDate?.month === 'July' ? 'YTD July 2025' : 
                        selectedDate?.month === 'June' ? 'YTD June 2025' : 'YTD May 2025'
                      ].ytd[0].gicgep}</td>
                    </>
                  )}
                  {idx === 1 && (
                    <>
                      <td className="or-table-block-td">{inwardFacDataMap[
                        selectedDate?.month === 'July' ? 'YTD July 2025' : 
                        selectedDate?.month === 'June' ? 'YTD June 2025' : 'YTD May 2025'
                      ].ytd[1].nop}</td>
                      <td className="or-table-block-td">{inwardFacDataMap[
                        selectedDate?.month === 'July' ? 'YTD July 2025' : 
                        selectedDate?.month === 'June' ? 'YTD June 2025' : 'YTD May 2025'
                      ].ytd[1].gwp}</td>
                      <td className="or-table-block-td">{inwardFacDataMap[
                        selectedDate?.month === 'July' ? 'YTD July 2025' : 
                        selectedDate?.month === 'June' ? 'YTD June 2025' : 'YTD May 2025'
                      ].ytd[1].si}</td>
                      <td className="or-table-block-td">{inwardFacDataMap[
                        selectedDate?.month === 'July' ? 'YTD July 2025' : 
                        selectedDate?.month === 'June' ? 'YTD June 2025' : 'YTD May 2025'
                      ].ytd[1].gic}</td>
                      <td className="or-table-block-td">{inwardFacDataMap[
                        selectedDate?.month === 'July' ? 'YTD July 2025' : 
                        selectedDate?.month === 'June' ? 'YTD June 2025' : 'YTD May 2025'
                      ].ytd[1].gep}</td>
                      <td className="or-table-block-td">{inwardFacDataMap[
                        selectedDate?.month === 'July' ? 'YTD July 2025' : 
                        selectedDate?.month === 'June' ? 'YTD June 2025' : 'YTD May 2025'
                      ].ytd[1].gicgep}</td>
                    </>
                  )}
                  {idx >= 2 && (
                    <>
                      <td className="or-table-block-td">0</td>
                      <td className="or-table-block-td">0</td>
                      <td className="or-table-block-td">0</td>
                      <td className="or-table-block-td">0</td>
                      <td className="or-table-block-td">0</td>
                      <td className="or-table-block-td">0%</td>
                    </>
                  )}
                </tr>
              ))}
              <tr className="or-table-block-tr-total">
                <td className="or-table-block-td">Total</td>
                <td className="or-table-block-td">
                  {selectedDate?.month === 'July' ? '9' : 
                   selectedDate?.month === 'June' ? '7' : '3'}
                </td>
                <td className="or-table-block-td">
                  {selectedDate?.month === 'July' ? '40,340,261' : 
                   selectedDate?.month === 'June' ? '20,963,768' : '16,829,914'}
                </td>
                <td className="or-table-block-td">
                  {selectedDate?.month === 'July' ? '32,041,550,944' : 
                   selectedDate?.month === 'June' ? '16,048,447,795' : '13,341,173,356'}
                </td>
                <td className="or-table-block-td">
                  {selectedDate?.month === 'July' ? '53,297,925' : 
                   selectedDate?.month === 'June' ? '16,045,260' : '63,581,291'}
                </td>
                <td className="or-table-block-td">
                  {selectedDate?.month === 'July' ? '30,701,756' : 
                   selectedDate?.month === 'June' ? '30,971,857' : '34,609,990'}
                </td>
                <td className="or-table-block-td">
                  {selectedDate?.month === 'July' ? '174%' : 
                   selectedDate?.month === 'June' ? '52%' : '184%'}
                </td>
                <td className="or-table-block-td">
                  {selectedDate?.month === 'July' ? '55' : 
                   selectedDate?.month === 'June' ? '47' : '40'}
                </td>
                <td className="or-table-block-td">
                  {selectedDate?.month === 'July' ? '197,568,689' : 
                   selectedDate?.month === 'June' ? '157,703,359' : '136,739,591'}
                </td>
                <td className="or-table-block-td">
                  {selectedDate?.month === 'July' ? '173,939,062,864' : 
                   selectedDate?.month === 'June' ? '141,735,409,352' : '125,686,961,557'}
                </td>
                <td className="or-table-block-td">
                  {selectedDate?.month === 'July' ? '169,000,928' : 
                   selectedDate?.month === 'June' ? '115,703,003' : '99,657,743'}
                </td>
                <td className="or-table-block-td">
                  {selectedDate?.month === 'July' ? '124,476,758' : 
                   selectedDate?.month === 'June' ? '93,775,003' : '62,803,146'}
                </td>
                <td className="or-table-block-td">
                  {selectedDate?.month === 'July' ? '136%' : 
                   selectedDate?.month === 'June' ? '123%' : '159%'}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <div className="or-bottom-grid" style={{ fontSize: '10px' }}>
        <div className="or-bottom-left">
          <div className="or-bottom-header" style={{ padding: '0.2rem 0', fontSize: '11px' }}>
            New Business Sourced (&gt;5 lakhs) - YTD {selectedDate?.month || 'May'} 2025
          </div>
          <div className="or-bottom-content" style={{ padding: '0.2rem', fontSize: '10px' }}>
            <span className="or-bottom-label" style={{ fontSize: '10px' }}>Commercial:</span>
            <ol className="or-bottom-list" style={{ marginBottom: '0.2rem' }}>
              {newBusinessDataMap[
                selectedDate?.month === 'July' ? 'YTD July 2025' : 
                selectedDate?.month === 'June' ? 'YTD June 2025' : 'YTD May 2025'
              ].commercial.map((item, idx) => (
                <li key={idx} style={{ fontSize: '9px', lineHeight: '1.2' }}>{item}</li>
              ))}
            </ol>
            <span className="or-bottom-label" style={{ fontSize: '10px' }}>Liability:</span>
            <ol className="or-bottom-list" style={{ marginBottom: '0.2rem' }}>
              {newBusinessDataMap[
                selectedDate?.month === 'July' ? 'YTD July 2025' : 
                selectedDate?.month === 'June' ? 'YTD June 2025' : 'YTD May 2025'
              ].liability.map((item, idx) => (
                <li key={idx} style={{ fontSize: '9px', lineHeight: '1.2' }}>{item}</li>
              ))}
            </ol>
          </div>
          <div className="or-bottom-header or-bottom-header-secondary" style={{ padding: '0.2rem 0', fontSize: '11px', marginTop: '0.3rem' }}>
            Large risk underwritten - More than 2500 Cr - YTD {selectedDate?.month || 'May'} 2025
          </div>
          <div className="or-bottom-content" style={{ padding: '0.2rem', fontSize: '9px', lineHeight: '1.2' }}>{largeRiskDataMap[
            selectedDate?.month === 'July' ? 'YTD July 2025' : 
            selectedDate?.month === 'June' ? 'YTD June 2025' : 'YTD May 2025'
          ]}</div>
        </div>
        <div className="or-bottom-right">
          <div className="or-bottom-header" style={{ padding: '0.2rem 0', fontSize: '11px' }}>
            New Initiatives - YTD {selectedDate?.month || 'May'} 2025
          </div>
          <div className="or-bottom-content" style={{ padding: '0.2rem', fontSize: '9px', lineHeight: '1.2' }} dangerouslySetInnerHTML={{ __html: newInitiativesDataMap[
            selectedDate?.month === 'July' ? 'YTD July 2025' : 
            selectedDate?.month === 'June' ? 'YTD June 2025' : 'YTD May 2025'
          ] }}>
          </div>
          <div className="or-bottom-header or-bottom-header-secondary" style={{ padding: '0.2rem 0', fontSize: '11px', marginTop: '0.3rem' }}>
            New Business Sourced (&gt;5 lakhs) - YTD {selectedDate?.month || 'May'} 2025
          </div>
          <div className="or-bottom-content" style={{ padding: '0.2rem', fontSize: '10px' }}>
            <span className="or-bottom-label" style={{ fontSize: '10px' }}>SME:</span>
            <ol className="or-bottom-list" style={{ marginBottom: '0.2rem' }}>
              {newBusinessDataMap[
                selectedDate?.month === 'July' ? 'YTD July 2025' : 
                selectedDate?.month === 'June' ? 'YTD June 2025' : 'YTD May 2025'
              ].sme.map((item, idx) => (
                <li key={idx} style={{ fontSize: '9px', lineHeight: '1.2' }}>{item}</li>
              ))}
            </ol>
          </div>
        </div>
      </div>
      
      {/* Growth Popup */}
      {showGrowthPopup && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '8px',
            maxWidth: '95vw',
            maxHeight: '90vh',
            overflow: 'auto',
            position: 'relative'
          }}>
            <button 
              onClick={() => setShowGrowthPopup(false)}
              style={{
                position: 'absolute',
                top: '10px',
                right: '15px',
                background: 'none',
                border: 'none',
                fontSize: '20px',
                cursor: 'pointer',
                color: '#666'
              }}
            >
              ×
            </button>
            
            <h2 style={{ marginBottom: '20px', textAlign: 'center' }}>LOB wise Growth % (GWP)</h2>
            
            {/* Static Table */}
            <div style={{ marginBottom: '30px' }}>
              <h3 style={{ backgroundColor: '#ff6600', color: 'white', padding: '8px', margin: '0 0 10px 0', textAlign: 'center' }}>
                {selectedDate?.month === 'July' ? "Apr'25 - July'25" : selectedDate?.month === 'June' ? "Apr'25 - June'25" : "Apr'25 - May'25"}
              </h3>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f0f0f0' }}>
                    <th rowSpan={2} style={{ border: '1px solid #ccc', padding: '8px', backgroundColor: '#ffb3b3' }}>Segment</th>
                    <th colSpan={3} style={{ border: '1px solid #ccc', padding: '8px', backgroundColor: '#ff9900' }}>FIRE</th>
                    <th colSpan={3} style={{ border: '1px solid #ccc', padding: '8px', backgroundColor: '#00cc00' }}>ENGINEERING</th>
                    <th colSpan={3} style={{ border: '1px solid #ccc', padding: '8px', backgroundColor: '#ffff00' }}>MISCELLANEOUS</th>
                    <th colSpan={3} style={{ border: '1px solid #ccc', padding: '8px', backgroundColor: '#0066cc' }}>Marine</th>
                    <th colSpan={3} style={{ border: '1px solid #ccc', padding: '8px', backgroundColor: '#00cccc' }}>LIABILITY</th>
                    <th colSpan={3} style={{ border: '1px solid #ccc', padding: '8px', backgroundColor: '#ff00cc' }}>OVERALL</th>
                  </tr>
                  <tr>
                    {['NOP', 'GWP', 'GIC:GEP', 'NOP', 'GWP', 'GIC:GEP', 'NOP', 'GWP', 'GIC:GEP', 'NOP', 'GWP', 'GIC:GEP', 'NOP', 'GWP', 'GIC:GEP', 'NOP', 'GWP', 'GIC:GEP'].map((header, i) => (
                      <th key={i} style={{ border: '1px solid #ccc', padding: '4px', fontSize: '10px' }}>{header}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {staticGrowthData.map((row, i) => (
                    <tr key={i} style={{ backgroundColor: i % 2 === 0 ? '#f9f9f9' : 'white' }}>
                      <td style={{ border: '1px solid #ccc', padding: '4px', fontWeight: 'bold' }}>{row.segment}</td>
                      <td style={{ border: '1px solid #ccc', padding: '4px' }}>{row.fire_nop.toLocaleString()}</td>
                      <td style={{ border: '1px solid #ccc', padding: '4px' }}>{row.fire_gwp}</td>
                      <td style={{ border: '1px solid #ccc', padding: '4px' }}>{row.fire_gicgep}</td>
                      <td style={{ border: '1px solid #ccc', padding: '4px' }}>{row.engg_nop}</td>
                      <td style={{ border: '1px solid #ccc', padding: '4px' }}>{row.engg_gwp}</td>
                      <td style={{ border: '1px solid #ccc', padding: '4px' }}>{row.engg_gicgep}</td>
                      <td style={{ border: '1px solid #ccc', padding: '4px' }}>{row.misc_nop.toLocaleString()}</td>
                      <td style={{ border: '1px solid #ccc', padding: '4px' }}>{row.misc_gwp}</td>
                      <td style={{ border: '1px solid #ccc', padding: '4px' }}>{row.misc_gicgep}</td>
                      <td style={{ border: '1px solid #ccc', padding: '4px' }}>{row.marine_nop}</td>
                      <td style={{ border: '1px solid #ccc', padding: '4px' }}>{row.marine_gwp}</td>
                      <td style={{ border: '1px solid #ccc', padding: '4px' }}>{row.marine_gicgep}</td>
                      <td style={{ border: '1px solid #ccc', padding: '4px' }}>{row.liability_nop}</td>
                      <td style={{ border: '1px solid #ccc', padding: '4px' }}>{row.liability_gwp}</td>
                      <td style={{ border: '1px solid #ccc', padding: '4px' }}>{row.liability_gicgep}</td>
                      <td style={{ border: '1px solid #ccc', padding: '4px' }}>{row.overall_nop.toLocaleString()}</td>
                      <td style={{ border: '1px solid #ccc', padding: '4px' }}>{row.overall_gwp}</td>
                      <td style={{ border: '1px solid #ccc', padding: '4px' }}>{row.overall_gicgep}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Dynamic Table with Dropdown */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
                <h3 style={{ backgroundColor: '#ff6600', color: 'white', padding: '8px', margin: '0', textAlign: 'center', flex: 1 }}>LOB & Segment wise Report</h3>
                <select 
                  value={popupPeriod}
                  onChange={(e) => setPopupPeriod(e.target.value)}
                  style={{ 
                    padding: '4px 8px', 
                    borderRadius: '4px', 
                    border: '1px solid #ccc',
                    fontSize: '12px',
                    marginLeft: '10px'
                  }}
                >
                  <option value="Apr'24 - Mar'25">Apr'24 - Mar'25</option>
                  <option value="Apr'23 - Mar'24">Apr'23 - Mar'24</option>
                  <option value="Apr'22 - Mar'23">Apr'22 - Mar'23</option>
                  <option value="Apr'21 - Mar'22">Apr'21 - Mar'22</option>
                </select>
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f0f0f0' }}>
                    <th rowSpan={2} style={{ border: '1px solid #ccc', padding: '8px', backgroundColor: '#ffb3b3' }}>Segment</th>
                    <th colSpan={3} style={{ border: '1px solid #ccc', padding: '8px', backgroundColor: '#ff9900' }}>FIRE</th>
                    <th colSpan={3} style={{ border: '1px solid #ccc', padding: '8px', backgroundColor: '#00cc00' }}>ENGINEERING</th>
                    <th colSpan={3} style={{ border: '1px solid #ccc', padding: '8px', backgroundColor: '#ffff00' }}>MISCELLANEOUS</th>
                    <th colSpan={3} style={{ border: '1px solid #ccc', padding: '8px', backgroundColor: '#0066cc' }}>Marine</th>
                    <th colSpan={3} style={{ border: '1px solid #ccc', padding: '8px', backgroundColor: '#00cccc' }}>LIABILITY</th>
                    <th colSpan={3} style={{ border: '1px solid #ccc', padding: '8px', backgroundColor: '#ff00cc' }}>OVERALL</th>
                  </tr>
                  <tr>
                    {['NOP', 'GWP', 'GIC:GEP', 'NOP', 'GWP', 'GIC:GEP', 'NOP', 'GWP', 'GIC:GEP', 'NOP', 'GWP', 'GIC:GEP', 'NOP', 'GWP', 'GIC:GEP', 'NOP', 'GWP', 'GIC:GEP'].map((header, i) => (
                      <th key={i} style={{ border: '1px solid #ccc', padding: '4px', fontSize: '10px' }}>{header}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {(popupDataMap[popupPeriod] || []).map((row, i) => (
                    <tr key={i} style={{ backgroundColor: i % 2 === 0 ? '#f9f9f9' : 'white' }}>
                      <td style={{ border: '1px solid #ccc', padding: '4px', fontWeight: 'bold' }}>{row.segment}</td>
                      <td style={{ border: '1px solid #ccc', padding: '4px' }}>{row.fire_nop.toLocaleString()}</td>
                      <td style={{ border: '1px solid #ccc', padding: '4px' }}>{row.fire_gwp}</td>
                      <td style={{ border: '1px solid #ccc', padding: '4px' }}>{row.fire_gicgep}</td>
                      <td style={{ border: '1px solid #ccc', padding: '4px' }}>{row.engg_nop}</td>
                      <td style={{ border: '1px solid #ccc', padding: '4px' }}>{row.engg_gwp}</td>
                      <td style={{ border: '1px solid #ccc', padding: '4px' }}>{row.engg_gicgep}</td>
                      <td style={{ border: '1px solid #ccc', padding: '4px' }}>{row.misc_nop.toLocaleString()}</td>
                      <td style={{ border: '1px solid #ccc', padding: '4px' }}>{row.misc_gwp}</td>
                      <td style={{ border: '1px solid #ccc', padding: '4px' }}>{row.misc_gicgep}</td>
                      <td style={{ border: '1px solid #ccc', padding: '4px' }}>{row.marine_nop}</td>
                      <td style={{ border: '1px solid #ccc', padding: '4px' }}>{row.marine_gwp}</td>
                      <td style={{ border: '1px solid #ccc', padding: '4px' }}>{row.marine_gicgep}</td>
                      <td style={{ border: '1px solid #ccc', padding: '4px' }}>{row.liability_nop}</td>
                      <td style={{ border: '1px solid #ccc', padding: '4px' }}>{row.liability_gwp}</td>
                      <td style={{ border: '1px solid #ccc', padding: '4px' }}>{row.liability_gicgep}</td>
                      <td style={{ border: '1px solid #ccc', padding: '4px' }}>{row.overall_nop.toLocaleString()}</td>
                      <td style={{ border: '1px solid #ccc', padding: '4px' }}>{row.overall_gwp}</td>
                      <td style={{ border: '1px solid #ccc', padding: '4px' }}>{row.overall_gicgep}</td>
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
