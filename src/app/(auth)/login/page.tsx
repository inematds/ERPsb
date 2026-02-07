import { LoginForm } from './login-form';

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-[400px] space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight">ERPsb</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Gestao financeira simples para seu negocio
          </p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
