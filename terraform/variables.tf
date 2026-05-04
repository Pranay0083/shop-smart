variable "aws_region" {
  description = "The AWS region to deploy resources into"
  type        = string
  default     = "us-east-1"
}

variable "app_name" {
  description = "The name of the application"
  type        = string
  default     = "shopsmart"
}

variable "container_port" {
  description = "The port the container listens on"
  type        = number
  default     = 5001
}

variable "client_port" {
  description = "The port the frontend client container listens on"
  type        = number
  default     = 80
}

variable "database_url" {
  description = "Prisma DATABASE_URL for backend container"
  type        = string
  sensitive   = true
}

variable "direct_url" {
  description = "Prisma DIRECT_URL for backend container"
  type        = string
  sensitive   = true
}

variable "jwt_secret" {
  description = "JWT secret for backend container"
  type        = string
  sensitive   = true
}
