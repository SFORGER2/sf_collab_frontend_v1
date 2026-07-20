import NavBar from "../../sections/NavBar";
import MarkdownFileRender from "../../../utils/markdownFileRender";
import Footer from "../../landing-page/Footer";



export default function PrivacyPolicy() {
  return <>
    <NavBar />
        <div className="max-w-7xl mx-auto">

    <MarkdownFileRender filePath="/docs/privacy-policy.md" />
    </div>

    <Footer />
  </>
}