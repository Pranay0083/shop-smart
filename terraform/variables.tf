variable "aws_region" {
  type    = string
  default = "us-east-1"
}

variable "project_name" {
  type    = string
  default = "shopsmart-pranay"
}

variable "vpc_cidr" {
  type    = string
  default = "10.0.0.0/16"
}

variable "public_subnet_cidrs" {
  type    = list(string)
  default = ["10.0.1.0/24", "10.0.2.0/24"]
}

variable "desired_count_client" {
  type    = number
  default = 1
}

variable "desired_count_server" {
  type    = number
  default = 1
}

variable "client_container_port" {
  type    = number
  default = 8080
}

variable "server_container_port" {
  type    = number
  default = 5001
}

variable "client_cpu" {
  type    = number
  default = 256
}

variable "client_memory" {
  type    = number
  default = 512
}

variable "server_cpu" {
  type    = number
  default = 256
}

variable "server_memory" {
  type    = number
  default = 512
}

variable "database_url" {
  type      = string
  sensitive = true
}

variable "jwt_secret" {
  type      = string
  sensitive = true
}
