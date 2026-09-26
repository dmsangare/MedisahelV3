# 🏥 MediSahel V3

Système d'Information Hospitalier (SIH) pour cliniques, 100% local et sans cloud.

## 🎯 Caractéristiques

- **Frontend** : React 19 + Vite 6 + Tailwind 4
- **Backend** : Node.js 20 + Express 4 + TypeScript
- **Base de données** : PostgreSQL 18 (via Prisma)
- **Authentification** : JWT
- **Déploiement** : Docker + Docker Compose
- **100% local** : aucune dépendance cloud, aucun service externe

## 📦 Modules

- Tableau de bord
- Patients + Dossier Médical (DME)
- Rendez-vous
- Consultations
- Hospitalisations
- Urgences
- Laboratoire
- Imagerie Médicale
- Pharmacie
- Facturation & Caisse
- Comptabilité
- Ressources Humaines
- Assurances
- Achats & Fournisseurs
- Inventaire
- Courrier & GED
- Emails Groupés
- Rapports
- Paramétrage
- Audit & Traçabilité

## 🚀 Installation rapide (Docker)

### Prérequis

- Ubuntu 24.04 LTS ou plus récent
- Docker installé
- 2 CPU, 4 Go RAM, 50 Go disque

### Procédure

1. Cloner le projet :
   sudo mkdir -p /opt/clinique
   sudo chown -R $USER:$USER /opt/clinique
   cd /opt/clinique
   git clone https://github.com/dmsangare/MedisahelV3.git .

2. Configurer les variables d'environnement :
   cp .env.example .env
   nano .env                    # Remplir JWT_SECRET, JWT_REFRESH_SECRET, POSTGRES_PASSWORD
   chmod 600 .env

3. Lancer l'installation :
   sudo ./scripts/install.sh

### Configuration Nginx

    sudo apt install -y nginx
    sudo cp docs/nginx-medisahel.conf /etc/nginx/sites-available/medisahel
    sudo ln -sf /etc/nginx/sites-available/medisahel /etc/nginx/sites-enabled/medisahel
    sudo rm -f /etc/nginx/sites-enabled/default
    sudo nginx -t && sudo systemctl reload nginx

### Firewall

    sudo ufw allow OpenSSH
    sudo ufw allow 'Nginx Full'
    sudo ufw enable

L'application est accessible sur http://IP_DU_SERVEUR.

**📖 Documentation complète : [docs/DEPLOY.md](docs/DEPLOY.md)**

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
| Export offline  | ./scripts/save-images.sh     |

## 📂 Structure

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
    ├── docs/
    │   ├── DEPLOY.md
    │   └── nginx-medisahel.conf
    ├── src/
    ├── server.ts
    └── backups/

## 🔒 Sécurité

- Aucun appel externe (pas de Google, Cloud, etc.)
- Secrets stockés dans .env (jamais commité)
- Containers Docker isolés
- Base de données non exposée sur internet
- UFW actif (seuls 22, 80, 443 ouverts)

## 📅 Sauvegardes

Sauvegarde manuelle :

    ./scripts/backup.sh

Sauvegarde automatique (quotidienne à 2h) :

    crontab -e
    # Ajouter :
    0 2 * * * cd /opt/clinique && ./scripts/backup.sh >> /var/log/medisahel-backup.log 2>&1

## 📄 Licence

Propriétaire — © 2026 Clinique Sahélienne de Bamako
