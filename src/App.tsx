import { useEffect } from "react";
import { useStore } from "./store";
import Canvas from "./components/Canvas";
import TableView from "./components/TableView";
import LeftSection from "./components/LeftSection";
import CenterToolbar from "./components/CenterToolbar";
import RightToolbar from "./components/RightToolbar";
import AddEntityModal from "./components/AddEntityModal";
import SearchModal from "./components/SearchModal";

function App() {
  const theme = useStore((s) => s.theme);
  const viewMode = useStore((s) => s.viewMode);
  const leftPanelOpen = useStore((s) => s.leftPanelOpen);
  const closeLeftPanel = useStore((s) => s.closeLeftPanel);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  return (
    <div className="relative w-screen h-screen overflow-hidden">
      {viewMode === "canvas" ? <Canvas /> : <TableView />}

      {viewMode === "canvas" && <CenterToolbar />}
      <RightToolbar />
      <LeftSection />

      {leftPanelOpen && (
        <div className="fixed inset-0 z-20 sm:hidden" style={{ background: "rgba(10,10,14,0.35)" }} onClick={closeLeftPanel} />
      )}

      <AddEntityModal />
      <SearchModal />
    </div>
  );
}

export default App;
