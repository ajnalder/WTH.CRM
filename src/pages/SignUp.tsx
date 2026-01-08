import { SignUp } from '@clerk/clerk-react';

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <SignUp
        routing="hash"
        signInUrl="/auth"
        afterSignUpUrl="/"
        appearance={{
          elements: {
            card: "shadow-lg",
          },
        }}
      />
    </div>
  );
}
