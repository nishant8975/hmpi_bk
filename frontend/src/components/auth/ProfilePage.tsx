import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const ProfilePage = () => {
  const { user, profile } = useAuth();

  if (!user || !profile) {
    return <div>Loading profile...</div>;
  }
  
  const displayRole = profile.role.charAt(0).toUpperCase() + profile.role.slice(1);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">My Profile</h1>
      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>User Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Full Name:</span>
            <span className="font-medium">{profile.full_name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Email:</span>
            <span className="font-medium">{user.email}</span>
          </div>
           <div className="flex justify-between">
            <span className="text-muted-foreground">Role:</span>
            <span className="font-medium">{displayRole}</span>
          </div>
           <div className="flex justify-between">
            <span className="text-muted-foreground">User ID:</span>
            <span className="font-mono text-xs text-muted-foreground">{user.id}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfilePage;

