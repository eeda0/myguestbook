'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';

export default function GuestbookForm() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSuccessMessage('');

    if (!name.trim() || !message.trim()) {
      setError('이름과 메시지를 모두 입력해주세요.');
      return;
    }

    setError('');
    setIsSubmitting(true);

    const response = await fetch('/api/guestbook', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name: name.trim(), message: message.trim() }),
    });

    const result = await response.json();
    setIsSubmitting(false);

    if (!response.ok) {
      setError(result?.error || '서버에 메시지를 저장하는 중에 오류가 발생했습니다.');
      return;
    }

    setName('');
    setMessage('');
    setSuccessMessage('메시지가 성공적으로 등록되었습니다.');
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('guestbook:created'));
    }
    router.refresh();
  };

  return (
    <section className="form-card">
      <form onSubmit={handleSubmit} className="field-group">
        <div className="field-group">
          <input
            id="name"
            name="name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="이름"
            aria-label="이름"
            aria-invalid={Boolean(error && !name.trim())}
          />
        </div>

        <div className="field-group">
          <textarea
            id="message"
            name="message"
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            placeholder="메시지를 남겨주세요"
            aria-label="메시지"
            aria-invalid={Boolean(error && !message.trim())}
          />
        </div>

        {error ? <p className="error-message">{error}</p> : null}
        {successMessage ? <p className="success-message">{successMessage}</p> : null}

        <button type="submit" className="submit-button" disabled={isSubmitting}>
          {isSubmitting ? '저장 중...' : '등록'}
        </button>
      </form>
    </section>
  );
}
