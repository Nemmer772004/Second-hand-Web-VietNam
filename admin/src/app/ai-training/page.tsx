'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';

type LogEntry = {
  timestamp: string;
  level: string;
  message: string;
};

type TrainingStatus = {
  status?: string;
  updated_at?: string;
  last_run_started_at?: string | null;
  last_run_finished_at?: string | null;
  last_success_at?: string | null;
  last_error?: string | null;
  next_scheduled_at?: string | null;
  scheduler?: {
    active?: boolean;
    interval_seconds?: number;
    started_at?: string;
    stopped_at?: string;
  };
  dataset?: {
    version?: string;
    generated_at?: string;
    rows?: number;
    users?: number;
    items?: number;
    positive_labels?: number;
  };
  model?: {
    version?: string;
    saved_at?: string;
    file?: string;
    current_link?: string;
  };
  lock?: {
    held?: boolean;
    context?: string;
  };
};

async function fetchLog(): Promise<LogEntry[]> {
  const res = await fetch('/api/ai-training/log', { cache: 'no-store' });
  if (!res.ok) {
    throw new Error('Không thể tải log huấn luyện.');
  }
  return res.json();
}

async function fetchStatus(): Promise<TrainingStatus> {
  const res = await fetch('/api/ai-training/status', { cache: 'no-store' });
  if (!res.ok) {
    throw new Error('Không thể tải trạng thái pipeline.');
  }
  return res.json();
}

const formatDate = (value?: string | null) => {
  if (!value) {
    return '—';
  }
  try {
    return new Date(value).toLocaleString('vi-VN');
  } catch {
    return value;
  }
};

const formatInterval = (seconds?: number) => {
  if (!seconds || seconds <= 0) return '—';
  if (seconds % 3600 === 0) {
    const hours = seconds / 3600;
    return `${hours} giờ`;
  }
  if (seconds % 60 === 0) {
    const minutes = seconds / 60;
    return `${minutes} phút`;
  }
  return `${seconds} giây`;
};

export default function AiTrainingPage() {
  const [entries, setEntries] = useState<LogEntry[]>([]);
  const [logLoading, setLogLoading] = useState(true);
  const [logError, setLogError] = useState<string | null>(null);

  const [statusData, setStatusData] = useState<TrainingStatus | null>(null);
  const [statusLoading, setStatusLoading] = useState(true);
  const [statusError, setStatusError] = useState<string | null>(null);

  const [manualRunning, setManualRunning] = useState(false);
  const [actionStatus, setActionStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [runOutput, setRunOutput] = useState<string[] | null>(null);

  const schedulerBusy = useMemo(() => {
    if (!statusData) return false;
    if (statusData.status === 'running') return true;
    return Boolean(statusData.lock?.held);
  }, [statusData]);

  const combinedRunning = manualRunning || schedulerBusy;

  const loadLogs = useCallback(async () => {
    setLogLoading(true);
    setLogError(null);
    try {
      const data = await fetchLog();
      setEntries(data);
    } catch (err) {
      setLogError(err instanceof Error ? err.message : 'Đã xảy ra lỗi khi tải log.');
    } finally {
      setLogLoading(false);
    }
  }, []);

  const loadStatus = useCallback(async () => {
    setStatusLoading(true);
    setStatusError(null);
    try {
      const data = await fetchStatus();
      setStatusData(data);
    } catch (err) {
      setStatusError(err instanceof Error ? err.message : 'Không thể tải trạng thái pipeline.');
    } finally {
      setStatusLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadLogs();
    void loadStatus();
  }, [loadLogs, loadStatus]);

  useEffect(() => {
    if (!combinedRunning) {
      return;
    }
    const timer = setInterval(() => {
      void loadStatus();
      void loadLogs();
    }, 5000);
    return () => clearInterval(timer);
  }, [combinedRunning, loadLogs, loadStatus]);

  const handleRefresh = async () => {
    if (combinedRunning) return;
    await Promise.all([loadLogs(), loadStatus()]);
  };

  const handleRetrainNow = async () => {
    if (combinedRunning) return;
    setManualRunning(true);
    setActionStatus(null);
    setRunOutput(null);
    try {
      const res = await fetch('/api/ai-training/run', {
        method: 'POST',
        cache: 'no-store',
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.message || 'Huấn luyện thất bại.');
      }
      setActionStatus({ type: 'success', message: data?.message || 'Huấn luyện thành công.' });
      const outputLines: string[] = [];
      if (Array.isArray(data?.output) && data.output.length > 0) {
        outputLines.push(...data.output);
      }
      if (Array.isArray(data?.errorOutput) && data.errorOutput.length > 0) {
        outputLines.push('\n[stderr]\n', ...data.errorOutput);
      }
      setRunOutput(outputLines.length ? outputLines : null);
    } catch (err) {
      setActionStatus({
        type: 'error',
        message: err instanceof Error ? err.message : 'Huấn luyện thất bại.',
      });
    } finally {
      setManualRunning(false);
      await Promise.all([loadStatus(), loadLogs()]);
    }
  };

  const schedulerInterval = statusData?.scheduler?.interval_seconds;
  const nextRun = statusData?.next_scheduled_at;
  const lastError = statusData?.last_error;

  return (
    <div className="admin-page">
      <div className="admin-page__header">
        <div>
          <h1>Lịch sử huấn luyện AI</h1>
          <p>Theo dõi và điều phối pipeline tái huấn luyện BERT4Rec tự động 5 phút/lần.</p>
        </div>
      </div>

      <div className="admin-toolbar">
        <button
          type="button"
          className="admin-btn admin-btn--ghost"
          onClick={handleRefresh}
          disabled={combinedRunning}
        >
          {logLoading || statusLoading ? 'Đang tải...' : 'Làm mới'}
        </button>
        <button
          type="button"
          className="admin-btn admin-btn--primary"
          onClick={handleRetrainNow}
          disabled={combinedRunning}
        >
          {combinedRunning ? 'Đang xử lý...' : 'Huấn luyện ngay'}
        </button>
      </div>

      {actionStatus && (
        <div
          className={`admin-alert ${
            actionStatus.type === 'success' ? 'admin-alert--success' : 'admin-alert--error'
          }`}
        >
          {actionStatus.message}
        </div>
      )}

      {runOutput && (
        <div className="admin-card">
          <h2 style={{ marginTop: 0 }}>Kết quả lần huấn luyện vừa chạy</h2>
          <pre className="admin-log-output">{runOutput.join('').trim() || '(Không có output)'}</pre>
        </div>
      )}

      <div className="admin-grid">
        <div className="admin-card">
          <h2>Trạng thái pipeline</h2>
          {statusLoading && <p>Đang tải trạng thái...</p>}
          {statusError && <p className="admin-alert admin-alert--error">{statusError}</p>}
          {!statusLoading && !statusError && statusData && (
            <div className="admin-meta">
              <div className="admin-meta__row">
                <span className="admin-meta__label">Trạng thái</span>
                <span className="admin-meta__value">{statusData.status ?? 'unknown'}</span>
              </div>
              <div className="admin-meta__row">
                <span className="admin-meta__label">Tự động</span>
                <span className="admin-meta__value">
                  {statusData.scheduler?.active ? 'Đang bật' : 'Tạm dừng'}
                  {schedulerInterval ? ` • mỗi ${formatInterval(schedulerInterval)}` : ''}
                </span>
              </div>
              <div className="admin-meta__row">
                <span className="admin-meta__label">Lần chạy tới</span>
                <span className="admin-meta__value">{formatDate(nextRun)}</span>
              </div>
              <div className="admin-meta__row">
                <span className="admin-meta__label">Bắt đầu gần nhất</span>
                <span className="admin-meta__value">{formatDate(statusData.last_run_started_at)}</span>
              </div>
              <div className="admin-meta__row">
                <span className="admin-meta__label">Hoàn tất gần nhất</span>
                <span className="admin-meta__value">{formatDate(statusData.last_run_finished_at)}</span>
              </div>
              <div className="admin-meta__row">
                <span className="admin-meta__label">Thành công gần nhất</span>
                <span className="admin-meta__value">{formatDate(statusData.last_success_at)}</span>
              </div>
              <div className="admin-meta__row">
                <span className="admin-meta__label">Cập nhật lúc</span>
                <span className="admin-meta__value">{formatDate(statusData.updated_at)}</span>
              </div>
              {lastError && (
                <div className="admin-meta__row">
                  <span className="admin-meta__label">Lỗi gần nhất</span>
                  <span className="admin-meta__value admin-text--danger">{lastError}</span>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="admin-card">
          <h2>Dataset hiện tại</h2>
          {statusData?.dataset ? (
            <div className="admin-meta">
              <div className="admin-meta__row">
                <span className="admin-meta__label">Phiên bản</span>
                <span className="admin-meta__value">{statusData.dataset.version ?? '—'}</span>
              </div>
              <div className="admin-meta__row">
                <span className="admin-meta__label">Sinh lúc</span>
                <span className="admin-meta__value">{formatDate(statusData.dataset.generated_at)}</span>
              </div>
              <div className="admin-meta__row">
                <span className="admin-meta__label">Số dòng</span>
                <span className="admin-meta__value">{statusData.dataset.rows ?? '—'}</span>
              </div>
              <div className="admin-meta__row">
                <span className="admin-meta__label">Số user</span>
                <span className="admin-meta__value">{statusData.dataset.users ?? '—'}</span>
              </div>
              <div className="admin-meta__row">
                <span className="admin-meta__label">Số sản phẩm</span>
                <span className="admin-meta__value">{statusData.dataset.items ?? '—'}</span>
              </div>
              <div className="admin-meta__row">
                <span className="admin-meta__label">Lượt mua</span>
                <span className="admin-meta__value">{statusData.dataset.positive_labels ?? '—'}</span>
              </div>
            </div>
          ) : (
            <p>Chưa có dataset nào được ghi nhận.</p>
          )}
        </div>

        <div className="admin-card">
          <h2>Model phục vụ</h2>
          {statusData?.model ? (
            <div className="admin-meta">
              <div className="admin-meta__row">
                <span className="admin-meta__label">Phiên bản</span>
                <span className="admin-meta__value">{statusData.model.version ?? '—'}</span>
              </div>
              <div className="admin-meta__row">
                <span className="admin-meta__label">Xuất bản lúc</span>
                <span className="admin-meta__value">{formatDate(statusData.model.saved_at)}</span>
              </div>
              <div className="admin-meta__row">
                <span className="admin-meta__label">Tệp hiện tại</span>
                <span className="admin-meta__value">{statusData.model.current_link ?? statusData.model.file ?? '—'}</span>
              </div>
            </div>
          ) : (
            <p>Chưa có checkpoint nào được phát hành.</p>
          )}
        </div>
      </div>

      <div className="admin-card">
        <h2>Log tác vụ</h2>
        {logLoading && <p>Đang tải log...</p>}
        {logError && <div className="admin-alert admin-alert--error">{logError}</div>}
        {!logLoading && !logError && (
          <>
            {entries.length === 0 ? (
              <p>Chưa ghi nhận lần huấn luyện nào.</p>
            ) : (
              <ul className="admin-log-list">
                {entries.map((entry, index) => (
                  <li key={`${entry.timestamp}-${index}`} className="admin-log-list__item">
                    <div className="admin-log-list__meta">
                      <span className="admin-log-list__timestamp">{entry.timestamp}</span>
                      <span className={`admin-log-list__level admin-log-list__level--${entry.level.toLowerCase()}`}>
                        {entry.level}
                      </span>
                    </div>
                    <pre className="admin-log-list__message">{entry.message}</pre>
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
      </div>
    </div>
  );
}
