import NavBar from "../../sections/NavBar";
import MarkdownFileRender from "../../../utils/markdownFileRender";
import Footer from "../../landing-page/Footer";

export default function TermsAndConditions() {
  return <>
    <NavBar />
      <div className="max-w-7xl mx-auto">

      <MarkdownFileRender filePath="/docs/terms-and-conditions.md" />
      </div>
    <Footer />
  </>
}