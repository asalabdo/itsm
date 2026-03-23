FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

COPY ["backend/ITSMBackend.csproj", "backend/"]
RUN dotnet restore "backend/ITSMBackend.csproj"

COPY . .
WORKDIR "/src/backend"
RUN dotnet build "ITSMBackend.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "ITSMBackend.csproj" -c Release -o /app/publish /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/aspnet:10.0
WORKDIR /app
COPY --from=publish /app/publish .

EXPOSE 5000

ENTRYPOINT ["dotnet", "ITSMBackend.dll"]
