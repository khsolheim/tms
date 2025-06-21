# 🚀 VPS DEPLOYMENT - FULLSTENDIG GUIDE

## 📋 **RASK START** 

**Koden er nå pushet til GitHub og klar for VPS deployment!** ✅

### **1. Kjør VPS Deployment Script**

```bash
# Start interaktiv deployment (enkleste måte)
./scripts/vps-deploy.sh

# Eller med direkte parametere:
./scripts/vps-deploy.sh --vps-host DIN_VPS_IP --vps-user root --repo-url https://github.com/khsolheim/tms.git
```

### **2. Hva Skjer Automatisk**

🔧 **Server Setup:**
- Installerer Docker & Docker Compose
- Oppretter deployment-mapper (`/opt/tms`)
- Setter opp sikkerhet og brannmur

📥 **Code Deployment:**
- Kloner koden fra GitHub
- Bygger produksjons Docker images
- Konfigurerer database og miljøvariabler

🚀 **Service Start:**
- Starter TMS med `docker-compose.production.yml`
- Konfigurerer SSL/TLS sertifikater
- Setter opp automatisk backup og overvåking

### **3. Miljøvariabler Som Må Konfigureres**

**KRITISK:** Du må oppdatere `.env.production` på VPS med:

```bash
# På VPS etter deployment:
sudo nano /opt/tms/.env.production

# Oppdater disse verdiene:
DATABASE_URL="postgresql://tms_prod_user:DITT_STERKE_PASSORD@localhost:5432/tms_production"
JWT_SECRET="DITT_JWT_SECRET_64_CHARACTERS_MINIMUM"
ENCRYPTION_KEY="DITT_ENCRYPTION_KEY_32_CHARACTERS"
ADMIN_EMAIL="din@email.com"
```

### **4. Verifiser Deployment**

```bash
# Sjekk at alt kjører:
./scripts/production-readiness-check.sh

# Sjekk Docker containers:
docker ps

# Sjekk logs:
docker logs tms-server-prod
docker logs tms-client-prod
```

### **5. Tilgang til Appen**

- **Frontend:** `http://DIN_VPS_IP` (HTTP)
- **Frontend SSL:** `https://DIN_VPS_IP` (HTTPS - krever SSL setup)
- **API:** `http://DIN_VPS_IP:3001/api` 

### **6. SSL Setup (Valgfritt)**

```bash
# Installer Let's Encrypt SSL:
sudo apt install certbot
sudo certbot --nginx -d yourdomain.com
```

## 🎯 **RESULTAT**

Etter deployment har du:
- ✅ **Produksjonsklar TMS** som kjører på VPS
- ✅ **Docker containerisering** for optimal ytelse  
- ✅ **Automatisk backup** og monitoring
- ✅ **SSL/TLS support** for sikkerhet
- ✅ **Zero-downtime updates** for fremtidige deployments

## 🆘 **Support**

Hvis du får problemer:
1. Sjekk `docker logs tms-server-prod`
2. Kjør `./scripts/production-readiness-check.sh`
3. Restart med `docker-compose -f docker-compose.production.yml restart`

**TMS er nå LIVE på din VPS!** 🎉 