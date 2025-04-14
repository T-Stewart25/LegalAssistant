import React, { useState } from 'react';
import './RightSidebar.css';

function RightSidebar() {
  // State to track selected prompts
  const [selectedPrompts, setSelectedPrompts] = useState([]);
  
  // Placeholder data
  const prompts = [
    "Vocational Expert",
    "SS Regulations Expert",
    "Medical Expert",
    "Pre Hearing Memo",
    "Medical Source Statements"
  ];
  
  const documents = [
    "Initial Application",
    "Pre Hearing Memo",
    "Medical Source Statements"
  ];

  // Toggle prompt selection
  const togglePrompt = (prompt) => {
    if (selectedPrompts.includes(prompt)) {
      // Remove if already selected
      setSelectedPrompts(selectedPrompts.filter(p => p !== prompt));
    } else {
      // Add if not selected
      setSelectedPrompts([...selectedPrompts, prompt]);
    }
  };

  return (
    <aside className="right-sidebar">
      {/* Status Section */}
      <div className="sidebar-section">
        <h4>
          Status
          <span className="section-tooltip">
            Current stage of the case in the disability claim process
          </span>
        </h4>
        <select defaultValue="Hearing">
          <option value="Intake">Intake</option>
          <option value="Development">Development</option>
          <option value="Hearing">Hearing</option>
          <option value="Appeal">Appeal</option>
          <option value="Closed">Closed</option>
        </select>
      </div>

      {/* Prompts Section */}
      <div className="sidebar-section">
        <h4>
          Prompts
          <span className="section-tooltip">
            Add specialized knowledge to the RAG system to enhance responses based on client data
          </span>
        </h4>
        {prompts.map(prompt => {
          const isSelected = selectedPrompts.includes(prompt);
          return (
            <button 
              key={prompt} 
              className={`prompt-button ${isSelected ? 'selected' : ''}`}
              title={isSelected ? `${prompt} knowledge is active` : `Add ${prompt} knowledge to the RAG system`}
              onClick={() => togglePrompt(prompt)}
            >
              {prompt}
              {isSelected && <span className="selected-indicator">✓</span>}
            </button>
          );
        })}
      </div>

      {/* Documents Section */}
      <div className="sidebar-section">
        <h4>
          Documents
          <span className="section-tooltip">
            Key documents related to the client's disability case
          </span>
        </h4>
        <ul className="document-list">
          {documents.map(doc => (
            <li key={doc} title={`View ${doc}`}>{doc}</li>
          ))}
        </ul>
      </div>

      {/* Theory Section */}
      <div className="sidebar-section">
        <h4>
          Theory
          <span className="section-tooltip">
            Legal theory and strategy for the client's disability case
          </span>
        </h4>
        <button className="theory-button" title="View or edit the theory of case">Theory of Case</button>
      </div>

      {/* Update Project Notice */}
      <div className="update-project-notice">
        <p><strong>Update Project</strong></p>
        <p>Your project is out of date</p>
        <button>Update project</button>
      </div>
    </aside>
  );
}

export default RightSidebar;
