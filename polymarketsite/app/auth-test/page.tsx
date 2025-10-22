import { 
  SignInButton, 
  SignUpButton, 
  UserButton, 
  SignedIn, 
  SignedOut 
} from "@clerk/nextjs";

export default function AuthTestPage() {
  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center">
      <div className="text-center space-y-6">
        <h1 className="text-3xl font-bold">Clerk Authentication Test</h1>
        
        <SignedOut>
          <div className="space-y-4">
            <p className="text-gray-400">You are signed out</p>
            <div className="flex gap-4 justify-center">
              <SignInButton mode="modal">
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors">
                  Sign In
                </button>
              </SignInButton>
              <SignUpButton mode="modal">
                <button className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg transition-colors">
                  Sign Up
                </button>
              </SignUpButton>
            </div>
          </div>
        </SignedOut>
        
        <SignedIn>
          <div className="space-y-4">
            <p className="text-green-400">You are signed in!</p>
            <UserButton 
              appearance={{
                elements: {
                  avatarBox: "w-12 h-12",
                },
              }}
            />
          </div>
        </SignedIn>
      </div>
    </div>
  );
}
