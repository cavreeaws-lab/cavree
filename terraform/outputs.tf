output "ec2_public_ip" {
  description = "Public IP of the EC2 instance"
  value       = aws_eip.app.public_ip
}

output "ec2_public_dns" {
  description = "Public DNS of the EC2 instance"
  value       = aws_instance.app.public_dns
}

output "rds_endpoint" {
  description = "RDS instance endpoint"
  value       = aws_db_instance.main.endpoint
}

output "rds_connection_string" {
  description = "PostgreSQL connection string (without password)"
  value       = "postgresql://cavree_admin:<PASSWORD>@${aws_db_instance.main.endpoint}/cavree?schema=public"
  sensitive   = true
}

output "s3_bucket_name" {
  description = "Name of the S3 bucket for images"
  value       = aws_s3_bucket.images.bucket
}

output "cloudfront_domain" {
  description = "CloudFront distribution domain name"
  value       = aws_cloudfront_distribution.images.domain_name
}

output "nextauth_secret_arn" {
  description = "ARN of the NextAuth secret in Secrets Manager"
  value       = aws_secretsmanager_secret.nextauth_secret.arn
}
