import type { BaseLayoutProps } from "fumadocs-ui/layouts/shared";
import { appName, gitConfig } from "./shared";
import { Route, Split } from "lucide-react";

export function baseOptions(): BaseLayoutProps {
  return {
    nav: {
      title: (
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-fd-primary rounded-xl">
            <Split className="h-4 w-4 text-fd-primary-foreground" />
          </div>
          <span className="text-fd-foreground">{appName}</span>
        </div>
      ),
      transparentMode: "top",
    },
    githubUrl: `https://github.com/${gitConfig.user}/${gitConfig.repo}`,
  };
}
