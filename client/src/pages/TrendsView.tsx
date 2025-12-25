import { useTrends } from "@/hooks/use-tracker";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  BarChart, 
  Bar,
  AreaChart,
  Area
} from "recharts";
import { format, parseISO } from "date-fns";

export default function TrendsView() {
  const { data: trends, isLoading } = useTrends();

  // Sort by date ascending just in case
  const sortedData = [...(trends || [])].sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  // Filter out days without weight for the weight chart
  const weightData = sortedData.filter(d => d.weight !== null);

  if (isLoading) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
          <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-display font-bold">Progress Trends</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Tracking your journey over the last 30 days.
          </p>
        </div>

        {/* WEIGHT CHART */}
        <Card className="shadow-lg border-border/60">
          <CardHeader>
            <CardTitle>Weight History</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px] w-full">
            {weightData.length > 1 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={weightData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={(str) => format(parseISO(str), "dd MMM")}
                    tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis 
                    domain={['auto', 'auto']}
                    tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      borderRadius: "12px", 
                      border: "none", 
                      boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                      fontFamily: "var(--font-sans)"
                    }}
                    labelFormatter={(str) => format(parseISO(str as string), "EEE, MMM d")}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="weight" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={3}
                    fillOpacity={1} 
                    fill="url(#colorWeight)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <EmptyState message="Log weight for at least 2 days to see trends" />
            )}
          </CardContent>
        </Card>

        {/* CALORIE CHART */}
        <Card className="shadow-lg border-border/60">
          <CardHeader>
            <CardTitle>Calorie Intake</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px] w-full">
            {sortedData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={sortedData.slice(-14)} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={(str) => format(parseISO(str), "dd")}
                    tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis 
                    tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip 
                    cursor={{ fill: "hsl(var(--muted)/0.3)" }}
                    contentStyle={{ 
                      borderRadius: "12px", 
                      border: "none", 
                      boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                      fontFamily: "var(--font-sans)"
                    }}
                    labelFormatter={(str) => format(parseISO(str as string), "EEE, MMM d")}
                  />
                  <Bar 
                    dataKey="calories" 
                    fill="hsl(var(--accent))" 
                    radius={[4, 4, 0, 0]} 
                    maxBarSize={40}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <EmptyState message="No calorie data logged yet" />
            )}
          </CardContent>
        </Card>

        {/* PROTEIN CHART (Mini) */}
         <Card className="shadow-lg border-border/60">
          <CardHeader>
            <CardTitle>Protein Consistency</CardTitle>
          </CardHeader>
          <CardContent className="h-[200px] w-full">
            {sortedData.length > 0 ? (
               <ResponsiveContainer width="100%" height="100%">
                <LineChart data={sortedData.slice(-14)}>
                   <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis hide />
                  <YAxis hide />
                  <Tooltip 
                    contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)" }} 
                    labelFormatter={(str) => format(parseISO(str as string), "MMM d")}
                  />
                  <Line 
                    type="step" 
                    dataKey="protein" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={2}
                    dot={{ r: 3, fill: "hsl(var(--primary))" }}
                  />
                </LineChart>
               </ResponsiveContainer>
            ) : (
              <EmptyState message="Log meals to see protein trends" />
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="h-full w-full flex items-center justify-center bg-muted/20 rounded-xl border-2 border-dashed border-muted">
      <p className="text-muted-foreground text-sm font-medium">{message}</p>
    </div>
  );
}
