import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center px-4 py-32 text-center">
      <p className="num text-6xl font-semibold text-gradient">404</p>
      <p className="mt-4 text-muted">This page doesn't exist.</p>
      <Button asChild className="mt-8">
        <Link to="/">Back home</Link>
      </Button>
    </div>
  );
}
