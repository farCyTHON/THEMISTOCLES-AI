import { Link } from "react-router-dom";
import type { WhyStep } from "../../data/types";
import { entityPath } from "../../lib/format";

export function WhyChanged({
  explanation,
  steps,
}: {
  explanation: string;
  steps: WhyStep[];
}) {
  return (
    <div className="chain">
      <article className="why-copy">
        <div className="tiny">Why this changed</div>
        <p>{explanation}</p>
      </article>
      <ol className="why-steps">
        {steps.map((step, index) => (
          <li key={`${step.label}-${step.title}`}>
            <div className="tiny">{step.label}</div>
            {step.targetKind && step.targetId ? (
              <Link to={entityPath(step.targetKind, step.targetId)}>{step.title}</Link>
            ) : (
              <strong>{step.title}</strong>
            )}
            {index < steps.length - 1 ? <span className="why-arrow" aria-hidden>↓</span> : null}
          </li>
        ))}
      </ol>
    </div>
  );
}
