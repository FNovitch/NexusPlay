import { Link } from "react-router-dom";

export function Brand() {
  return (
    <Link to="/" className="flex min-h-10 items-center rounded-lg transition duration-200 hover:opacity-80" aria-label="NexusPlay início">
      <img
        src="/brand/nexusplay-logo.png"
        alt="NexusPlay"
        className="h-9 w-auto max-w-[158px] object-contain sm:h-10 sm:max-w-[180px]"
        decoding="async"
      />
    </Link>
  );
}
