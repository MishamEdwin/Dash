import { useState } from 'react'
import { Building2, Flame, Wrench, Ship, Shield, Menu, X, Upload, Home } from 'lucide-react'

/**
 * Sidebar component - Collapsible navigation sidebar for insurance dashboard
 * Provides navigation between different insurance modules with expand/collapse functionality
 * @param {string} selectedOption - Currently selected navigation option name
 * @param {Function} onOptionClick - Callback function triggered when navigation option is clicked
 * @returns {JSX.Element} Sidebar navigation component with collapsible functionality
 */
const Sidebar = ({ selectedOption, onOptionClick }) => {
  // State variable to control sidebar expanded/collapsed state
  const [isExpanded, setIsExpanded] = useState(false) // Boolean flag for sidebar expansion state

  // Static configuration array defining navigation options with icons
  const sidebarOptions = [
    { name: 'Home', icon: Home }, // Home page navigation option
    { name: 'OverAll Review', icon: Building2 }, // Overall review module option
    { name: 'Fire', icon: Flame }, // Fire insurance module option
    { name: 'Engineering', icon: Wrench }, // Engineering insurance module option
    { name: 'Marine', icon: Ship }, // Marine insurance module option
    { name: 'Liability', icon: Shield }, // Liability insurance module option
    { name: 'Upload', icon: Upload } // File upload module option
  ]

  /**
   * Toggles the sidebar between expanded and collapsed states
   * @returns {void} No return value, updates isExpanded state
   */
  const toggleSidebar = () => {
    setIsExpanded(!isExpanded) // Toggle boolean state between true/false
  }

  return (
    <div className={`${isExpanded ? 'w-64' : 'w-20'} bg-gradient-to-b from-slate-900 to-slate-800 shadow-2xl transition-all duration-300 ease-in-out relative flex-shrink-0`}>
      {/* Toggle Button */}
      <button
        onClick={toggleSidebar} // Trigger sidebar toggle function when clicked
        className={`absolute top-4 p-2 text-slate-300 hover:text-white hover:bg-slate-700 rounded-lg transition-colors z-10 ${
          isExpanded ? 'right-4' : 'left-1/2 transform -translate-x-1/2' // Position button based on sidebar state
        }`}
        title={isExpanded ? 'Collapse Sidebar' : 'Expand Sidebar'} // Dynamic tooltip text based on current state
      >
        {isExpanded ? <X size={18} /> : <Menu size={18} />} {/* Show X icon when expanded, Menu icon when collapsed */}
      </button>

      <div className={`${isExpanded ? 'p-6' : 'p-3 pt-16'}`}>
        {/* Logo/Brand */}
        <div className={`mb-8 ${!isExpanded && 'text-center mb-6'}`}> {/* Brand section with conditional styling */}
          {isExpanded ? ( // Show full brand text only when sidebar is expanded
            <>
              <h2 className="text-2xl font-bold text-white mb-2 mt-2">Insurance</h2> {/* Main brand title */}
              <p className="text-slate-300 text-sm">Analysis Dashboard</p> {/* Brand subtitle */}
            </>
          ) : (
            <div> {/* Empty div placeholder for collapsed state */}
            </div>
          )}
        </div>
        
        {/* Navigation */}
        <nav>
          <ul className={`${isExpanded ? 'space-y-3' : 'space-y-4'}`}>
            {sidebarOptions.map((option) => {
              const Icon = option.icon // Extract icon component from option object
              return (
                <li key={option.name}> {/* List item with unique key for React rendering */}
                  <button
                    onClick={() => onOptionClick(option.name)} // Trigger callback with option name when clicked
                    className={`w-full text-left rounded-xl transition-all duration-200 flex items-center group relative ${
                      isExpanded 
                        ? 'px-4 py-3 space-x-3' // Expanded state styling with padding and spacing
                        : 'w-12 h-12 mx-auto justify-center' // Collapsed state styling with fixed dimensions
                    } ${
                      selectedOption === option.name
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25' // Active/selected option styling
                        : 'text-slate-300 hover:bg-slate-700 hover:text-white' // Default and hover styling
                    }`}
                    title={!isExpanded ? option.name : ''} // Tooltip title for collapsed state
                  >
                    <Icon 
                      size={20} // Icon size in pixels
                      className={`${
                        selectedOption === option.name 
                          ? 'text-white' // White color for selected option icon
                          : 'text-slate-400 group-hover:text-white' // Default and hover colors for icon
                      } ${!isExpanded && 'flex-shrink-0'}`} // Prevent icon shrinking in collapsed state
                    />
                    {isExpanded && ( // Conditionally render option name text only when expanded
                      <span className="font-medium text-sm">{option.name}</span>
                    )}
                    
                    {/* Tooltip for collapsed state */}
                    {!isExpanded && ( // Show tooltip only when sidebar is collapsed
                      <div className="absolute left-full ml-4 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50 pointer-events-none">
                        {option.name} {/* Tooltip text showing option name */}
                        <div className="absolute top-1/2 left-0 transform -translate-y-1/2 -translate-x-1 w-2 h-2 bg-gray-900 rotate-45"></div> {/* Tooltip arrow */}
                      </div>
                    )}
                  </button>
                </li>
              )
            })}
          </ul>
        </nav>
      </div>
    </div>
  )
}

export default Sidebar
