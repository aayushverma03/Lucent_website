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
`deploy/`, and docs). `--delete` keeps the server an exact mirror of the repo.

---

## Operations

- **Redeploy:** just push to `main` (or Actions → Deploy to EC2 → Run workflow).
- **Nginx logs:** `sudo tail -f /var/log/nginx/{access,error}.log`
- **Reload Nginx after manual config edits:** `sudo nginx -t && sudo systemctl reload nginx`
- **Renew cert manually / test:** `sudo certbot renew --dry-run`
- **Edit the served Nginx config:** `/etc/nginx/sites-available/lucent.conf`
  (regenerate from `deploy/nginx/lucent.conf.template` if you change the template).

## Optional hardening

- Use a **dedicated deploy key** instead of the instance key pair:
  `ssh-keygen -t ed25519 -f deploy_key`, append `deploy_key.pub` to
  `~/.ssh/authorized_keys` on the server, and put the private key in `EC2_SSH_KEY`.
- Restrict SSH (port 22) to your IP and/or GitHub Actions IP ranges.
- Enable automatic security updates: `sudo apt-get install -y unattended-upgrades`.
