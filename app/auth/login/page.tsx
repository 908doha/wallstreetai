import { LoginForm } from "@/components/auth/LoginForm";

export default async function LoginPage(props: {
  searchParams: Promise<{ callbackUrl?: string; error?: string }>;
}) {
  const searchParams = await props.searchParams;
  const callbackUrl = searchParams?.callbackUrl || "/";
  const error = searchParams?.error;

  return (
    <div className="min-h-screen bg-[#0f0f23] flex items-center justify-center p-4">
      <LoginForm callbackUrl={callbackUrl} error={error} />
    </div>
  );
}
