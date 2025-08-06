# Troubleshooting Guide

Denne guide hjælper dig med at løse almindelige problemer med Danish Wordle.

## 🔍 Hurtig diagnose

**Første trin**: Prøv altid disse grundlæggende løsninger først:

1. **Opdater siden** (Ctrl+F5 / Cmd+Shift+R)
2. **Check internetforbindelse**
3. **Prøv en anden browser**
4. **Ryd browser cache**

## 🌐 Frontend problemer

### Spillet loader ikke

#### Symptom
- Siden er helt blank
- "Loading..." bliver ved med at vise
- Kun header vises, intet spil

#### Mulige årsager og løsninger

**1. JavaScript fejl**
```javascript
// Åbn browser DevTools (F12)
// Check Console tab for fejl som:
// - "Uncaught ReferenceError"
// - "Failed to fetch"
// - "SyntaxError"
```

**Løsning:**
- Opdater browser til nyeste version
- Aktivér JavaScript i browser settings
- Deaktiver ad blockers midlertidigt

**2. API ikke tilgængelig**
```bash
# Test API direkte
curl https://wordle.rasmusknabe.dk/health

# Forventet svar:
{"status":"OK","timestamp":"...","uptime":123}
```

**Løsning:**
- Vent et par minutter og prøv igen
- Check om wordle.rasmusknabe.dk er tilgængelig

**3. CORS problemer (kun development)**
```
Console error: "Access to fetch at 'http://localhost:3000' has been blocked by CORS policy"
```

**Løsning:**
```javascript
// I server.js, tilføj CORS middleware
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
});
```

### Tastaturet virker ikke

#### Symptom
- Kan ikke indtaste bogstaver
- Virtuelle knapper reagerer ikke
- Enter/Backspace virker ikke

#### Løsninger

**1. Focus problem**
```javascript
// Klik på spil området først
// Eller tilføj debug kode:
document.addEventListener('keydown', (e) => {
  console.log('Key pressed:', e.key);
});
```

**2. Event listener problem**
```javascript
// Check om event listeners er sat op
// I browser DevTools Console:
console.log(document.listeners); // Chrome extension nødvendig
```

**3. JavaScript fejl**
- Åbn DevTools og check for fejl i Console
- Opdater siden og prøv igen

### Farver vises ikke korrekt

#### Symptom
- Alle tiles forbliver hvide/grå
- Feedback farver mangler efter gæt

#### Løsninger

**1. CSS loading problem**
```html
<!-- Check at style.css loader -->
<!-- I DevTools Network tab, se om style.css loader med status 200 -->
```

**2. CSS class problem**
```javascript
// Debug CSS classes
const tile = document.querySelector('.tile');
console.log('Tile classes:', tile.className);
console.log('Computed styles:', getComputedStyle(tile));
```

### Mobile problemer

#### Symptom
- Layout ødelagt på mobile
- Knapper for små/store
- Ikke responsive

#### Løsninger

**1. Viewport problem**
```html
<!-- Check at viewport meta tag er correct -->
<meta name="viewport" content="width=device-width, initial-scale=1.0">
```

**2. CSS media queries**
```css
/* Test om media queries virker */
@media (max-width: 480px) {
  body::before {
    content: "Mobile CSS active";
    position: fixed;
    top: 0;
    background: red;
    color: white;
  }
}
```

## ⚙️ Backend problemer

### Server svarer ikke

#### Symptom
- API calls får timeout
- Fejl 500/503 responses
- `/health` endpoint svarer ikke

#### Diagnose

```bash
# Check om Node.js processer kører
ps aux | grep node

# Check port 3000
netstat -tlnp | grep :3000

# Check server logs
sudo journalctl -u wordle -f
# eller
tail -f /var/log/wordle.log
```

#### Løsninger

**1. Restart Node.js server**
```bash
# Hvis systemd service
sudo systemctl restart wordle
sudo systemctl status wordle

# Hvis manual start
cd /path/to/wordle
npm start
```

**2. Port konflikt**
```bash
# Find proces på port 3000
lsof -i :3000

# Stop proces
kill -9 [PID]

# Start på anden port
PORT=3001 npm start
```

### Database/Word list fejl

#### Symptom
- "Not a valid Danish word" for gyldige ord
- Fejl med ordliste loading

#### Diagnose

```bash
# Check ordliste.txt eksisterer
ls -la ordliste.txt

# Check fil indhold
head -10 ordliste.txt
wc -l ordliste.txt
```

#### Løsninger

**1. Fil missing**
```bash
# Re-clone repository
git pull origin master
# eller
curl -O https://raw.githubusercontent.com/RasmusKnabe/danish-wordle/master/ordliste.txt
```

**2. Encoding problemer**
```bash
# Check fil encoding
file ordliste.txt
# Should be: UTF-8 Unicode text

# Fix encoding hvis nødvendigt
iconv -f ISO-8859-1 -t UTF-8 ordliste.txt > ordliste_utf8.txt
mv ordliste_utf8.txt ordliste.txt
```

### Session problemer

#### Symptom
- Spil resetter uventet
- Multiple games samtidig
- Session cookie problemer

#### Diagnose

```javascript
// I browser DevTools Application tab
// Check Cookies for wordle.rasmusknabe.dk
// Look for wordleSession cookie

// Backend debug
console.log('Sessions active:', gameSessions.size);
console.log('Session cookie:', req.cookies.wordleSession);
```

#### Løsninger

**1. Clear cookies**
```javascript
// I browser DevTools Console
document.cookie = "wordleSession=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
location.reload();
```

**2. Server memory problem**
```bash
# Check server memory
free -m
htop

# Restart server hvis low memory
sudo systemctl restart wordle
```

## 🌐 Deployment problemer

### Apache konfiguration

#### Symptom
- 404 errors for wordle subdomain
- Apache viser default site
- SSL ikke virker

#### Diagnose

```bash
# Check virtual hosts
sudo httpd -S

# Check Apache logs
sudo tail -f /var/log/httpd/error_log
sudo tail -f /var/log/httpd/wordle_error.log
```

#### Løsninger

**1. Virtual host ikke aktiv**
```bash
# Check configuration
sudo httpd -t

# Restart Apache
sudo systemctl restart httpd
```

**2. DNS ikke propageret**
```bash
# Check DNS resolution
nslookup wordle.rasmusknabe.dk
dig wordle.rasmusknabe.dk

# Wait for propagation (up to 24 hours)
```

### SSL certificat problemer

#### Symptom
- "Not secure" i browser
- SSL errors
- Certificate expired

#### Diagnose

```bash
# Check certificate status
sudo certbot certificates

# Check certificate validity
openssl x509 -in /etc/letsencrypt/live/wordle.rasmusknabe.dk/fullchain.pem -text -noout
```

#### Løsninger

**1. Renew certificate**
```bash
sudo certbot renew
sudo systemctl reload httpd
```

**2. Certificate missing**
```bash
# Re-issue certificate
sudo certbot --apache -d wordle.rasmusknabe.dk
```

## 🔧 Development problemer

### Node.js installation fejl

#### Symptom
- `node: command not found`
- Wrong Node.js version

#### Løsninger

```bash
# Install/update Node.js
# Option 1: Official installer fra nodejs.org
# Option 2: Package manager
sudo yum install -y nodejs npm  # CentOS/RHEL
sudo apt install -y nodejs npm  # Ubuntu/Debian

# Option 3: Node Version Manager
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc
nvm install --lts
nvm use --lts
```

### NPM dependency problemer

#### Symptom
- `npm install` fejler
- Module ikke fundet fejl
- Version conflicts

#### Løsninger

```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules og reinstall
rm -rf node_modules package-lock.json
npm install

# Fix permissions (macOS/Linux)
sudo chown -R $(whoami) $(npm config get prefix)/{lib/node_modules,bin,share}
```

### Git problemer

#### Symptom
- Push rejected
- Merge conflicts
- Permission denied

#### Løsninger

```bash
# Update from upstream
git fetch upstream
git checkout master
git merge upstream/master

# Fix merge conflicts
# Edit conflicted files
git add .
git commit -m "Resolve merge conflicts"

# Permission problems
chmod 600 ~/.ssh/id_rsa
ssh-add ~/.ssh/id_rsa
```

## 📊 Performance problemer

### Langsom loading

#### Diagnose

```bash
# Check server resources
htop
df -h
free -m

# Network test
ping wordle.rasmusknabe.dk
curl -w "@curl-format.txt" -o /dev/null -s "https://wordle.rasmusknabe.dk"
```

hvor `curl-format.txt`:
```
     time_namelookup:  %{time_namelookup}\n
        time_connect:  %{time_connect}\n
     time_appconnect:  %{time_appconnect}\n
    time_pretransfer:  %{time_pretransfer}\n
       time_redirect:  %{time_redirect}\n
  time_starttransfer:  %{time_starttransfer}\n
                     ----------\n
          time_total:  %{time_total}\n
```

#### Løsninger

**1. Enable compression**
```apache
# I Apache config
LoadModule deflate_module modules/mod_deflate.so
<Location />
    SetOutputFilter DEFLATE
</Location>
```

**2. Browser caching**
```apache
# Cache static files
<Directory "/path/to/wordle/public">
    ExpiresActive On
    ExpiresByType text/css "access plus 1 month"
    ExpiresByType application/javascript "access plus 1 month"
</Directory>
```

## 🆘 Getting more help

### Log indsamling

Når du reporter problemer, inkluder:

**Frontend logs:**
```javascript
// Browser DevTools Console output
// Network tab for failed requests
// Screenshots af problemer
```

**Backend logs:**
```bash
# System logs
sudo journalctl -u wordle -n 100

# Apache logs
sudo tail -100 /var/log/httpd/wordle_error.log

# Node.js process
ps aux | grep node
```

### Reporting bugs

Opret issue på GitHub med:
1. **Problem beskrivelse**
2. **Steps to reproduce**
3. **Expected vs actual behavior**
4. **Browser/OS information**
5. **Console logs/errors**
6. **Screenshots hvis relevant**

### Emergency contacts

- **GitHub Issues**: Tekniske problemer
- **Dokumentation**: Læs guides i `/docs/`
- **System admin**: For server problemer

---

*Håber denne guide hjalp dig! 🚀*