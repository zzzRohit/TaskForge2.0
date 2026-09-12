import { Link } from "react-router-dom";

type BreadcrumbItem = {
  label: string;
  to?: string;
};

export function Breadcrumb({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav aria-label="Breadcrumb" className="mb-5 font-mono text-xs text-ink-3">
      <ol className="flex flex-wrap items-center gap-2">
        {items.map((item, index) => (
          <li className="flex items-center gap-2" key={`${item.label}-${index}`}>
            {index > 0 ? <span>/</span> : null}
            {item.to ? (
              <Link className="hover:text-ink" to={item.to}>
                {item.label}
              </Link>
            ) : (
              <span className="text-ink-2">{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
