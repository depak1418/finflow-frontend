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

<img width="1912" height="1038" alt="image" src="https://github.com/user-attachments/assets/68476906-e498-44f5-895a-6ce1a950c2a1" />

