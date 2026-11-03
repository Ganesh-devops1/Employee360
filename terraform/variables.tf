variable "acr_name" {
  type        = string
  description = "Shared Azure Container Registry name"
  default     = "cremp360hszjzgz"
}

variable "subscription_id" {
  type        = string
  description = "Azure Subscription ID"
  default     = "3db31461-a3eb-4d9a-aeee-e7b7e6f79f95"
}

variable "project_name" {
  type        = string
  description = "Base project name used in all resource naming conventions"
  default     = "emp360"
}

variable "environment" {
  type        = string
  description = "Deployment environment target (dev, test, prod, shared)"
  validation {
    condition     = contains(["dev", "test", "prod", "shared"], var.environment)
    error_message = "Environment must be one of: dev, test, prod, shared."
  }
}

variable "location" {
  type        = string
  description = "Azure Region for provisioning resources"
  default     = "centralindia"
}

variable "deploy_shared_services" {
  type        = bool
  description = "Flag to deploy shared platform services (ACR, Key Vault, Shared Log Analytics) once"
  default     = false
}

variable "sql_admin_username" {
  type        = string
  description = "Administrator login username for Azure SQL Server"
  default     = "emp360admin"
}

variable "sql_admin_password" {
  type        = string
  description = "Administrator login password for Azure SQL Server"
  sensitive   = true
  default     = "P@ssw0rdEmployee360!#"
}

variable "app_service_sku" {
  type        = string
  description = "App Service Plan pricing tier (e.g., B1, F1 for free/lean testing)"
  default     = "B1"
}

variable "sql_sku" {
  type        = string
  description = "Azure SQL Database performance tier (Basic for dev/test, GP_S_Gen5_1 for prod)"
  default     = "Basic"
}

variable "tags" {
  type        = map(string)
  description = "Common resource tags for governance and cost tracking"
  default = {
    Project     = "Employee360"
    ManagedBy   = "Terraform"
    Environment = "CloudDevOps"
  }
}
