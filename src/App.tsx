import LandingPage from "./components/LandingPage";
import BlockedUniversity from "./components/BlockedUniversity";
import ScholarshipCalculator from "./components/ScholarshipCalculator";

function getTopSegment(pathname: string): string {
  const cleaned = pathname.replace(/\/+$/, "");
  return cleaned.replace(/^\/+/, "").split("/")[0] ?? "";
}

function App() {
  const topSegment = getTopSegment(window.location.pathname).toLowerCase();
  if (topSegment === "unidep") return <ScholarshipCalculator university="unidep" />;
  if (topSegment === "utc") return <BlockedUniversity label="Demo 1" />;
  if (topSegment === "ula") return <BlockedUniversity label="Demo 2" />;
  return <LandingPage />;
}

export default App;
