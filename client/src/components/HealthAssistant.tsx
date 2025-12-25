import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { MessageCircle, Send, Zap, AlertCircle } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface HealthAssistantProps {
  weight?: number;
  height?: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
}

export function HealthAssistant({
  weight,
  height,
  calories,
  protein,
  carbs,
  fat,
  fiber,
}: HealthAssistantProps) {
  const [conversationId, setConversationId] = useState<number | null>(null);
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([]);
  const [input, setInput] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  // Calculate BMI
  const bmi = height && weight ? (weight / (height / 100) ** 2).toFixed(1) : null;
  const getBmiStatus = (bmi: number) => {
    if (bmi < 18.5) return { status: "Underweight", color: "text-blue-500" };
    if (bmi < 25) return { status: "Normal", color: "text-green-500" };
    if (bmi < 30) return { status: "Overweight", color: "text-yellow-500" };
    return { status: "Obese", color: "text-red-500" };
  };

  const bmiStatus = bmi ? getBmiStatus(parseFloat(bmi)) : null;

  // Get daily health assessment
  const getHealthScore = () => {
    const calorieScore = calories > 0 && calories <= 2500 ? 1 : 0.5;
    const proteinScore = protein >= 50 ? 1 : protein >= 30 ? 0.7 : 0.4;
    const fiberScore = fiber >= 25 ? 1 : fiber >= 15 ? 0.7 : 0.4;
    const balanceScore =
      carbs > 0 && fat > 0 && protein > 0
        ? 1
        : carbs > 0 || fat > 0 || protein > 0
          ? 0.6
          : 0;
    return ((calorieScore + proteinScore + fiberScore + balanceScore) / 4 * 100).toFixed(0);
  };

  const healthScore = parseInt(getHealthScore());

  const getHealthSuggestion = () => {
    if (calories === 0) return "Log your meals to get personalized recommendations";
    if (calories > 2500) return "Calorie intake is high - consider portion control";
    if (protein < 50) return "Increase protein intake for better muscle health";
    if (fiber < 25) return "Add more fiber-rich foods like vegetables and whole grains";
    if (carbs === 0 || fat === 0) return "Ensure balanced macros for optimal health";
    return "Great job! Your nutrition looks balanced today";
  };

  // Create conversation
  const createConversation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: "Health Coach" }),
      });
      return res.json();
    },
    onSuccess: (data) => {
      setConversationId(data.id);
      setMessages([
        {
          role: "assistant",
          content: `Hi! I'm your health coach. Based on your today's data:\n\n📊 Health Score: ${healthScore}%\n💪 Calories: ${calories} kcal\n🥗 Protein: ${protein}g | Carbs: ${carbs}g | Fat: ${fat}g | Fiber: ${fiber}g\n${bmi ? `📏 BMI: ${bmi} (${bmiStatus?.status})` : ""}\n\nHow can I help you today?`,
        },
      ]);
      setIsOpen(true);
    },
  });

  // Send message
  const sendMessage = useMutation({
    mutationFn: async (content: string) => {
      const res = await fetch(`/api/conversations/${conversationId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });

      const reader = res.body?.getReader();
      if (!reader) throw new Error("No response body");

      let fullResponse = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const text = new TextDecoder().decode(value);
        const lines = text.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.content) fullResponse += data.content;
            } catch {}
          }
        }
      }

      return fullResponse;
    },
    onSuccess: (response) => {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: response },
      ]);
    },
  });

  const handleSend = async () => {
    if (!input.trim() || !conversationId) return;

    const userMessage = input;
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    await sendMessage.mutateAsync(userMessage);
  };

  const handleOpenChat = async () => {
    if (!conversationId) {
      await createConversation.mutateAsync();
    } else {
      setIsOpen(true);
    }
  };

  return (
    <>
      {/* Health Summary Card */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2">
            <Zap className="w-4 h-4" />
            Health Score
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-lg font-bold">{healthScore}%</span>
              {bmi && (
                <span className={`text-sm font-medium ${bmiStatus?.color}`}>
                  BMI: {bmi} ({bmiStatus?.status})
                </span>
              )}
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div
                className="bg-gradient-to-r from-green-500 to-accent rounded-full h-2 transition-all"
                style={{ width: `${healthScore}%` }}
              />
            </div>
          </div>

          <div className="p-3 rounded-lg bg-muted/50 border border-border/50 flex gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-muted-foreground mt-0.5" />
            <p className="text-sm text-muted-foreground">{getHealthSuggestion()}</p>
          </div>

          <Button
            onClick={handleOpenChat}
            className="w-full gap-2"
            data-testid="button-health-chat"
          >
            <MessageCircle className="w-4 h-4" />
            Chat with Health Coach
          </Button>

          {/* Collapsible Chat */}
          <Collapsible open={isOpen} onOpenChange={setIsOpen} className="space-y-2">
            <CollapsibleContent>
              <div className="space-y-3 mt-4 pt-4 border-t">
                <ScrollArea className="h-[300px] pr-4 rounded-lg bg-muted/30 p-4">
                  <div className="space-y-3">
                    {messages.map((msg, i) => (
                      <div
                        key={i}
                        className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-xs px-3 py-2 rounded-lg text-sm ${
                            msg.role === "user"
                              ? "bg-primary text-primary-foreground"
                              : "bg-card text-card-foreground border border-border"
                          }`}
                        >
                          <p className="whitespace-pre-wrap">{msg.content}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>

                <div className="flex gap-2">
                  <Textarea
                    placeholder="Ask about meals, nutrition, or workouts..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSend();
                      }
                    }}
                    className="min-h-[40px] resize-none"
                    data-testid="input-health-chat"
                  />
                  <Button
                    onClick={handleSend}
                    disabled={!input.trim() || sendMessage.isPending}
                    size="icon"
                    data-testid="button-send-health-chat"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>
        </CardContent>
      </Card>
    </>
  );
}
