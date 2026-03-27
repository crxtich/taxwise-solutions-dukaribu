import { useState } from "react";
import { Link } from "react-router-dom";
import { CheckCircle, AlertTriangle, XCircle } from "lucide-react";
import Layout from "@/components/Layout";
import AnimatedSection from "@/components/AnimatedSection";
import { useComplianceData } from "@/hooks/useSiteData";

type Answer = "yes" | "no" | "na";

const ComplianceCheck = () => {
  const { data: sections, isLoading } = useComplianceData();
  const [answers, setAnswers] = useState<Record<string, Answer>>({});
  const [submitted, setSubmitted] = useState(false);

  const allQuestions = (sections || []).flatMap((s) => s.questions);
  const answeredCount = Object.keys(answers).length;
  const allAnswered = allQuestions.length > 0 && answeredCount === allQuestions.length;

  const setAnswer = (id: string, val: Answer) => {
    setAnswers((prev) => ({ ...prev, [id]: val }));
  };

  const yesCount = Object.values(answers).filter((a) => a === "yes").length;
  const noItems = allQuestions.filter((q) => answers[q.id] === "no");

  // Reverse-scored questions: "Yes" is bad, so subtract; "No" is good, so add
  const reverseQuestions = allQuestions.filter((q) => q.is_reverse_scored);
  let adjustedYes = yesCount;
  reverseQuestions.forEach((q) => {
    if (answers[q.id] === "yes") adjustedYes -= 1;
    else if (answers[q.id] === "no") adjustedYes += 1;
  });

  const getResult = () => {
    if (adjustedYes >= 14) return { status: "Good Standing", color: "text-green-brand", bg: "bg-green-light", icon: CheckCircle, emoji: "🟢" };
    if (adjustedYes >= 9) return { status: "Attention Needed", color: "text-gold", bg: "bg-gold-light", icon: AlertTriangle, emoji: "🟡" };
    return { status: "Critical Action Required", color: "text-destructive", bg: "bg-destructive/10", icon: XCircle, emoji: "🔴" };
  };

  const handleSubmit = () => { if (allAnswered) setSubmitted(true); };
  const handleReset = () => { setAnswers({}); setSubmitted(false); };
  const result = getResult();

  if (isLoading) {
    return (
      <Layout>
        <section className="py-20 bg-background min-h-[60vh] flex items-center justify-center">
          <p className="text-muted-foreground">Loading...</p>
        </section>
      </Layout>
    );
  }

  return (
    <Layout>
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4 max-w-3xl">
          <AnimatedSection className="text-center mb-12">
            <span className="text-gold font-medium text-sm uppercase tracking-wider">Free Tool</span>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mt-2 mb-4">Compliance Health Check</h1>
            <p className="text-muted-foreground">
              Answer {allQuestions.length} questions to assess your business compliance status.
            </p>
          </AnimatedSection>

          {!submitted ? (
            <>
              {(sections || []).map((section) => (
                <AnimatedSection key={section.id} className="mb-10">
                  <h2 className="text-lg font-bold text-foreground mb-4 font-sans border-l-4 border-gold pl-4">
                    {section.title}
                  </h2>
                  <div className="space-y-4">
                    {section.questions.map((q) => (
                      <div key={q.id} className="bg-card border border-border rounded-lg p-4">
                        <p className="text-sm text-foreground mb-3">
                          <span className="font-semibold text-green-brand">Q{q.question_number}.</span> {q.text}
                        </p>
                        <div className="flex gap-4">
                          {(["yes", "no", "na"] as Answer[]).map((val) => (
                            <label key={val} className="flex items-center gap-2 cursor-pointer">
                              <input type="radio" name={`q-${q.id}`} checked={answers[q.id] === val} onChange={() => setAnswer(q.id, val)} className="accent-primary w-4 h-4" />
                              <span className="text-sm capitalize">{val === "na" ? "N/A" : val === "yes" ? "Yes" : "No"}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </AnimatedSection>
              ))}
              <div className="text-center mb-4 text-sm text-muted-foreground">{answeredCount} / {allQuestions.length} questions answered</div>
              <div className="text-center">
                <button onClick={handleSubmit} disabled={!allAnswered} className="bg-primary text-primary-foreground px-8 py-3 rounded-md font-semibold disabled:opacity-40 hover:opacity-90 transition-opacity">
                  Get My Score
                </button>
              </div>
            </>
          ) : (
            <AnimatedSection>
              <div className={`${result.bg} rounded-xl p-8 text-center mb-8`}>
                <result.icon className={`h-16 w-16 ${result.color} mx-auto mb-4`} />
                <div className="text-4xl mb-2">{result.emoji}</div>
                <h2 className={`text-2xl font-bold ${result.color} mb-2 font-sans`}>{result.status}</h2>
                <p className="text-muted-foreground">You answered <strong>Yes</strong> to {yesCount} out of {allQuestions.length} questions.</p>
              </div>
              {noItems.length > 0 && (
                <div className="bg-card border border-border rounded-xl p-6 mb-8">
                  <h3 className="font-bold text-foreground mb-4 font-sans">⚠️ Issues Flagged</h3>
                  <ul className="space-y-2">
                    {noItems.map((q) => (
                      <li key={q.id} className="text-sm text-muted-foreground flex gap-2">
                        <XCircle className="h-4 w-4 text-destructive shrink-0 mt-0.5" /> {q.text}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              <div className="text-center space-y-4">
                <Link to="/contact" className="bg-gold text-navy px-8 py-3 rounded-md font-semibold inline-block hover:opacity-90 transition-opacity">
                  Book a Consultation With Our Team
                </Link>
                <div><button onClick={handleReset} className="text-sm text-muted-foreground hover:underline">Take the check again</button></div>
              </div>
            </AnimatedSection>
          )}
        </div>
      </section>
    </Layout>
  );
};

export default ComplianceCheck;
