"use client";

import { useState } from "react";
import { Globe } from "lucide-react";

export function CompanyLogo({
  domain,
  className,
}: {
  domain: string;
  className?: string;
}) {
  const [error, setError] = useState(false);

  if (!domain || error) {
    return (
      <div className={`bg-muted flex items-center justify-center rounded-sm ${className}`}>
        <Globe className="h-5 w-5 text-muted-foreground" />
      </div>
    );
  }

  return (
    <img
      className={className}
      src={
        domain.includes(".")
          ? `https://logos-api.apistemic.com/domain:${domain}`
          : `https://logos-api.apistemic.com/linkedin:${domain}`
      }
      alt={`${domain} logo`}
      onError={() => setError(true)}
      loading="lazy"
    />
  );
}
