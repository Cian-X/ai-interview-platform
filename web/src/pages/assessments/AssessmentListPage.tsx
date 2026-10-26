import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { assessmentsApi } from "@/services/assessments";
import { Plus, ChevronRight } from "lucide-react";
import type { Assessment } from "@/types";

function SessionSummary({ session }: { session?: Assessment["latest_session"] }) {
  if (!session) return null;
  if (session.status === "active") return <span className="flex items-center gap-1 font-medium text-foreground"><span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />Live now</span>;
  if (session.status === "ended" && session.end_reason === "error") return <span className="font-medium text-destructive">Last session failed</span>;
  if (session.status === "ended") return <span className="font-medium text-foreground">Last session completed</span>;
  return <span className="font-medium text-foreground">Awaiting candidate</span>;
}

export default function AssessmentListPage() {
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const navigate = useNavigate();

  useEffect(() => { assessmentsApi.list().then((res) => setAssessments(res.data.assessments)).catch(() => setError(true)).finally(() => setLoading(false)); }, []);

  return <div className="space-y-4">
    <div className="flex items-center justify-between"><h1 className="text-xl font-semibold">Assessments</h1><Button onClick={() => navigate("/assessments/new")}><Plus className="mr-1.5 h-4 w-4" /> New Assessment</Button></div>
    {error && <div className="rounded-lg border border-destructive/40 p-4 text-sm text-destructive">Failed to load assessments. Please refresh the page.</div>}
    {loading ? <div className="grid gap-4 lg:grid-cols-2">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-32 w-full" />)}</div> : assessments.length === 0 ? <div className="rounded-lg border p-12 text-center text-sm text-muted-foreground"><p className="mb-3">No assessments yet.</p><Button variant="outline" onClick={() => navigate("/assessments/new")}><Plus className="mr-1.5 h-4 w-4" /> Create your first assessment</Button></div> : <div className="grid gap-4 lg:grid-cols-2">{assessments.map((a) => <Card key={a.id} className="min-h-[132px] cursor-pointer transition-colors hover:border-primary/40" onClick={() => navigate(`/assessments/${a.id}/invite`)}><CardContent className="flex items-start justify-between gap-3 px-4 py-4"><div className="min-w-0 flex-1"><p className="truncate text-base font-semibold">{a.name}</p><div className="mt-3 space-y-2 border-t pt-3 text-sm text-foreground"><p>{a.time_limit_min} min</p><p>{a.skill_count ?? 0} {(a.skill_count ?? 0) === 1 ? "skill" : "skills"} · {a.session_count ?? 0} {(a.session_count ?? 0) === 1 ? "session" : "sessions"}</p><SessionSummary session={a.latest_session} /></div></div><ChevronRight className="mt-1 h-4 w-4 shrink-0 text-muted-foreground" /></CardContent></Card>)}</div>}
  </div>;
}
