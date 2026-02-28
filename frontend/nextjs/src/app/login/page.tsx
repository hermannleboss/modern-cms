import { LoginForm } from "@/components/auth/LoginForm";

export const metadata = {
  title: "Sign In - Modern CMS",
};

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-md space-y-8 rounded-lg border border-gray-200 bg-white p-8 shadow-sm">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Modern CMS</h1>
          <p className="mt-2 text-sm text-gray-600">
            Sign in to manage your content
          </p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
