output "resource_group" {
  description = "Target environment resource group name"
  value       = var.environment == "shared" ? module.shared[0].shared_rg_name : azurerm_resource_group.env_rg[0].name
}

output "frontend_url" {
  description = "Public URL of the Employee360 React Frontend"
  value       = var.environment != "shared" ? module.app_service[0].frontend_url : null
}

output "backend_url" {
  description = "Public URL of the Employee360 .NET 8 Backend Web API"
  value       = var.environment != "shared" ? module.app_service[0].backend_url : null
}

output "sql_server_fqdn" {
  description = "Fully qualified domain name of Azure SQL Server"
  value       = var.environment != "shared" ? module.database[0].server_fqdn : null
}

output "acr_name" {
  description = "Name of the Azure Container Registry"
  value       = var.environment == "shared" ? module.shared[0].acr_name : data.azurerm_container_registry.shared_acr[0].name
}

output "acr_login_server" {
  description = "Login server of the Azure Container Registry"
  value       = var.environment == "shared" ? module.shared[0].acr_login_server : data.azurerm_container_registry.shared_acr[0].login_server
}
