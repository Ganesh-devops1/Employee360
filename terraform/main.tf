# =============================================================================
# 1. SHARED PLATFORM SERVICES (ACR & Key Vault in rg-emp360-shared)
# Deployed when environment == "shared"
# =============================================================================
module "shared" {
  count        = var.environment == "shared" ? 1 : 0
  source       = "./modules/shared"
  project_name = var.project_name
  location     = var.location
  tags         = var.tags
}

# =============================================================================
# 2. ENVIRONMENT-SPECIFIC INFRASTRUCTURE (DEV / TEST / PROD)
# Deployed when environment != "shared"
# =============================================================================
resource "azurerm_resource_group" "env_rg" {
  count    = var.environment != "shared" ? 1 : 0
  name     = "rg-${var.project_name}-${var.environment}"
  location = var.location
  tags     = var.tags
}

# Data source to dynamically locate the Shared Azure Container Registry
data "azurerm_container_registry" "shared_acr" {
  count               = var.environment != "shared" ? 1 : 0
  name                = var.acr_name
  resource_group_name = "rg-${var.project_name}-shared"
}

# Monitoring (Log Analytics & Application Insights)
module "monitoring" {
  count               = var.environment != "shared" ? 1 : 0
  source              = "./modules/monitoring"
  project_name        = var.project_name
  environment         = var.environment
  resource_group_name = azurerm_resource_group.env_rg[0].name
  location            = azurerm_resource_group.env_rg[0].location
  tags                = var.tags
}

# Database (Azure SQL Server & Database)
module "database" {
  count               = var.environment != "shared" ? 1 : 0
  source              = "./modules/database"
  project_name        = var.project_name
  environment         = var.environment
  resource_group_name = azurerm_resource_group.env_rg[0].name
  location            = azurerm_resource_group.env_rg[0].location
  admin_username      = var.sql_admin_username
  admin_password      = var.sql_admin_password
  sku_name            = var.sql_sku
  tags                = var.tags
}

# App Services (Linux App Service Plan hosting Frontend & Backend)
module "app_service" {
  count                         = var.environment != "shared" ? 1 : 0
  source                        = "./modules/app_service"
  project_name                  = var.project_name
  environment                   = var.environment
  resource_group_name           = azurerm_resource_group.env_rg[0].name
  location                      = azurerm_resource_group.env_rg[0].location
  plan_sku                      = var.app_service_sku
  acr_login_server              = data.azurerm_container_registry.shared_acr[0].login_server
  acr_admin_username            = data.azurerm_container_registry.shared_acr[0].admin_username
  acr_admin_password            = data.azurerm_container_registry.shared_acr[0].admin_password
  db_connection_string          = module.database[0].connection_string
  appinsights_connection_string = module.monitoring[0].connection_string
  tags                          = var.tags
}
