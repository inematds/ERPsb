# 17. Monitoring and Observability

### 17.1 Monitoring Stack

- **Frontend Monitoring:** Sentry (errors + performance traces) + PostHog (user analytics)
- **Backend Monitoring:** Sentry (API errors) + Vercel Analytics (function metrics)
- **Error Tracking:** Sentry com alertas para erros novos e regressoes
- **Performance Monitoring:** Vercel Speed Insights (Core Web Vitals) + Sentry Performance

### 17.2 Key Metrics

**Frontend Metrics:**
- Core Web Vitals (LCP, FID, CLS)
- FCP < 1.5s (meta)
- JavaScript errors por rota
- PWA install rate

**Backend Metrics:**
- Request rate por endpoint
- Error rate (4xx, 5xx)
- Response time p50/p95/p99
- BullMQ queue depth e job failure rate

**Business Metrics (PostHog):**
- DAU/MAU
- Time to Value (cadastro → primeira venda)
- Activation Rate (3 acoes-chave na primeira semana)
- Onboarding completion rate
- Feature adoption (PIX, NFe, WhatsApp)
- Churn indicators

---
