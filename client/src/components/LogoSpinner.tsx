interface LogoSpinnerProps {
  size?: number;
  label?: string;
  // When true, renders centered in a tall area (for full-page / route loading).
  fullscreen?: boolean;
}

// Rotating brand glyph used as the app's loading indicator. The SVG uses
// currentColor, so the accent color is applied via the .logo-spinner CSS class.
export default function LogoSpinner({ size = 48, label = 'Loading', fullscreen = false }: LogoSpinnerProps) {
  const spinner = (
    <span className="logo-spinner" role="status" aria-label={label}>
      <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true">
        <g fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round">
          <path d="M16 17 L32 32" />
          <path d="M16 47 L32 32" />
          <path d="M32 32 L48 17" />
          <path d="M32 32 L48 47" />
        </g>
        <g fill="currentColor">
          <circle cx="16" cy="17" r="5" />
          <circle cx="16" cy="47" r="5" />
          <circle cx="32" cy="32" r="6.5" />
          <circle cx="48" cy="17" r="5" />
          <circle cx="48" cy="47" r="5" />
        </g>
      </svg>
    </span>
  );

  if (fullscreen) {
    return <div className="page-loader">{spinner}</div>;
  }
  return spinner;
}
