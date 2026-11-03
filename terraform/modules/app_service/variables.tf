variable "project_name" {
  type        = string
  description = "Project name prefix"
}

variable "environment" {
  type        = string
  description = "Environment name (dev, test, prod)"
}

variable "resource_group_name" {
  type        = string
  description = "Resource group name"
}

variable "location" {
  type        = string
  description = "Azure region"
}

variable "plan_sku" {
  type        = string
  description = "App Service Plan SKU (e.g. B1)"
  default     = "B1"
}

variable "acr_login_server" {
  type        = string
  description = "ACR login server domain"
}

variable "acr_admin_username" {
  type        = string
  description = "ACR admin username"
}

variable "acr_admin_password" {
  type        = string
  description = "ACR admin password"
  sensitive   = true
}

variable "db_connection_string" {
  type        = string
  description = "Azure SQL connection string"
  sensitive   = true
}

variable "appinsights_connection_string" {
  type        = string
  description = "Application Insights connection string"
  sensitive   = true
  default     = ""
}

variable "tags" {
  type        = map(string)
  description = "Resource tags"
}
