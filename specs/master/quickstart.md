# Quickstart

## Prerequisites
- .NET 10 SDK
- Node 20+ (for frontend)
- SQL Server / LocalDB
- Docker (optional)

## Local backend
1. `cd backend`
2. Update `appsettings.Development.json` connection string to your database.
3. `dotnet ef database update`
4. `dotnet run`
5. API available at `https://localhost:7030` (or as logged).

## Local frontend
1. `cd src`
2. `npm install`
3. `npm run start`
4. Open browser at `http://localhost:5173`

## Validation
- Access `GET /api/tickets`, `GET /api/dashboard` endpoints from backend.
- Confirm UI pages load (e.g., `/incident-management-workflow`, `/executive-it-service-summary`).

## Feature-add workflow
1. Define `specs/master/spec.md` feature scope and acceptance criteria.
2. Update `specs/master/plan.md` and `specs/master/research.md` accordingly.
3. Implement backend model + controller + service updates.
4. Add/extend frontend pages/components and API client functions.
5. Add tests (`backend` as xUnit + `src` as RTL/e2e).
