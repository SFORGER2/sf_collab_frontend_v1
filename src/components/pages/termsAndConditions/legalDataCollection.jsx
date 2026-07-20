import NavBar from "../../sections/NavBar";
import MarkdownFileRender from "../../../utils/markdownFileRender";
import Footer from "../../landing-page/Footer";



export default function DataCollection() {
  return <>
    <NavBar />

    <div className="max-w-7xl mx-auto">
      <MarkdownFileRender filePath="/docs/data_collection_and_tracking.md" />
      </div>

    <Footer />
  </>
}