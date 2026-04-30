output "alb_dns_name" {
  value = aws_lb.app.dns_name
}

output "client_ecr_repo" {
  value = aws_ecr_repository.client.repository_url
}

output "server_ecr_repo" {
  value = aws_ecr_repository.server.repository_url
}

output "artifacts_bucket" {
  value = aws_s3_bucket.artifacts.bucket
}
