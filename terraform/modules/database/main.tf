resource "random_string" "sql_suffix" {
  length  = 6
  special = false
  upper   = false
  keepers = {
    location = var.location
  }
}

resource "azurerm_mssql_server" "sql" {
  name                         = "sql-${var.project_name}-${var.environment}-${random_string.sql_suffix.result}"
  resource_group_name          = var.resource_group_name
  location                     = var.location
  version                      = "12.0"
  administrator_login          = var.admin_username
  administrator_login_password = var.admin_password
  minimum_tls_version          = "1.2"

  tags = var.tags
}

resource "azurerm_mssql_database" "db" {
  name           = "sqldb-${var.project_name}-${var.environment}"
  server_id      = azurerm_mssql_server.sql.id
  collation      = "SQL_Latin1_General_CP1_CI_AS"
  license_type   = "LicenseIncluded"
  max_size_gb    = 2
  sku_name       = var.sku_name # Basic (5 DTU) preserves $200 free trial
  zone_redundant = false

  tags = var.tags
}

# Allow Azure Services (App Service) to connect to SQL Server
resource "azurerm_mssql_firewall_rule" "allow_azure_services" {
  name             = "AllowAllWindowsAzureIps"
  server_id        = azurerm_mssql_server.sql.id
  start_ip_address = "0.0.0.0"
  end_ip_address   = "0.0.0.0"
}
