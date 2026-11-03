# Build Stage
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy project file and restore dependencies
COPY Employee360.API/Employee360.API.csproj Employee360.API/
RUN dotnet restore Employee360.API/Employee360.API.csproj

# Copy the rest of the source code and build
COPY Employee360.API/ Employee360.API/
WORKDIR /src/Employee360.API
RUN dotnet publish -c Release -o /app/publish /p:UseAppHost=false

# Runtime Stage
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app
EXPOSE 8080
ENV ASPNETCORE_URLS=http://+:8080
ENV ASPNETCORE_ENVIRONMENT=Production

COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "Employee360.API.dll"]
