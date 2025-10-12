'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { graphqlRequest } from '../../lib/graphql-client';
import { useAdminAuth } from '../../context/AdminAuthContext';

const USERS_QUERY = /* GraphQL */ `
  query AdminUsersForRecommendations {
    users {
      id
      name
      email
    }
  }
`;

const RECOMMENDATIONS_QUERY = /* GraphQL */ `
  query AdminRecommendations($userId: String!, $topK: Int) {
    recommendations(userId: $userId, topK: $topK) {
      userId
      reply
      generatedAt
      items {
        productId
        productName
        productSlug
        image
        price
        score
      }
    }
  }
`;

type UserSummary = {
  id: string;
  name?: string | null;
  email?: string | null;
};

type RecommendationItem = {
  productId: string;
  productName?: string | null;
  productSlug?: string | null;
  image?: string | null;
  price?: number | null;
  score?: number | null;
};

type RecommendationResponse = {
  recommendations: {
    userId: string;
    reply?: string | null;
    generatedAt: string;
    items: RecommendationItem[];
  } | null;
};

type UsersResponse = {
  users: UserSummary[];
};

const DEFAULT_USER_COUNT = 12;

function formatPrice(price?: number | null) {
  if (typeof price !== 'number' || Number.isNaN(price)) {
    return '—';
  }
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(price);
}

export default function RecommendationsPage() {
  const { user: adminUser } = useAdminAuth();
  const [users, setUsers] = useState<UserSummary[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [searchValue, setSearchValue] = useState('');
  const [topK, setTopK] = useState<number>(5);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<RecommendationItem[]>([]);
  const [replyText, setReplyText] = useState<string | undefined>('');
  const [generatedAt, setGeneratedAt] = useState<string | undefined>('');

  const fetchUsers = useCallback(async () => {
    try {
      setLoadingUsers(true);
      const data = await graphqlRequest<UsersResponse>(USERS_QUERY);
      const list = Array.isArray(data?.users) ? data.users.slice(0, DEFAULT_USER_COUNT) : [];
      setUsers(list);
      if (list.length > 0) {
        setSelectedUserId((prev) => prev || list[0].id);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Không thể tải danh sách người dùng';
      setError(message);
    } finally {
      setLoadingUsers(false);
    }
  }, []);

  const fetchRecommendations = useCallback(
    async (targetUserId: string) => {
      if (!targetUserId) {
        setSuggestions([]);
        return;
      }
      try {
        setLoadingSuggestions(true);
        setError(null);
        const data = await graphqlRequest<RecommendationResponse>(RECOMMENDATIONS_QUERY, {
          userId: targetUserId,
          topK,
        });
        const result = data?.recommendations;
        setSuggestions(result?.items ?? []);
        setReplyText(result?.reply ?? undefined);
        setGeneratedAt(result?.generatedAt ?? undefined);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Không thể lấy gợi ý từ mô hình BERT4Rec';
        setError(message);
        setSuggestions([]);
        setReplyText(undefined);
      } finally {
        setLoadingSuggestions(false);
      }
    },
    [topK],
  );

  useEffect(() => {
    if (adminUser) {
      fetchUsers();
    }
  }, [adminUser, fetchUsers]);

  useEffect(() => {
    if (selectedUserId) {
      fetchRecommendations(selectedUserId);
    }
  }, [fetchRecommendations, selectedUserId]);

  const handleCopyId = (value: string) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(value).catch(() => undefined);
    }
  };

  const filteredUsers = useMemo(() => {
    if (!searchValue.trim()) {
      return users;
    }
    const keyword = searchValue.toLowerCase();
    return users.filter((item) =>
      item.id.toLowerCase().includes(keyword) ||
      item.name?.toLowerCase().includes(keyword) ||
      item.email?.toLowerCase().includes(keyword)
    );
  }, [searchValue, users]);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: 24 }}>
      <aside style={{ background: 'white', borderRadius: 16, border: '1px solid #e2e8f0', padding: 20, height: 'fit-content' }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 12 }}>Người dùng</h2>
        <input
          type="text"
          placeholder="Tìm theo ID, tên hoặc email"
          value={searchValue}
          onChange={(event) => setSearchValue(event.target.value)}
          style={{
            width: '100%',
            padding: '10px 12px',
            borderRadius: 10,
            border: '1px solid #cbd5f5',
            marginBottom: 16,
          }}
        />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {loadingUsers && <div className="admin-muted">Đang tải người dùng…</div>}
          {!loadingUsers && filteredUsers.length === 0 && (
            <div className="admin-muted">Không tìm thấy người dùng phù hợp.</div>
          )}
          {filteredUsers.map((item) => {
            const isActive = selectedUserId === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setSelectedUserId(item.id)}
                className={isActive ? 'admin-sidebar__link admin-sidebar__link--active' : 'admin-sidebar__link'}
                style={{ justifyContent: 'flex-start' }}
              >
                <span style={{ fontWeight: 600 }}>{item.name || `User ${item.id}`}</span>
                <span className="admin-muted" style={{ fontSize: 12 }}>{item.id}</span>
              </button>
            );
          })}
        </div>
      </aside>

      <section style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0 }}>Gợi ý realtime</h1>
            <p style={{ color: '#64748b', marginTop: 4 }}>
              Theo dõi các sản phẩm mà mô hình BERT4Rec đang đề xuất cho từng user.
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <label style={{ fontSize: 14, color: '#475569' }}>
              Số gợi ý
              <select
                value={topK}
                onChange={(event) => setTopK(Number(event.target.value))}
                style={{
                  marginLeft: 8,
                  padding: '6px 8px',
                  borderRadius: 8,
                  border: '1px solid #cbd5f5',
                }}
              >
                {[3, 5, 8, 10].map((value) => (
                  <option key={value} value={value}>{value}</option>
                ))}
              </select>
            </label>
            <button
              onClick={() => fetchRecommendations(selectedUserId)}
              disabled={loadingSuggestions || !selectedUserId}
              style={{
                padding: '10px 16px',
                borderRadius: 10,
                border: 'none',
                background: '#2563eb',
                color: 'white',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              {loadingSuggestions ? 'Đang tải...' : 'Làm mới'}
            </button>
          </div>
        </div>

        {error && (
          <div className="admin-alert admin-alert--error">{error}</div>
        )}

        <div className="admin-card" style={{ padding: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
            <div>
              <h2 style={{ margin: 0, fontSize: 18 }}>
                {selectedUserId ? `User ${selectedUserId}` : 'Chọn người dùng để xem gợi ý'}
              </h2>
              {replyText && (
                <p className="admin-muted" style={{ marginTop: 8 }}>{replyText}</p>
              )}
              {generatedAt && (
                <p className="admin-muted" style={{ marginTop: 4 }}>
                  Sinh vào lúc {new Date(generatedAt).toLocaleString('vi-VN')}
                </p>
              )}
            </div>
          </div>

          {loadingSuggestions && (
            <div style={{ display: 'flex', justifyContent: 'center', padding: 24 }}>
              <div className="admin-spinner" />
            </div>
          )}

          {!loadingSuggestions && suggestions.length === 0 && (
            <div className="admin-empty-state">
              <p>Chưa có gợi ý nào cho người dùng này ở thời điểm hiện tại.</p>
              <p className="admin-muted">Bạn có thể yêu cầu chatbot gợi ý hoặc thử lại sau.</p>
            </div>
          )}

          {!loadingSuggestions && suggestions.length > 0 && (
            <div className="admin-grid" style={{ gap: 16, gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
              {suggestions.map((item) => (
                <article key={item.productId} className="admin-card" style={{ margin: 0, padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div style={{
                    width: '100%',
                    paddingTop: '65%',
                    position: 'relative',
                    borderRadius: 14,
                    background: '#f8fafc',
                    overflow: 'hidden',
                  }}>
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.productName ?? 'Sản phẩm'}
                        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    ) : (
                      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontSize: 12 }}>
                        Không có ảnh
                      </div>
                    )}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>{item.productName || 'Sản phẩm đề xuất'}</h3>
                    <div className="admin-muted" style={{ fontSize: 12 }}>ID: {item.productId}</div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: '#2563eb' }}>{formatPrice(item.price)}</div>
                    {typeof item.score === 'number' && (
                      <div className="admin-muted" style={{ fontSize: 12 }}>
                        Điểm BERT4Rec: {item.score.toFixed(3)}
                      </div>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <a
                      href={`/products/${item.productId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        textAlign: 'center',
                        flex: 1,
                        padding: '10px 14px',
                        borderRadius: 10,
                        background: '#1d4ed8',
                        color: 'white',
                        fontWeight: 600,
                        textDecoration: 'none',
                      }}
                    >
                      Xem sản phẩm
                    </a>
                    <button
                      style={{
                        flex: 1,
                        padding: '10px 14px',
                        borderRadius: 10,
                        border: '1px solid #cbd5f5',
                        background: 'white',
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                      onClick={() => handleCopyId(item.productId)}
                    >
                      Sao chép ID
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
