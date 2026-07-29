"use client";

import { useEffect, useState } from 'react';

type Entry = {
  id: number;
  name: string;
  message: string;
  created_at: string;
  likes?: number;
};

export default function GuestbookEntries() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [likedIds, setLikedIds] = useState<Record<number, boolean>>({});
  const [counts, setCounts] = useState<Record<number, number>>({});
  const [poppingId, setPoppingId] = useState<number | null>(null);

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const res = await fetch('/api/guestbook');
        if (!res.ok) throw new Error('Failed to fetch');
        const data = await res.json();
        if (mounted) {
          setEntries(data ?? []);
          const initialCounts: Record<number, number> = {};
          (data ?? []).forEach((d: any) => {
            initialCounts[d.id] = d.likes ?? 0;
          });
          setCounts(initialCounts);
        }
      } catch (e) {
        console.error(e);
      } finally {
        if (mounted) setLoading(false);
      }
    }

      load();

      function onCreated() {
        if (!mounted) return;
        setLoading(true);
        load();
      }

      window.addEventListener('guestbook:created', onCreated);

      // load like state from localStorage
      try {
        const storedLiked = localStorage.getItem('guestbook_liked_ids');
        const storedCounts = localStorage.getItem('guestbook_like_counts');
        if (storedLiked) setLikedIds(JSON.parse(storedLiked));
        if (storedCounts) setCounts(JSON.parse(storedCounts));
      } catch (e) {
        // ignore
      }

      return () => {
        mounted = false;
        window.removeEventListener('guestbook:created', onCreated);
      };
  }, []);

  if (loading) return <p className="empty-state">불러오는 중...</p>;

  return (
    <>
      <div className="entries-header">
        <h2>도착한 메시지</h2>
        <p>{entries.length}개의 메시지</p>
      </div>
      <div className="entries-list">
        {entries.length === 0 ? (
          <p className="empty-state">아직 남겨진 메시지가 없습니다.</p>
        ) : (
          entries.map((entry) => (
            <article key={entry.id} className="entry-card">
              <div className="entry-head">
                <span className="entry-name">{entry.name}</span>
                <span className="like-wrap">
                    <button
                      className={`like-button ${likedIds[entry.id] ? 'liked' : ''}`}
                      aria-label="좋아요"
                      onClick={async () => {
                        const currentlyLiked = !!likedIds[entry.id];
                        const nextLiked = !currentlyLiked;
                        const delta = nextLiked ? 1 : -1;
                        if (nextLiked) {
                          setPoppingId(entry.id);
                        }
                        try {
                          const res = await fetch('/api/guestbook/like', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ id: entry.id, delta }),
                          });
                          if (!res.ok) throw new Error('Like API failed');
                          const updated = await res.json();
                          const nextLikedIds = { ...likedIds, [entry.id]: nextLiked };
                          const nextCounts = { ...counts, [entry.id]: updated.likes ?? (counts[entry.id] || 0) + delta };
                          setLikedIds(nextLikedIds);
                          setCounts(nextCounts);
                          try {
                            localStorage.setItem('guestbook_liked_ids', JSON.stringify(nextLikedIds));
                            localStorage.setItem('guestbook_like_counts', JSON.stringify(nextCounts));
                          } catch (e) {
                            console.error(e);
                          }
                        } catch (e) {
                          console.error(e);
                        }
                      }}
                    >
                      <span
                        aria-hidden
                        className={poppingId === entry.id ? 'heart-pop' : ''}
                        onAnimationEnd={() => setPoppingId((current) => (current === entry.id ? null : current))}
                      >
                        ♥
                      </span>
                    </button>
                    <span className="like-count">{counts[entry.id] || 0}</span>
                  </span>
              </div>
              <p className="entry-message">{entry.message}</p>
              <time className="entry-date">
                {new Date(entry.created_at).toLocaleString('ko-KR', {
                  year: 'numeric',
                  month: '2-digit',
                  day: '2-digit',
                  hour: '2-digit',
                  minute: '2-digit',
                  hour12: false,
                  timeZone: 'Asia/Seoul',
                })}
              </time>
            </article>
          ))
        )}
      </div>
    </>
  );
}
