// Mock client data for demonstration purposes
const clients = [
  {
    id: "020825",
    lastName: "Smith",
    firstName: "John",
    ssn: "123-45-6789",
    status: "active",
    sections: {
      A: { available: true, summary: "Employment history shows consistent work in construction until 2022." },
      B: { available: true, summary: "Education includes high school diploma and vocational training." },
      D: { available: true, summary: "Medical records indicate chronic back pain and degenerative disc disease." },
      E: { available: true, summary: "Functional assessment shows limited ability to stand or lift over 10 pounds." },
      F: { available: true, summary: "Treatment history includes physical therapy and pain management." }
    }
  },
  {
    id: "031542",
    lastName: "Johnson",
    firstName: "Maria",
    ssn: "987-65-4321",
    status: "pending",
    sections: {
      A: { available: true, summary: "Worked as a nurse for 15 years until 2023." },
      B: { available: true, summary: "Bachelor's degree in Nursing from State University." },
      D: { available: true, summary: "Diagnosed with rheumatoid arthritis and fibromyalgia." },
      E: { available: false, summary: "" },
      F: { available: true, summary: "Currently on medication regimen for pain and inflammation." }
    }
  },
  {
    id: "045678",
    lastName: "Williams",
    firstName: "Robert",
    ssn: "456-78-9012",
    status: "closed",
    sections: {
      A: { available: true, summary: "Former accountant with 20 years experience." },
      B: { available: true, summary: "Master's degree in Accounting." },
      D: { available: true, summary: "Severe anxiety disorder and depression following workplace incident." },
      E: { available: true, summary: "Mental health assessment indicates inability to work in high-stress environments." },
      F: { available: true, summary: "Psychiatric treatment and medication ongoing since 2021." }
    }
  },
  {
    id: "059823",
    lastName: "Garcia",
    firstName: "Elena",
    ssn: "234-56-7890",
    status: "active",
    sections: {
      A: { available: true, summary: "Retail manager for 10 years until 2022." },
      B: { available: true, summary: "Associate's degree in Business Administration." },
      D: { available: true, summary: "Multiple sclerosis diagnosis in 2020." },
      E: { available: true, summary: "Progressive mobility limitations affecting ability to stand for extended periods." },
      F: { available: true, summary: "Current treatment includes disease-modifying therapies and physical therapy." }
    }
  },
  {
    id: "067234",
    lastName: "Brown",
    firstName: "David",
    ssn: "345-67-8901",
    status: "hearing",
    sections: {
      A: { available: true, summary: "Construction worker for 25 years." },
      B: { available: true, summary: "High school diploma and trade certification." },
      D: { available: true, summary: "Severe back injury from workplace accident in 2021." },
      E: { available: true, summary: "Unable to lift more than 5 pounds or stand for more than 30 minutes." },
      F: { available: true, summary: "Two surgeries performed, currently in pain management program." }
    }
  }
];

export default clients;
