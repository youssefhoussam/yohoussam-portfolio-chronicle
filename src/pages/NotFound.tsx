import { useLocation } from "react-router-dom";

const NotFound = () => {
  const location = useLocation();
  return (
    <div className="flex min-h-screen items-center justify-center bg-ink px-6 text-paper">
      <div className="max-w-md">
        <p className="font-mono text-[12px] text-rose-300">HTTP/1.1 404 Not Found · judge: FAIL</p>
        <h1 className="mt-3 font-display text-[72px] leading-none">404</h1>
        <p className="mt-4 text-dim">
          No chunk in the knowledge base matches <span className="font-mono text-paper">{location.pathname}</span>, and I don&apos;t make
          things up.
        </p>
        <a href="#/" className="btn-primary mt-8">
          Back to the gateway
        </a>
      </div>
    </div>
  );
};

export default NotFound;
