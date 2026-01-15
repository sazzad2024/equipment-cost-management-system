variable "namespace" {
  description = "Kubernetes namespace for the application"
  type        = string
  default     = "equipment-system"
}

variable "environment" {
  description = "Environment (dev, staging, prod)"
  type        = string
  default     = "dev"
}

variable "frontend_replicas" {
  description = "Number of frontend replicas"
  type        = number
  default     = 2
}

variable "backend_replicas" {
  description = "Number of backend replicas"
  type        = number
  default     = 2
}

variable "mongodb_uri" {
  description = "MongoDB connection string"
  type        = string
  sensitive   = true
}

variable "cookie_secret" {
  description = "Cookie secret for session management"
  type        = string
  sensitive   = true
}

variable "frontend_image" {
  description = "Frontend Docker image"
  type        = string
  default     = "equipment-frontend:latest"
}

variable "backend_image" {
  description = "Backend Docker image"
  type        = string
  default     = "equipment-backend:latest"
}
