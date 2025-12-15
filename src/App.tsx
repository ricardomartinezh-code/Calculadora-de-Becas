import LandingPage from "./components/LandingPage";
import ScholarshipCalculator from "./components/ScholarshipCalculator";

function getTopSegment(pathname: string): string {
  const cleaned = pathname.replace(/\/+$/, "");
  return cleaned.replace(/^\/+/, "").split("/")[0] ?? "";
}

function App() {
  const topSegment = getTopSegment(window.location.pathname).toLowerCase();
  if (topSegment === "unidep") return <ScholarshipCalculator university="unidep" />;
  return <LandingPage />;
}

export default App;
