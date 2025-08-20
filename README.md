# 🚀 LLM Search Insights

<div align="center">

![Next.js](https://img.shields.io/badge/Next.js-13+-000000)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC)
![FastAPI](https://img.shields.io/badge/FastAPI-009688)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://github.com/SUKESH127-art/LLM-Search-Insights-Web-UI/pulls)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

*Generate LLM search insights & visualizations!*

</div>

---

## ✨ Features

<div align="center">

### 📝 Simulate & Analyze Customers LLM Search Queries
![Job Running](media/job_running.png)

### 🔍 Generate Google SEO Analysis & LLM Visibility Insight Report
![Results](media/results.gif)

### 📊 Compare and Contrast Market Leaders
![Stunning Visualization](media/stunning_visualization_comparison_with_methodology.png)

</div>

### 🎯 **Key Insights Include**
- **🔍 Google SEO Analysis**: Marketer-oriented brand visibility report based off of top Google results as well as what these brands are known for. 
- **🤖 ChatGPT's Actual Response**: AI-generated answer to query  
- **📈 Data Visualization**: Interactive charts showing top 5 LLM-visible brands with methodology.

---

## 🏗️ System Architecture

### 🔧 Backend Architecture
The backend follows a microservices architecture with asynchronous job processing, web scraping capabilities, and AI-powered analysis synthesis. Check out the **[Backend GitHub Repo](https://github.com/SUKESH127-art/LLM-search-insights-api)**! The entire system is built on an asynchronous, polling-based interaction model.


### High-Level Architecture

<div align="center">

![Backend Architecture](media/backend_architecture_diagram.png)

</div>

The system is composed of four primary layers:
1.  **Client Application**: Any HTTP client (e.g., the provided CLI, a Next.js web app) that initiates and retrieves analysis jobs.
2.  **FastAPI Web Service**: The public-facing API layer that handles request validation, database session management, and spawns background tasks.
3.  **Background Processing Layer**: The core of the application, where a multi-stage pipeline orchestrates data collection, processing, and visualization.
4.  **Data & External Services**: The persistence layer (SQLite) and the external APIs (Bright Data, OpenAI) that the service depends on.

### Data Flow & Interaction Model

The service uses a non-blocking, polling-based workflow:
1.  **Job Submission**: A client sends a `POST` request to `/api/v1/analyze`. The server immediately validates the request, creates a job record in the database with a `QUEUED` status, and returns a `202 Accepted` response with a unique `analysis_id`. A background task is spawned to perform the analysis.
2.  **Background Processing**: The background task progresses through a series of states (`PROCESSING`, `SYNTHESIZING`, etc.), making parallel calls to Bright Data and OpenAI. It continuously updates the job's status in the database.
3.  **Result Retrieval**: The client periodically polls the `GET /.../status` endpoint. Once the status is `COMPLETE`, the client makes a final call to `GET /.../{id}` to retrieve the full, structured JSON report.

### Key Assumptions & Tradeoffs

The current design was built on a set of assumptions that informed key architectural tradeoffs. These choices prioritized development speed and simplicity, which are appropriate for an MVP but have clear implications for production scalability.

| Design Choice... | Pro | Con |
| :--- | :--- | :--- |
| **SQLite Database** | **Extreme Simplicity & Speed of Development.** Zero setup, no separate server to manage. | **Scalability & Concurrency.** The single-writer nature of SQLite is a bottleneck under high write loads. |
| **FastAPI `BackgroundTasks`** | **Simplicity & No Extra Infrastructure.** Avoids the complexity of managing a separate task queue like Celery/Redis. | **Reliability & Persistence.** If the server restarts, any in-progress tasks are permanently lost. |
| **JSON Blob for Results** | **High Read Performance & Simple Code.** Retrieving a full report is a single, fast database read with no complex `JOIN`s. | **Data Queryability.** It is not possible to run analytical queries over the contents of the final reports. |
| **HTTP Polling** | **Simplicity & Statelessness.** The backend is simple, and the client logic is straightforward to implement. | **Efficiency & Real-Time Updates.** Polling can be inefficient and does not provide real-time notifications. |

### Limitations & Future Enhancements

The tradeoffs above result in known limitations that define the roadmap for production-hardening the service:

*   **AI Hallucination in Data Cleaning & Analysis**: Using LLMs for data cleaning or analysis can introduce "hallucinations"—plausible but incorrect or fabricated data and insights. This may result in errors that are hard to detect and can mislead downstream decisions. Always validate AI-generated outputs, prefer rule-based methods for critical steps, and flag AI-derived results for review when accuracy is essential.
*   **Database Scalability**: The primary bottleneck is SQLite. The first step to scaling would be migrating to a client-server database like **PostgreSQL**.
*   **Task Queue Reliability**: The lack of task persistence is a critical issue for a production system. The next step would be to replace `BackgroundTasks` with a robust task queue like **Celery + Redis**.
*   **Observability**: The current use of `print()` statements is insufficient for production. The system needs to be upgraded with structured **logging**, **metrics**, and **tracing** for proper monitoring and debugging.
*   **Security**: The current app lacks user authentication and the API lacks authorization, making it vulnerable to unauthorized access and potential data leaks. We could handle this via migration to Supabase (row level security, automatic user handling).


---

## 📁 Project Structure

```bash
llm-search-insight-web-app/
├── src/
│   ├── app/                    # Next.js app router
│   │   ├── api/               # API routes
│   │   ├── globals.css        # Global styles
│   │   ├── layout.tsx         # Root layout
│   │   ├── page.tsx           # Home page
│   │   ├── providers.tsx      # Context providers
│   │   └── tailwind-input.css # Tailwind source
│   ├── components/             # React components (shadcn)
│   │   ├── ui/ ...               # Reusable UI components
│   │   │   ├── accordion.tsx  # Accordion component
│   │   │   ├── ...      
│   │   │   └── tooltip.tsx    # Tooltip component
│   │   ├── AnalysisResults.tsx # Main results display
│   │   ├── BrandChart.tsx     # Brand visualization
│   │   ├── LoadingState.tsx   # Loading indicators
│   │   └── SearchInterface.tsx # Search form
│   ├── hooks/                  # Custom React hooks
│   │   └── useAnalysis.ts     # API integration hook
│   └── lib/                    # Utility functions
│       ├── parser.ts           # Text parsing utilities
│       └── utils.ts            # General utilities
├── public/                      # Static assets
│   ├── file.svg                # File icon
│   ├── globe.svg               # Globe icon
│   ├── next.svg                # Next.js logo
│   ├── vercel.svg              # Vercel logo
│   └── window.svg              # Window icon
├── media/                       # Project screenshots
├── components.json              # shadcn/ui configuration
├── next.config.ts               # Next.js configuration
├── tailwind.config.js           # Tailwind CSS configuration
├── tsconfig.json                # TypeScript configuration
└── package.json                 # Dependencies and scripts
```

---

## 🔌 LLM Insights API

### 🚀 Get Started
- **[Render's Live Docs](https://llm-search-insights-api.onrender.com/docs)**
- **[OpenAPI Spec](https://llm-search-insights-api.onrender.com/openapi.json)**

### 📡 Endpoints

<div align="center">

| 🔄 **Generate Insight** | 📊 **Poll Job Status** | 🎯 **See Results** |
|:---:|:---:|:---:|
| `POST /api/v1/analyze` | `GET /api/v1/analyze/{analysis_id}/status` | `GET /api/v1/analyze/{analysis_id}` |

</div>

### 💻 Example Usage

```bash
# Submit analysis
curl -X POST 'https://llm-search-insights-api.onrender.com/api/v1/analyze' \
  -H 'Content-Type: application/json' \
  -d '{"research_question": "What are the best programming languages for AI?"}'

# Check status
curl 'https://llm-search-insights-api.onrender.com/api/v1/analyze/{analysis_id}/status'

# Get results
curl 'https://llm-search-insights-api.onrender.com/api/v1/analyze/{analysis_id}'
```

---

## 📊 Data Models

### 🏗️ Core Schemas

<div align="center">

| 📋 **Schema** | 📝 **Description** |
|:---:|:---:|
| `FullAnalysisResult` | Main analysis report container |
| `WebAnalysis` | Web scraping results and confidence scores |
| `ChatGPTResponse` | AI-generated responses and brand identification |
| `VisualizationData` | Chart data and methodology explanations |

</div>

#### 🔍 `FullAnalysisResult`
- `analysis_id` (string)
- `research_question` (string) 
- `status` (string): `QUEUED` • `PROCESSING` • `SCRAPING` • `SYNTHESIZING` • `COMPLETE` • `ERROR`
- `completed_at` (string, date-time)
- `web_results` (WebAnalysis object)
- `chatgpt_simulation` (ChatGPTResponse object)
- `visualization` (VisualizationData object)

#### 🌐 `WebAnalysis`
- `content` (string)
- `confidence_score` (number)

#### 🤖 `ChatGPTResponse`
- `simulated_response` (string)
- `identified_brands` (array of strings)

#### 📈 `VisualizationData`
- `title` (string)
- `brand_scores` (array of BrandVisibilityScore objects)
- `methodology_explanation` (string)

---

## 🚀 Getting Started

### 📋 Prerequisites
- **Node.js** 18+ 
- **npm**, **yarn**, **pnpm**, or **bun**

### ⚡ Quick Start

```bash
# 1. Clone and install dependencies
git clone <your-repo-url>
cd llm-search-insight-web-app
npm install

# 2. Run dev server
npm run dev

# 3. Open browser: http://localhost:3000
```

<div align="center">

🎉 **You're all set! Your LLM Search Insight Web App is now running locally.**

</div>