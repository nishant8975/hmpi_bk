# 💧 AquaWatch: HMPI Environmental Monitoring Platform

AquaWatch is a modern, AI-augmented environmental monitoring dashboard designed to calculate, visualize, and report on the **Heavy Metal Pollution Index (HMPI)** of various water bodies. 
The platform allows researchers and policymakers to track heavy metal concentrations (As, Pb, Hg, Cd, Cr, Ni, Cu, Zn), assess water quality risks based on WHO standards, and interact with an integrated AI assistant for environmental science guidance.
---

## ✨ Key Features
* **Real-Time HMPI Calculator**: Instantly calculate the Heavy Metal Pollution Index by inputting raw concentration data.
* **AI-Powered "HMPI Advisor"**: A floating, contextual chatbot powered by the Gemini API that assists users with HMPI mathematics, weighting factors, and the environmental impacts of specific metals.
* **Role-Based Dashboards**: Secure routes tailored for Administrators, Researchers, and Policymakers.
* **Data Visualization**: Map-based site monitoring and trend analysis charts.
* **AI Extraction Pipeline (Backend WIP)**: A planned Python service to ingest unstructured text from government reports/PDFs and use LLMs to extract structured CSV data for the dashboard.
---

## 🏗️ System Architecture
AquaWatch is designed with a decoupled architecture to handle both snappy UI interactions and heavy data processing.
### 1. Frontend (The Storefront)
* **Framework**: React (Vite / Create React App)
* **Routing**: React Router (`react-router-dom`)
* **Styling**: Tailwind CSS & Lucide React (Icons)
* **State Management**: TanStack Query (`@tanstack/react-query`)
* **AI Integration**: Direct Gemini API integration for the frontend chatbot.

### 2. Data Extraction Pipeline (The Factory - *In Development*)
* **Framework**: Python (FastAPI / Flask)
* **Data Processing**: `pandas`, `pdfplumber`
* **AI Engine**: Gemini / LangChain
* **Flow**: 
    1. User uploads a messy PDF/Text report to the React frontend.
    2. React sends the file to the Python backend.
    3. Python prompts the LLM to extract heavy metal concentrations and formats them into JSON.
    4. Python converts JSON to a strict CSV schema (`Location, Date, As, Pb, Hg...`) and returns it to React.
---

## 🚀 Getting Started (Frontend)

### Prerequisites
* Node.js (v16 or higher)
* npm or yarn
* A Google Gemini API Key

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/nishant8975/hmpi_bk.git
   cd HMPI_bk
   npm install
   npm run dev 
