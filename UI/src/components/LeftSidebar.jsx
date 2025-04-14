import React from 'react';
import './LeftSidebar.css';
import { useAppContext } from '../context/AppContext';

function LeftSidebar() {
  // Get the handleSectionSelect function from context
  const { handleSectionSelect } = useAppContext();
  // Define sections with their keys for data lookup
  const sections = [
    { id: "base", label: "Base Data", key: null },
    { id: "sectionA", label: "Section A", key: "A" },
    { id: "sectionB", label: "Section B", key: "B" },
    { id: "sectionD", label: "Section D", key: "D" },
    { id: "sectionE", label: "Section E", key: "E" },
    { id: "sectionF", label: "Section F", key: "F" },
    { id: "transcripts", label: "Meeting Transcripts", key: null },
    { id: "otherData", label: "Other Data", key: null },
    { id: "courtDocs", label: "Court Documents", key: null }
  ];

  // Additional document types
  const additionalSources = [
    "Meeting Transcripts",
    "Other Data",
    "Court Documents"
  ];

  const handleSourceClick = (section) => {
    // If this section has a key, use the context function
    if (section.key) {
      handleSectionSelect(section.key);
    } else {
      console.log(`Selected source: ${section.label} (no data key available)`);
    }
  };

  return (
    <aside className="left-sidebar">
      <h3>Sources</h3>
      <button className="add-source-btn">Add Source</button>
      
      <ul className="source-list">
        {sections.map((section) => (
          <li 
            key={section.id} 
            onClick={() => handleSourceClick(section)}
            className={section.key ? 'has-data' : ''}
          >
            <input 
              type="checkbox" 
              id={`source-${section.id}`} 
              name={section.id} 
            />
            <label htmlFor={`source-${section.id}`}>
              {section.label}
              {section.key && <span className="data-indicator">•</span>}
            </label>
          </li>
        ))}
      </ul>
      
      <h3>Firm Notes</h3>
      <button className="add-note-btn">Add Note</button>
      <div className="notes-area">
        <p>No notes added yet</p>
      </div>
    </aside>
  );
}

export default LeftSidebar;
