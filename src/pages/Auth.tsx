
import { SignIn } from '@clerk/clerk-react';

export default function Auth() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <SignIn
        routing="hash"
        signUpUrl="/sign-up"
        afterSignInUrl="/"
        appearance={{
          elements: {
            card: "shadow-lg",
          },
        }}
      />
    </div>
  );
}
