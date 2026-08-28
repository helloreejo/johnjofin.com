import { getSiteContent } from "@/lib/content";
import SiteEffects from "@/components/SiteEffects";
import Header from "@/components/sections/Header";
import Hero from "@/components/sections/Hero";
import Stats from "@/components/sections/Stats";
import About from "@/components/sections/About";
import Dimensions from "@/components/sections/Dimensions";
import Faith from "@/components/sections/Faith";
import Spiritual from "@/components/sections/Spiritual";
import Journey from "@/components/sections/Journey";
import Expertise from "@/components/sections/Expertise";
import Credentials from "@/components/sections/Credentials";
import Certifications from "@/components/sections/Certifications";
import References from "@/components/sections/References";
import Beyond from "@/components/sections/Beyond";
import Contact from "@/components/sections/Contact";
import Footer from "@/components/sections/Footer";

export default async function Page() {
  const c = await getSiteContent();

  return (
    <>
      <Header header={c.header} />

      <main>
        <Hero hero={c.hero} />
        <Stats stats={c.stats} />
        <About about={c.about} />
        <Dimensions dimensions={c.dimensions} />
        <Faith faith={c.faith} />
        <Spiritual spiritual={c.spiritual} />
        <Journey journey={c.journey} />
        <Expertise expertise={c.expertise} />
        <Credentials credentials={c.credentials} />
        <Certifications certifications={c.certifications} />
        <References references={c.references} />
        <Beyond beyond={c.beyond} />
        <Contact contact={c.contact} />
      </main>

      <Footer footer={c.footer} />

      {c.seo.jsonld && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(c.seo.jsonld) }}
        />
      )}

      <SiteEffects />
    </>
  );
}
