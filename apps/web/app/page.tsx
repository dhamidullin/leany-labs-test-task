import Map from "@/components/Map";
import Filters from "@/components/Filters";

export default function Home() {
  return (
    <div className="relative w-full h-screen">
      <Map />
      <Filters />
    </div>
  )
}
