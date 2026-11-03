variable "project_name" {
  type        = string
  description = "Base project name"
}

variable "location" {
  type        = string
  description = "Azure Region"
}

variable "tags" {
  type        = map(string)
  description = "Resource tags"
}
