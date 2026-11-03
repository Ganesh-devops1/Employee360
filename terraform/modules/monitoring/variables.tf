variable "project_name" {
  type        = string
  description = "Project prefix"
}

variable "environment" {
  type        = string
  description = "Target environment (dev, test, prod)"
}

variable "resource_group_name" {
  type        = string
  description = "Environment resource group name"
}

variable "location" {
  type        = string
  description = "Azure region"
}

variable "tags" {
  type        = map(string)
  description = "Resource tags"
}
