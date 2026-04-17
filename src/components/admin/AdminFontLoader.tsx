import { useEffect } from "react";

/**
 * Lazy-loads Syne + JetBrains Mono only when the admin layout mounts.
 * Keeps the public site font-payload untouched.
 */
const FONT_HREF =
  "https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600&family=Syne:wght@400;600;700&display=swap";

const PRECONNECT_HREFS = [
  "https://fonts.googleapis.com",
  "https://fonts.gstatic.com",
];

export function AdminFontLoader() {
  useEffect(() => {
    const created: HTMLElement[] = [];

    // Preconnect (idempotent)
    PRECONNECT_HREFS.forEach((href) => {
      if (document.head.querySelector(`link[rel="preconnect"][href="${href}"]`)) return;
      const link = document.createElement("link");
      link.rel = "preconnect";
      link.href = href;
      if (href.includes("gstatic")) link.crossOrigin = "anonymous";
      document.head.appendChild(link);
      created.push(link);
    });

    // Font CSS
    if (!document.head.querySelector(`link[data-admin-fonts]`)) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = FONT_HREF;
      link.setAttribute("data-admin-fonts", "true");
      document.head.appendChild(link);
      created.push(link);
    }

    return () => {
      // Leave fonts cached for SPA navigations between admin pages.
      // Only remove preconnects we added if no longer needed — keep them; cheap.
    };
  }, []);

  return null;
}
