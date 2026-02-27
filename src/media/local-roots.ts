import path from "node:path";
import { resolveAgentWorkspaceDir } from "../agents/agent-scope.js";
import type { OpenClawConfig } from "../config/config.js";
import { resolveStateDir } from "../config/paths.js";
import { resolvePreferredOpenClawTmpDir } from "../infra/tmp-openclaw-dir.js";

function buildMediaLocalRoots(stateDir: string): string[] {
  const resolvedStateDir = path.resolve(stateDir);
  const preferredTmpDir = resolvePreferredOpenClawTmpDir();
  return [
    preferredTmpDir,
    path.join(resolvedStateDir, "media"),
    path.join(resolvedStateDir, "agents"),
    path.join(resolvedStateDir, "workspace"),
    path.join(resolvedStateDir, "sandboxes"),
  ];
}

export function getDefaultMediaLocalRoots(): readonly string[] {
  return buildMediaLocalRoots(resolveStateDir());
}

export function getAgentScopedMediaLocalRoots(
  cfg: OpenClawConfig,
  agentId?: string,
): readonly string[] {
  const roots = buildMediaLocalRoots(resolveStateDir());
  if (agentId?.trim()) {
    const workspaceDir = resolveAgentWorkspaceDir(cfg, agentId);
    if (workspaceDir) {
      const normalizedWorkspaceDir = path.resolve(workspaceDir);
      if (!roots.includes(normalizedWorkspaceDir)) {
        roots.push(normalizedWorkspaceDir);
      }
    }
  }
  // Merge user-configured extra roots from media.localRoots
  const extraRoots = cfg.media?.localRoots;
  if (Array.isArray(extraRoots)) {
    for (const extra of extraRoots) {
      const resolved = path.resolve(extra);
      if (!roots.includes(resolved)) {
        roots.push(resolved);
      }
    }
  }
  return roots;
}
