import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/config/supabaseClient";
import { useToast } from "@/components/ui/use-toast";
import { Github, Chrome } from 'lucide-react';
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const LoginPage = () => {
  const { toast } = useToast();
  const navigate = useNavigate();

  // States for Sign In
  const [signInEmail, setSignInEmail] = useState('');
  const [signInPassword, setSignInPassword] = useState('');
  const [isSignInLoading, setIsSignInLoading] = useState(false);

  // States for Sign Up
  const [signUpFullName, setSignUpFullName] = useState('');
  const [signUpEmail, setSignUpEmail] = useState('');
  const [signUpPassword, setSignUpPassword] = useState('');
  const [signUpConfirmPassword, setSignUpConfirmPassword] = useState(''); // ✨ New state for confirm password
  const [isSignUpLoading, setIsSignUpLoading] = useState(false);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSignInLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: signInEmail,
      password: signInPassword,
    });
    if (error) {
      toast({ variant: "destructive", title: "Sign In Failed", description: error.message });
    } else {
      toast({ title: "Signed In Successfully" });
      navigate('/');
    }
    setIsSignInLoading(false);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();

    // ✨ Password confirmation check
    if (signUpPassword !== signUpConfirmPassword) {
      toast({
        variant: "destructive",
        title: "Passwords do not match",
        description: "Please make sure your passwords match before creating an account.",
      });
      return; // Stop the sign-up process if passwords don't match
    }

    setIsSignUpLoading(true);
    const { error } = await supabase.auth.signUp({
      email: signUpEmail,
      password: signUpPassword,
      options: {
        data: {
          full_name: signUpFullName,
        }
      }
    });
    if (error) {
      toast({ variant: "destructive", title: "Sign Up Failed", description: error.message });
    } else {
      toast({ title: "Confirmation Email Sent", description: "Please check your inbox to verify your email." });
    }
    setIsSignUpLoading(false);
  };
  
  const handleOAuthLogin = async (provider: 'google' | 'github') => {
    const { error } = await supabase.auth.signInWithOAuth({ provider });
    if (error) {
      toast({ variant: "destructive", title: "OAuth Login Failed", description: error.message });
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <Tabs defaultValue="sign-in" className="w-[450px]">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="sign-in">Sign In</TabsTrigger>
          <TabsTrigger value="sign-up">Sign Up</TabsTrigger>
        </TabsList>

        {/* Sign In Tab */}
        <TabsContent value="sign-in">
          <Card>
            <CardHeader>
              <CardTitle>Sign In</CardTitle>
              <CardDescription>Enter your credentials to access your account.</CardDescription>
            </CardHeader>
            <form onSubmit={handleSignIn}>
              <CardContent className="space-y-4">
                <div className="space-y-1">
                  <Label htmlFor="signInEmail">Email</Label>
                  <Input id="signInEmail" type="email" value={signInEmail} onChange={(e) => setSignInEmail(e.target.value)} required />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="signInPassword">Password</Label>
                  <Input id="signInPassword" type="password" value={signInPassword} onChange={(e) => setSignInPassword(e.target.value)} required />
                </div>
              </CardContent>
              <CardFooter className="flex-col gap-4">
                <Button className="w-full" type="submit" disabled={isSignInLoading}>
                  {isSignInLoading ? "Signing In..." : "Sign In"}
                </Button>
                <div className="relative w-full">
                  <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
                  <div className="relative flex justify-center text-xs uppercase"><span className="bg-card px-2 text-muted-foreground">Or continue with</span></div>
                </div>
                <div className="grid grid-cols-2 gap-4 w-full">
                   <Button variant="outline" onClick={() => handleOAuthLogin('google')}><Chrome className="mr-2 h-4 w-4"/> Google</Button>
                   <Button variant="outline" onClick={() => handleOAuthLogin('github')}><Github className="mr-2 h-4 w-4"/> Github</Button>
                </div>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>

        {/* Sign Up Tab */}
        <TabsContent value="sign-up">
          <Card>
            <CardHeader>
              <CardTitle>Sign Up</CardTitle>
              <CardDescription>Create a new account to get started.</CardDescription>
            </CardHeader>
            <form onSubmit={handleSignUp}>
              <CardContent className="space-y-4">
                <div className="space-y-1">
                  <Label htmlFor="signUpFullName">Full Name</Label>
                  <Input id="signUpFullName" value={signUpFullName} onChange={(e) => setSignUpFullName(e.target.value)} required />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="signUpEmail">Email</Label>
                  <Input id="signUpEmail" type="email" value={signUpEmail} onChange={(e) => setSignUpEmail(e.target.value)} required />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="signUpPassword">Password</Label>
                  <Input id="signUpPassword" type="password" value={signUpPassword} onChange={(e) => setSignUpPassword(e.target.value)} required />
                </div>
                {/* ✨ New Input Field for Confirm Password */}
                <div className="space-y-1">
                  <Label htmlFor="signUpConfirmPassword">Confirm Password</Label>
                  <Input id="signUpConfirmPassword" type="password" value={signUpConfirmPassword} onChange={(e) => setSignUpConfirmPassword(e.target.value)} required />
                </div>
              </CardContent>
              <CardFooter>
                <Button className="w-full" type="submit" disabled={isSignUpLoading}>
                  {isSignUpLoading ? "Creating Account..." : "Create Account"}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default LoginPage;

