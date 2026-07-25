# Deploying Lucent to AWS EC2 (Nginx) with a GoDaddy domain

Static site → one small EC2 instance running Nginx. Every push to `main`
auto-deploys via GitHub Actions (rsync over SSH). HTTPS is free via Let's
Encrypt. Estimated cost: a `t3.micro` is roughly **$7–9/mo** (or free for 12
months on the AWS free tier with `t2.micro`/`t3.micro`).

```
GitHub (main)  --push-->  GitHub Actions  --rsync/ssh-->  EC2 + Nginx  <--HTTPS-->  visitors
                                                            ^ DNS (GoDaddy A/CNAME)
```

---

## 1. Launch the EC2 instance

AWS Console → EC2 → **Launch instance**:

- **AMI:** Ubuntu Server 24.04 LTS (x86_64)
- **Type:** `t3.micro` (or `t2.micro` for free tier)
- **Key pair:** create/download a `.pem` (you'll reuse it for CI) — keep it safe
- **Storage:** 16 GB gp3
- **Security group — inbound rules:**
  | Type  | Port | Source        |
  |-------|------|---------------|
  | SSH   | 22   | My IP         |
  | HTTP  | 80   | 0.0.0.0/0, ::/0 |
  | HTTPS | 443  | 0.0.0.0/0, ::/0 |

Then give it a **stable IP** so DNS never breaks:
EC2 → **Elastic IPs** → Allocate → Associate with the instance. Note this IP.

---

## 2. Point the GoDaddy domain at the instance

GoDaddy → **My Products** → your domain → **DNS** → **Manage DNS**. Set:

| Type  | Name | Value             | TTL  |
|-------|------|-------------------|------|
| A     | `@`  | `<YOUR_ELASTIC_IP>` | 600  |
| CNAME | `www`| `@`               | 600  |

Delete GoDaddy's default "Parked" A record and any domain Forwarding if present.
DNS usually propagates in minutes; check with `dig +short yourdomain.com`.

---

## 3. Provision the server (one time)

SSH in and run the setup script. From your machine:

```bash
chmod 400 your-key.pem
scp -i your-key.pem -r deploy ubuntu@<ELASTIC_IP>:~/
ssh -i your-key.pem ubuntu@<ELASTIC_IP>
# on the server:
chmod +x ~/deploy/*.sh
~/deploy/setup-server.sh yourdomain.com
```

This installs Nginx + Certbot, creates `/var/www/lucent` (owned by `ubuntu` so
CI can write to it), and serves a placeholder page. Visit `http://<ELASTIC_IP>`
to confirm Nginx is up.

---

## 4. Enable HTTPS (after DNS from step 2 resolves)

```bash
# on the server:
~/deploy/enable-https.sh yourdomain.com you@example.com
```

Certbot fetches the certificate, switches the site to HTTPS, and adds an
HTTP→HTTPS redirect. Renewal is automatic (certbot systemd timer).

---

## 5. Turn on auto-deploy from `main`

In GitHub → repo **Settings → Secrets and variables → Actions → New repository
secret**, add:

| Secret        | Value                                              |
|---------------|----------------------------------------------------|
| `EC2_HOST`    | your Elastic IP (or `yourdomain.com`)              |
| `EC2_USER`    | `ubuntu`                                            |
| `EC2_SSH_KEY` | the full contents of `your-key.pem`                |
| `EC2_PORT`    | `22` (optional)                                    |

The workflow `.github/workflows/deploy.yml` is already in the repo. Trigger it:

```bash
git push origin main            # or run it manually from the Actions tab
```

It rsyncs the site into `/var/www/lucent` (excluding `.git`, `.github`,
`deploy/`, `backend/`, and all `*.md`/`*.pdf` so internal docs and draft
policies are never publicly served). `--delete --delete-excluded` keeps the
server an exact mirror and removes previously deployed excluded files.

---

## Waitlist backend (one-time, from GitHub)

The static-site job never touches the backend. To install or update the
waitlist API service and its nginx `/api/` proxy, run the workflow manually:

1. Add repo secrets (Settings → Secrets → Actions): `WAITLIST_FROM_EMAIL`
   (SES-verified sender), `WAITLIST_ALERT_TO` (inbox for signup alerts),
   and optionally `AWS_REGION` (defaults to eu-west-1). Verify both email
   identities in SES first (both, if the SES account is in sandbox).
2. Actions → "Deploy to EC2" → Run workflow → tick **deploy_backend**
   (pick the branch whose backend code you want).
3. The job rsyncs `backend/` + `deploy/` to `~/lucent-setup` on the box, runs
   `setup-backend.sh` (venv, env file, systemd service) and
   `install-api-proxy.sh` (idempotently inserts the `/api/` block into the
   live nginx conf, `nginx -t`, reload, auto-revert on failure), then smoke
   tests `/api/health` locally and publicly.

The env file `/etc/lucent/waitlist.env` is created only on the first run —
to change SES settings later, edit it on the box and
`sudo systemctl restart lucent-waitlist`.

## Operations

- **Redeploy:** just push to `main` (or Actions → Deploy to EC2 → Run workflow).
- **Nginx logs:** `sudo tail -f /var/log/nginx/{access,error}.log`
- **Reload Nginx after manual config edits:** `sudo nginx -t && sudo systemctl reload nginx`
- **Renew cert manually / test:** `sudo certbot renew --dry-run`
- **Edit the served Nginx config:** `/etc/nginx/sites-available/lucent.conf`
  (regenerate from `deploy/nginx/lucent.conf.template` if you change the template).

## Backups (waitlist DB → S3)

The signups live in one SQLite file (`/var/lib/lucent/waitlist.db`). A daily cron
uploads a consistent, gzipped snapshot to S3 so instance loss ≠ data loss.

**One-time setup:**

1. Create a private S3 bucket (e.g. `lucent-backups`).
2. Give the EC2 instance an **IAM role** allowing writes to the backup prefix
   (EC2 → instance → Actions → Security → Modify IAM role):
   ```json
   { "Version": "2012-10-17", "Statement": [{
       "Effect": "Allow", "Action": "s3:PutObject",
       "Resource": "arn:aws:s3:::lucent-backups/waitlist-backups/*" }] }
   ```
3. Install the cron (on the server, from the repo checkout):
   ```bash
   sudo ./deploy/setup-backup.sh lucent-backups
   ```
   This installs `/opt/lucent-backend/backup-waitlist.sh`, writes
   `/etc/cron.d/lucent-backup` (daily 03:17 UTC, runs as `www-data`), and runs
   one backup immediately to verify. Logs: `tail -f /var/log/lucent-backup.log`.

Backups land at `s3://lucent-backups/waitlist-backups/waitlist-<UTC-timestamp>.db.gz`.

**Retention:** add an S3 lifecycle rule on the bucket to expire objects after,
say, 90 days (S3 console → bucket → Management → Lifecycle rules).

**Restore:**
```bash
aws s3 cp s3://lucent-backups/waitlist-backups/waitlist-<stamp>.db.gz .
gunzip waitlist-<stamp>.db.gz
sudo systemctl stop lucent-waitlist
sudo -u www-data cp waitlist-<stamp>.db /var/lib/lucent/waitlist.db
sudo rm -f /var/lib/lucent/waitlist.db-wal /var/lib/lucent/waitlist.db-shm
sudo systemctl start lucent-waitlist
```

## Optional hardening

- Use a **dedicated deploy key** instead of the instance key pair:
  `ssh-keygen -t ed25519 -f deploy_key`, append `deploy_key.pub` to
  `~/.ssh/authorized_keys` on the server, and put the private key in `EC2_SSH_KEY`.
- Restrict SSH (port 22) to your IP and/or GitHub Actions IP ranges.
- Enable automatic security updates: `sudo apt-get install -y unattended-upgrades`.
