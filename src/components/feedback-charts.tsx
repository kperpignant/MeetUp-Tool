"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export type FeedbackRow = {
  id: string;
  responses: { question: string; answer: string }[];
};

const COLORS = ["#6366f1", "#8b5cf6", "#ec4899", "#14b8a6", "#f97316"];

function classifyColumn(answers: string[]): "numeric" | "categorical" | "text" {
  const trimmed = answers.map((a) => a.trim()).filter(Boolean);
  if (trimmed.length === 0) return "text";
  let numeric = 0;
  for (const a of trimmed) {
    const n = Number(a);
    if (!Number.isNaN(n) && a !== "") numeric++;
  }
  if (numeric / trimmed.length >= 0.8) return "numeric";
  const unique = new Set(trimmed);
  const avgLen =
    trimmed.reduce((s, a) => s + a.length, 0) / trimmed.length;
  if (unique.size <= 15 && avgLen < 48) return "categorical";
  return "text";
}

function buildCategoricalData(answers: string[]) {
  const counts = new Map<string, number>();
  for (const a of answers) {
    const k = a.trim() || "(empty)";
    counts.set(k, (counts.get(k) ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);
}

export function FeedbackCharts({ rows }: { rows: FeedbackRow[] }) {
  if (rows.length === 0) {
    return (
      <p className="text-muted-foreground text-sm">
        No feedback yet. Upload a CSV to see charts.
      </p>
    );
  }

  const byQuestion = new Map<string, string[]>();
  for (const row of rows) {
    for (const { question, answer } of row.responses) {
      if (!question) continue;
      const list = byQuestion.get(question) ?? [];
      list.push(answer);
      byQuestion.set(question, list);
    }
  }

  const sections = [...byQuestion.entries()].map(([question, answers]) => ({
    question,
    answers,
    kind: classifyColumn(answers),
  }));

  return (
    <div className="grid gap-6">
      {sections.map(({ question, answers, kind }) => (
        <Card key={question}>
          <CardHeader>
            <CardTitle className="text-base">{question}</CardTitle>
            <CardDescription>
              {kind === "numeric" && "Numeric responses"}
              {kind === "categorical" && "Category counts"}
              {kind === "text" && "Recent text responses"}
            </CardDescription>
          </CardHeader>
          <CardContent className="min-h-[220px]">
            {kind === "numeric" && <NumericSection answers={answers} />}
            {kind === "categorical" && (
              <CategoricalSection answers={answers} />
            )}
            {kind === "text" && <TextSection answers={answers} />}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function NumericSection({ answers }: { answers: string[] }) {
  const nums = answers
    .map((a) => Number(a))
    .filter((n) => !Number.isNaN(n));
  const avg = nums.length ? nums.reduce((a, b) => a + b, 0) / nums.length : 0;
  const counts = new Map<number, number>();
  for (const n of nums) {
    counts.set(n, (counts.get(n) ?? 0) + 1);
  }
  const barData =
    counts.size > 0
      ? [...counts.entries()]
          .sort((a, b) => a[0] - b[0])
          .map(([value, count]) => ({ value: String(value), count }))
      : [{ value: "0", count: 0 }];

  return (
    <div className="space-y-4">
      <p className="text-muted-foreground text-sm">
        Average:{" "}
        <span className="text-foreground font-medium">{avg.toFixed(2)}</span>{" "}
        (n={nums.length})
      </p>
      <div className="h-56 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={barData}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis dataKey="value" tick={{ fontSize: 12 }} />
            <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
            <Tooltip contentStyle={{ borderRadius: 8 }} />
            <Bar dataKey="count" name="Responses" fill="#6366f1" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function CategoricalSection({ answers }: { answers: string[] }) {
  const data = buildCategoricalData(answers);
  return (
    <div className="h-56 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={80}
          >
            {data.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

function TextSection({ answers }: { answers: string[] }) {
  const recent = [...answers].reverse().slice(0, 12);
  return (
    <ul className="text-muted-foreground max-h-56 list-disc space-y-2 overflow-auto pl-5 text-sm">
      {recent.map((a, i) => (
        <li key={i}>{a.trim() || "(empty)"}</li>
      ))}
    </ul>
  );
}
