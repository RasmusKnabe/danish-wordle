# Deployment Guide

Denne guide beskriver hvordan du deployer Danish Wordle til en produktionsserver med Apache og SSL.

## 🎯 Oversigt

Vores produktionssetup består af:

- **Server**: Linux (CentOS/RHEL) med Apache
- **Node.js**: Backend server på port 3000
- **Apache**: Reverse proxy og static file serving
- **SSL**: Let's Encrypt certificat
- **Domain**: wordle.rasmusknabe.dk

## 🖥️ Server forudsætninger

### System krav

- Linux server (CentOS/RHEL/Ubuntu)
- Root eller sudo adgang
- Apache installeret og kørende
- Git installeret
- Internetforbindelse for Let's Encrypt

### DNS konfiguration

Før deployment skal DNS være konfigureret:

```
Type: A
Host: wordle
Value: [SERVER-IP]
TTL: 600
```

## 📦 Node.js installation

### 1. Installer Node.js og npm

```bash
# CentOS/RHEL
curl -fsSL https://rpm.nodesource.com/setup_lts.x | bash -
yum install -y nodejs

# Ubuntu/Debian
curl -fsSL https://deb.nodesource.com/setup_lts.x | bash -
apt-get install -y nodejs

# Verificer installation
node --version
npm --version
```

## 🚀 Applikation deployment

### 1. Clone repository

```bash
# Naviger til ønsket directory
cd /home/[USERNAME]

# Clone projekt
git clone https://github.com/RasmusKnabe/danish-wordle.git wordle
cd wordle
```

### 2. Installer dependencies

```bash
npm install --production
```

### 3. Test applikation

```bash
# Start server
npm start

# Test i anden terminal
curl http://localhost:3000/health
```

### 4. Start som service (valgfrit)

Opret systemd service for automatisk start:

```bash
sudo nano /etc/systemd/system/wordle.service
```

```ini
[Unit]
Description=Danish Wordle Node.js App
After=network.target

[Service]
Type=simple
User=wordle
WorkingDirectory=/home/wordle/wordle
ExecStart=/usr/bin/node server.js
Restart=always
Environment=NODE_ENV=production
Environment=PORT=3000

[Install]
WantedBy=multi-user.target
```

```bash
# Enable og start service
sudo systemctl enable wordle
sudo systemctl start wordle
sudo systemctl status wordle
```

## 🌐 Apache konfiguration

### 1. Opret virtual host

```bash
sudo nano /etc/httpd/conf.d/00-wordle.conf
```

```apache
<VirtualHost [SERVER-IP]:80>
    ServerName wordle.rasmusknabe.dk
    DocumentRoot /home/[USERNAME]/wordle/public
    
    <Directory "/home/[USERNAME]/wordle/public">
        AllowOverride All
        Require all granted
        DirectoryIndex index.html
    </Directory>

    # Proxy API requests to Node.js backend
    ProxyPreserveHost On
    ProxyPass /game http://localhost:3000/game
    ProxyPassReverse /game http://localhost:3000/game
    ProxyPass /guess http://localhost:3000/guess
    ProxyPassReverse /guess http://localhost:3000/guess
    ProxyPass /health http://localhost:3000/health
    ProxyPassReverse /health http://localhost:3000/health

    ErrorLog /var/log/httpd/wordle_error.log
    CustomLog /var/log/httpd/wordle_access.log combined
</VirtualHost>
```

### 2. Test Apache konfiguration

```bash
# Test konfiguration
sudo httpd -t

# Reload Apache
sudo systemctl reload httpd

# Verificer virtual host
sudo httpd -S | grep wordle
```

## 🔒 SSL setup med Let's Encrypt

### 1. Installer Certbot

```bash
# CentOS/RHEL
sudo yum install -y certbot python3-certbot-apache

# Ubuntu/Debian
sudo apt install -y certbot python3-certbot-apache
```

### 2. Generer SSL certificat

```bash
sudo certbot --apache -d wordle.rasmusknabe.dk \
  --non-interactive \
  --agree-tos \
  --email admin@rasmusknabe.dk
```

### 3. Test SSL

```bash
# Test HTTPS
curl -I https://wordle.rasmusknabe.dk

# Test SSL rating
curl -s "https://api.ssllabs.com/api/v3/analyze?host=wordle.rasmusknabe.dk"
```

### 4. Auto-renewal

Certbot sætter automatisk cron job op. Verificer:

```bash
# Check cron job
sudo crontab -l

# Test renewal
sudo certbot renew --dry-run
```

## 🔄 Deployment workflow

### 1. Manuel deployment

```bash
# På serveren
cd /home/[USERNAME]/wordle

# Pull latest changes
git pull origin master

# Installer nye dependencies (hvis nødvendigt)
npm install --production

# Restart applikation
sudo systemctl restart wordle

# Eller hvis ikke service
# npm start
```

### 2. Deployment script

Opret `deploy.sh` script:

```bash
#!/bin/bash

echo "🚀 Deploying Danish Wordle..."

# Navigate to project directory
cd /home/[USERNAME]/wordle

# Backup current version (optional)
# cp -r . ../wordle-backup-$(date +%Y%m%d-%H%M%S)

# Pull latest changes
git pull origin master

# Install/update dependencies
npm install --production

# Restart services
sudo systemctl restart wordle
sudo systemctl reload httpd

# Test deployment
sleep 2
curl -f http://localhost:3000/health > /dev/null

if [ $? -eq 0 ]; then
    echo "✅ Deployment successful!"
    echo "🌐 Site available at: https://wordle.rasmusknabe.dk"
else
    echo "❌ Deployment failed - check logs"
    exit 1
fi
```

```bash
# Gør script eksekverbart
chmod +x deploy.sh

# Kør deployment
./deploy.sh
```

## 📊 Monitoring

### 1. Log filer

```bash
# Application logs (hvis systemd service)
sudo journalctl -u wordle -f

# Apache logs
sudo tail -f /var/log/httpd/wordle_error.log
sudo tail -f /var/log/httpd/wordle_access.log

# System logs
sudo tail -f /var/log/messages
```

### 2. Process monitoring

```bash
# Check Node.js proces
ps aux | grep node

# Check Apache status
sudo systemctl status httpd

# Check port usage
sudo netstat -tlnp | grep :3000
sudo netstat -tlnp | grep :80
```

### 3. Performance monitoring

```bash
# Resource usage
htop
df -h
free -m

# Network connections
sudo ss -tlnp
```

## 🔧 Maintenance

### 1. Updates

```bash
# Node.js updates
sudo npm install -g npm@latest

# System updates
sudo yum update -y    # CentOS/RHEL
sudo apt update && sudo apt upgrade -y  # Ubuntu/Debian
```

### 2. Backup

```bash
# Database backup (ordliste.txt)
cp ordliste.txt ../backups/ordliste-$(date +%Y%m%d).txt

# Full project backup
tar -czf ../wordle-backup-$(date +%Y%m%d).tar.gz .
```

### 3. Security updates

```bash
# Check for npm security issues
npm audit

# Fix automatically
npm audit fix
```

## ❌ Troubleshooting

### Node.js ikke tilgængelig

```bash
# Check if Node.js is running
ps aux | grep node

# Check port 3000
sudo netstat -tlnp | grep :3000

# Restart manually
cd /home/[USERNAME]/wordle
npm start
```

### Apache problemer

```bash
# Check Apache status
sudo systemctl status httpd

# Check configuration
sudo httpd -t

# Check virtual hosts
sudo httpd -S
```

### SSL problemer

```bash
# Check certificate status
sudo certbot certificates

# Force renewal
sudo certbot renew --force-renewal
```

### Performance problemer

```bash
# Check system resources
htop
df -h
free -m

# Check Apache processes
ps aux | grep httpd
```

## 📚 Best practices

1. **Always test deployment i staging først**
2. **Backup før major updates**
3. **Monitor logs regelmæssigt**
4. **Automatiser deployment workflow**
5. **Hold system og dependencies opdaterede**
6. **Implementer proper monitoring og alerts**

## 🔗 Relaterede links

- [Installation Guide](installation.md) - Lokal development setup
- [Architecture Guide](architecture.md) - System arkitektur
- [Troubleshooting Guide](troubleshooting.md) - Problem solving

---

*Har du problemer med deployment? Se [Troubleshooting Guide](troubleshooting.md)*