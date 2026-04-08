import type { ReactNode } from "react";

interface PageSectionProps {
  title: string;
  description?: string;
  children: ReactNode;
}

export function PageSection({ title, description, children }: PageSectionProps) {
  return (
    <section className="page-section">
      <div className="page-heading">
        <h2>{title}</h2>
        {description ? <p>{description}</p> : null}
      </div>
      {children}
    </section>
  );
}
