variable "project_name" {
  type        = string
  description = "Project prefix"
}

variable "environment" {
  type        = string
  description = "Target environment"
}

variable "resource_group_name" {
  type        = string
  description = "Resource group name"
}

variable "location" {
  type        = string
  description = "Azure location"
}

variable "admin_username" {
  type        = string
  description = "SQL administrator username"
}

variable "admin_password" {
  type        = string
  description = "SQL administrator password"
  sensitive   = true
}

variable "sku_name" {
  type        = string
  description = "Database SKU tier (Basic for dev/test)"
  default     = "Basic"
}

variable "tags" {
  type        = map(string)
  description = "Resource tags"
}
