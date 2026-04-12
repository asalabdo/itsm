FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

COPY ["ITSMBackend.csproj", "./"]
RUN dotnet restore "ITSMBackend.csproj"

COPY . .
RUN dotnet build "ITSMBackend.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "ITSMBackend.csproj" -c Release -o /app/publish /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS runtime
WORKDIR /app
COPY --from=publish /app/publish .

ENV ASPNETCORE_URLS=http://+:5500

EXPOSE 5500

HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD curl -f http://localhost:5500/health || exit 1

ENTRYPOINT ["dotnet", "ITSMBackend.dll"]
