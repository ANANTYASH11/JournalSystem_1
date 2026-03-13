# ARCHITECTURE.md

## System Overview

This project uses a layered architecture:

- **API Layer**: Express routes + controllers
- **Domain/Service Layer**: business logic for journaling, LLM analysis, and insights
- **Data Layer**: Prisma ORM + SQLite
- **Client Layer**: React SPA consuming backend APIs

Data flow:
1. User submits journal entry from frontend
2. Backend stores entry
3. Backend analyzes text with LLM service (or cache/fallback)
4. Analysis persisted and reused by hash
5. Insights endpoint aggregates trends over time

---

## 1) How to scale this to 100k users?

### Application scaling
- Move backend to stateless containers (Kubernetes / ECS)
- Horizontal scale multiple API instances behind load balancer
- Store sessions/auth in external store (if added)

### Database scaling
- Replace SQLite with PostgreSQL
- Add read replicas for analytics-heavy reads
- Add proper indexes on:
  - `journalEntry.userId`
  - `journalEntry.createdAt`
  - `emotionAnalysis.textHash`
- Use partitioning for very large journal tables (time-based)

### Async processing
- Move LLM analysis to job queue (BullMQ / SQS / RabbitMQ)
- `POST /api/journal` returns quickly
- Worker processes analysis and updates records asynchronously

### Observability
- Structured logs (pino)
- Tracing (OpenTelemetry)
- Metrics (Prometheus/Grafana)
- SLO alerts on latency, LLM failure rate, queue lag

---

## 2) How to reduce LLM cost?

- **Cache-first strategy**: reuse analysis for repeated text hash
- **Model routing**:
  - Use small/cheap model for short simple entries
  - Escalate to larger model only when confidence is low
- **Batch jobs** for non-urgent analysis
- **Token controls**:
  - strict prompts
  - max token limits
  - compact JSON output only
- **Prompt optimization** to remove unnecessary verbose tokens
- **Fallback heuristics** when API unavailable or rate-limited

Cost formula approximation:
$$
\text{Cost} \propto \text{requests} \times (\text{inputTokens} + \text{outputTokens})
$$

So reducing repeated requests and token size gives direct savings.

---

## 3) How to cache repeated analysis?

Current implementation uses 2 layers:

1. **In-memory cache** (`node-cache`) for hot reads
2. **Persistent hash reuse** in DB (`EmotionAnalysis.textHash`)

Process:
- Normalize text
- Compute deterministic hash (SHA-256 shortened)
- Check memory cache
- Check DB for existing hash
- Only call LLM on cache miss

At scale, replace in-memory cache with Redis:
- shared across instances
- TTL policy
- cache invalidation by key namespace (`analysis:*`, `insights:*`)

---

## 4) How to protect sensitive journal data?

### Data protection
- Encrypt data at rest (DB encryption / disk encryption)
- Encrypt sensitive fields at app level for journal text (AES-GCM)
- TLS everywhere in transit

### Access control
- Add JWT/OAuth authn + authz
- Row-level authorization (`userId` ownership checks)
- Principle of least privilege for service accounts

### Privacy and compliance
- Data retention policies
- User data export + deletion endpoints
- Audit logs for access to sensitive records
- PII minimization in logs (never log raw journal text)

### LLM privacy controls
- Redact PII before sending to LLM
- Use providers with zero-retention mode
- Optional self-hosted model for strict compliance environments

---

## Additional Technical Decisions

- **Why Prisma**: fast development, schema clarity, safe queries
- **Why SQLite now**: quick evaluator setup and local reproducibility
- **Why this frontend**: minimal UI focused on required candidate tasks
- **Why fallback analysis**: resilience if LLM quota/network fails

---

## Future Improvements
- Background queue workers for analysis
- WebSocket/SSE progress for long-running analysis
- Better trend visualizations (weekly mood trajectory)
- Multi-tenant auth system
- CI/CD + automated integration tests
