## Tech Stack

- **Supabase** — stores subscriptions
- **Kafka** (Docker) — message broker
- **KafkaJS** — Kafka client
- **Nodemailer** — sends emails
- **Zod** — validation

## Setup

### 1. Clone and install

```bash
git clone <repo-url>
cd <repo-name>
pnpm install
```

### 2. Environment variables

Create `.env` and `.env.local` in the project root with the same content:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Kafka
KAFKA_BROKERS=localhost:9092
KAFKA_TOPIC=article.published
KAFKA_GROUP_ID=mailing-service

# Gmail SMTP
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your@gmail.com
SMTP_PASS=your_gmail_app_password
SMTP_FROM=your@gmail.com

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

> For Gmail, enable 2-Step Verification then generate an App Password at [myaccount.google.com](https://myaccount.google.com) → Security → App Passwords.

### 4. Start Kafka

```bash
docker-compose up -d
```

Wait about 20 seconds for Kafka to fully start.

## Running

Open **2 terminals**:

**Terminal 1 — Next.js API server:**

```bash
pnpm run dev
```

**Terminal 2 — Mailing service (Kafka consumer):**

```bash
pnpm kafka:consumer
```

Open http://localhost:3000 in your browser.

## Usage

### Subscribe tab

Enter an author username and your email address to subscribe to that author's updates.

### Simulate Publish tab

Enter the same author username and an article title to simulate a publish event. All subscribers of that author will receive an email notification.

### Unsubscribe

Every notification email contains an unsubscribe link at the bottom. Clicking it removes your subscription and shows a confirmation page.

## API Endpoints

### POST /api/subscription

Subscribe an email to an author's updates.

**Body:**

```json
{
  "author_username": "johndoe",
  "subs_email": "reader@example.com"
}
```

**Responses:**

- `201` — Subscribed successfully
- `200` — Already subscribed
- `422` — Validation failed
- `500` — Server error

### POST /api/publish

Fires a publish event to Kafka (simulates the already running system).

**Body:**

```json
{
  "author": "johndoe",
  "title": "My New Article",
  "article_url": "https://example.com/my-article"
}
```
