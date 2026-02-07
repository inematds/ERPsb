# 16. Error Handling Strategy

### 16.1 Error Response Format

```typescript
interface ApiError {
  error: {
    code: string;
    message: string;
    details?: Record<string, string[]>;
    timestamp: string;
    requestId: string;
  };
}
```

### 16.2 Error Codes

| Code | HTTP Status | Description |
|------|------------|-------------|
| `VALIDATION_ERROR` | 400 | Input nao passou na validacao Zod |
| `UNAUTHORIZED` | 401 | Sem sessao valida |
| `FORBIDDEN` | 403 | Sem permissao para a operacao |
| `NOT_FOUND` | 404 | Recurso nao encontrado |
| `CONFLICT` | 409 | Conflito (ex: duplicata) |
| `PLAN_LIMIT` | 403 | Limite do plano atingido |
| `EXTERNAL_API_ERROR` | 502 | Erro na integracao externa |
| `INTERNAL_ERROR` | 500 | Erro inesperado (logado no Sentry) |

### 16.3 Backend Error Handler

```typescript
// src/lib/api-handler.ts
export function apiHandler(handler: ApiRouteHandler) {
  return async (req: NextRequest, ctx: RouteContext) => {
    const requestId = crypto.randomUUID();
    try {
      return await handler(req, ctx);
    } catch (error) {
      if (error instanceof ZodError) {
        return NextResponse.json({
          error: { code: 'VALIDATION_ERROR', message: 'Dados invalidos', details: formatZodErrors(error), timestamp: new Date().toISOString(), requestId }
        }, { status: 400 });
      }
      if (error instanceof AppError) {
        return NextResponse.json({
          error: { code: error.code, message: error.message, timestamp: new Date().toISOString(), requestId }
        }, { status: error.statusCode });
      }
      logger.error({ err: error, requestId }, 'Unhandled error');
      Sentry.captureException(error);
      return NextResponse.json({
        error: { code: 'INTERNAL_ERROR', message: 'Erro interno do servidor', timestamp: new Date().toISOString(), requestId }
      }, { status: 500 });
    }
  };
}
```

---
