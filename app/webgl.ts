import * as THREE from "three";

/**
 * Some environments (headless/software renderers, remote desktop / VM GPU
 * passthrough, sandboxed embedded previews, etc.) fail to create a WebGL
 * context — or only succeed with a conservative set of context attributes.
 * This tries several progressively more conservative strategies before
 * giving up, instead of letting THREE.WebGLRenderer throw an uncaught error
 * on the first attempt.
 */
export function createSafeRenderer(
  extra: Record<string, unknown> = {}
): THREE.WebGLRenderer | null {
  if (typeof window === "undefined") return null;

  const attemptConfigs: Record<string, unknown>[] = [
    { antialias: true, powerPreference: "high-performance", failIfMajorPerformanceCaveat: false, ...extra },
    { antialias: false, powerPreference: "default", failIfMajorPerformanceCaveat: false, ...extra },
    { failIfMajorPerformanceCaveat: false, ...extra },
  ];

  for (const config of attemptConfigs) {
    try {
      return new THREE.WebGLRenderer(config);
    } catch {
      // try the next, more conservative configuration
    }
  }

  // Last resort: acquire a raw context manually and hand it to three — this
  // takes a different code path than THREE's own auto-creation and
  // sometimes succeeds where the above attempts fail.
  try {
    const canvas = document.createElement("canvas");
    const gl =
      canvas.getContext("webgl", { alpha: true, failIfMajorPerformanceCaveat: false }) ||
      canvas.getContext("experimental-webgl", { alpha: true });
    if (!gl) return null;
    return new THREE.WebGLRenderer({
      canvas,
      context: gl as WebGLRenderingContext,
      ...extra,
    });
  } catch {
    return null;
  }
}
