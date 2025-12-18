import Map from "@/components/Map";
import Filters from "@/components/Filters";
import { ErrorBoundary } from "react-error-boundary";
import ErrorFallback from "@/components/ErrorFallback";

export default function Home() {
  return (
    <div className="relative w-full h-screen">
      <ErrorBoundary FallbackComponent={ErrorFallback}>
        <Map />
        <Filters />
      </ErrorBoundary>
    </div>
  )
}
