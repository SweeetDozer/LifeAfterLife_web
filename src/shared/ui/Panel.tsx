import type { ReactNode } from "react";

interface PanelProps {
  title?: string;
  subtitle?: string;
  children: ReactNode;
}

export function Panel({ title, subtitle, children }: PanelProps) {
  return (
    <section className="panel">
      {title || subtitle ? (
        <div className="panel-header">
          <div>
            {title ? <h2>{title}</h2> : null}
            {subtitle ? <p>{subtitle}</p> : null}
          </div>
        </div>
      ) : null}
      {children}
    </section>
  );
}
