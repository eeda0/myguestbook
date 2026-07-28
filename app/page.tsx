import GuestbookForm from '../components/GuestbookForm';
import dynamic from 'next/dynamic';

const GuestbookEntries = dynamic(() => import('../components/GuestbookEntries'), {
  ssr: false,
});

export default function Home() {
  return (
    <main className="page-shell">
      <section className="guestbook-card">
        <div className="hero-block">
          <div>
            <h1>eeda's zone</h1>
            <p className="subhead">다녀가신 흔적을 남겨주세요</p>
          </div>
        </div>

        <GuestbookForm />

        <section className="entries-section">
          <GuestbookEntries />
        </section>
      </section>
    </main>
  );
}
