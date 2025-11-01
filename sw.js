// Service Worker for Push Notifications
const CACHE_NAME = 'diary-app-v1';
const NOTIFICATION_TITLE = '今日の日記書いた？';

// Service Workerのインストール
self.addEventListener('install', (event) => {
  console.log('Service Worker: インストール中');
  self.skipWaiting();
});

// Service Workerのアクティベート
self.addEventListener('activate', (event) => {
  console.log('Service Worker: アクティベート中');
  event.waitUntil(clients.claim());
});

// プッシュ通知の受信
self.addEventListener('push', (event) => {
  console.log('Service Worker: プッシュ通知を受信');
  
  const options = {
    body: '今日も一日お疲れ様でした。今日の出来事を記録しましょう。',
    icon: './vite.svg',
    badge: './vite.svg',
    tag: 'daily-reminder',
    requireInteraction: false,
    silent: false,
  };

  event.waitUntil(
    self.registration.showNotification(NOTIFICATION_TITLE, options)
  );
});

// 通知クリック時の処理
self.addEventListener('notificationclick', (event) => {
  console.log('Service Worker: 通知がクリックされました');
  event.notification.close();

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // 既に開いているウィンドウがあればフォーカス
        for (const client of clientList) {
          if (client.url && 'focus' in client) {
            return client.focus();
          }
        }
        // なければ新しいウィンドウを開く
        if (clients.openWindow) {
          return clients.openWindow('./');
        }
      })
  );
});

// 毎日のリマインド通知をスケジュール
const scheduleDailyNotification = async () => {
  const now = new Date();
  const targetTime = new Date();
  targetTime.setHours(0, 30, 0, 0); // 0:30（テスト用）

  // 今日の0:30が過ぎていたら明日の0:30にする
  if (now >= targetTime) {
    targetTime.setDate(targetTime.getDate() + 1);
  }

  const timeUntilNotification = targetTime.getTime() - now.getTime();
  const minutes = Math.floor(timeUntilNotification / 1000 / 60);
  console.log(`Service Worker: ${minutes}分後に通知をスケジュール（テスト用：0:30）`);

  // タイムアウトを設定
  setTimeout(() => {
    self.registration.showNotification(NOTIFICATION_TITLE, {
      body: '今日も一日お疲れ様でした。今日の出来事を記録しましょう。',
      icon: './vite.svg',
      badge: './vite.svg',
      tag: 'daily-reminder',
      requireInteraction: false,
      silent: false,
    });
    
    // 次の日の通知もスケジュール
    scheduleDailyNotification();
  }, timeUntilNotification);
};

// Service Worker起動時にスケジュールをセットアップ
self.addEventListener('activate', (event) => {
  event.waitUntil(
    scheduleDailyNotification()
  );
});
