import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const discussions = [
  { id: 1, title: "High Arsenic Levels at Site B-03", replies: 12, time: "2 hours ago", status: "High Risk" },
  { id: 2, title: "Safe Zone Monitoring for Site A-01", replies: 4, time: "1 day ago", status: "Safe" },
  { id: 3, title: "Critical Mercury Pollution at Site C-12", replies: 8, time: "3 days ago", status: "Critical" },
];

const messages = [
  { id: 1, author: "Dr. Meera", time: "10:15 AM", text: "We need further sampling at Site B-03." },
  { id: 2, author: "Dr. Arjun", time: "11:00 AM", text: "Agreed, the arsenic levels are beyond limits." },
  { id: 3, author: "Dr. Smith", time: "11:45 AM", text: "Suggest collaboration with local labs for validation." },
];

export default function Collaboration() {
  const [newMessage, setNewMessage] = useState("");

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Left: Discussion List */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-foreground">Discussions</CardTitle>
        </CardHeader>
        <CardContent>
          <Input placeholder="Search discussions..." className="mb-4 bg-background text-foreground" />
          <div className="space-y-3">
            {discussions.map((d) => (
              <div
                key={d.id}
                className="p-3 rounded-lg border border-border hover:bg-accent cursor-pointer transition"
              >
                <p className="font-medium text-foreground">{d.title}</p>
                <p className="text-sm text-muted-foreground">
                  {d.replies} replies • {d.time}
                </p>
                <Badge
                  variant={
                    d.status === "High Risk"
                      ? "destructive"
                      : d.status === "Critical"
                      ? "secondary"
                      : "default"
                  }
                >
                  {d.status}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Right: Chat Window */}
      <Card className="md:col-span-2 bg-card border-border">
        <CardHeader>
          <CardTitle className="text-foreground">High Arsenic Levels at Site B-03</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {messages.map((m) => (
              <div key={m.id} className="p-3 rounded-lg border border-border bg-background">
                <p className="font-semibold text-foreground">{m.author}</p>
                <p className="text-xs text-muted-foreground">{m.time}</p>
                <p className="mt-1 text-foreground">{m.text}</p>
              </div>
            ))}
          </div>

          {/* New Message Box */}
          <div className="mt-4 flex space-x-2">
            <Textarea
              placeholder="Share your view..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              className="flex-1 bg-background text-foreground"
            />
            <Button onClick={() => setNewMessage("")} className="bg-primary text-primary-foreground">
              Post
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
