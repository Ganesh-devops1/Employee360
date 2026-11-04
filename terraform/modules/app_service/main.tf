resource "random_string" "app_suffix" {
  length  = 6
  special = false
  upper   = false
  keepers = {
    location = var.location
  }
}

# Shared App Service Plan for the environment (hosts both Frontend & Backend to reduce costs)
resource "azurerm_service_plan" "asp" {
  name                = "asp-${var.project_name}-${var.environment}"
  resource_group_name = var.resource_group_name
  location            = var.location
  os_type             = "Linux"
  sku_name            = var.plan_sku
  tags                = var.tags
}

# Backend .NET 8 Web API App Service
resource "azurerm_linux_web_app" "backend" {
  name                = "app-${var.project_name}-backend-${var.environment}-${random_string.app_suffix.result}"
  resource_group_name = var.resource_group_name
  location            = var.location
  service_plan_id     = azurerm_service_plan.asp.id
  https_only          = true

  identity {
    type = "SystemAssigned"
  }

  site_config {
    always_on = (var.plan_sku != "F1") # Always on not supported on Free tier

    application_stack {
      docker_image_name   = "employee360-backend:latest"
      docker_registry_url = "https://${var.acr_login_server}"
      docker_registry_username = var.acr_admin_username
      docker_registry_password = var.acr_admin_password
    }
  }

  app_settings = {
    "WEBSITES_PORT"                            = "8080"
    "ASPNETCORE_ENVIRONMENT"                  = title(var.environment)
    "ConnectionStrings__DefaultConnection"     = var.db_connection_string
    "APPLICATIONINSIGHTS_CONNECTION_STRING"    = var.appinsights_connection_string
    "ApplicationInsightsAgent_EXTENSION_VERSION" = "~3"
  }

  tags = var.tags
}

# Frontend React App Service
resource "azurerm_linux_web_app" "frontend" {
  name                = "app-${var.project_name}-frontend-${var.environment}-${random_string.app_suffix.result}"
  resource_group_name = var.resource_group_name
  location            = var.location
  service_plan_id     = azurerm_service_plan.asp.id
  https_only          = true

  site_config {
    always_on = (var.plan_sku != "F1")

    application_stack {
      docker_image_name   = "employee360-frontend:latest"
      docker_registry_url = "https://${var.acr_login_server}"
      docker_registry_username = var.acr_admin_username
      docker_registry_password = var.acr_admin_password
    }
  }

  app_settings = {
    "WEBSITES_PORT" = "80"
    "VITE_API_URL"  = "https://${azurerm_linux_web_app.backend.default_hostname}"
  }

  tags = var.tags
}
