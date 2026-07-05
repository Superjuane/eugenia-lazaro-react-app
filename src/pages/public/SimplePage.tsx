import { simplePages } from "../../content/site";
import { SectionHeader } from "../../shared/ui/SectionHeader";

type SimplePageKey = keyof typeof simplePages;

export function SimplePage({ pageKey }: { pageKey: SimplePageKey }) {
  const page = simplePages[pageKey];

  return (
    <section className={`simple-page simple-page-${pageKey}`}>
      <div className="section-container">
        <SectionHeader eyebrow={page.eyebrow} title={page.title} description={page.body} />
        <div className="simple-page-mockup">
          <span />
          <span />
          <span />
        </div>
      </div>
    </section>
  );
}
