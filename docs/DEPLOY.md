# 🏥 MediSahel V3 — Guide de déploiement

## 🎯 Objectif

Déployer MediSahel V3 sur un nouveau serveur Ubuntu en 5-10 minutes,
avec ou sans internet.

---

## 📋 Prérequis

- Serveur Ubuntu 24.04 LTS ou plus récent
- 2 CPU, 4 Go RAM minimum (recommandé : 4 CPU, 8 Go RAM)
- 50 Go de disque
- Accès root ou sudo

---

## 🚀 Installation AVEC internet

### 1. Récupérer le projet

    sudo mkdir -p /opt/clinique
    sudo chown -R $USER:$USER /opt/clinique
    cd /opt/clinique
    git clone https://github.com/dmsangare/MedisahelV3.git .

### 2. Créer le fichier .env

    cp .env.example .env
    nano .env
    chmod 600 .env

Variables à remplir :
- JWT_SECRET : généré avec openssl rand -hex 64
- JWT_REFRESH_SECRET : généré avec openssl rand -hex 64
- POSTGRES_PASSWORD : un mot de passe fort

### 3. Lancer l'installation

    sudo ./scripts/install.sh

### 4. Configurer Nginx

    sudo apt install -y nginx
    sudo cp docs/nginx-medisahel.conf /etc/nginx/sites-available/medisahel
    sudo ln -sf /etc/nginx/sites-available/medisahel /etc/nginx/sites-enabled/medisahel
    sudo rm -f /etc/nginx/sites-enabled/default
    sudo nginx -t && sudo systemctl reload nginx

### 5. Firewall

    sudo ufw allow OpenSSH
    sudo ufw allow 'Nginx Full'
    sudo ufw enable

### 6. Accès

Ouvrir un navigateur sur http://IP_DU_SERVEUR

---

## 📦 Installation SANS internet (offline)

### Sur un serveur AVEC internet (préparer le bundle)

    cd /opt/clinique
    ./scripts/save-images.sh

Cela crée images-base.tar (~500 Mo). Copier ce fichier sur une clé USB.

### Sur le serveur de la nouvelle clinique (sans internet)

1. Copier le projet + images-base.tar dans /opt/clinique/
2. Installer Docker manuellement (paquets .deb pré-téléchargés)
3. Charger les images : docker load -i images-base.tar
4. Créer .env puis chmod 600 .env
5. Lancer : sudo ./scripts/install.sh

---

## 🔧 Commandes utiles

| Action          | Commande                     |
|-----------------|------------------------------|
| Voir l'état     | docker compose ps            |
| Logs app        | docker compose logs app -f   |
| Logs DB         | docker compose logs db -f    |
| Redémarrer      | docker compose restart       |
| Arrêter         | docker compose down          |
| Mettre à jour   | ./scripts/deploy.sh          |
| Sauvegarder     | ./scripts/backup.sh          |

---

## 🚨 Dépannage

### Erreur 502 Bad Gateway

    docker compose ps
    docker compose logs app
    grep proxy_pass /etc/nginx/sites-available/medisahel

Vérifier que Nginx pointe bien sur 127.0.0.1:3001.

### Base de données vide

    docker compose exec app npx prisma db push

### Restaurer une sauvegarde

    gunzip < backups/medisahel-YYYYMMDD-HHMMSS.sql.gz | docker compose exec -T db psql -U medisahel_user medisahel

---

## 📅 Sauvegardes automatiques

Ajouter au crontab (tous les jours à 2h du matin) :

    crontab -e

Puis ajouter cette ligne :

    0 2 * * * cd /opt/clinique && ./scripts/backup.sh >> /var/log/medisahel-backup.log 2>&1

---

## 📂 Structure du projet

    /opt/clinique/
    ├── docker-compose.yml
    ├── Dockerfile
    ├── .env
    ├── .env.example
    ├── prisma/schema.prisma
    ├── scripts/
    │   ├── install.sh
    │   ├── deploy.sh
    │   ├── backup.sh
    │   └── save-images.sh
    ├── docs/DEPLOY.md
    ├── docs/nginx-medisahel.conf
    ├── src/
    ├── server.ts
    └── backups/
