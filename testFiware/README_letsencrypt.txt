>>> For acquiring a certificate, run the following command (after starting up all containers with "docker-compose up"): <<<

docker-compose run --rm certbot certonly --webroot --register-unsafely-without-email --agree-tos -w /var/www/letsencrypt -d <domain>

Replace <domain> with the corresponding FQDN (in our case "graziot.info.tm").
After fetching the certificate successfully, open "nginx.conf" in the folder .\nginx_config and enter the correct certificate paths
(like "<path>/fullchain.pem" and "<path>/privkey.pem") in the lines starting with "ssl_certificate" and "ssl_certificate_key".

>>> For renewing the certificate, use the following command: <<<

docker-compose run --rm certbot renew