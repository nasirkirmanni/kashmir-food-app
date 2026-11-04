import { feastDisplay } from "./fonts";
import t from "./tokens.module.css";
import FeastName from "./sections/FeastName";
import FeastLegend from "./sections/FeastLegend";
import FeastSeven from "./sections/FeastSeven";
import FeastLine from "./sections/FeastLine";
import FeastLibrary from "./sections/FeastLibrary";
import FeastTables from "./sections/FeastTables";
import FeastValley from "./sections/FeastValley";
import FeastPlan from "./sections/FeastPlan";
import FeastAsk from "./sections/FeastAsk";
import FeastJournal from "./sections/FeastJournal";
import ContentsStrip from "./islands/ContentsStrip";
import FeastMotion from "./islands/FeastMotion";
import { feastAnchors, feastStripLabel } from "@/lib/homeFeast";

/** Desktop homepage (≥768px) after the kept video hero. Hidden on phones; the phone home is HomePageHero's strip. */
export default function HomeFeast() {
  return (
    <div id="feast-root" className={`hidden md:block ${feastDisplay.variable} ${t.root}`}>
      <FeastName />
      <div className={t.stripScope}>
        <ContentsStrip anchors={feastAnchors()} label={feastStripLabel()} />
        <FeastLegend />
        <FeastSeven />
        <FeastLine />
        <FeastLibrary />
        <FeastTables />
        <FeastValley />
        <FeastPlan />
        <FeastAsk />
        <FeastJournal />
      </div>
      <FeastMotion rootId="feast-root" />
    </div>
  );
}
