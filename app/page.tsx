import BasePage from "@/components/BasePage";
import Link from "next/link";

export default function PageHome() {
  return <BasePage>
    <h1 className="sr-only">Home</h1>

    <div className="flex flex-col items-center">
    <Link
      href="/event/create"
      className="py-3 px-4 inline-flex justify-center items-center gap-x-2 text-sm font-medium rounded-lg border border-transparent bg-primary text-white hover:bg-primary-700 focus:outline-none focus:bg-primary-700 disabled:opacity-50 disabled:pointer-events-none"
    >
      Create Event
    </Link>
    </div>
  </BasePage>
}
