import { Link } from "react-router-dom";

export function Brand() {
  return (
    <Link to="/" className="flex items-center rounded-[20px] transition duration-[250ms] hover:opacity-90" aria-label="KRIAR início">
      <img
        src="/brand/kriar-logo.png"
        alt="KRIAR - Onde a arte encontra o futuro"
        decoding="async"
        className="h-11 w-auto max-w-[156px] object-contain sm:h-12 sm:max-w-[188px]"
      />
    </Link>
  );
}
