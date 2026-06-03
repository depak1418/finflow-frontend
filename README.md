# FinFlow — Frontend

React.js frontend for FinFlow personal finance management system.

## Tech Stack
- React 18 + Vite
- React Router DOM
- Axios with JWT interceptor
- Recharts (Pie chart + Bar chart)
- React Hot Toast
- Lucide React icons

## Pages
| Page | Route | Features |
|---|---|---|
| Login | /login | JWT login |
| Register | /register | Create account |
| Dashboard | /dashboard | Income/expense cards, pie chart, 6-month trend, budget health |
| Transactions | /transactions | Add/edit/delete, filter, pagination |
| Budgets | /budgets | Set monthly limits per category, spending progress |

## Running Locally
```bash
npm install
npm run dev
```
Runs at `http://localhost:5173`  
Requires finflow-backend running at `http://localhost:8080`

## Demo

<img width="1912" height="1038" alt="FinFlowappoverview-ezgif com-optimize" src="https://github.com/user-attachments/assets/c0559a11-4d4c-46bc-87e9-8e30b2e15a6a" />

<img width="1916" height="1038" alt="Finflowapptransactions-ezgif com-optimize" src="https://github.com/user-attachments/assets/eeea68ef-a267-4251-89bf-950a5092df2a" />

<img width="1904" height="1034" alt="FinFlowappBudget-ezgif com-optimize" src="https://github.com/user-attachments/assets/a42cb4b5-c743-4ba8-9b25-699b9bd62d9d" />


